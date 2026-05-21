<?php
/**
 * update_bot_info.php — Atualiza nome, descrição e about do bot via Telegram API
 * DELETE APÓS USAR!
 */
require_once __DIR__ . '/includes/db.php';

$userToken  = defined('TELEGRAM_USER_BOT_TOKEN') ? TELEGRAM_USER_BOT_TOKEN : '';
$adminToken = defined('TELEGRAM_BOT_TOKEN')       ? TELEGRAM_BOT_TOKEN       : '';

function tgSet(string $token, string $method, array $data): array {
    $ch = curl_init("https://api.telegram.org/bot{$token}/{$method}");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($data),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 10,
    ]);
    $res = curl_exec($ch);
    curl_close($ch);
    return json_decode($res ?: '{}', true) ?: [];
}

$results = [];

// ── Bot de USUÁRIOS ───────────────────────────────────────────────────────────
if ($userToken) {
    // setMyName sem language_code = altera o nome padrão global
    $results['user_name']        = tgSet($userToken, 'setMyName',             ['name'              => 'LunarPay Assistente']);
    $results['user_description'] = tgSet($userToken, 'setMyDescription',      ['description'       => "🌙 LunarPay — Seu assistente de vendas no Telegram.\nConsulte saldo, gere PIX, acompanhe vendas e muito mais."]);
    $results['user_short']       = tgSet($userToken, 'setMyShortDescription', ['short_description' => '🌙 LunarPay — Assistente de vendas. Saldo, PIX, relatórios e saques.']);
}

// ── Bot de ADMIN ──────────────────────────────────────────────────────────────
if ($adminToken) {
    $results['admin_name']        = tgSet($adminToken, 'setMyName',             ['name'              => 'LunarPay Admin']);
    $results['admin_description'] = tgSet($adminToken, 'setMyDescription',      ['description'       => "🌙 LunarPay — Painel administrativo via Telegram.\nEstatísticas, saques, produtos e relatórios em tempo real."]);
    $results['admin_short']       = tgSet($adminToken, 'setMyShortDescription', ['short_description' => '🌙 LunarPay Admin — Gestão da plataforma pelo Telegram.']);
}

echo '<pre>';
foreach ($results as $key => $res) {
    $ok = !empty($res['ok']) ? '✅ OK' : '❌ ERRO';
    echo "{$ok} — {$key}\n";
    if (empty($res['ok'])) {
        echo "   Detalhe: " . ($res['description'] ?? json_encode($res)) . "\n";
    }
}
echo '</pre>';
echo '<p style="color:red"><b>DELETE este arquivo após usar!</b></p>';
