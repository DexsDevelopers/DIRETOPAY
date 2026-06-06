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
    
    // Check $_SERVER variable
    $res['server_vars'] = $_SERVER;

    echo json_encode(['success' => true, 'data' => $res]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
