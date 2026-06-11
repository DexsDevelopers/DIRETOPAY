<?php
header('Content-Type: application/json');

try {
    require_once 'includes/db.php';
    require_once 'includes/SyncPaymentsService.php';
    require_once 'includes/TelegramService.php';
    require_once 'includes/MailService.php';
    try { require_once 'includes/WhatsAppService.php'; } catch (Throwable $e) {}

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['ok' => true, 'service' => 'DiretoPay Nominal 6 Webhook']);
        exit;
    }

    $rawBody = file_get_contents('php://input');
    write_log('info', "SyncPayments Webhook recebido: " . substr($rawBody, 0, 500));

    if (!$rawBody) {
        echo json_encode(['ok' => true]);
        exit;
    }

    // Autorização / Validação de assinatura
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? getallheaders()['Authorization'] ?? '';
    if (!SyncPaymentsService::verifyWebhookSignature($authHeader)) {
        write_log('warning', "SyncPayments Webhook: assinatura inválida | authHeader=" . substr($authHeader, 0, 100));
        http_response_code(401);
        echo json_encode(['error' => 'Invalid auth token']);
        exit;
    }

    $payload = json_decode($rawBody, true);
    if (!$payload) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    $data = $payload['data'] ?? [];
    $status = $data['status'] ?? '';
    $syncTxId = (string)($data['id'] ?? '');
    $amount = round((float)($data['amount'] ?? 0), 2);
    $clientName = $data['client']['name'] ?? 'Cliente';

    if (empty($syncTxId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing data.id']);
        exit;
    }

    if ($status !== 'completed') {
        echo json_encode(['ok' => true, 'skipped_status' => $status]);
        exit;
    }

    // Evitar processamento duplo (Idempotência)
    $dup = $pdo->prepare("SELECT id FROM transactions WHERE pix_id = ? AND status = 'paid'");
    $dup->execute([$syncTxId]);
    if ($dup->fetch()) {
        echo json_encode(['ok' => true, 'duplicate' => true]);
        exit;
    }

    // Atualizar transação no banco de dados local
    $upd = $pdo->prepare("UPDATE transactions SET status='paid' WHERE pix_id=? AND status='pending'");
    $upd->execute([$syncTxId]);

    if ($upd->rowCount() > 0) {
        $tx = $pdo->prepare("SELECT * FROM transactions WHERE pix_id=?");
        $tx->execute([$syncTxId]);
        $txRow = $tx->fetch();

        if ($txRow) {
            $userId    = $txRow['user_id'];
            $netAmount = (float)$txRow['amount_net_brl'];

            // Busca dados do vendedor
            $mStmt = $pdo->prepare("SELECT full_name, telegram_chat_id, whatsapp, commission_rate FROM users WHERE id = ?");
            $mStmt->execute([$userId]);
            $merchantRow  = $mStmt->fetch();
            $merchantName = $merchantRow['full_name'] ?? 'N/A';

            // Credita saldo
            $creditResult = adjustBalance(
                (int)$userId,
                $netAmount,
                'pix_credit',
                'syncpayments_' . $syncTxId,
                'Pagamento PIX SyncPayments #' . $syncTxId
            );
            if (!$creditResult['success']) {
                write_log('ERROR', 'SyncPayments: falha ao creditar saldo', ['user_id' => $userId, 'tx' => $syncTxId, 'error' => $creditResult['error']]);
            }

            // Creditar comissão da plataforma ao administrador
            $commissionRate = (float)($merchantRow['commission_rate'] ?? 5.0);
            $feePlatform = round((float)$txRow['amount_brl'] * ($commissionRate / 100), 2);

            if ($feePlatform > 0) {
                $adminStmt = $pdo->query("SELECT id FROM users WHERE is_admin = 1 ORDER BY id ASC LIMIT 1");
                $admin = $adminStmt->fetch();
                if ($admin) {
                    adjustBalance(
                        (int)$admin['id'],
                        $feePlatform,
                        'admin_profit',
                        'tx_' . $txRow['id'],
                        'Comissão da venda #' . $txRow['id'] . ' (SyncPayments)'
                    );
                }
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

            // Telegram admin e vendedor
            try { TelegramService::notifySale($amount, $netAmount, $clientName, $merchantName, (int)$txRow['id'], 'PIX'); } catch (Throwable $e) {}
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

            // WhatsApp admin e vendedor
            try { if (class_exists('WhatsAppService')) WhatsAppService::notifySale($amount, $netAmount, $clientName, $merchantName, (int)$txRow['id'], 'PIX'); } catch (Throwable $e) {}
            try {
                if (class_exists('WhatsAppService') && WhatsAppService::isEnabled() && !empty($merchantRow['whatsapp'])) {
                    WhatsAppService::notifySaleToUser(
                        $merchantRow['whatsapp'], $amount, $netAmount,
                        $clientName, (int)$txRow['id'],
                        $checkoutName
                    );
                }
            } catch (Throwable $e) {}

            // Disparar callback_url
            if (!empty($txRow['callback_url']) && is_safe_external_url($txRow['callback_url'])) {
                $cbPayload = [
                    'event'          => 'payment.completed',
                    'transaction_id' => $txRow['id'],
                    'pix_id'         => $syncTxId,
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
                    write_log('info', "SyncPayments callback_url disparado", ['url' => $txRow['callback_url'], 'http_code' => $cbCode]);
                } catch (Throwable $e) {
                    write_log('warning', 'SyncPayments callback_url falhou: ' . $e->getMessage());
                }
            }

            write_log('info', "SyncPayments pagamento processado: txid=$syncTxId | user=$userId | amount=$amount");
        }
    }

    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    write_log('error', "SyncPayments Webhook CRÍTICO: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal error: ' . $e->getMessage()]);
}
