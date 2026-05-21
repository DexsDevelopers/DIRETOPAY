<?php
require_once 'includes/db.php';
require_once 'includes/TelegramService.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$data     = json_decode(file_get_contents('php://input'), true);
$event    = $data['event']    ?? '';   // 'store_visit' | 'cart_abandoned' | 'checkout_visit'
$sellerId = (int)($data['seller_id'] ?? 0);
$extra    = $data['extra']    ?? '';   // nome do produto/checkout

if (!$sellerId || !in_array($event, ['store_visit', 'cart_abandoned', 'checkout_visit'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false]);
    exit;
}

try {
    $ip = get_real_ip();

    // Buscar dados do vendedor (para Telegram)
    $sellerStmt = $pdo->prepare("SELECT telegram_chat_id FROM users WHERE id = ? AND status = 'approved'");
    $sellerStmt->execute([$sellerId]);
    $seller = $sellerStmt->fetch();
    $tgChatId = $seller['telegram_chat_id'] ?? '';

    if ($event === 'store_visit' || $event === 'checkout_visit') {
        // Limitar: 1 notificação por IP por loja por hora
        $check = $pdo->prepare(
            "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND type = 'store_visit' AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR) AND message LIKE ?"
        );
        $check->execute([$sellerId, "%$ip%"]);
        if ($check->fetchColumn() > 0) {
            echo json_encode(['success' => true, 'skipped' => true]);
            exit;
        }
        $productName = $extra ?: 'Loja';
        $pdo->prepare(
            "INSERT INTO notifications (user_id, title, message, type) VALUES (?, '👁️ Visita no Checkout', ?, 'store_visit')"
        )->execute([$sellerId, "Alguém visitou: {$productName}. IP: {$ip}"]);

        // Push Telegram ao vendedor
        if ($tgChatId) {
            try { TelegramService::notifyCheckoutVisit($tgChatId, $productName, $ip); } catch (Throwable $e) {}
        }

    } elseif ($event === 'cart_abandoned') {
        $pdo->prepare(
            "INSERT INTO notifications (user_id, title, message, type) VALUES (?, '🛒 Carrinho Abandonado', ?, 'cart_abandoned')"
        )->execute([$sellerId, "Um visitante iniciou um checkout mas não finalizou." . ($extra ? " Produto: $extra" : '')]);

        // Push Telegram ao vendedor
        if ($tgChatId) {
            $msg = "🛒 <b>CARRINHO ABANDONADO</b>\n━━━━━━━━━━━━━━━━━━━━\n\n"
                 . "😕 Um visitante iniciou mas não finalizou o pagamento.\n"
                 . ($extra ? "🛍 <b>Produto:</b> " . htmlspecialchars($extra) . "\n\n" : "\n")
                 . "💡 <i>Considere otimizar sua página de vendas!</i>"
                 . "\n\n🌙 <i>LunarPay • " . date('H:i') . "</i>";
            try { TelegramService::sendToUser($tgChatId, $msg); } catch (Throwable $e) {}
        }
    }

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    echo json_encode(['success' => false]);
}
