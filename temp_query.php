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
    
    // Count of withdrawals
    $res['withdrawals_count'] = (int)$pdo->query("SELECT COUNT(*) FROM withdrawals")->fetchColumn();
    
    // Detailed list of withdrawals (if any exist)
    $stmt = $pdo->query("SELECT * FROM withdrawals ORDER BY id DESC LIMIT 50");
    $res['withdrawals'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // List all users
    $res['users'] = $pdo->query("SELECT id, email, full_name, balance, preferred_nominal, commission_rate FROM users ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
    
    // Recent balance logs
    $res['balance_logs'] = $pdo->query("SELECT id, user_id, amount, origin, reference_id, description, created_at FROM balance_log ORDER BY id DESC LIMIT 30")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $res]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
