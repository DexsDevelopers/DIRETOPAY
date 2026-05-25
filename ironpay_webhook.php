<?php
/**
 * Webhook IronPay — recebe postback de pagamentos confirmados
 */

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $_SERVER['REQUEST_METHOD'] === 'HEAD') {
    http_response_code(200);
    echo 'ok';
    exit;
}

require_once __DIR__ . '/includes/db.php';

$rawBody = file_get_contents('php://input');
write_log('info', "[ironpay_webhook] payload: " . substr($rawBody, 0, 1000));

$data = json_decode($rawBody, true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload']);
    exit;
}

$paymentStatus = $data['payment_status'] ?? '';
$txHash        = $data['hash']           ?? '';

if ($paymentStatus !== 'paid' || empty($txHash)) {
    http_response_code(200);
    echo json_encode(['ok' => true, 'skipped' => true]);
    exit;
}

// Busca a transação pelo pix_id (= hash da IronPay)
$stmt = $pdo->prepare("SELECT id, status, amount FROM transactions WHERE pix_id = ? LIMIT 1");
$stmt->execute([$txHash]);
$tx = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$tx) {
    write_log('warning', "[ironpay_webhook] transacao nao encontrada: $txHash");
    http_response_code(200);
    echo json_encode(['ok' => true, 'not_found' => true]);
    exit;
}

if ($tx['status'] === 'paid') {
    write_log('info', "[ironpay_webhook] transacao ja paga: $txHash");
    http_response_code(200);
    echo json_encode(['ok' => true, 'already_paid' => true]);
    exit;
}

// Marca como pago
$pdo->prepare("UPDATE transactions SET status='paid', paid_at=NOW() WHERE id=?")
    ->execute([$tx['id']]);

write_log('info', "[ironpay_webhook] transacao PAGA: id={$tx['id']} hash=$txHash valor={$tx['amount']}");

http_response_code(200);
echo json_encode(['ok' => true]);
