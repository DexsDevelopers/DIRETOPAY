<?php
require_once __DIR__ . '/config.php';

echo '<pre>';
echo 'TELEGRAM_WEBHOOK_SECRET = ' . (defined('TELEGRAM_WEBHOOK_SECRET') ? TELEGRAM_WEBHOOK_SECRET : '(não definido)') . "\n";
echo 'DEPLOY_SECRET           = ' . (defined('DEPLOY_SECRET')           ? DEPLOY_SECRET           : '(não definido)') . "\n";
echo '</pre>';

// Auto-deleta após exibir
@unlink(__FILE__);
echo '<i>Arquivo deletado automaticamente.</i>';
