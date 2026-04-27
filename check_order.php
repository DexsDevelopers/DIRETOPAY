<?php
/**
 * check_order.php — Poll payment status by delivery_token.
 * Used by produto.php to detect when a PIX is confirmed.
 */
require_once __DIR__ . '/includes/db.php';
header('Content-Type: application/json');

$token = trim($_GET['token'] ?? '');
if (!$token) {
    echo json_encode(['status' => 'error', 'message' => 'Token inválido']);
    exit;
}

try {
    // Check regular product order
    $stmt = $pdo->prepare("
        SELECT o.status AS order_status, o.delivery_data,
               t.status AS tx_status,
               p.delivery_info,
               cr.chat_token
        FROM orders o
        JOIN transactions t ON t.id = o.transaction_id
        JOIN products p     ON p.id = o.product_id
        LEFT JOIN chat_rooms cr ON cr.order_id = o.id
        WHERE o.delivery_token = ?
        LIMIT 1
    ");
    $stmt->execute([$token]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($order) {
        $status = match($order['tx_status']) {
            'approved' => 'paid',
            'expired'  => 'expired',
            default    => 'pending',
        };
        echo json_encode([
            'status'        => $status,
            'chat_token'    => $status === 'paid' ? ($order['chat_token'] ?? null) : null,
            'delivery_info' => $status === 'paid' ? ($order['delivery_info'] ?? null) : null,
            'delivery_data' => $status === 'paid' ? ($order['delivery_data'] ?? null) : null,
        ]);
        exit;
    }

    // Check subscription (token = subscription_id for subscribe.php flow)
    if (is_numeric($token)) {
        $subStmt = $pdo->prepare("
            SELECT s.status, p.delivery_info
            FROM subscriptions s
            JOIN products p ON p.id = s.product_id
            WHERE s.id = ?
            LIMIT 1
        ");
        $subStmt->execute([(int)$token]);
        $sub = $subStmt->fetch(PDO::FETCH_ASSOC);

        if ($sub) {
            $status = match($sub['status']) {
                'active'    => 'paid',
                'cancelled', 'expired' => 'expired',
                default     => 'pending',
            };
            echo json_encode([
                'status'        => $status,
                'delivery_info' => $status === 'paid' ? ($sub['delivery_info'] ?? null) : null,
            ]);
            exit;
        }
    }

    echo json_encode(['status' => 'not_found']);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error']);
}
