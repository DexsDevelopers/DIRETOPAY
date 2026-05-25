<?php
require_once __DIR__ . '/includes/db.php';
$secret = 'whsec_afefa04c1f0a5bc3353b896567b631c3a1e6b7324c25f79fe83ad96f5b4f00a2';
$pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('brpix_webhook_secret', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")
    ->execute([$secret]);
echo '<b>brpix_webhook_secret salvo!</b>';
@unlink(__FILE__);
echo ' <i>Arquivo deletado.</i>';
