<?php
/**
 * EzzyBanking API — Script de Teste
 * Acesse: https://diretopay.site/ezzy_test.php?token=SEU_TOKEN_AQUI
 *
 * Testa:
 *   1. Autenticação básica (GET /account)
 *   2. Se a API aceita campo "adquirente" no request-qrcode
 *   3. Se a API aceita campo "nominal" no request-qrcode
 *   4. Endpoint de adquirentes disponíveis (/adquirente, /my-acquirer, /acquirers)
 *   5. Saldo da conta
 */

// ── Proteção de acesso ─────────────────────────────────────────────────────
$SAFE_TOKEN = 'ezzy_test_2025'; // mude se quiser
if (($_GET['token'] ?? '') !== $SAFE_TOKEN) {
    http_response_code(403);
    die(json_encode(['error' => 'Token inválido. Adicione ?token=' . $SAFE_TOKEN . ' na URL']));
}

header('Content-Type: application/json; charset=utf-8');
require_once 'includes/db.php';

// ── Credenciais do banco ───────────────────────────────────────────────────
$ci = $pdo->query("SELECT `value` FROM settings WHERE `key`='ezzybanking_api_key'")->fetchColumn() ?: '';
$cs = $pdo->query("SELECT `value` FROM settings WHERE `key`='ezzybanking_api_secret'")->fetchColumn() ?: '';

if (!$ci || !$cs) {
    die(json_encode(['error' => 'Credenciais EzzyBanking não configuradas no painel admin (ci/cs)']));
}

$BASE = 'https://ws.ezzybanking.com.br';

// ── Helper de requisição ───────────────────────────────────────────────────
function req(string $url, array $body = [], string $method = 'POST', string $ci = '', string $cs = ''): array {
    $ch = curl_init($url);
    $headers = [
        'ci: ' . $ci,
        'cs: ' . $cs,
        'Content-Type: application/json',
        'User-Agent: DiretoPay-Test/1.0',
    ];
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ];
    if ($method === 'POST') {
        $opts[CURLOPT_POST]       = true;
        $opts[CURLOPT_POSTFIELDS] = json_encode($body);
    } else {
        $opts[CURLOPT_CUSTOMREQUEST] = $method;
    }
    curl_setopt_array($ch, $opts);
    $raw      = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err      = curl_error($ch);
    curl_close($ch);
    return [
        'http'     => $httpCode,
        'raw'      => $raw,
        'decoded'  => json_decode($raw, true),
        'curl_err' => $err ?: null,
    ];
}

$results = [];

// ── TESTE 1: Informações da conta ──────────────────────────────────────────
$r = req("$BASE/api/v1/account", [], 'GET', $ci, $cs);
$results['1_account_info'] = [
    'url'      => "$BASE/api/v1/account",
    'method'   => 'GET',
    'http'     => $r['http'],
    'response' => $r['decoded'] ?? $r['raw'],
];

// ── TESTE 2: Saldo ─────────────────────────────────────────────────────────
$r = req("$BASE/api/v1/account/balance", [], 'GET', $ci, $cs);
$results['2_balance'] = [
    'url'      => "$BASE/api/v1/account/balance",
    'method'   => 'GET',
    'http'     => $r['http'],
    'response' => $r['decoded'] ?? $r['raw'],
];

// ── TESTE 3: Listar adquirentes disponíveis ────────────────────────────────
foreach ([
    '/api/v1/adquirente',
    '/api/v1/my-acquirer',
    '/api/v1/acquirers',
    '/api/v1/account/acquirers',
    '/api/v1/gateway/adquirentes',
    '/api/v1/gateway/acquirer',
] as $path) {
    $r = req("$BASE$path", [], 'GET', $ci, $cs);
    $results['3_list_acquirers'][$path] = [
        'http'     => $r['http'],
        'response' => $r['decoded'] ?? substr($r['raw'], 0, 300),
    ];
}

// ── TESTE 4: QR Code SEM campo adquirente (baseline) ──────────────────────
$baseQr = [
    'valor'       => 1.00,
    'expiracao'   => 60,
    'callbackUrl' => 'https://diretopay.site/ezzybanking_webhook.php',
    'devedor'     => ['cpf' => '14714301624', 'nome' => 'Teste DiretoPay'],
];
$r = req("$BASE/api/v1/gateway/request-qrcode", $baseQr, 'POST', $ci, $cs);
$results['4_qrcode_baseline'] = [
    'url'      => "$BASE/api/v1/gateway/request-qrcode",
    'body_sent'=> $baseQr,
    'http'     => $r['http'],
    'response' => $r['decoded'] ?? $r['raw'],
    'fields_returned' => is_array($r['decoded']) ? array_keys($r['decoded']) : [],
];

// ── TESTE 5: QR Code COM campo "adquirente" ────────────────────────────────
$qrComAdquirente = array_merge($baseQr, ['adquirente' => 'OWEMPAY']);
$r = req("$BASE/api/v1/gateway/request-qrcode", $qrComAdquirente, 'POST', $ci, $cs);
$results['5_qrcode_with_adquirente_field'] = [
    'body_sent'           => $qrComAdquirente,
    'http'                => $r['http'],
    'response'            => $r['decoded'] ?? $r['raw'],
    'accepted_adquirente' => ($r['http'] >= 200 && $r['http'] < 300) ? 'POSSIVEL — HTTP OK' : 'REJEITADO ou ERRO',
];

// ── TESTE 6: QR Code COM campo "nominal" ──────────────────────────────────
$qrComNominal = array_merge($baseQr, ['nominal' => 'OWEMPAY']);
$r = req("$BASE/api/v1/gateway/request-qrcode", $qrComNominal, 'POST', $ci, $cs);
$results['6_qrcode_with_nominal_field'] = [
    'body_sent'       => $qrComNominal,
    'http'            => $r['http'],
    'response'        => $r['decoded'] ?? $r['raw'],
    'accepted_nominal'=> ($r['http'] >= 200 && $r['http'] < 300) ? 'POSSIVEL — HTTP OK' : 'REJEITADO ou ERRO',
];

// ── TESTE 7: QR Code COM campo "acquirer" ─────────────────────────────────
$qrComAcquirer = array_merge($baseQr, ['acquirer' => 'OWEMPAY']);
$r = req("$BASE/api/v1/gateway/request-qrcode", $qrComAcquirer, 'POST', $ci, $cs);
$results['7_qrcode_with_acquirer_field'] = [
    'body_sent'        => $qrComAcquirer,
    'http'             => $r['http'],
    'response'         => $r['decoded'] ?? $r['raw'],
    'accepted_acquirer'=> ($r['http'] >= 200 && $r['http'] < 300) ? 'POSSIVEL — HTTP OK' : 'REJEITADO ou ERRO',
];

// ── RESUMO ─────────────────────────────────────────────────────────────────
$summary = [
    'auth_ok'                 => ($results['1_account_info']['http'] === 200),
    'balance_endpoint_exists' => ($results['2_balance']['http'] === 200),
    'acquirers_list_found'    => array_filter(
        $results['3_list_acquirers'],
        fn($v) => $v['http'] === 200
    ),
    'qrcode_baseline_ok'      => ($results['4_qrcode_baseline']['http'] >= 200 && $results['4_qrcode_baseline']['http'] < 300),
    'qrcode_fields_available' => $results['4_qrcode_baseline']['fields_returned'],
    'adquirente_accepted'     => ($results['5_qrcode_with_adquirente_field']['http'] >= 200 && $results['5_qrcode_with_adquirente_field']['http'] < 300),
    'nominal_accepted'        => ($results['6_qrcode_with_nominal_field']['http'] >= 200 && $results['6_qrcode_with_nominal_field']['http'] < 300),
    'acquirer_accepted'       => ($results['7_qrcode_with_acquirer_field']['http'] >= 200 && $results['7_qrcode_with_acquirer_field']['http'] < 300),
];

echo json_encode([
    'RESUMO'   => $summary,
    'DETALHES' => $results,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
