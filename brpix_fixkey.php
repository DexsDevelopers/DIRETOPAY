<?php
require_once __DIR__ . '/includes/db.php';

// Client ID completo (64 chars) — estava truncado no setup anterior
$clientId     = 'f1ef52f801beefc9768b27d076cc0fc14fb4173f59ac7fd97b33cd0e5525317d';
$clientSecret = '7b1aa61caf850121e7fe06eef4168087a627a7fc6ab3a35b11010378a34c6bce';

$pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('brpix_client_id', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$clientId]);
$pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('brpix_client_secret', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$clientSecret]);

echo '<b>Credenciais BRPix corrigidas!</b><br>';
echo 'Client ID: ' . htmlspecialchars($clientId) . '<br>';
echo 'Secret: ••••••••••••••••<br>';

@unlink(__FILE__);
echo '<br><i>Arquivo deletado.</i>';
