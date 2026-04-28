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

    // Valida token
    $storedToken = $pdo->query("SELECT `value` FROM settings WHERE `key`='sigilopay_webhook_token'")->fetchColumn();
    $incomingToken = $payload['token'] ?? '';
    if ($storedToken && $incomingToken && !hash_equals((string)$storedToken, (string)$incomingToken)) {
        write_log('warning', "SigiloPay Webhook: token inválido recebido=$incomingToken");
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }

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
    $upd = $pdo->prepare("UPDATE transactions SET status='paid', updated_at=NOW() WHERE pix_id=? AND status='pending'");
    $upd->execute([$sigiloTxId]);

    if ($upd->rowCount() > 0) {
        // Busca transação para obter user_id e valores
        $tx = $pdo->prepare("SELECT * FROM transactions WHERE pix_id=?");
        $tx->execute([$sigiloTxId]);
        $txRow = $tx->fetch();

        if ($txRow) {
            $userId    = $txRow['user_id'];
            $netAmount = (float)$txRow['amount_net_brl'];

            // Credita saldo
            $pdo->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$netAmount, $userId]);

            // Log de saldo
            try {
                $pdo->prepare("INSERT INTO balance_log (user_id, type, amount, description, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'credit', $netAmount, 'Pagamento PIX via SigiloPay #' . $sigiloTxId]);
            } catch (Throwable $e) {}

            // Notificação in-app
            try {
                $pdo->prepare("INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'payment', '✅ Pagamento Confirmado', 'R$ ' . number_format($netAmount, 2, ',', '.') . ' creditado na sua conta.']);
            } catch (Throwable $e) {}

            // Telegram admin
            try { TelegramService::notifyPaymentConfirmed($txRow['id'], $amount, $netAmount); } catch (Throwable $e) {}

            write_log('info', "SigiloPay Webhook: pagamento processado tx={$txRow['id']} user=$userId net=$netAmount");
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
            $commStmt  = $pdo->query("SELECT `value` FROM settings WHERE `key`='default_user_tax'");
            $commRate  = (float)($commStmt ? $commStmt->fetchColumn() : 5);
            $netAmount = $amount * (1 - $commRate / 100);

            $pdo->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$netAmount, $userId]);

            try {
                $pdo->prepare("INSERT INTO balance_log (user_id, type, amount, description, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'credit', $netAmount, 'SigiloPay checkout #' . $sigiloTxId]);
            } catch (Throwable $e) {}

            try {
                $pdo->prepare("INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'payment', '✅ Pagamento Confirmado', 'R$ ' . number_format($netAmount, 2, ',', '.') . ' creditado.']);
            } catch (Throwable $e) {}

            try { TelegramService::sendAdminMessage("💰 SigiloPay checkout pago\nCliente: $clientName\nEmail: $clientEmail\nValor: R$ " . number_format($amount, 2, ',', '.')); } catch (Throwable $e) {}
        }
    }

    http_response_code(200);
    echo json_encode(['ok' => true]);

} catch (Throwable $e) {
    write_log('error', 'SigiloPay Webhook crítico: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
