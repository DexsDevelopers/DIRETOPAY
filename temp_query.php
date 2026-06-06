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
    
    // Check withdrawals table for 3.20, 320, 310
    $stmt = $pdo->query("SELECT * FROM withdrawals WHERE amount_gross IN (3.20, 320, 310) OR amount IN (3.20, 320, 310) OR description LIKE '%3.20%' OR description LIKE '%320%' OR description LIKE '%310%'");
    $res['withdrawals_matches'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Search logs for 320 or 310
    $logDir = __DIR__ . '/logs';
    $matches = [];
    
    if (is_dir($logDir)) {
        $files = scandir($logDir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            $path = $logDir . '/' . $file;
            if (is_file($path)) {
                $content = file_get_contents($path);
                if (strpos($content, '320') !== false || strpos($content, '310') !== false) {
                    $lines = explode("\n", $content);
                    foreach ($lines as $line) {
                        if (strpos($line, '320') !== false || strpos($line, '310') !== false) {
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
    $res['log_matches'] = $matches;

    echo json_encode(['success' => true, 'data' => $res]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
