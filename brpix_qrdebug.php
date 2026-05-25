<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/BRPixService.php';

$clientId     = $pdo->query("SELECT `value` FROM settings WHERE `key`='brpix_client_id'")->fetchColumn();
$clientSecret = $pdo->query("SELECT `value` FROM settings WHERE `key`='brpix_client_secret'")->fetchColumn();
define('BRPIX_CLIENT_ID',     $clientId);
define('BRPIX_CLIENT_SECRET', $clientSecret);

echo '<pre>';
echo "Criando cobrança de R$2,00...\n\n";
$result = BRPixService::createCharge(2.00, 'qrdebug_' . time(), 'Debug QR');
echo "HTTP Code: " . $result['http_code'] . "\n";
echo "Full Response:\n";
echo json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

// Se txid presente, busca direto
$txid = $result['data']['txid'] ?? ($result['data']['id'] ?? null);
if ($txid) {
    echo "=== POLL GET /pix/charge/$txid ===\n";
    sleep(3);
    $poll = BRPixService::getCharge($txid);
    echo "HTTP Code: " . $poll['http_code'] . "\n";
    echo json_encode($poll['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
}
echo '</pre>';

@unlink(__FILE__);
echo '<br><i>Arquivo deletado.</i>';
