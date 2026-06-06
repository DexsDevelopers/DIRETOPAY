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
    
    // Recent withdrawals
    $stmt = $pdo->query("SELECT id, user_id, amount_gross, amount, fee_platform, fee_gateway, pix_key, status, nominal, type, description, created_at FROM withdrawals ORDER BY id DESC LIMIT 15");
    $res['withdrawals'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // User data for recent withdrawals
    if (!empty($res['withdrawals'])) {
        $userIds = array_unique(array_column($res['withdrawals'], 'user_id'));
        $inQuery = implode(',', array_map('intval', $userIds));
        $stmtUsers = $pdo->query("SELECT id, email, full_name, balance, preferred_nominal, commission_rate FROM users WHERE id IN ($inQuery)");
        $res['users'] = $stmtUsers->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $res['users'] = [];
    }
    
    // Recent transactions
    $stmtTx = $pdo->query("SELECT id, user_id, amount_brl, amount_net_brl, status, created_at FROM transactions ORDER BY id DESC LIMIT 10");
    $res['transactions'] = $stmtTx->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $res]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
