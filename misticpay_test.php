<?php
/**
 * Script temporário de teste para validar Mistic Pay com credenciais reais do banco
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'includes/db.php';
require_once 'includes/MisticPayService.php';

echo "<h2>DiretoPay - Diagnóstico Real Mistic Pay</h2>";

// Verifica se MisticPayService existe
if (!class_exists('MisticPayService')) {
    echo "<p style='color:red'>✗ Classe MisticPayService NÃO encontrada!</p>";
    exit;
}

// Carregar chaves do banco
$getSetting = function(string $key) use ($pdo): string {
    $s = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
    $s->execute([$key]);
    $val = $s->fetchColumn();
    return ($val === false) ? '' : (string)$val;
};

$misticpayEnabled      = $getSetting('misticpay_enabled') === '1';
$misticpayClientId     = $getSetting('misticpay_client_id');
$misticpayClientSecret = $getSetting('misticpay_client_secret');

echo "<p>misticpay_enabled: " . ($misticpayEnabled ? 'Ativo' : 'Inativo') . "</p>";
echo "<p>misticpay_client_id: " . (!empty($misticpayClientId) ? htmlspecialchars($misticpayClientId) : 'Vazio') . "</p>";
echo "<p>misticpay_client_secret: " . (!empty($misticpayClientSecret) ? 'Configurado (Oculto)' : 'Vazio') . "</p>";

if (empty($misticpayClientId) || empty($misticpayClientSecret)) {
    echo "<p style='color:red'>✗ Credenciais ausentes no banco de dados!</p>";
    exit;
}

// Configurar as constantes que o serviço usa
if (!defined('MISTICPAY_CLIENT_ID')) {
    define('MISTICPAY_CLIENT_ID', $misticpayClientId);
}
if (!defined('MISTICPAY_CLIENT_SECRET')) {
    define('MISTICPAY_CLIENT_SECRET', $misticpayClientSecret);
}

$amount = 2.00; // Mínimo suportado pela plataforma e gateway
$externalId = 'diagnostic_test_' . time();
$customer = [
    'name' => 'Cliente Teste Real',
    'document' => '12345678909'
];

echo "<p>Enviando requisição de teste para Mistic Pay (Valor: R$ 2,00)...</p>";

$res = MisticPayService::createCharge($amount, $externalId, $customer, 'Teste Diagnóstico DiretoPay Real', 'https://diretopay.com.br/misticpay_webhook.php');

echo "<h3>Resposta da API Mistic Pay:</h3>";
echo "<pre>HTTP Code: " . $res['http_code'] . "\n";
echo "CURL Error: " . $res['curl_error'] . "\n";
echo "Response Body:\n";
echo htmlspecialchars(print_r($res['data'], true));
echo "</pre>";

if ($res['http_code'] === 200 || $res['http_code'] === 201) {
    if (!empty($res['data']['data']['copyPaste'])) {
        echo "<p style='color:green; font-weight:bold;'>✓ Sucesso Supremo! O PIX foi gerado com credenciais reais.</p>";
        echo "<p>Código Copia-e-Cola: <code>" . htmlspecialchars($res['data']['data']['copyPaste']) . "</code></p>";
    } else {
        echo "<p style='color:orange'>⚠ Resposta bem sucedida HTTP mas os campos da transação estão em formato inesperado.</p>";
    }
} else {
    echo "<p style='color:red'>✗ Falha na autenticação ou processamento de cobrança (verifique chaves no banco).</p>";
}
