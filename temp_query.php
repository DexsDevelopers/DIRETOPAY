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
    $logDir = __DIR__ . '/logs';
    $matches = [];
    
    if (is_dir($logDir)) {
        $files = scandir($logDir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            $path = $logDir . '/' . $file;
            if (is_file($path)) {
                $content = file_get_contents($path);
                if (strpos($content, '3.20') !== false || strpos($content, '3,20') !== false) {
                    // Find lines containing the pattern
                    $lines = explode("\n", $content);
                    foreach ($lines as $line) {
                        if (strpos($line, '3.20') !== false || strpos($line, '3,20') !== false) {
                            $matches[] = [
                                'file' => $file,
                                'line' => trim($line)
                            ];
                        }
                    }
                }
            }
        }
    }
    
    $res['matches'] = $matches;

    echo json_encode(['success' => true, 'data' => $res]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
