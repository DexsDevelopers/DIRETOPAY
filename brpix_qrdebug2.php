<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/BRPixService.php';

$clientId     = $pdo->query("SELECT `value` FROM settings WHERE `key`='brpix_client_id'")->fetchColumn();
$clientSecret = $pdo->query("SELECT `value` FROM settings WHERE `key`='brpix_client_secret'")->fetchColumn();
define('BRPIX_CLIENT_ID',     $clientId);
define('BRPIX_CLIENT_SECRET', $clientSecret);

echo '<pre>';

// 1. Testa autenticação consultando saldo
echo "=== 1. SALDO / DASHBOARD ===\n";
$path = '/api/v1/dashboard';
$credentials = base64_encode($clientSecret . ':' . $clientId);
$ch = curl_init('https://api.brpixsolutions.com' . $path);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Authorization: Basic ' . $credentials, 'Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_IPRESOLVE      => CURL_IPRESOLVE_V4,
]);
$r = curl_exec($ch);
echo "HTTP: " . curl_getinfo($ch, CURLINFO_HTTP_CODE) . "\n";
echo json_encode(json_decode($r), JSON_PRETTY_PRINT) . "\n\n";
curl_close($ch);

// 2. Testa cash-in com payload mínimo (só amount)
echo "=== 2. CASH-IN PAYLOAD MINIMO (R\$15,00) ===\n";
$body = json_encode(['amount' => 1500]);
$path2 = '/pix/cash-in';
$ch2 = curl_init('https://api.brpixsolutions.com' . $path2);

$ts   = (string) time();
$non  = bin2hex(random_bytes(16));
$pay  = "POST|$path2|$ts|$non|$body";
$sig  = hash_hmac('sha256', $pay, $clientSecret);
curl_setopt_array($ch2, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $body,
    CURLOPT_HTTPHEADER     => [
        "X-API-Key: $clientId",
        "X-Timestamp: $ts",
        "X-Nonce: $non",
        "X-Signature: $sig",
        "Content-Type: application/json",
    ],
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_IPRESOLVE      => CURL_IPRESOLVE_V4,
]);
$r2 = curl_exec($ch2);
echo "HTTP: " . curl_getinfo($ch2, CURLINFO_HTTP_CODE) . "\n";
echo json_encode(json_decode($r2), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
curl_close($ch2);

echo '</pre>';
@unlink(__FILE__);
echo '<br><i>Arquivo deletado.</i>';
