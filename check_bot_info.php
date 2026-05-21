<?php
require_once __DIR__ . '/includes/db.php';

$userToken  = defined('TELEGRAM_USER_BOT_TOKEN') ? TELEGRAM_USER_BOT_TOKEN : '';
$adminToken = defined('TELEGRAM_BOT_TOKEN')       ? TELEGRAM_BOT_TOKEN       : '';

function tgGet(string $token, string $method, array $data = []): array {
    $url = "https://api.telegram.org/bot{$token}/{$method}";
    if ($data) $url .= '?' . http_build_query($data);
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
    $res = curl_exec($ch); curl_close($ch);
    return json_decode($res ?: '{}', true) ?: [];
}

echo '<style>body{font-family:monospace;padding:20px} .ok{color:green} .label{font-weight:bold}</style>';

foreach ([['Bot Usuários', $userToken], ['Bot Admin', $adminToken]] as [$label, $token]) {
    if (!$token) { echo "<p>⚠️ Token não configurado: {$label}</p>"; continue; }

    $me   = tgGet($token, 'getMe');
    $desc = tgGet($token, 'getMyDescription',      ['language_code' => 'pt']);
    $short= tgGet($token, 'getMyShortDescription', ['language_code' => 'pt']);

    $name     = $me['result']['first_name']                        ?? '—';
    $username = $me['result']['username']                          ?? '—';
    $descTxt  = $desc['result']['description']                     ?? '—';
    $shortTxt = $short['result']['short_description']              ?? '—';

    echo "<h3>{$label}</h3>";
    echo "<p><span class='label'>Nome:</span>     {$name}</p>";
    echo "<p><span class='label'>Username:</span> @{$username}</p>";
    echo "<p><span class='label'>Bio:</span>      " . nl2br(htmlspecialchars($shortTxt)) . "</p>";
    echo "<p><span class='label'>Descrição:</span> " . nl2br(htmlspecialchars($descTxt)) . "</p>";
    echo "<hr>";
}
echo '<p style="color:red"><b>DELETE após usar!</b></p>';
