<?php
/**
 * test_7k_notify.php — Simula disparo do webhook 7K Community
 * Acesse via navegador estando logado como admin para testar.
 *
 * URL: https://seusite.com/test_7k_notify.php?user_id=SEU_ID
 */
require_once 'includes/db.php';

header('Content-Type: text/html; charset=utf-8');

// Apenas admins podem rodar este script
if (!isAdmin()) {
    http_response_code(403);
    die('<h2 style="color:red">Acesso negado. Apenas administradores.</h2>');
}

$targetUserId = (int)($_GET['user_id'] ?? $_SESSION['user_id']);

// Busca dados do vendedor alvo
$stmt = $pdo->prepare("SELECT id, full_name, email, seven_k_id FROM users WHERE id = ?");
$stmt->execute([$targetUserId]);
$seller = $stmt->fetch();

if (!$seller) {
    die('<h2 style="color:red">Usuário ID ' . $targetUserId . ' não encontrado.</h2>');
}

$sevenKSecret = defined('SEVEN_K_WEBHOOK_SECRET') ? SEVEN_K_WEBHOOK_SECRET : 'lunarpay_7kchat_webhook_2026';
$sevenKUrl    = 'https://7kchat.site/api/webhook_lunarpay.php?token=' . urlencode($sevenKSecret);

// Payload de teste (simula uma venda de R$ 150,00)
$testPayload = [
    'event'          => 'payment.completed',
    'transaction_id' => 0,
    'pix_id'         => 'test_' . bin2hex(random_bytes(6)),
    'amount'         => 150.00,
    'amount_net'     => 142.50,
    'customer_name'  => 'Cliente Teste',
    'status'         => 'paid',
    'external_id'    => 'test_ext_' . time(),
    'seller_email'   => $seller['email'],
    'seller_id_7k'   => $seller['seven_k_id'] ? (int)$seller['seven_k_id'] : null,
    'product_name'   => 'Produto de Teste',
    'payment_method' => 'PIX',
    'timestamp'      => date('Y-m-d H:i:s'),
];

// Dispara o webhook
$ch = curl_init($sevenKUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($testPayload),
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'User-Agent: LunarPay-Bot/1.0'],
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_SSL_VERIFYPEER => true,
]);
$response   = curl_exec($ch);
$httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError  = curl_error($ch);
curl_close($ch);

$responseDecoded = json_decode($response, true);
$success = $httpCode >= 200 && $httpCode < 300;
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Teste 7K Notify</title>
    <style>
        body { font-family: 'Outfit', monospace, sans-serif; background: #050505; color: #fff; padding: 2rem; max-width: 760px; margin: 0 auto; }
        h1 { color: #818cf8; }
        h2 { color: <?php echo $success ? '#4ade80' : '#f87171'; ?>; }
        pre { background: #111; border: 1px solid #222; border-radius: 12px; padding: 1.2rem; overflow-x: auto; font-size: 0.85rem; line-height: 1.6; }
        .badge { display: inline-block; padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
        .ok  { background: rgba(74,222,128,0.15); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
        .err { background: rgba(248,113,113,0.15); color: #f87171; border: 1px solid rgba(248,113,113,0.3); }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        td, th { padding: 0.6rem 1rem; border: 1px solid #222; text-align: left; font-size: 0.88rem; }
        th { color: #818cf8; background: #111; }
    </style>
</head>
<body>
    <h1>🤖 Teste — Bot 7K Community</h1>

    <table>
        <tr><th>Vendedor alvo</th><td><?php echo htmlspecialchars($seller['full_name']); ?> (ID <?php echo $seller['id']; ?>)</td></tr>
        <tr><th>E-mail</th><td><?php echo htmlspecialchars($seller['email']); ?></td></tr>
        <tr><th>ID na 7K (seven_k_id)</th><td><?php echo $seller['seven_k_id'] ? '<span class="badge ok">' . $seller['seven_k_id'] . '</span>' : '<span class="badge err">Não cadastrado — bot buscará por e-mail</span>'; ?></td></tr>
        <tr><th>URL destino</th><td><?php echo htmlspecialchars($sevenKUrl); ?></td></tr>
        <tr><th>HTTP Code</th><td><span class="badge <?php echo $success ? 'ok' : 'err'; ?>"><?php echo $httpCode ?: '0 (timeout/erro)'; ?></span></td></tr>
        <?php if ($curlError): ?>
        <tr><th>Erro cURL</th><td><span class="badge err"><?php echo htmlspecialchars($curlError); ?></span></td></tr>
        <?php endif; ?>
    </table>

    <h2><?php echo $success ? '✅ Webhook enviado com sucesso!' : '❌ Falha no envio'; ?></h2>

    <h3 style="color:#a5b4fc; margin-top:2rem;">📤 Payload enviado</h3>
    <pre><?php echo htmlspecialchars(json_encode($testPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)); ?></pre>

    <h3 style="color:#a5b4fc;">📥 Resposta do 7K</h3>
    <pre><?php echo htmlspecialchars($response ?: '(sem resposta)'); ?></pre>

    <p style="margin-top: 2rem; color: #555; font-size: 0.8rem;">
        Para testar outro usuário: <code style="color:#818cf8;"><?php echo htmlspecialchars(get_trusted_base_url()); ?>/test_7k_notify.php?user_id=ID</code>
    </p>
</body>
</html>
