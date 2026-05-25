<?php
require_once __DIR__ . '/config.php';

// Só acessível localmente ou com IP do admin
$allowed = ['127.0.0.1', '::1'];
if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', $allowed)) {
    // Apaga o arquivo após o primeiro uso externo
    @unlink(__FILE__);
    http_response_code(403);
    die('Forbidden');
}

echo '<pre>';
echo 'TELEGRAM_WEBHOOK_SECRET = ' . (defined('TELEGRAM_WEBHOOK_SECRET') ? TELEGRAM_WEBHOOK_SECRET : '(não definido)') . "\n";
echo 'DEPLOY_SECRET           = ' . (defined('DEPLOY_SECRET')           ? DEPLOY_SECRET           : '(não definido)') . "\n";
echo '</pre>';

// Auto-deleta após exibir
@unlink(__FILE__);
echo '<i>Arquivo deletado automaticamente.</i>';
