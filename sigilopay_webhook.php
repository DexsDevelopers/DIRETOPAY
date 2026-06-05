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
    try { require_once 'includes/WhatsAppService.php'; } catch (Throwable $e) {}

    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody, true);

    if (!$payload) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    // Rate Limiting — previne flood/replay de webhook (max 60 req/min por IP)
    // Pesquisa: hooklistener.com, readme.io — rate limiting em webhooks
    $whIp = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if (!check_endpoint_rate_limit($pdo, $whIp, 'sigilo_webhook', 60, 1)) {
        http_response_code(429);
        echo json_encode(['error' => 'Rate limit exceeded']);
        exit;
    }

    $event = $payload['event'] ?? '';
    write_log('info', "SigiloPay Webhook: event=$event ip=$whIp | " . substr($rawBody, 0, 300));

    // SigiloPay usa token por transação (não HMAC global) — segurança extra via rate limit + match de pix_id interno
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
    $clientName  = $client['name'] ?? 'Cliente';

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

            // Credita saldo atomicamente (SELECT FOR UPDATE + log correto em balance_log)
            $creditResult = adjustBalance(
                (int)$userId,
                (float)$amount,
                'pix_credit',
                'sigilo_' . $sigiloTxId,
                'Pagamento PIX SigiloPay #' . $sigiloTxId
            );
            if (!$creditResult['success']) {
                write_log('ERROR', 'SigiloPay: falha ao creditar saldo', ['user_id' => $userId, 'tx' => $sigiloTxId, 'error' => $creditResult['error']]);
            }

            // Notificação in-app com frase engraçada
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
            try { TelegramService::notifySale($amount, $netAmount, $txRow['customer_name'] ?? 'N/A', $merchantName, (int)$txRow['id'], 'PIX'); } catch (Throwable $e) {}

            // Telegram usuário (bot)
            try {
                if (!empty($merchantRow['telegram_chat_id'])) {
                    $tgMsg = TelegramService::getSaleCelebrationMsg(
                        $amount, $netAmount,
                        $txRow['customer_name'] ?? 'N/A',
                        (int)$txRow['id'],
                        $checkoutName
                    );
                    TelegramService::sendToUser($merchantRow['telegram_chat_id'], $tgMsg);
                }
            } catch (Throwable $e) {}

            // WhatsApp admin
            try { if (class_exists('WhatsAppService')) WhatsAppService::notifySale($amount, $netAmount, $txRow['customer_name'] ?? 'N/A', $merchantName, (int)$txRow['id'], 'PIX'); } catch (Throwable $e) {}

            // WhatsApp vendedor (número cadastrado no perfil)
            try {
                if (class_exists('WhatsAppService') && WhatsAppService::isEnabled() && !empty($merchantRow['whatsapp'])) {
                    WhatsAppService::notifySaleToUser(
                        $merchantRow['whatsapp'], $amount, $netAmount,
                        $txRow['customer_name'] ?? 'N/A', (int)$txRow['id'],
                        $checkoutName
                    );
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
                        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'User-Agent: DiretoPay-Webhook/1.0', 'X-DiretoPay-Event: payment.completed'],
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
                // Sanitize clientName and clientEmail to defend against SQL/markup injections
                $clientNameFiltered = strip_tags(trim($clientName));
                $clientEmailFiltered = filter_var(trim($clientEmail), FILTER_SANITIZE_EMAIL);
                $badChars = ["'", '"', '--', ';', '#', '0x'];
                $clientNameFiltered = str_ireplace($badChars, "", $clientNameFiltered);
                $clientEmailFiltered = str_ireplace($badChars, "", $clientEmailFiltered);

                // Cria usuário automaticamente
                $tempPass = bin2hex(random_bytes(6));
                $hashedPass = password_hash($tempPass, PASSWORD_DEFAULT);
                $pdo->prepare("INSERT INTO users (full_name, email, password, status, created_at) VALUES (?,?,?,'approved',NOW())")
                    ->execute([$clientNameFiltered, $clientEmailFiltered, $hashedPass]);
                $newUserId = (int)$pdo->lastInsertId();
                $user = ['id' => $newUserId, 'full_name' => $clientNameFiltered];
                $isNewUser = true;

                try {
                    MailService::sendNewUserCredentials($clientEmailFiltered, $clientNameFiltered, $tempPass);
                } catch (Throwable $e) {}
            }

            $userId    = $user['id'];
            $commRate  = (float)($commStmt ? $commStmt->fetchColumn() : 5);
            $gatewayFee = $amount * (8 / 100) + 0.99;
            $platformFee = $amount * ($commRate / 100);
            $netAmount = $amount - $gatewayFee - $platformFee;

            // Credita saldo atomicamente — novo usuário criado via SigiloPay
            $creditResult2 = adjustBalance(
                (int)$userId,
                (float)$amount,
                'pix_credit',
                'sigilo_new_' . $sigiloTxId,
                'Pagamento PIX SigiloPay (novo usuário) #' . $sigiloTxId
            );
            if (!$creditResult2['success']) {
                write_log('ERROR', 'SigiloPay (novo usuário): falha ao creditar saldo', ['user_id' => $userId, 'tx' => $sigiloTxId, 'error' => $creditResult2['error']]);
            }

            try {
                $pdo->prepare("INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?,?,?,?,NOW())")
                    ->execute([$userId, 'payment', '✅ Pagamento Confirmado', 'R$ ' . number_format($amount, 2, ',', '.') . ' creditado.']);
            } catch (Throwable $e) {}

            // Telegram admin
            try { TelegramService::notifySale($amount, $netAmount, $clientName, $user['full_name'] ?? 'N/A', 0); } catch (Throwable $e) {}

            // WhatsApp admin
            try { if (class_exists('WhatsAppService')) WhatsAppService::notifySale($amount, $netAmount, $clientName, $user['full_name'] ?? 'N/A', 0, 'PIX'); } catch (Throwable $e) {}

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
