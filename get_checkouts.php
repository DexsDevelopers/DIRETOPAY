<?php
require_once 'includes/db.php';

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'error' => 'Não autorizado']);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("SELECT * FROM checkouts WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    $checkouts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Adicionar itens de cada checkout
    foreach ($checkouts as &$checkout) {
        $stmtItems = $pdo->prepare("SELECT * FROM checkout_items WHERE checkout_id = ?");
        $stmtItems->execute([$checkout['id']]);
        $checkout['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
        
        $checkout['url'] = rtrim(APP_CHECKOUT_URL, '/') . '/p/' . $checkout['slug'];
    }

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'checkouts' => $checkouts]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
