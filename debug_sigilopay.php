<?php
require_once 'includes/db.php';

// Apenas admin
if (!isAdmin()) { http_response_code(403); die('Acesso negado'); }

header('Content-Type: text/plain; charset=utf-8');

// Ler as chaves salvas
$stmt = $pdo->query("SELECT `key`, `value` FROM settings WHERE `key` LIKE 'sigilopay%' ORDER BY `key`");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "=== SIGILOPAY SETTINGS NO BANCO ===\n\n";
foreach ($rows as $r) {
    $val = $r['value'];
    if (str_contains($r['key'], 'secret')) {
        $val = substr($val, 0, 6) . str_repeat('*', max(0, strlen($val) - 6));
    }
    echo $r['key'] . " = " . ($val ?: '(vazio)') . "\n";
}

echo "\n=== TESTE DE CONEXÃO COM SIGILOPAY ===\n\n";

$pubKey = '';
$secKey = '';
foreach ($rows as $r) {
    if ($r['key'] === 'sigilopay_public_key')  $pubKey = $r['value'];
    if ($r['key'] === 'sigilopay_secret_key')  $secKey = $r['value'];
}

if (!$pubKey || !$secKey) {
    echo "ERRO: Credenciais não encontradas no banco.\n";
    echo "Acesse /admin/gateways e salve as credenciais.\n";
    exit;
}

echo "Public Key: " . $pubKey . "\n";
echo "Secret Key: " . substr($secKey, 0, 6) . "...\n\n";

// Teste simples de conectividade
$ch = curl_init('https://app.sigilopay.com.br/api/v1/gateway/pix/receive');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode([
        'identifier'  => 'test_' . time(),
        'amount'      => 2.00,
        'client'      => ['name' => 'Test', 'email' => 'test@test.com', 'phone' => '11900000000', 'document' => '147.143.016-24'],
        'callbackUrl' => 'https://lunarpay.site/sigilopay_webhook.php',
    ]),
    CURLOPT_HTTPHEADER => [
        'x-public-key: ' . $pubKey,
        'x-secret-key: ' . $secKey,
        'Content-Type: application/json',
        'Accept: application/json',
    ],
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_SSL_VERIFYPEER => true,
]);
$body     = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "cURL Error: " . ($curlErr ?: 'nenhum') . "\n";
echo "Response Body:\n" . ($body ?: '(vazio)') . "\n";

// Tentar decodificar
$json = json_decode($body, true);
if ($json) {
    echo "\nResponse Decoded:\n";
    print_r($json);
}
