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
    
    // List files in the root directory
    $files = scandir(__DIR__);
    $res['root_files'] = [];
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $res['root_files'][] = [
            'name' => $file,
            'is_dir' => is_dir($file),
            'size' => is_dir($file) ? 0 : filesize($file),
            'mtime' => date('Y-m-d H:i:s', filemtime($file))
        ];
    }
    
    // Check if index.html exists and its content excerpt
    if (file_exists('index.html')) {
        $res['index_html_excerpt'] = substr(file_get_contents('index.html'), 0, 500);
    } else {
        $res['index_html_excerpt'] = null;
    }
    
    // Check index.php content excerpt
    if (file_exists('index.php')) {
        $res['index_php_excerpt'] = substr(file_get_contents('index.php'), 0, 500);
    } else {
        $res['index_php_excerpt'] = null;
    }

    echo json_encode(['success' => true, 'data' => $res]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
