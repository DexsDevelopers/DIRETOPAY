<?php
require_once 'includes/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$event    = $data['event']    ?? '';   // 'store_visit' | 'cart_abandoned'
$sellerId = (int)($data['seller_id'] ?? 0);
$extra    = $data['extra']    ?? '';

if (!$sellerId || !in_array($event, ['store_visit', 'cart_abandoned'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false]);
    exit;
}

try {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $ip = explode(',', $ip)[0];

    if ($event === 'store_visit') {
        // Limitar: 1 notificação por IP por loja por hora
        $check = $pdo->prepare(
            "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND type = 'store_visit' AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR) AND message LIKE ?"
        );
        $check->execute([$sellerId, "%$ip%"]);
        if ($check->fetchColumn() > 0) {
            echo json_encode(['success' => true, 'skipped' => true]);
            exit;
        }
        $pdo->prepare(
            "INSERT INTO notifications (user_id, title, message, type) VALUES (?, '👁️ Visita na Loja', ?, 'store_visit')"
        )->execute([$sellerId, "Alguém visitou sua loja sem comprar. IP: $ip" . ($extra ? " | $extra" : '')]);

    } elseif ($event === 'cart_abandoned') {
        $pdo->prepare(
            "INSERT INTO notifications (user_id, title, message, type) VALUES (?, '🛒 Carrinho Abandonado', ?, 'cart_abandoned')"
        )->execute([$sellerId, "Um visitante iniciou um checkout mas não finalizou." . ($extra ? " Produto: $extra" : '')]);
    }

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    echo json_encode(['success' => false]);
}
