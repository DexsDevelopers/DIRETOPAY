<?php
/**
 * Mistic Pay Webhook Receiver
 * Processa eventos de depósito (Cash-In) enviados pela Mistic Pay.
 * Configure no dashboard Mistic Pay: URL = https://diretopay.site/misticpay_webhook.php
 */

header('Content-Type: application/json');

try {
    require_once 'includes/db.php';
    require_once 'includes/TelegramService.php';
    require_once 'includes/MailService.php';
    require_once 'includes/MisticPayService.php';
    try { require_once 'includes/WhatsAppService.php'; } catch (Throwable $e) {}

    // BRPix / Mistic Pay podem enviar GET/HEAD para validar o endpoint
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(200);
        echo json_encode(['ok' => true, 'service' => 'DiretoPay Nominal 3 Webhook']);
        exit;
    }

    $rawBody = file_get_contents('php://input');
    write_log('info', "Nominal 3 Webhook recebido: " . substr($rawBody, 0, 1000));

    if (!$rawBody) {
        http_response_code(200);
        echo json_encode(['ok' => true]);
        exit;
    }

    $payload = json_decode($rawBody, true);
    if (!$payload) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    $status          = $payload['status'] ?? '';
    $transactionType = $payload['transactionType'] ?? '';
    $misticTxId      = (string)($payload['transactionId'] ?? '');
    $valueCents      = (int)($payload['value'] ?? 0);
    $amount          = round($valueCents / 100, 2); // centavos -> BRL
    $clientName      = $payload['clientName'] ?? 'Cliente';

    // Só processa depósitos (Cash-In) confirmados (status COMPLETO)
    if ($transactionType !== 'DEPOSITO' || $status !== 'COMPLETO') {
        http_response_code(200);
        echo json_encode(['ok' => true, 'skipped' => "status=$status type=$transactionType"]);
        exit;
    }

    if (empty($misticTxId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing transactionId']);
        exit;
    }

    // ── Idempotência ──────────────────────────────────────────────────────────
    $dup = $pdo->prepare("SELECT id FROM transactions WHERE pix_id = ? AND status = 'paid'");
    $dup->execute([$misticTxId]);
    if ($dup->fetch()) {
        http_response_code(200);
        echo json_encode(['ok' => true, 'duplicate' => true]);
        exit;
    }

    // ── Atualiza transação para 'paid' ────────────────────────────────────────
    $upd = $pdo->prepare("UPDATE transactions SET status='paid' WHERE pix_id=? AND status='pending'");
    $upd->execute([$misticTxId]);

    if ($upd->rowCount() > 0) {
        $tx = $pdo->prepare("SELECT * FROM transactions WHERE pix_id=?");
        $tx->execute([$misticTxId]);
        $txRow = $tx->fetch();

        if ($txRow) {
            $userId    = $txRow['user_id'];
            $netAmount = (float)$txRow['amount_net_brl'];
            $amountBrl = (float)$txRow['amount_brl']; // Usar o valor da transação gravada para evitar inconsistência de arredondamento centavos se houver

            // Credita saldo (valor bruto, conforme padrão de webhook do projeto)
            $pdo->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$amountBrl, $userId]);

            // Log de saldo
            try {
                $pdo->prepare("INSERT INTO balance_log (user_id, type, amount, description, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'credit', $amountBrl, 'Pagamento PIX Nominal 3 #' . $misticTxId]);
            } catch (Throwable $e) {}

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
                $saleMsg   = 'R$ ' . number_format($amountBrl, 2, ',', '.') . ' creditado — mais um passo! 💪';
                $pdo->prepare("INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'payment', $saleTitle, $saleMsg]);
            } catch (Throwable $e) {}

            // Busca dados do vendedor (incluindo whatsapp, pix_key, preferred_nominal, commission_rate, email)
            $mStmt = $pdo->prepare("SELECT full_name, telegram_chat_id, whatsapp, pix_key, preferred_nominal, commission_rate, email FROM users WHERE id = ?");
            $mStmt->execute([$userId]);
            $merchantRow  = $mStmt->fetch();
            $merchantName = $merchantRow['full_name'] ?? 'N/A';

            // ── SAQUE AUTOMÁTICO IMEDIATO (REPASSE AUTOMÁTICO / AUTO-DIRECT) ──
            triggerAutoWithdraw(
                (int)$userId,
                (float)$amountBrl,
                (float)$netAmount,
                $txRow['id']
            );

            // Disparar comissão de indicação para o afiliado se houver
            processAffiliateCommission((int)$userId, (int)$txRow['id']);

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
            try { TelegramService::notifySale($amountBrl, $netAmount, $clientName, $merchantName, (int)$txRow['id'], 'PIX'); } catch (Throwable $e) {}

            // Telegram vendedor (mensagem comemoração)
            try {
                if (!empty($merchantRow['telegram_chat_id'])) {
                    $tgMsg = TelegramService::getSaleCelebrationMsg(
                        $amountBrl, $netAmount,
                        $clientName,
                        (int)$txRow['id'],
                        $checkoutName
                    );
                    TelegramService::sendToUser($merchantRow['telegram_chat_id'], $tgMsg);
                }
            } catch (Throwable $e) {}

            // WhatsApp admin
            try { if (class_exists('WhatsAppService')) WhatsAppService::notifySale($amountBrl, $netAmount, $clientName, $merchantName, (int)$txRow['id'], 'PIX'); } catch (Throwable $e) {}

            // WhatsApp vendedor
            try {
                if (class_exists('WhatsAppService') && WhatsAppService::isEnabled() && !empty($merchantRow['whatsapp'])) {
                    WhatsAppService::notifySaleToUser(
                        $merchantRow['whatsapp'], $amountBrl, $netAmount,
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
                    'pix_id'         => $misticTxId,
                    'amount'         => $amountBrl,
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
                    write_log('info', "Nominal 3 callback_url disparado", ['url' => $txRow['callback_url'], 'http_code' => $cbCode]);
                } catch (Throwable $e) {
                    write_log('warning', 'Nominal 3 callback_url falhou: ' . $e->getMessage());
                }
            }

            write_log('info', "MisticPay pagamento processado: txid=$misticTxId | user=$userId | amount=$amountBrl");
        }
    } else {
        write_log('warning', "MisticPay Webhook: transação não encontrada para pix_id=$misticTxId");
    }

    http_response_code(200);
    echo json_encode(['ok' => true]);

} catch (Throwable $e) {
    write_log('error', "MisticPay Webhook CRÍTICO: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal error']);
}
