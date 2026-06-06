<?php
require_once 'includes/db.php';
require_once 'includes/MailService.php';
require_once 'includes/TelegramService.php';

if (!isAdmin()) {
    echo json_encode(['success' => false, 'error' => 'Não autorizado']);
    exit;
}

$data = $_POST;
$action = $data['action'] ?? '';

header('Content-Type: application/json');

try {
    switch ($action) {
        case 'update_global_settings':
            $aff_rate = (float)$data['affiliate_rate'];
            $def_tax = (float)$data['default_user_tax'];

            $pdo->prepare("UPDATE settings SET `value` = ? WHERE `key` = 'affiliate_commission_rate'")->execute([$aff_rate]);
            $pdo->prepare("UPDATE settings SET `value` = ? WHERE `key` = 'default_user_tax'")->execute([$def_tax]);

            echo json_encode(['success' => true]);
            break;

        case 'update_card_extra_fee':
            $fee = number_format((float)($data['card_extra_fee'] ?? 0), 2, '.', '');
            $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('card_extra_fee', ?) ON DUPLICATE KEY UPDATE `value` = ?")->execute([$fee, $fee]);
            echo json_encode(['success' => true]);
            break;

        case 'update_card_fees':
            // Legacy fallback for cached builds
            echo json_encode(['success' => true]);
            break;

        case 'create_demo_user':
            $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
            $password = password_hash($data['password'] ?? '123456', PASSWORD_DEFAULT);
            $full_name = strip_tags(trim($data['full_name'] ?? 'Demo'));
            $balance = (float)($data['initial_balance'] ?? 0);
            $pix_key = strip_tags(trim($data['pix_key'] ?? 'demo@pix.com'));

            $defTaxStmt = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'default_user_tax'");
            $defaultTax = (float)($defTaxStmt->fetchColumn() ?: '5.0');

            $stmt = $pdo->prepare("INSERT INTO users (email, password, full_name, pix_key, balance, status, referral_token, is_demo, commission_rate) VALUES (?, ?, ?, ?, ?, 'approved', ?, 1, ?)");
            $stmt->execute([$email, $password, $full_name, $pix_key, $balance, bin2hex(random_bytes(8)), $defaultTax]);

            echo json_encode(['success' => true]);
            break;

        case 'create_user':
            $email     = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
            $password  = password_hash($data['password'] ?? '123456', PASSWORD_DEFAULT);
            $full_name = strip_tags(trim($data['full_name'] ?? 'Usuário'));
            $pix_key   = strip_tags(trim($data['pix_key'] ?? ''));
            $status    = in_array($data['status'] ?? 'pending', ['pending','approved']) ? $data['status'] : 'pending';

            // ── Validação rigorosa contra injeção e contas de pentest ──────────
            $clientIp = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
            $injectionPatterns = ["'", '"', '--', ';', 'SLEEP', 'SELECT', 'DROP', 'INSERT', 'UPDATE', 'DELETE', 'UNION', 'EXEC', '<script', '0x', '#'];
            foreach ($injectionPatterns as $pattern) {
                if (stripos($full_name, $pattern) !== false || stripos($email, $pattern) !== false) {
                    throw new Exception("Cadastro rejeitado por motivos de segurança.");
                }
            }

            $pentestKeywords = ['pentest', 'bugbounty', 'sqltest', 'bbadmin', 'bbtest', 'admintest'];
            foreach ($pentestKeywords as $keyword) {
                if (stripos($full_name, $keyword) !== false || stripos($email, $keyword) !== false) {
                    throw new Exception("Cadastro não permitido.");
                }
            }

            $defTaxStmt  = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'default_user_tax'");
            $defaultTax  = (float)($defTaxStmt->fetchColumn() ?: '5.0');

            $stmt = $pdo->prepare("INSERT INTO users (email, password, full_name, pix_key, status, referral_token, is_demo, commission_rate) VALUES (?, ?, ?, ?, ?, ?, 0, ?)");
            $stmt->execute([$email, $password, $full_name, $pix_key, $status, bin2hex(random_bytes(8)), $defaultTax]);

            echo json_encode(['success' => true]);
            break;

        case 'update_user_field':
            $userId = (int)$data['user_id'];
            $field = $data['field']; // 'pix_key', 'balance', 'commission_rate', 'is_demo', 'status', 'preferred_nominal'
            $value = $data['value'];

            if (!in_array($field, ['pix_key', 'balance', 'commission_rate', 'is_demo', 'status', 'preferred_nominal', 'ezzy_acquirer'])) {
                throw new Exception("Campo inválido");
            }

            $stmt = $pdo->prepare("UPDATE users SET $field = ? WHERE id = ? AND is_admin = 0");
            $stmt->execute([$value, $userId]);

            // Se for aprovação, enviar e-mail e notificação
            if ($field === 'status') {
                $title = ($value == 'approved') ? 'Conta Aprovada! ✅' : 'Conta Bloqueada ⚠️';
                $msg = ($value == 'approved') ? 'Sua conta foi verificada e aprovada.' : 'Sua conta foi bloqueada.';
                $type = ($value == 'approved') ? 'success' : 'danger';

                $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)")->execute([$userId, $title, $msg, $type]);

                $u = getUser($userId);
                if ($u) {
                    if ($value == 'approved') MailService::notifyApproval($u['email'], $u['full_name']);
                    try { TelegramService::notifyUserStatusChanged($u['full_name'], $u['email'], $value); } catch (Throwable $e) {}
                }
            }

            echo json_encode(['success' => true]);
            break;

        case 'update_withdraw_nominal':
            $wId = (int)$data['withdraw_id'];
            $nominal = $data['nominal'] ?? 'nominal1';
            if (!in_array($nominal, ['nominal1', 'nominal2', 'nominal3', 'nominal4'])) {
                throw new Exception("Nominal inválido");
            }
            $pdo->prepare("UPDATE withdrawals SET nominal = ? WHERE id = ?")->execute([$nominal, $wId]);
            echo json_encode(['success' => true]);
            break;

        case 'create_fake_withdrawal':
            $userId = (int)$data['user_id'];
            $amount = (float)$data['amount'];

            $stmt = $pdo->prepare("INSERT INTO withdrawals (user_id, full_name, amount, status, type) VALUES (?, (SELECT full_name FROM users WHERE id = ?), ?, 'completed', 'fake')");
            $stmt->execute([$userId, $userId, $amount]);

            echo json_encode(['success' => true]);
            break;

        case 'complete_withdraw':
            $wId = (int)$data['withdraw_id'];
            $hash = $data['tx_hash'] ?? '';
            $pdo->beginTransaction();
            try {
                // Lock + verificar status para evitar double-processing
                $stmtW = $pdo->prepare("SELECT w.user_id, w.amount, w.amount_gross, w.nominal, w.fee_platform, w.pix_key, w.status, w.is_debited, u.full_name, u.whatsapp FROM withdrawals w JOIN users u ON u.id = w.user_id WHERE w.id = ? FOR UPDATE");
                $stmtW->execute([$wId]);
                $w = $stmtW->fetch();
                if (!$w || $w['status'] !== 'pending') {
                    $pdo->rollBack();
                    echo json_encode(['error' => 'Saque não encontrado ou já processado']);
                    break;
                }

                // O valor a ser debitado do saldo do usuário deve ser o valor BRUTO solicitado
                $debitAmount = (float)($w['amount_gross'] ?: $w['amount']);

                // Debitar saldo atomicamente se ainda não foi debitado (compatibilidade com saques antigos)
                if (!$w['is_debited']) {
                    $result = adjustBalance(
                        (int)$w['user_id'],
                        -abs($debitAmount),
                        'withdraw_debit',
                        'wd_' . $wId,
                        'Saque #' . $wId . ' aprovado — ' . ($hash ?: 'sem hash') . ' (Valor Bruto: R$ ' . number_format($debitAmount, 2, ',', '.') . ')',
                        true // Admin pode aprovar mesmo que o saldo tenha caído (ex: MED posterior ao pedido)
                    );
                    if (!$result['success']) {
                        $pdo->rollBack();
                        echo json_encode(['error' => 'Falha ao debitar: ' . $result['error']]);
                        break;
                    }
                }
                $pdo->prepare("UPDATE withdrawals SET status = 'completed', tx_hash = ? WHERE id = ?")->execute([$hash, $wId]);

                // Creditar a taxa da plataforma ao administrador (se houver e não for Nominal 3, que já repassa via Pix)
                $wNominal = $w['nominal'] ?? 'nominal1';
                $wFeePlatform = (float)($w['fee_platform'] ?? 0);
                if ($wNominal !== 'nominal3' && $wFeePlatform > 0) {
                    $adminStmt = $pdo->query("SELECT id FROM users WHERE is_admin = 1 ORDER BY id ASC LIMIT 1");
                    $admin = $adminStmt->fetch();
                    if ($admin) {
                        adjustBalance(
                            (int)$admin['id'],
                            $wFeePlatform,
                            'admin_profit',
                            'wd_' . $wId,
                            'Taxa do saque #' . $wId . ' (Lojista: ' . $w['full_name'] . ')'
                        );
                    }
                }

                $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Saque Enviado! 💸', ?, 'success')")
                    ->execute([$w['user_id'], "Seu saque de R$ " . number_format($w['amount'], 2, ',', '.') . " foi processado."]);
                $pdo->commit();
                $u = getUser($w['user_id']);
                if ($u) MailService::notifyWithdrawalPaid($u['email'], $u['full_name'], $w['amount']);
                try { TelegramService::notifyWithdrawalApproved($w['full_name'], (float)$w['amount'], $w['pix_key'] ?? '', $hash); } catch (Throwable $e) {}

                // Enviar notificações pelo WhatsApp se ativado
                try {
                    require_once __DIR__ . '/includes/WhatsAppService.php';
                    if ($w && !empty($w['whatsapp'])) {
                        WhatsAppService::notifyWithdrawalPaid($w['whatsapp'], $w['full_name'], (float)$w['amount']);
                    }
                    WhatsAppService::notifyWithdrawalPaidAdmin($w['full_name'], (float)$w['amount']);
                } catch (Throwable $e) {}

            } catch (Throwable $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                write_log('ERROR', 'complete_withdraw FAILED', ['wd_id' => $wId, 'error' => $e->getMessage()]);
                echo json_encode(['error' => 'Erro: ' . $e->getMessage()]);
                break;
            }
            echo json_encode(['success' => true]);
            break;

        case 'reject_withdraw':
            $wId = (int)$data['withdraw_id'];
            $stmt = $pdo->prepare("SELECT w.user_id, w.amount, w.amount_gross, w.status, w.is_debited, u.full_name, u.whatsapp FROM withdrawals w JOIN users u ON u.id = w.user_id WHERE w.id = ?");
            $stmt->execute([$wId]);
            $w = $stmt->fetch();
            if ($w && $w['status'] === 'pending') {
                $pdo->beginTransaction();

                // Se o saldo foi debitado no pedido, devolver agora
                if ($w['is_debited']) {
                    $refundAmount = (float)($w['amount_gross'] ?: $w['amount']);
                    adjustBalance(
                        (int)$w['user_id'],
                        abs($refundAmount),
                        'withdraw_refund',
                        'wd_' . $wId,
                        'Estorno de saque #' . $wId . ' rejeitado — R$ ' . number_format($refundAmount, 2, ',', '.')
                    );
                }

                $pdo->prepare("UPDATE withdrawals SET status = 'rejected' WHERE id = ?")->execute([$wId]);
                $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Saque Rejeitado ❌', ?, 'warning')")
                    ->execute([$w['user_id'], "Seu saque de R$ " . number_format($w['amount'], 2, ',', '.') . " foi rejeitado. O valor foi devolvido ao seu saldo."]);
                $pdo->commit();
                try { TelegramService::notifyWithdrawalRejected($w['full_name'], (float)$w['amount']); } catch (Throwable $e) {}

                // Enviar notificações pelo WhatsApp se ativado
                try {
                    require_once __DIR__ . '/includes/WhatsAppService.php';
                    if ($w && !empty($w['whatsapp'])) {
                        WhatsAppService::notifyWithdrawalRejected($w['whatsapp'], $w['full_name'], (float)$w['amount']);
                    }
                    WhatsAppService::notifyWithdrawalRejectedAdmin($w['full_name'], (float)$w['amount']);
                } catch (Throwable $e) {}
            }
            echo json_encode(['success' => true]);
            break;

        case 'reset_user_password':
            $userId = (int)$data['user_id'];
            // Auto-criar coluna se não existir
            try { $pdo->exec("ALTER TABLE users ADD COLUMN must_reset_password TINYINT(1) DEFAULT 0"); } catch (PDOException $e) {}
            // Setar flag de reset (não muda a senha - o user vai definir uma nova ao fazer login)
            $pdo->prepare("UPDATE users SET must_reset_password = 1 WHERE id = ? AND is_admin = 0")->execute([$userId]);
            // Notificar usuário
            $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Senha Resetada 🔑', 'Sua senha foi resetada pelo administrador. Ao fazer login, você precisará criar uma nova senha.', 'warning')")->execute([$userId]);
            write_log('INFO', 'Admin resetou senha do usuário', ['user_id' => $userId]);
            echo json_encode(['success' => true, 'message' => 'Senha resetada. O usuário precisará definir uma nova senha no próximo login.']);
            break;

        case 'add_api':
            $name = strip_tags(trim($data['name'] ?? 'Nova API'));
            $key = strip_tags(trim($data['api_key'] ?? ''));
            $isAdminOnly = isset($data['is_admin_only']) && $data['is_admin_only'] == '1' ? 1 : 0;
            if (empty($key)) throw new Exception("Chave API é obrigatória");
            // Auto-add column if missing
            try { $pdo->exec("ALTER TABLE pixgo_apis ADD COLUMN is_admin_only TINYINT(1) DEFAULT 0"); } catch (PDOException $e) {}
            $stmt = $pdo->prepare("INSERT INTO pixgo_apis (name, api_key, status, is_admin_only) VALUES (?, ?, 'active', ?)");
            $stmt->execute([$name, $key, $isAdminOnly]);
            echo json_encode(['success' => true]);
            break;

        case 'set_api_type':
            $id = (int)$data['id'];
            $isAdminOnly = isset($data['is_admin_only']) && $data['is_admin_only'] == '1' ? 1 : 0;
            try { $pdo->exec("ALTER TABLE pixgo_apis ADD COLUMN is_admin_only TINYINT(1) DEFAULT 0"); } catch (PDOException $e) {}
            $pdo->prepare("UPDATE pixgo_apis SET is_admin_only = ? WHERE id = ?")->execute([$isAdminOnly, $id]);
            echo json_encode(['success' => true]);
            break;

        case 'toggle_api_status':
            $id = (int)$data['id'];
            $stmt = $pdo->prepare("UPDATE pixgo_apis SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;

        case 'delete_api':
            $id = (int)$data['id'];
            $stmt = $pdo->prepare("DELETE FROM pixgo_apis WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;

        case 'toggle_med':
            $txId = (int)$data['transaction_id'];
            $stmt = $pdo->prepare("SELECT med, user_id, amount_brl, amount_net_brl, status FROM transactions WHERE id = ?");
            $stmt->execute([$txId]);
            $tx = $stmt->fetch();
            if (!$tx) {
                echo json_encode(['error' => 'Transação não encontrada']);
                break;
            }
            $newMed = $tx['med'] ? 0 : 1;
            $netAmount = (float)$tx['amount_net_brl'];

            $pdo->beginTransaction();
            try {
                $pdo->prepare("UPDATE transactions SET med = ? WHERE id = ?")->execute([$newMed, $txId]);

                // Ajustar saldo: marcar MED = debitar, remover MED = devolver
                if ($newMed) {
                    // Debitar valor líquido do vendedor
                    $result = adjustBalance(
                        (int)$tx['user_id'],
                        -abs($netAmount),
                        'med_debit',
                        'med_' . $txId,
                        'MED na venda #' . $txId . ' — R$ ' . number_format($tx['amount_brl'], 2, ',', '.'),
                        true // allowNegative
                    );
                } else {
                    // Devolver valor líquido ao vendedor
                    $result = adjustBalance(
                        (int)$tx['user_id'],
                        abs($netAmount),
                        'med_refund',
                        'med_refund_' . $txId,
                        'MED removido da venda #' . $txId . ' — estorno R$ ' . number_format($netAmount, 2, ',', '.')
                    );
                }

                if (!$result['success']) {
                    $pdo->rollBack();
                    echo json_encode(['error' => 'Falha ao ajustar saldo: ' . ($result['error'] ?? 'erro desconhecido')]);
                    break;
                }

                // Notificar vendedor
                $msg = $newMed
                    ? "Sua venda #$txId de R$ " . number_format($tx['amount_brl'], 2, ',', '.') . " recebeu um MED (Mecanismo Especial de Devolução). O valor líquido de R$ " . number_format($netAmount, 2, ',', '.') . " foi debitado do seu saldo."
                    : "O MED da venda #$txId foi removido. R$ " . number_format($netAmount, 2, ',', '.') . " foi devolvido ao seu saldo.";
                $title = $newMed ? 'MED Recebido ⚠️' : 'MED Removido ✅';
                $type = $newMed ? 'danger' : 'success';
                $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)")
                    ->execute([$tx['user_id'], $title, $msg, $type]);

                $pdo->commit();
            } catch (Throwable $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                echo json_encode(['error' => 'Erro: ' . $e->getMessage()]);
                break;
            }
            echo json_encode(['success' => true, 'med' => $newMed]);
            break;

        case 'toggle_sigilopay':
            $enabled = (int)($data['enabled'] ?? 0);
            $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('sigilopay_enabled',?) ON DUPLICATE KEY UPDATE `value`=?")
                ->execute([$enabled, $enabled]);
            echo json_encode(['success' => true]);
            break;

        case 'save_sigilopay':
            $pubKey  = trim($data['sigilopay_public_key'] ?? '');
            $secKey  = trim($data['sigilopay_secret_key'] ?? '');
            $enabled = (int)($data['sigilopay_enabled'] ?? 0);
            $keepSec = ($secKey === '__KEEP__' || $secKey === '');
            // Verifica se já existe secret salvo
            $existsSec = $pdo->query("SELECT `value` FROM settings WHERE `key`='sigilopay_secret_key'")->fetchColumn();
            if (!$pubKey || (!$keepSec && !$secKey)) {
                echo json_encode(['success' => false, 'error' => 'Preencha Public Key e Secret Key']);
                break;
            }
            if (!$keepSec && !$existsSec && !$secKey) {
                echo json_encode(['success' => false, 'error' => 'Preencha a Secret Key']);
                break;
            }
            $toSave = ['sigilopay_public_key' => $pubKey, 'sigilopay_enabled' => $enabled];
            if (!$keepSec) $toSave['sigilopay_secret_key'] = $secKey;
            foreach ($toSave as $k => $v) {
                $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?")
                    ->execute([$k, $v, $v]);
            }
            echo json_encode(['success' => true]);
            break;

        case 'save_brpix':
            $clientId     = trim($data['brpix_client_id'] ?? '');
            $clientSecret = trim($data['brpix_client_secret'] ?? '');
            $enabled      = (int)($data['brpix_enabled'] ?? 0);
            $keepSec      = ($clientSecret === '__KEEP__' || $clientSecret === '');
            $existsSec    = $pdo->query("SELECT `value` FROM settings WHERE `key`='brpix_client_secret'")->fetchColumn();
            if (!$clientId) {
                echo json_encode(['success' => false, 'error' => 'Preencha o Client ID']);
                break;
            }
            if (!$keepSec && !$clientSecret) {
                echo json_encode(['success' => false, 'error' => 'Preencha o Client Secret']);
                break;
            }
            if ($keepSec && !$existsSec) {
                echo json_encode(['success' => false, 'error' => 'Preencha o Client Secret']);
                break;
            }
            $toSave = ['brpix_client_id' => $clientId, 'brpix_enabled' => $enabled];
            if (!$keepSec) $toSave['brpix_client_secret'] = $clientSecret;
            foreach ($toSave as $k => $v) {
                $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?")
                    ->execute([$k, $v, $v]);
            }
            echo json_encode(['success' => true]);
            break;

        case 'toggle_brpix':
            $enabled = (int)($data['enabled'] ?? 0);
            $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('brpix_enabled',?) ON DUPLICATE KEY UPDATE `value`=?")
                ->execute([$enabled, $enabled]);
            echo json_encode(['success' => true]);
            break;

        case 'save_ironpay':
            $token       = trim($data['ironpay_token']        ?? '');
            $offerHash   = trim($data['ironpay_offer_hash']   ?? '');
            $productHash = trim($data['ironpay_product_hash'] ?? '');
            $enabled     = (int)($data['ironpay_enabled']     ?? 0);
            $keepToken   = ($token === '__KEEP__' || $token === '');
            $existsToken = $pdo->query("SELECT `value` FROM settings WHERE `key`='ironpay_token'")->fetchColumn();
            if (!$offerHash || !$productHash) {
                echo json_encode(['success' => false, 'error' => 'Preencha Offer Hash e Product Hash']);
                break;
            }
            if ($keepToken && !$existsToken) {
                echo json_encode(['success' => false, 'error' => 'Preencha o API Token']);
                break;
            }
            $toSave = ['ironpay_offer_hash' => $offerHash, 'ironpay_product_hash' => $productHash, 'ironpay_enabled' => $enabled];
            if (!$keepToken) $toSave['ironpay_token'] = $token;
            foreach ($toSave as $k => $v) {
                $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?")
                    ->execute([$k, $v, $v]);
            }
            echo json_encode(['success' => true]);
            break;

        case 'toggle_ironpay':
            $enabled = (int)($data['enabled'] ?? 0);
            $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('ironpay_enabled',?) ON DUPLICATE KEY UPDATE `value`=?")
                ->execute([$enabled, $enabled]);
            echo json_encode(['success' => true]);
            break;

        case 'save_misticpay':
            $clientId     = trim($data['misticpay_client_id']     ?? '');
            $clientSecret = trim($data['misticpay_client_secret'] ?? '');
            $enabled      = (int)($data['misticpay_enabled']      ?? 0);
            $keepSec      = ($clientSecret === '__KEEP__' || $clientSecret === '');
            $existsSec    = $pdo->query("SELECT `value` FROM settings WHERE `key`='misticpay_client_secret'")->fetchColumn();
            if (!$clientId) {
                echo json_encode(['success' => false, 'error' => 'Preencha o Client ID']);
                break;
            }
            if (!$keepSec && !$clientSecret) {
                echo json_encode(['success' => false, 'error' => 'Preencha o Client Secret']);
                break;
            }
            if ($keepSec && !$existsSec) {
                echo json_encode(['success' => false, 'error' => 'Preencha o Client Secret']);
                break;
            }
            $toSave = ['misticpay_client_id' => $clientId, 'misticpay_enabled' => $enabled];
            if (!$keepSec) $toSave['misticpay_client_secret'] = $clientSecret;
            foreach ($toSave as $k => $v) {
                $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?")
                    ->execute([$k, $v, $v]);
            }
            echo json_encode(['success' => true]);
            break;

        case 'toggle_misticpay':
            $enabled = (int)($data['enabled'] ?? 0);
            $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('misticpay_enabled',?) ON DUPLICATE KEY UPDATE `value`=?")
                ->execute([$enabled, $enabled]);
            echo json_encode(['success' => true]);
            break;

        case 'save_ezzybanking':
            $apiKey    = trim($data['ezzybanking_api_key']        ?? '');
            $apiSecret = trim($data['ezzybanking_api_secret']     ?? '');
            $whSecret  = trim($data['ezzybanking_webhook_secret'] ?? '');
            $feePerc   = (float)($data['ezzybanking_fee_percent'] ?? 3.99);
            $feeFixed  = (float)($data['ezzybanking_fee_fixed']   ?? 0.25);
            $enabled   = (int)($data['ezzybanking_enabled']       ?? 0);
            $keepKey   = ($apiKey    === '__KEEP__' || $apiKey    === '');
            $keepSec   = ($apiSecret === '__KEEP__' || $apiSecret === '');
            $keepWh    = ($whSecret  === '__KEEP__' || $whSecret  === '');
            $existsKey = $pdo->query("SELECT `value` FROM settings WHERE `key`='ezzybanking_api_key'")->fetchColumn();
            $existsSec = $pdo->query("SELECT `value` FROM settings WHERE `key`='ezzybanking_api_secret'")->fetchColumn();
            if ($keepKey && !$existsKey) {
                echo json_encode(['success' => false, 'error' => 'Preencha a API Key']);
                break;
            }
            if ($keepSec && !$existsSec) {
                echo json_encode(['success' => false, 'error' => 'Preencha o API Secret']);
                break;
            }
            $toSave = [
                'ezzybanking_enabled'     => $enabled,
                'ezzybanking_fee_percent' => number_format($feePerc,  2, '.', ''),
                'ezzybanking_fee_fixed'   => number_format($feeFixed, 2, '.', ''),
            ];
            if (!$keepKey) $toSave['ezzybanking_api_key']        = $apiKey;
            if (!$keepSec) $toSave['ezzybanking_api_secret']     = $apiSecret;
            if (!$keepWh)  $toSave['ezzybanking_webhook_secret'] = $whSecret;
            foreach ($toSave as $k => $v) {
                $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?")
                    ->execute([$k, $v, $v]);
            }
            echo json_encode(['success' => true]);
            break;

        case 'toggle_ezzybanking':
            $enabled = (int)($data['enabled'] ?? 0);
            $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('ezzybanking_enabled',?) ON DUPLICATE KEY UPDATE `value`=?")
                ->execute([$enabled, $enabled]);
            echo json_encode(['success' => true]);
            break;

        case 'get_ezzybanking_balance':
            require_once 'includes/EzzyBankingService.php';
            $res = EzzyBankingService::getBalance();
            if ($res['ok'] && is_array($res['data'])) {
                $info = $res['data'];
                echo json_encode([
                    'success'          => true,
                    'availableBalance' => (float)($info['available_balance'] ?? $info['balance'] ?? $info['available'] ?? 0),
                    'blockedBalance'   => (float)($info['blocked_balance']   ?? $info['blocked']  ?? 0),
                    'name'             => $info['name'] ?? $info['account_name'] ?? '',
                ]);
            } else {
                $err = $res['error'] ?? 'Não foi possível conectar à API da Ezzy Banking';
                echo json_encode(['success' => false, 'error' => $err]);
            }
            break;

        case 'get_ezzy_acquirers':
            require_once 'includes/EzzyBankingService.php';
            $res = EzzyBankingService::listAcquirers();
            if ($res['ok'] && isset($res['data']) && is_array($res['data'])) {
                echo json_encode([
                    'success' => true,
                    'data' => $res['data'],
                ]);
            } else {
                $err = $res['error'] ?? 'Não foi possível obter lista de adquirentes';
                echo json_encode(['success' => false, 'error' => $err]);
            }
            break;

        case 'get_misticpay_balance':
            require_once 'includes/MisticPayService.php';
            $res = MisticPayService::getUserInfo();
            if ($res['http_code'] === 200 && isset($res['data']['data'])) {
                $info = $res['data']['data'];
                echo json_encode([
                    'success'          => true,
                    'availableBalance' => (float)($info['availableBalance'] ?? 0),
                    'blockedBalance'   => (float)($info['blockedBalance'] ?? 0),
                    'name'             => $info['name'] ?? '',
                ]);
            } else {
                 $err = $res['data']['message'] ?? ($res['curl_error'] ?: 'Não foi possível conectar à API do Nominal 3');
                 echo json_encode(['success' => false, 'error' => $err]);
            }
            break;

        case 'payout_withdraw_misticpay':
            $wId = (int)($data['withdraw_id'] ?? 0);
            if ($wId <= 0) {
                echo json_encode(['success' => false, 'error' => 'ID de saque inválido']);
                break;
            }

            $pdo->beginTransaction();
            try {
                // Lock no banco de dados para evitar concorrência
                $stmtW = $pdo->prepare("SELECT w.*, u.full_name, u.whatsapp, u.email FROM withdrawals w JOIN users u ON u.id = w.user_id WHERE w.id = ? FOR UPDATE");
                $stmtW->execute([$wId]);
                $w = $stmtW->fetch();

                if (!$w || $w['status'] !== 'pending') {
                    $pdo->rollBack();
                    echo json_encode(['success' => false, 'error' => 'Saque não encontrado ou já processado']);
                    break;
                }

                // Deduzir tipo de chave Pix se estiver vazio
                $pixKeyType = $w['pix_key_type'] ?? '';
                if (empty($pixKeyType)) {
                    $pixKey = trim($w['pix_key']);
                    if (strpos($pixKey, '@') !== false) {
                        $pixKeyType = 'EMAIL';
                    } elseif (preg_match('/^[0-9]{11}$/', preg_replace('/\D/', '', $pixKey))) {
                        $pixKeyType = 'CPF';
                    } elseif (preg_match('/^[0-9]{14}$/', preg_replace('/\D/', '', $pixKey))) {
                        $pixKeyType = 'CNPJ';
                    } elseif (preg_match('/^\+?[0-9]{10,15}$/', preg_replace('/[^\d]/', '', $pixKey))) {
                        $pixKeyType = 'TELEFONE';
                    } else {
                        $pixKeyType = 'CHAVE_ALEATORIA';
                    }
                }

                // O valor líquido que deve ser transferido
                $netAmount = (float)$w['amount'];

                require_once 'includes/MisticPayService.php';
                $mpRes = MisticPayService::requestWithdraw($netAmount, $w['pix_key'], $pixKeyType, 'Saque DiretoPay #' . $wId);

                if (($mpRes['http_code'] === 200 || $mpRes['http_code'] === 201) && !empty($mpRes['data']['data']['transactionId'])) {
                    $txHash = $mpRes['data']['data']['transactionId'];

                    // Se por algum motivo o saldo bruto não foi debitado no pedido original (compatibilidade legada)
                    if (!$w['is_debited']) {
                        $debitAmount = (float)($w['amount_gross'] ?: $w['amount']);
                        $adjust = adjustBalance(
                            (int)$w['user_id'],
                            -abs($debitAmount),
                            'withdraw_debit',
                            'wd_' . $wId,
                            'Saque #' . $wId . ' aprovado automaticamente via Nominal 3',
                            true
                        );
                        if (!$adjust['success']) {
                            $pdo->rollBack();
                            echo json_encode(['success' => false, 'error' => 'Falha ao debitar saldo: ' . $adjust['error']]);
                            break;
                        }
                    }

                    // Dar baixa no saque no banco
                    $pdo->prepare("UPDATE withdrawals SET status = 'completed', tx_hash = ? WHERE id = ?")->execute([$txHash, $wId]);
                    $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Saque Enviado! 💸', ?, 'success')")
                        ->execute([$w['user_id'], "Seu saque de R$ " . number_format($w['amount'], 2, ',', '.') . " foi processado automaticamente."]);

                    $pdo->commit();

                    // Notificações por E-mail, Telegram e WhatsApp (fora da transação de banco)
                    try { MailService::notifyWithdrawalPaid($w['email'], $w['full_name'], $netAmount); } catch (Throwable $e) {}
                    try { TelegramService::notifyWithdrawalApproved($w['full_name'], $netAmount, $w['pix_key'], $txHash); } catch (Throwable $e) {}
                    try {
                        require_once __DIR__ . '/includes/WhatsAppService.php';
                        if ($w && !empty($w['whatsapp'])) {
                            WhatsAppService::notifyWithdrawalPaid($w['whatsapp'], $w['full_name'], $netAmount);
                        }
                        WhatsAppService::notifyWithdrawalPaidAdmin($w['full_name'], $netAmount);
                    } catch (Throwable $e) {}

                    echo json_encode(['success' => true, 'tx_hash' => $txHash]);
                } else {
                    $pdo->rollBack();
                     $errMsg = $mpRes['data']['message'] ?? ($mpRes['curl_error'] ?: 'Erro retornado pela API do Nominal 3');
                     write_log('ERROR', 'Saque automatico Nominal 3 falhou', ['wd_id' => $wId, 'api_response' => $mpRes]);
                     echo json_encode(['success' => false, 'error' => 'API Nominal 3: ' . $errMsg]);
                }
            } catch (Throwable $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                write_log('ERROR', 'Erro critico no saque automatico', ['wd_id' => $wId, 'error' => $e->getMessage()]);
                echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
            }
            break;

        case 'toggle_pixgo':
        case 'setup_cakto_webhook':
            echo json_encode(['success' => false, 'error' => 'Gateway removido. Apenas SigiloPay é suportado.']);
            break;

        case '_setup_cakto_webhook_DISABLED':
            $clientId     = trim($data['client_id'] ?? '');
            $clientSecret = trim($data['client_secret'] ?? '');
            if (!$clientId || !$clientSecret) {
                echo json_encode(['success' => false, 'error' => 'Preencha CLIENT ID e CLIENT SECRET']);
                break;
            }

            // 1. Get access token from Cakto
            $ch = curl_init('https://api.cakto.com.br/public_api/token/');
            curl_setopt_array($ch, [
                CURLOPT_POST           => 1,
                CURLOPT_POSTFIELDS     => "client_id=$clientId&client_secret=$clientSecret",
                CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 15,
                CURLOPT_SSL_VERIFYPEER => false,
            ]);
            $tokenResult = curl_exec($ch);
            curl_close($ch);

            $tokenData   = json_decode($tokenResult, true);
            $accessToken = $tokenData['access_token'] ?? '';
            if (!$accessToken) {
                echo json_encode(['success' => false, 'error' => 'Credenciais inválidas: ' . ($tokenData['error'] ?? $tokenResult)]);
                break;
            }

            // 2. Save credentials + token in settings
            $upsert = $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?");
            $upsert->execute(['cakto_client_id',     $clientId,     $clientId]);
            $upsert->execute(['cakto_client_secret',  $clientSecret, $clientSecret]);
            $upsert->execute(['cakto_token',           $accessToken,  $accessToken]);
            $upsert->execute(['cakto_token_expiry',    (string)(time() + 35000), (string)(time() + 35000)]);

            // 3. Register webhook in Cakto
            $webhookUrl  = 'https://diretopay.site/cakto_webhook.php';
            $webhookBody = json_encode([
                'name'   => 'DiretoPay - Compra Aprovada',
                'url'    => $webhookUrl,
                'events' => ['purchase_approved'],
                'status' => 'active',
            ]);
            $ch = curl_init('https://api.cakto.com.br/public_api/webhook/');
            curl_setopt_array($ch, [
                CURLOPT_POST           => 1,
                CURLOPT_POSTFIELDS     => $webhookBody,
                CURLOPT_HTTPHEADER     => ['Content-Type: application/json', "Authorization: Bearer $accessToken"],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 15,
                CURLOPT_SSL_VERIFYPEER => false,
            ]);
            $whResult = curl_exec($ch);
            curl_close($ch);

            $whData        = json_decode($whResult, true);
            $webhookId     = $whData['id'] ?? '';
            $webhookSecret = $whData['fields']['secret'] ?? '';

            if ($webhookId) {
                $upsert->execute(['cakto_webhook_id',     (string)$webhookId, (string)$webhookId]);
                $upsert->execute(['cakto_webhook_secret',  $webhookSecret,     $webhookSecret]);
                echo json_encode(['success' => true, 'webhook_id' => $webhookId, 'webhook_url' => $webhookUrl]);
            } else {
                $upsert->execute(['cakto_webhook_id',    '', '']);
                echo json_encode(['success' => true, 'warning' => 'Credenciais salvas. Webhook: ' . ($whData['detail'] ?? $whResult), 'token_ok' => true]);
            }
            break;

        case 'delete_user':
            $userId = (int)$data['user_id'];

            // Proibir exclusão de administradores por segurança
            $stmtCheck = $pdo->prepare("SELECT is_admin FROM users WHERE id = ?");
            $stmtCheck->execute([$userId]);
            $userCheck = $stmtCheck->fetch();
            if ($userCheck && (int)$userCheck['is_admin'] === 1) {
                throw new Exception("Administradores não podem ser deletados.");
            }

            $pdo->beginTransaction();
            try {
                // Deleta registros filhos nas tabelas relacionadas
                $pdo->prepare("DELETE FROM balance_log WHERE user_id = ?")->execute([$userId]);
                $pdo->prepare("DELETE FROM notifications WHERE user_id = ?")->execute([$userId]);
                $pdo->prepare("DELETE FROM withdrawals WHERE user_id = ?")->execute([$userId]);
                $pdo->prepare("DELETE FROM transactions WHERE user_id = ?")->execute([$userId]);
                $pdo->prepare("DELETE FROM products WHERE user_id = ?")->execute([$userId]);
                $pdo->prepare("DELETE FROM checkouts WHERE user_id = ?")->execute([$userId]);
                $pdo->prepare("DELETE FROM orders WHERE buyer_user_id = ? OR seller_id = ?")->execute([$userId, $userId]);

                // Por fim, deleta o usuário
                $pdo->prepare("DELETE FROM users WHERE id = ? AND is_admin = 0")->execute([$userId]);

                $pdo->commit();
                write_log('INFO', 'Usuário deletado via painel admin', ['user_id' => $userId]);
                echo json_encode(['success' => true]);
            } catch (Throwable $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                throw $e;
            }
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Ação desconhecida']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
