<?php
require_once __DIR__ . '/includes/db.php';

$token       = $pdo->query("SELECT `value` FROM settings WHERE `key`='ironpay_token'")->fetchColumn();
$offerHash   = $pdo->query("SELECT `value` FROM settings WHERE `key`='ironpay_offer_hash'")->fetchColumn();
$productHash = $pdo->query("SELECT `value` FROM settings WHERE `key`='ironpay_product_hash'")->fetchColumn();

$base = 'https://api.ironpayapp.com.br/api/public/v1';

echo '<pre>';
echo "Token DB: " . ($token ? substr($token, 0, 8) . '...' : '(VAZIO)') . "\n";
echo "Offer Hash DB: " . ($offerHash ?: '(VAZIO)') . "\n";
echo "Product Hash DB: " . ($productHash ?: '(VAZIO)') . "\n\n";

// Se token não está no DB, usa o fornecido diretamente
if (!$token) {
    $token = 'hHRg6hOraAH6CqWOVNOcm9T61o1szRVJ2mSX4ubAp7WcoHOvlXDBaqDPRirt';
    echo "Usando token hardcoded para teste.\n\n";
    // Salva no DB
    $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('ironpay_token',?) ON DUPLICATE KEY UPDATE `value`=?")->execute([$token, $token]);
    echo "Token salvo no banco.\n\n";
}

function ironGet(string $url, string $token): array {
    $ch = curl_init($url . '?api_token=' . urlencode($token));
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_HTTPHEADER => ['Accept: application/json']]);
    $r = curl_exec($ch);
    $c = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['http' => $c, 'data' => json_decode($r, true), 'raw' => $r];
}

function ironPost(string $url, string $token, array $body): array {
    $j  = json_encode($body, JSON_UNESCAPED_UNICODE);
    $ch = curl_init($url . '?api_token=' . urlencode($token));
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => $j,
        CURLOPT_TIMEOUT => 30, CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json']]);
    $r = curl_exec($ch);
    $c = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['http' => $c, 'data' => json_decode($r, true), 'raw' => $r];
}

// 1. Listar produtos
echo "=== 1. PRODUTOS ===\n";
$prod = ironGet("$base/products", $token);
echo "HTTP: {$prod['http']}\n";
echo json_encode($prod['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

// Tenta pegar primeiro product_hash e offer_hash automaticamente
$autoProductHash = null;
$autoOfferHash   = null;
if (!empty($prod['data']['data']) && is_array($prod['data']['data'])) {
    $firstProduct = $prod['data']['data'][0] ?? null;
    if ($firstProduct) {
        $autoProductHash = $firstProduct['hash'] ?? null;
        // Busca offers do produto
        if ($autoProductHash) {
            $offers = ironGet("$base/products/$autoProductHash/offers", $token);
            echo "=== 1b. OFFERS do produto $autoProductHash ===\n";
            echo "HTTP: {$offers['http']}\n";
            echo json_encode($offers['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
            $firstOffer = $offers['data']['data'][0] ?? null;
            if ($firstOffer) {
                $autoOfferHash = $firstOffer['hash'] ?? null;
            }
        }
    }
}

// Usa hashes do DB ou auto-detectados
$useOfferHash   = $offerHash   ?: $autoOfferHash;
$useProductHash = $productHash ?: $autoProductHash;

echo "=== HASHES A USAR ===\n";
echo "Offer Hash: " . ($useOfferHash ?: '(NÃO ENCONTRADO)') . "\n";
echo "Product Hash: " . ($useProductHash ?: '(NÃO ENCONTRADO)') . "\n\n";

if (!$useOfferHash || !$useProductHash) {
    echo "ERRO: Configure offer_hash e product_hash no painel admin ou crie um produto na IronPay.\n";
    echo '</pre>';
    @unlink(__FILE__);
    echo '<br><i>Arquivo deletado.</i>';
    exit;
}

// 2. Criar cobrança PIX de R$5,00
echo "=== 2. CRIAR PIX R\$5,00 ===\n";
$body = [
    'amount'             => 500,
    'offer_hash'         => $useOfferHash,
    'payment_method'     => 'pix',
    'installments'       => 1,
    'expire_in_days'     => 1,
    'transaction_origin' => 'api',
    'customer' => [
        'name'         => 'Teste DiretoPay',
        'email'        => 'teste@diretopay.site',
        'phone_number' => '11900000000',
        'document'     => '09115751031',
    ],
    'cart' => [[
        'product_hash'   => $useProductHash,
        'title'          => 'Teste DiretoPay',
        'cover'          => null,
        'price'          => 500,
        'quantity'       => 1,
        'operation_type' => 1,
        'tangible'       => false,
    ]],
];
$pix = ironPost("$base/transactions", $token, $body);
echo "HTTP: {$pix['http']}\n";
echo json_encode($pix['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

// Extrai QR code
$pixCode = $pix['data']['pix']['pix_qr_code'] ?? null;
if ($pixCode) {
    echo "\n✅ QR CODE ENCONTRADO!\n";
    echo "Copia e Cola: $pixCode\n";
    echo "<img src='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode($pixCode) . "' style='margin:10px 0;display:block'>\n";
} else {
    echo "\n❌ QR code não encontrado na resposta.\n";
}

echo '</pre>';
@unlink(__FILE__);
echo '<br><i>Arquivo deletado.</i>';
