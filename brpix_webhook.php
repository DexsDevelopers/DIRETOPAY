<?php
/**
 * BRPix Webhook Receiver
 * Processa eventos charge.paid enviados pela BRPix Solutions.
 * Configure no dashboard BRPix: URL = https://diretopay.site/brpix_webhook.php
 * Eventos: charge.paid
 */

header('Content-Type: application/json');

try {
    require_once 'includes/db.php';
    require_once 'includes/TelegramService.php';
    require_once 'includes/MailService.php';
    require_once 'includes/BRPixService.php';
    try { require_once 'includes/WhatsAppService.php'; } catch (Throwable $e) {}

    // Verificação de URL — BRPix pode enviar GET/HEAD para validar o endpoint
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(200);
        echo json_encode(['ok' => true, 'service' => 'DiretoPay BRPix Webhook']);
        exit;
    }

    $rawBody = file_get_contents('php://input');
    write_log('info', "BRPix Webhook recebido: " . substr($rawBody, 0, 500));

    if (!$rawBody) {
        // Ping sem body — retorna 200 para não bloquear verificação
        http_response_code(200);
        echo json_encode(['ok' => true]);
        exit;
    }

    // ── Verificar assinatura HMAC ──────────────────────────────────────────────
    $getSetting = function(string $key) use ($pdo): string {
        $s = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $s->execute([$key]);
        $val = $s->fetchColumn();
        return ($val === false) ? '' : (string)$val;
    };

    $webhookSecret = $getSetting('brpix_webhook_secret');
    $incomingSign  = $_SERVER['HTTP_X_BRPIX_SIGNATURE'] ?? '';

    if (!BRPixService::verifyWebhookSignature($rawBody, $incomingSign, $webhookSecret)) {
        write_log('warning', "BRPix Webhook: assinatura inválida | got=$incomingSign");
        http_response_code(401);
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }

    if (empty($webhookSecret)) {
        write_log('warning', "BRPix Webhook: brpix_webhook_secret não configurado — aceite sem verificação!");
    }

    $payload = json_decode($rawBody, true);
    if (!$payload) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    $event = $payload['event'] ?? '';
    write_log('info', "BRPix Webhook: event=$event");

    // Só processa pagamentos confirmados
    if ($event !== 'charge.paid') {
        http_response_code(200);
        echo json_encode(['ok' => true, 'skipped' => $event]);
        exit;
    }

    $data       = $payload['data'] ?? [];
    $brpixTxId  = $data['txid'] ?? ($data['charge_id'] ?? '');
    $amountCents = (int)($data['amount'] ?? 0);
    $amount      = round($amountCents / 100, 2); // centavos → BRL
    $clientName  = $data['payer_name'] ?? 'Cliente';
    $status      = $data['status'] ?? '';

    if (!$brpixTxId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing data.txid']);
        exit;
    }

    // ── Idempotência ──────────────────────────────────────────────────────────
    $dup = $pdo->prepare("SELECT id FROM transactions WHERE pix_id = ? AND status = 'paid'");
    $dup->execute([$brpixTxId]);
    if ($dup->fetch()) {
        http_response_code(200);
        echo json_encode(['ok' => true, 'duplicate' => true]);
        exit;
    }

    // ── Atualiza transação para 'paid' ────────────────────────────────────────
    $upd = $pdo->prepare("UPDATE transactions SET status='paid' WHERE pix_id=? AND status='pending'");
    $upd->execute([$brpixTxId]);

    if ($upd->rowCount() > 0) {
        $tx = $pdo->prepare("SELECT * FROM transactions WHERE pix_id=?");
        $tx->execute([$brpixTxId]);
        $txRow = $tx->fetch();

        if ($txRow) {
            $userId    = $txRow['user_id'];
            $netAmount = (float)$txRow['amount_net_brl'];

            // Credita saldo atomicamente (SELECT FOR UPDATE + log correto em balance_log)
            $creditResult = adjustBalance(
                (int)$userId,
                (float)$amount,
                'pix_credit',
                'brpix_' . $brpixTxId,
                'Pagamento PIX BRPix #' . $brpixTxId
            );
            if (!$creditResult['success']) {
                write_log('ERROR', 'BRPix: falha ao creditar saldo', ['user_id' => $userId, 'tx' => $brpixTxId, 'error' => $creditResult['error']]);
            }

            // Notificação in-app
            try {
                $saleTitles = [
                    '💸 PIX CAIU! Corre ver!',
                    '🔥 Venda confirmada, monstro!',
                    '🤑 Dinheiro no bolso!',
                    '🚀 Mais uma! Bora!',
                    '💰 PIX aprovado! É isso!',
                    '🏆 Vendeu! Merece!',
                    '⚡ Ka-ching! Chegou!',
                    '🎯 Acertou em cheio!',
                ];
                $saleTitle = $saleTitles[array_rand($saleTitles)];
                $saleMsg   = 'R$ ' . number_format($amount, 2, ',', '.') . ' creditado — mais um passo! 💪';
                $pdo->prepare("INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'payment', $saleTitle, $saleMsg]);
            } catch (Throwable $e) {}

            // Busca dados do vendedor (incluindo whatsapp)
            $mStmt = $pdo->prepare("SELECT full_name, telegram_chat_id, whatsapp FROM users WHERE id = ?");
            $mStmt->execute([$userId]);
            $merchantRow  = $mStmt->fetch();
            $merchantName = $merchantRow['full_name'] ?? 'N/A';

            // Buscar nome do produto/checkout
            $checkoutName = '';
            if (!empty($txRow['external_id'])) {
                $extId = $txRow['external_id'];
                if (strpos($extId, 'chk_') === 0) {
                    $parts = explode('_', $extId);
                    $chkId = (int)($parts[1] ?? 0);
                    if ($chkId > 0) {
                        $cStmt = $pdo->prepare("SELECT name FROM checkouts WHERE id = ?");
                        $cStmt->execute([$chkId]);
                        $checkoutName = (string)($cStmt->fetchColumn() ?: '');
                    }
                } elseif (strpos($extId, 'prod_') === 0) {
                    $parts = explode('_', $extId);
                    $prodId = (int)($parts[1] ?? 0);
                    if ($prodId > 0) {
                        $pStmt = $pdo->prepare("SELECT name FROM products WHERE id = ?");
                        $pStmt->execute([$prodId]);
                        $checkoutName = (string)($pStmt->fetchColumn() ?: '');
                    }
                }
            }

            // Telegram admin
            try { TelegramService::notifySale($amount, $netAmount, $clientName, $merchantName, (int)$txRow['id'], 'PIX'); } catch (Throwable $e) {}

            // Telegram vendedor (mensagem engraçada)
            try {
                if (!empty($merchantRow['telegram_chat_id'])) {
                    $tgMsg = TelegramService::getSaleCelebrationMsg(
                        $amount, $netAmount,
                        $clientName,
                        (int)$txRow['id'],
                        $checkoutName
                    );
                    TelegramService::sendToUser($merchantRow['telegram_chat_id'], $tgMsg);
                }
            } catch (Throwable $e) {}

            // WhatsApp admin
            try { if (class_exists('WhatsAppService')) WhatsAppService::notifySale($amount, $netAmount, $clientName, $merchantName, (int)$txRow['id'], 'PIX'); } catch (Throwable $e) {}

            // WhatsApp vendedor (número cadastrado no perfil)
            try {
                if (class_exists('WhatsAppService') && WhatsAppService::isEnabled() && !empty($merchantRow['whatsapp'])) {
                    WhatsAppService::notifySaleToUser(
                        $merchantRow['whatsapp'], $amount, $netAmount,
                        $clientName, (int)$txRow['id'],
                        $checkoutName
                    );
                }
            } catch (Throwable $e) {}

            // Disparar callback_url do site externo (se fornecido)
            if (!empty($txRow['callback_url']) && is_safe_external_url($txRow['callback_url'])) {
                $cbPayload = [
                    'event'          => 'payment.completed',
                    'transaction_id' => $txRow['id'],
                    'pix_id'         => $brpixTxId,
                    'amount'         => $amount,
                    'amount_net'     => $netAmount,
                    'customer_name'  => $clientName,
                    'status'         => 'paid',
                    'external_id'    => $txRow['external_id'] ?? '',
                    'timestamp'      => date('Y-m-d H:i:s'),
                ];
                try {
                    $cbCh = curl_init($txRow['callback_url']);
                    curl_setopt_array($cbCh, [
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_POST           => true,
                        CURLOPT_POSTFIELDS     => json_encode($cbPayload),
                        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'User-Agent: DiretoPay-Webhook/1.0', 'X-DiretoPay-Event: payment.completed'],
                        CURLOPT_TIMEOUT        => 10,
                        CURLOPT_CONNECTTIMEOUT => 5,
                    ]);
                    $cbOut  = curl_exec($cbCh);
                    $cbCode = curl_getinfo($cbCh, CURLINFO_HTTP_CODE);
                    curl_close($cbCh);
                    write_log('info', "BRPix callback_url disparado", ['url' => $txRow['callback_url'], 'http_code' => $cbCode]);
                } catch (Throwable $e) {
                    write_log('warning', 'BRPix callback_url falhou: ' . $e->getMessage());
                }
            }

            write_log('info', "BRPix pagamento processado: txid=$brpixTxId | user=$userId | amount=$amount");
        }
    } else {
        // Transação não encontrada — pode ser duplicata já processada ou external_reference
        write_log('warning', "BRPix Webhook: transação não encontrada para pix_id=$brpixTxId");
    }

    http_response_code(200);
    echo json_encode(['ok' => true]);

} catch (Throwable $e) {
    write_log('error', "BRPix Webhook CRÍTICO: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal error']);
}
