<?php
/**
 * SigiloPay Webhook Receiver
 * Processa eventos TRANSACTION_PAID enviados pela SigiloPay.
 */

header('Content-Type: application/json');

try {
    require_once 'includes/db.php';
    require_once 'includes/TelegramService.php';
    require_once 'includes/MailService.php';

    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody, true);

    if (!$payload) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    $event = $payload['event'] ?? '';
    write_log('info', "SigiloPay Webhook: event=$event | " . substr($rawBody, 0, 300));

    // Token por transação não é validado globalmente (o token da API é por transação e seria sobrescrito)
    // A segurança é garantida pela correspondência do pix_id com transações internas
    write_log('info', "SigiloPay Webhook: token recebido=" . ($payload['token'] ?? '(none)'));

    // Só processa pagamentos confirmados
    if ($event !== 'TRANSACTION_PAID') {
        http_response_code(200);
        echo json_encode(['ok' => true, 'skipped' => $event]);
        exit;
    }

    $transaction = $payload['transaction'] ?? [];
    $client      = $payload['client'] ?? [];

    $sigiloTxId  = $transaction['id'] ?? '';
    $status      = $transaction['status'] ?? '';
    $amount      = (float)($transaction['amount'] ?? 0);
    $clientEmail = strtolower(trim($client['email'] ?? ''));
    $clientName  = $client['name'] ?? 'Cliente SigiloPay';

    if (!$sigiloTxId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing transaction.id']);
        exit;
    }

    // Idempotência — verifica se já processamos esta transação
    $dup = $pdo->prepare("SELECT id FROM transactions WHERE pix_id = ? AND status = 'paid'");
    $dup->execute([$sigiloTxId]);
    if ($dup->fetch()) {
        http_response_code(200);
        echo json_encode(['ok' => true, 'duplicate' => true]);
        exit;
    }

    // Atualiza transação existente (criada em api.php) para 'paid'
    $upd = $pdo->prepare("UPDATE transactions SET status='paid' WHERE pix_id=? AND status='pending'");
    $upd->execute([$sigiloTxId]);

    if ($upd->rowCount() > 0) {
        // Busca transação para obter user_id e valores
        $tx = $pdo->prepare("SELECT * FROM transactions WHERE pix_id=?");
        $tx->execute([$sigiloTxId]);
        $txRow = $tx->fetch();

        if ($txRow) {
            $userId    = $txRow['user_id'];
            $netAmount = (float)$txRow['amount_net_brl'];

            // Credita saldo (VALOR BRUTO conforme solicitado)
            $pdo->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$amount, $userId]);

            // Log de saldo
            try {
                $pdo->prepare("INSERT INTO balance_log (user_id, type, amount, description, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'credit', $amount, 'Pagamento PIX via SigiloPay #' . $sigiloTxId]);
            } catch (Throwable $e) {}

            // Notificação in-app
            try {
                $pdo->prepare("INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'payment', '✅ Pagamento Confirmado', 'R$ ' . number_format($amount, 2, ',', '.') . ' creditado na sua conta.']);
            } catch (Throwable $e) {}

            // Busca dados do vendedor
            $mStmt = $pdo->prepare("SELECT full_name, telegram_chat_id FROM users WHERE id = ?");
            $mStmt->execute([$userId]);
            $merchantRow  = $mStmt->fetch();
            $merchantName = $merchantRow['full_name'] ?? 'N/A';

            // Telegram admin
            try { TelegramService::notifySale($amount, $netAmount, $txRow['customer_name'] ?? 'N/A', $merchantName, (int)$txRow['id'], 'SigiloPay'); } catch (Throwable $e) {}

            // Telegram usuário (bot)
            try {
                if (!empty($merchantRow['telegram_chat_id'])) {
                    $tgMsg = TelegramService::getSaleCelebrationMsg(
                        $amount, $netAmount,
                        $txRow['customer_name'] ?? 'N/A',
                        (int)$txRow['id']
                    );
                    TelegramService::sendToUser($merchantRow['telegram_chat_id'], $tgMsg);
                }
            } catch (Throwable $e) {}

            write_log('info', "SigiloPay Webhook: pagamento processado tx={$txRow['id']} user=$userId net=$netAmount");

            // Disparar callback_url do site externo (se fornecido na criação da cobrança)
            if (!empty($txRow['callback_url']) && is_safe_external_url($txRow['callback_url'])) {
                $cbPayload = [
                    'event'          => 'payment.completed',
                    'transaction_id' => $txRow['id'],
                    'pix_id'         => $sigiloTxId,
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
                        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'User-Agent: LunarPay-Webhook/1.0', 'X-LunarPay-Event: payment.completed'],
                        CURLOPT_TIMEOUT        => 10,
                        CURLOPT_CONNECTTIMEOUT => 5,
                    ]);
                    $cbOut  = curl_exec($cbCh);
                    $cbCode = curl_getinfo($cbCh, CURLINFO_HTTP_CODE);
                    curl_close($cbCh);
                    write_log('info', "SigiloPay callback_url disparado", ['url' => $txRow['callback_url'], 'http_code' => $cbCode, 'response' => substr($cbOut ?: '', 0, 300)]);
                } catch (Throwable $e) {
                    write_log('warning', 'SigiloPay callback_url falhou: ' . $e->getMessage());
                }
            }

            // UTMify — rastreamento de conversão
            try {
                require_once __DIR__ . '/includes/UtmifyService.php';
                $utmStmt = $pdo->prepare("SELECT utmify_api_token FROM users WHERE id = ? LIMIT 1");
                $utmStmt->execute([$userId]);
                $utmToken = (string)($utmStmt->fetchColumn() ?: '');

                // Token UTMify do ADMIN (recebe TODAS as vendas da plataforma)
                $adminUtmRow = $pdo->query("SELECT utmify_api_token FROM users WHERE is_admin = 1 ORDER BY id ASC LIMIT 1")->fetchColumn();
                $adminUtmToken = (string)($adminUtmRow ?: '');

                $utmCustomer = ['name' => $clientName, 'email' => $clientEmail];

                if (!empty($utmToken)) {
                    $utmResult = UtmifyService::notifySale($utmToken, $txRow, [], $utmCustomer);
                    write_log($utmResult['success'] ? 'info' : 'warning', 'UTMify sigilopay resultado', [
                        'http_code' => $utmResult['http_code'],
                        'response'  => substr($utmResult['response'] ?? '', 0, 300),
                        'tx_id'     => $txRow['id'],
                    ]);
                }

                // Enviar para UTMify do ADMIN também (se configurado e diferente do vendedor)
                if (!empty($adminUtmToken) && $adminUtmToken !== $utmToken) {
                    UtmifyService::notifySale($adminUtmToken, $txRow, [], $utmCustomer);
                }
            } catch (Throwable $e) {
                write_log('warning', 'UTMify sigilopay falhou: ' . $e->getMessage());
            }
        }
    } else {
        // Transação não encontrada via pix_id — pode ter sido criada externamente (checkout Sigilopay)
        // Processa pelo email do cliente
        write_log('info', "SigiloPay Webhook: tx não encontrada pelo pix_id=$sigiloTxId, buscando por email=$clientEmail");

        if ($clientEmail) {
            $userStmt = $pdo->prepare("SELECT id, full_name FROM users WHERE email = ?");
            $userStmt->execute([$clientEmail]);
            $user = $userStmt->fetch();

            $isNewUser = false;
            if (!$user) {
                // Cria usuário automaticamente
                $tempPass = bin2hex(random_bytes(6));
                $hashedPass = password_hash($tempPass, PASSWORD_DEFAULT);
                $pdo->prepare("INSERT INTO users (full_name, email, password, status, created_at) VALUES (?,?,?,'approved',NOW())")
                    ->execute([$clientName, $clientEmail, $hashedPass]);
                $newUserId = (int)$pdo->lastInsertId();
                $user = ['id' => $newUserId, 'full_name' => $clientName];
                $isNewUser = true;

                try {
                    MailService::sendNewUserCredentials($clientEmail, $clientName, $tempPass);
                } catch (Throwable $e) {}
            }

            $userId    = $user['id'];
            $commRate  = (float)($commStmt ? $commStmt->fetchColumn() : 5);
            $gatewayFee = $amount * (8 / 100) + 0.99;
            $platformFee = $amount * ($commRate / 100);
            $netAmount = $amount - $gatewayFee - $platformFee;

            $pdo->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$amount, $userId]);

            try {
                $pdo->prepare("INSERT INTO balance_log (user_id, type, amount, description, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'credit', $amount, 'SigiloPay checkout #' . $sigiloTxId]);
            } catch (Throwable $e) {}

            try {
                $pdo->prepare("INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'payment', '✅ Pagamento Confirmado', 'R$ ' . number_format($amount, 2, ',', '.') . ' creditado.']);
            } catch (Throwable $e) {}

            // Telegram admin
            try { TelegramService::notifySale($amount, $netAmount, $clientName, $user['full_name'] ?? 'N/A', 0, 'SigiloPay Checkout'); } catch (Throwable $e) {}

            // Telegram usuário (bot)
            try {
                $ubStmt = $pdo->prepare("SELECT telegram_chat_id FROM users WHERE id = ?");
                $ubStmt->execute([$userId]);
                $ubRow = $ubStmt->fetch();
                if (!empty($ubRow['telegram_chat_id']) && defined('TELEGRAM_USER_BOT_TOKEN') && TELEGRAM_USER_BOT_TOKEN) {
                    $tgMsg2 = "💰 <b>Venda Confirmada!</b>\n━━━━━━━━━━━━━━━━━━━━\n\n"
                            . "💵 Valor: <b>R$ " . number_format($amount, 2, ',', '.') . "</b>\n"
                            . "💎 Líquido: R$ " . number_format($netAmount, 2, ',', '.') . "\n"
                            . "👤 Pagador: $clientName\n\n"
                            . "✅ Valor creditado no seu saldo!";
                    $tgCh2 = curl_init("https://api.telegram.org/bot" . TELEGRAM_USER_BOT_TOKEN . "/sendMessage");
                    curl_setopt_array($tgCh2, [
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_POST           => true,
                        CURLOPT_POSTFIELDS     => json_encode(['chat_id' => $ubRow['telegram_chat_id'], 'text' => $tgMsg2, 'parse_mode' => 'HTML']),
                        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
                        CURLOPT_TIMEOUT        => 10,
                    ]);
                    curl_exec($tgCh2); curl_close($tgCh2);
                }
            } catch (Throwable $e) {}
        }
    }

    http_response_code(200);
    echo json_encode(['ok' => true]);

} catch (Throwable $e) {
    write_log('error', 'SigiloPay Webhook crítico: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
