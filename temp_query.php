<?php
require_once 'includes/db.php';
header('Content-Type: application/json');

if (empty($_GET['token']) || $_GET['token'] !== 'diretopay_secure_debug_token_2026') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

try {
    $res = [];
    
    // Transactions for User 9
    $res['user9_transactions'] = $pdo->query("SELECT id, amount_brl, amount_net_brl, status, created_at FROM transactions WHERE user_id = 9 ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
    
    // Withdrawals for User 9
    $res['user9_withdrawals'] = $pdo->query("SELECT id, amount_gross, amount, status, nominal, created_at FROM withdrawals WHERE user_id = 9 ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $res]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
