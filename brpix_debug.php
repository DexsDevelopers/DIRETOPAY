<?php
require_once __DIR__ . '/includes/db.php';

$clientId     = 'f1ef52f801beefc9768b27d076cc0fc14fb4173f59ac7fd97b33cd0e5525317d';
$clientSecret = '7b1aa61caf850121e7fe06eef4168087a627a7fc6ab3a35b11010378a34c6bce';

// Lê o que está no banco agora
$dbId  = $pdo->query("SELECT `value` FROM settings WHERE `key`='brpix_client_id'")->fetchColumn();
$dbSec = $pdo->query("SELECT `value` FROM settings WHERE `key`='brpix_client_secret'")->fetchColumn();

echo '<pre>';
echo "=== BANCO ATUAL ===\n";
echo "client_id   (" . strlen((string)$dbId)  . " chars): " . htmlspecialchars((string)$dbId)  . "\n";
echo "client_sec  (" . strlen((string)$dbSec) . " chars): " . htmlspecialchars((string)$dbSec) . "\n\n";
echo "=== ESPERADO ===\n";
echo "client_id   (" . strlen($clientId)     . " chars): " . $clientId     . "\n";
echo "client_sec  (" . strlen($clientSecret) . " chars): " . $clientSecret . "\n\n";
echo "=== MATCH ===\n";
echo "client_id:  " . ($dbId === $clientId ? "✅ OK" : "❌ DIFERENTE — atualizando...") . "\n";
echo "client_sec: " . ($dbSec === $clientSecret ? "✅ OK" : "❌ DIFERENTE — atualizando...") . "\n\n";

// Força atualização
$pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('brpix_client_id',?) ON DUPLICATE KEY UPDATE `value`=?")->execute([$clientId, $clientId]);
$pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('brpix_client_secret',?) ON DUPLICATE KEY UPDATE `value`=?")->execute([$clientSecret, $clientSecret]);
$pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('brpix_enabled','1') ON DUPLICATE KEY UPDATE `value`='1'")->execute([]);

echo "✅ Credenciais atualizadas no banco!\n\n";

// Testa HMAC ao vivo
require_once __DIR__ . '/includes/BRPixService.php';
define('BRPIX_CLIENT_ID', $clientId);
define('BRPIX_CLIENT_SECRET', $clientSecret);

echo "=== TESTE REAL AO VIVO ===\n";
$result = BRPixService::createCharge(10.00, 'debug_test_' . time(), 'Teste diagnóstico');
echo "HTTP Code: " . $result['http_code'] . "\n";
echo "Response:  " . $result['raw'] . "\n";
echo '</pre>';

@unlink(__FILE__);
echo '<br><i>Arquivo deletado.</i>';
