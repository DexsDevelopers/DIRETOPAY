<?php
require_once 'includes/db.php';
require_once 'includes/TelegramService.php';
try { require_once 'includes/PushService.php'; } catch (Throwable $e) {}

header('Content-Type: application/json');

if (!isLoggedIn()) { echo json_encode(['success' => false, 'error' => 'Não autorizado']); exit; }

$headers   = getallheaders();
$csrfToken = $headers['X-CSRF-Token'] ?? ($headers['x-csrf-token'] ?? '');
check_csrf($csrfToken);

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? ($_GET['action'] ?? '');

try {

    switch ($action) {

        // ════════════════════════════════════════════════════════════════════
        // LIST — subscriptions + payments for a product (or all seller subs)
        // ════════════════════════════════════════════════════════════════════
        case 'list':
            $pid = (int)($_GET['product_id'] ?? $input['product_id'] ?? 0);
            if ($pid) {
                // Verify product belongs to seller
                $chk = $pdo->prepare("SELECT id FROM products WHERE id = ? AND user_id = ?");
                $chk->execute([$pid, $userId]);
                if (!$chk->fetch()) { echo json_encode(['success' => false, 'error' => 'Produto não encontrado.']); exit; }

                $stmt = $pdo->prepare("SELECT s.*, p.name AS product_name, p.subscription_interval,
                    (SELECT COUNT(*) FROM subscription_payments sp WHERE sp.subscription_id = s.id AND sp.status = 'paid') AS payments_count
                    FROM subscriptions s JOIN products p ON p.id = s.product_id
                    WHERE s.product_id = ? ORDER BY s.created_at DESC");
                $stmt->execute([$pid]);
            } else {
                $stmt = $pdo->prepare("SELECT s.*, p.name AS product_name, p.subscription_interval,
                    (SELECT COUNT(*) FROM subscription_payments sp WHERE sp.subscription_id = s.id AND sp.status = 'paid') AS payments_count
                    FROM subscriptions s JOIN products p ON p.id = s.product_id
                    WHERE s.seller_id = ? ORDER BY s.created_at DESC");
                $stmt->execute([$userId]);
            }
            $subs = $stmt->fetchAll();

            // Stats
            $statsStmt = $pdo->prepare("SELECT
                COUNT(CASE WHEN status='active'    THEN 1 END) AS active_count,
                COUNT(CASE WHEN status='pending'   THEN 1 END) AS pending_count,
                COUNT(CASE WHEN status='cancelled' THEN 1 END) AS cancelled_count,
                SUM(CASE WHEN status='active' THEN billing_amount ELSE 0 END) AS mrr
                FROM subscriptions WHERE seller_id = ?");
            $statsStmt->execute([$userId]);
            $stats = $statsStmt->fetch();

            echo json_encode(['success' => true, 'subscriptions' => $subs, 'stats' => $stats]);
            break;

        // ════════════════════════════════════════════════════════════════════
        // DETAIL — single subscription + payment history
        // ════════════════════════════════════════════════════════════════════
        case 'detail':
            $sid = (int)($input['id'] ?? 0);
            $sub = $pdo->prepare("SELECT s.*, p.name AS product_name, p.subscription_interval FROM subscriptions s JOIN products p ON p.id = s.product_id WHERE s.id = ? AND s.seller_id = ?");
            $sub->execute([$sid, $userId]);
            $subscription = $sub->fetch();
            if (!$subscription) { echo json_encode(['success' => false, 'error' => 'Assinatura não encontrada.']); exit; }

            $pays = $pdo->prepare("SELECT * FROM subscription_payments WHERE subscription_id = ? ORDER BY created_at DESC");
            $pays->execute([$sid]);

            echo json_encode(['success' => true, 'subscription' => $subscription, 'payments' => $pays->fetchAll()]);
            break;

        // ════════════════════════════════════════════════════════════════════
        // CANCEL — seller cancels a subscription
        // ════════════════════════════════════════════════════════════════════
        case 'cancel':
            $sid = (int)($input['id'] ?? 0);
            $chk = $pdo->prepare("SELECT id FROM subscriptions WHERE id = ? AND seller_id = ?");
            $chk->execute([$sid, $userId]);
            if (!$chk->fetch()) { echo json_encode(['success' => false, 'error' => 'Assinatura não encontrada.']); exit; }

            $pdo->prepare("UPDATE subscriptions SET status='cancelled', cancelled_at=NOW() WHERE id = ?")->execute([$sid]);
            echo json_encode(['success' => true]);
            break;

        // ════════════════════════════════════════════════════════════════════
        // BILL — manually generate a new PIX charge for renewal
        // ════════════════════════════════════════════════════════════════════
        case 'bill':
            $sid = (int)($input['id'] ?? 0);
            $sub = $pdo->prepare("SELECT s.*, p.name AS product_name, u.pix_key, u.commission_rate FROM subscriptions s JOIN products p ON p.id = s.product_id JOIN users u ON u.id = s.seller_id WHERE s.id = ? AND s.seller_id = ?");
            $sub->execute([$sid, $userId]);
            $subscription = $sub->fetch();

            if (!$subscription) { echo json_encode(['success' => false, 'error' => 'Assinatura não encontrada.']); exit; }
            if ($subscription['status'] !== 'active') { echo json_encode(['success' => false, 'error' => 'Assinatura não está ativa.']); exit; }

            $amount     = (float)$subscription['billing_amount'];
            $externalId = 'sub_' . $sid . '_' . time();
            $currentKey = getActivePixGoKey();

            if ($currentKey === 'SUA_API_KEY_AQUI' || empty($currentKey)) {
                // Simulation
                $pixCode = '00020126360014br.gov.bcb.pix0114000000000000005204000053039865802BR5925GHOSTPIX6009SAOPAULO62070503***6304ABCD';
                $qrImage = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=GHOSTPIX_SUB_' . $sid;
                $pixId   = 'sim_sub_' . time();
                $netAmt  = $amount * 0.95;

                saveTransaction($userId, $amount, $netAmt, $pixId, $pixCode, $qrImage, null, $subscription['subscriber_name'], $externalId, 'pix');
                $txId = (int)$pdo->lastInsertId();
            } else {
                $data = ['amount' => $amount, 'description' => 'Renovação: ' . mb_substr($subscription['product_name'], 0, 40), 'webhook_url' => getFullUrl('webhook.php'), 'external_id' => $externalId, 'payer' => ['name' => $subscription['subscriber_name']]];
                $ch = curl_init('https://pixgo.org/api/v1/payment/create');
                curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($data), CURLOPT_HTTPHEADER => ['x-api-key: ' . $currentKey, 'Content-Type: application/json'], CURLOPT_TIMEOUT => 30]);
                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);

                $res = json_decode($response, true);
                if ($httpCode < 200 || $httpCode >= 300 || empty($res['success'])) {
                    throw new Exception('Erro no gateway de pagamento.');
                }
                $pixData = $res['data'] ?? [];
                $pixId   = $pixData['payment_id'] ?? '';
                $qrImage = $pixData['qr_image_url'] ?? '';
                $pixCode = $pixData['pix_code'] ?? ($pixData['payload'] ?? '');
                $pixgoFee    = $amount * 0.02 + ($amount < 50 ? 1.00 : 0);
                $platformFee = $amount * ($subscription['commission_rate'] / 100);
                $netAmt      = $amount - $pixgoFee - $platformFee;

                saveTransaction($userId, $amount, $netAmt, $pixId, $pixCode, $qrImage, null, $subscription['subscriber_name'], $externalId, 'pix');
                $txId = (int)$pdo->lastInsertId();
            }

            // Record subscription payment
            $pdo->prepare("INSERT INTO subscription_payments (subscription_id, transaction_id, amount, pix_code, qr_image, due_at) VALUES (?,?,?,?,?,NOW())")
                ->execute([$sid, $txId, $amount, $pixCode, $qrImage]);

            echo json_encode(['success' => true, 'pix_code' => $pixCode, 'qr_image' => $qrImage, 'amount' => $amount]);
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Ação inválida.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
