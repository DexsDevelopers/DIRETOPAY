<?php
/**
 * Script de teste para gerar PIX via SigiloPay
 * Acesse: https://diretopay.site/test_generate_pix.php
 */
require_once 'includes/db.php';

// Buscar credenciais SigiloPay
$getSetting = function(string $key) use ($pdo): string {
    $s = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
    $s->execute([$key]);
    return (string)($s->fetchColumn() ?: '');
};

$sigiloEnabled = $getSetting('sigilopay_enabled') === '1';
$sigiloPublicKey = $getSetting('sigilopay_public_key');
$sigiloSecretKey = $getSetting('sigilopay_secret_key');

if (!$sigiloEnabled || !$sigiloPublicKey || !$sigiloSecretKey) {
    die('❌ SigiloPay não configurado. Configure em /admin/gateways');
}

// Dados do teste
$amount = 2.00;
$externalId = 'test_' . time();
$customer = [
    'name' => 'Cliente Teste',
    'email' => 'teste@teste.com',
    'phone' => '11900000000',
    'document' => '14714301624'
];

// Chave PIX do vendedor (busca do primeiro usuário aprovado)
$userStmt = $pdo->prepare("SELECT pix_key FROM users WHERE status = 'approved' AND pix_key IS NOT NULL LIMIT 1");
$userStmt->execute([]);
$user = $userStmt->fetch();

if (!$user) {
    die('❌ Nenhum usuário com chave PIX configurado encontrado.');
}

$pixKey = $user['pix_key'];

// Payload SigiloPay
$payload = [
    'identifier'  => $externalId,
    'amount'      => $amount,
    'client'      => $customer,
    'callbackUrl' => 'https://diretopay.site/sigilopay_webhook.php',
];

$ch = curl_init('https://app.sigilopay.com.br/api/v1/gateway/pix/receive');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_HTTPHEADER => [
        'x-public-key: ' . $sigiloPublicKey,
        'x-secret-key: ' . $sigiloSecretKey,
        'Content-Type: application/json',
        'Accept: application/json',
        'User-Agent: Mozilla/5.0 (compatible; DiretoPay/2.0; +https://diretopay.site)',
    ],
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Teste PIX</title></head><body style="font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">';
echo '<h1>🧪 Teste de Geração PIX</h1>';
echo '<p><strong>Valor:</strong> R$ 2,00</p>';
echo '<p><strong>External ID:</strong> ' . htmlspecialchars($externalId) . '</p>';
echo '<p><strong>HTTP Code:</strong> ' . $httpCode . '</p>';
echo '<p><strong>cURL Error:</strong> ' . ($curlError ?: 'nenhum') . '</p>';

if ($httpCode === 200 || $httpCode === 201) {
    $data = json_decode($response, true);
    echo '<h2>✅ Sucesso!</h2>';
    echo '<pre style="background:#f4f4f4;padding:20px;border-radius:8px;overflow:auto;">' . htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT)) . '</pre>';
    
    if (!empty($data['data']['copyPaste'])) {
        echo '<h3>📱 QR Code / Copy-Paste:</h3>';
        echo '<p style="font-family:monospace;background:#e8f5e9;padding:15px;border-radius:8px;word-break:break-all;">' . htmlspecialchars($data['data']['copyPaste']) . '</p>';
        echo '<img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($data['data']['copyPaste']) . '" style="margin-top:20px;border:1px solid #ddd;padding:10px;border-radius:8px;">';
    }
} else {
    echo '<h2>❌ Erro</h2>';
    echo '<pre style="background:#ffebee;padding:20px;border-radius:8px;overflow:auto;">' . htmlspecialchars($response) . '</pre>';
}

echo '</body></html>';
