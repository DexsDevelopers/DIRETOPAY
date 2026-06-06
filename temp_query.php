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
    
    // Check git log on server
    $res['git_log'] = shell_exec('git log -n 5 --oneline 2>&1');
    
    // Check git status on server
    $res['git_status'] = shell_exec('git status 2>&1');
    
    // Check what is inside index.php on the server
    if (file_exists('index.php')) {
        $res['index_php_content'] = file_get_contents('index.php');
    }

    echo json_encode(['success' => true, 'data' => $res]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
