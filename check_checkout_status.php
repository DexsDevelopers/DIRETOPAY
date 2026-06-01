<?php
require_once 'includes/db.php';
require_once 'includes/TelegramService.php';
require_once 'includes/MailService.php';
try { require_once 'includes/PushService.php'; } catch (Throwable $e) {}

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$pixId = $_GET['pix_id'] ?? '';

if (empty($pixId)) {
    echo json_encode(['error' => 'ID do Pix não informado']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM transactions WHERE pix_id = ?");
$stmt->execute([$pixId]);
$txRow = $stmt->fetch();

if (!$txRow) {
    echo json_encode(['status' => 'not_found']);
    exit;
}

// Se já pago, retorna direto
if ($txRow['status'] === 'paid') {
    echo json_encode(['status' => 'paid']);
    exit;
}

// ── Fallback: consulta SigiloPay API diretamente ─────────────────────────────
// Se ainda pending, verifica diretamente na API (contorna falha de webhook)
try {
    $getSetting = function(string $key) use ($pdo): string {
        $s = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $s->execute([$key]);
        $val = $s->fetchColumn();
        return ($val === false) ? '' : (string)$val;
    };

    $sigiloEnabled   = $getSetting('sigilopay_enabled') === '1';
    $sigiloPublicKey = $getSetting('sigilopay_public_key');
    $sigiloSecretKey = $getSetting('sigilopay_secret_key');

    if ($sigiloEnabled && $sigiloPublicKey && $sigiloSecretKey) {
        $ch = curl_init('https://app.sigilopay.com.br/api/v1/gateway/transactions/' . urlencode($pixId));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPGET        => true,
            CURLOPT_HTTPHEADER     => [
                'x-public-key: ' . $sigiloPublicKey,
                'x-secret-key: ' . $sigiloSecretKey,
                'Content-Type: application/json',
                'Accept: application/json',
                'User-Agent: Mozilla/5.0 (compatible; DiretoPay/2.0; +https://diretopay.com.br)',
            ],
            CURLOPT_TIMEOUT        => 8,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $spBody = curl_exec($ch);
        $spCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        write_log('info', "SigiloPay poll: HTTP=$spCode pix_id=$pixId body=" . substr($spBody ?: '', 0, 300));

        if ($spCode === 200 && $spBody) {
            $spData   = json_decode($spBody, true);
            $spStatus = strtoupper($spData['status'] ?? $spData['transaction']['status'] ?? '');

            if (in_array($spStatus, ['PAID', 'COMPLETED', 'APPROVED'])) {
                // Idempotência
                $dup = $pdo->prepare("SELECT id FROM transactions WHERE pix_id = ? AND status = 'paid'");
                $dup->execute([$pixId]);
                if (!$dup->fetch()) {
                    // Processa pagamento
                    $amount = (float)$txRow['amount_brl'];
                    $userId = (int)$txRow['user_id'];

                    $pdo->beginTransaction();
                    $pdo->prepare("UPDATE transactions SET status='paid' WHERE pix_id=? AND status='pending'")->execute([$pixId]);
                    $pdo->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$amount, $userId]);
                    try {
                        $pdo->prepare("INSERT INTO balance_log (user_id, type, amount, description, created_at) VALUES (?,?,?,?,NOW())")
                            ->execute([$userId, 'credit', $amount, 'Pagamento PIX confirmado via poll #' . $pixId]);
                    } catch (Throwable $e) {}
                    try {
                        $pdo->prepare("INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?,?,?,?,NOW())")
                            ->execute([$userId, 'payment', '✅ Pagamento Confirmado', 'R$ ' . number_format($amount, 2, ',', '.') . ' creditado na sua conta.']);
                    } catch (Throwable $e) {}
                    $pdo->commit();

                    // Disparar repasse/saque automático se ativado para o lojista
                    triggerAutoWithdraw(
                        (int)$userId,
                        (float)$amount,
                        (float)$txRow['amount_net_brl'],
                        $txRow['id']
                    );

                    // Disparar comissão de indicação para o afiliado se houver
                    processAffiliateCommission((int)$userId, (int)$txRow['id']);

                    // Notificações
                    try {
                        $userData = getUser($userId);
                        TelegramService::notifySale($amount, (float)$txRow['amount_net_brl'], $txRow['customer_name'] ?? 'N/A', $userData['full_name'] ?? 'N/A', (int)$txRow['id'], 'SigiloPay-Poll');
                    } catch (Throwable $e) {}

                    // UTMify
                    try {
                        require_once 'includes/UtmifyService.php';
                        $utmTokenStmt = $pdo->prepare("SELECT utmify_api_token FROM users WHERE id = ? LIMIT 1");
                        $utmTokenStmt->execute([$userId]);
                        $utmToken = (string)($utmTokenStmt->fetchColumn() ?: '');
                        if (!empty($utmToken)) {
                            $fullTx = $pdo->prepare("SELECT * FROM transactions WHERE pix_id = ?");
                            $fullTx->execute([$pixId]);
                            UtmifyService::notifySale($utmToken, $fullTx->fetch() ?: $txRow);
                        }
                    } catch (Throwable $e) {}

                    write_log('info', "SigiloPay poll: pagamento processado via fallback pix_id=$pixId user=$userId");
                }
                echo json_encode(['status' => 'paid']);
                exit;
            }
        }
    }
} catch (Throwable $e) {
    write_log('warning', 'SigiloPay poll fallback erro: ' . $e->getMessage());
}

echo json_encode(['status' => $txRow['status']]);
