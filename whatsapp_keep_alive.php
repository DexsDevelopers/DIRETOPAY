<?php
/**
 * whatsapp_keep_alive.php
 * Script keep-alive executado periodicamente (via cron-job.org) para verificar
 * e reinicializar a ponte do WhatsApp no servidor Hostinger.
 */
ignore_user_abort(true);
set_time_limit(60);

require_once __DIR__ . '/config.php';

$secret = $_GET['secret'] ?? '';
$expectedSecret = defined('TELEGRAM_USER_BOT_SECRET') ? TELEGRAM_USER_BOT_SECRET : '';
$deploySecret = defined('DEPLOY_SECRET') ? DEPLOY_SECRET : '';

if (!empty($expectedSecret) || !empty($deploySecret)) {
    if ($secret !== $expectedSecret && $secret !== $deploySecret) {
        http_response_code(403);
        exit('Forbidden');
    }
}

// Executar o script de keepalive da ponte do WhatsApp
$cmd = 'cd ' . __DIR__ . '/whatsapp-bridge && bash ./keep_alive.sh 2>&1';
$output = shell_exec($cmd);

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'command' => 'keep_alive.sh',
    'output' => trim((string)$output),
    'time' => date('Y-m-d H:i:s')
]);
