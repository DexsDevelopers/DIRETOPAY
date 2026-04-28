<?php
require_once __DIR__ . '/includes/db.php';

$rawBody = file_get_contents('php://input');
$headers = getallheaders();

// Verify webhook signature if secret is configured
$secretStmt = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'cakto_webhook_secret'");
$webhookSecret = $secretStmt ? ($secretStmt->fetchColumn() ?: '') : '';

if ($webhookSecret) {
    $sig = $headers['X-Cakto-Signature'] ?? $headers['X-Signature'] ?? $headers['Signature'] ?? '';
    if ($sig && !hash_equals(hash_hmac('sha256', $rawBody, $webhookSecret), $sig)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }
}

$data = json_decode($rawBody, true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Cakto can send event at top-level or wrapped
$event = $data['event'] ?? $data['type'] ?? '';
$order = $data['data'] ?? $data;

// Only process purchase_approved
if ($event !== 'purchase_approved') {
    http_response_code(200);
    echo json_encode(['ok' => true, 'ignored' => $event ?: 'unknown']);
    exit;
}

// Extract order fields
$customerEmail = strtolower(trim($order['customer']['email'] ?? ''));
$customerName  = trim($order['customer']['name'] ?? 'Cliente Cakto');
$customerDoc   = preg_replace('/\D/', '', $order['customer']['docNumber'] ?? '');
$amount        = (float)($order['amount'] ?? $order['baseAmount'] ?? 0);
$orderId       = $order['id'] ?? $order['refId'] ?? '';
$productName   = $order['product']['name'] ?? 'Produto Cakto';
$paymentMethod = $order['paymentMethod'] ?? 'pix';

if (!$customerEmail || $amount <= 0 || !$orderId) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$externalId = 'cakto_' . $orderId;

// Idempotency: skip if already processed
$dupCheck = $pdo->prepare("SELECT id FROM transactions WHERE external_id = ?");
$dupCheck->execute([$externalId]);
if ($dupCheck->fetchColumn()) {
    http_response_code(200);
    echo json_encode(['ok' => true, 'duplicate' => true]);
    exit;
}

// Find or create user
$userStmt = $pdo->prepare("SELECT id, commission_rate, balance FROM users WHERE email = ?");
$userStmt->execute([$customerEmail]);
$user = $userStmt->fetch();

$autoPassword = null;
if (!$user) {
    $autoPassword = substr(bin2hex(random_bytes(4)), 0, 8);
    $hash = password_hash($autoPassword, PASSWORD_DEFAULT);

    $defTaxStmt = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'default_user_tax'");
    $defaultTax = (float)($defTaxStmt->fetchColumn() ?: '5.0');

    $pdo->prepare("INSERT INTO users (email, password, full_name, status, commission_rate, referral_token) VALUES (?, ?, ?, 'approved', ?, ?)")
        ->execute([$customerEmail, $hash, $customerName, $defaultTax, bin2hex(random_bytes(8))]);

    $userId = (int)$pdo->lastInsertId();
    $commissionRate = $defaultTax;
    $currentBalance = 0.0;
} else {
    $userId = (int)$user['id'];
    $commissionRate = (float)$user['commission_rate'];
    $currentBalance = (float)$user['balance'];
}

// Calculate amounts
$platformFee = $amount * ($commissionRate / 100);
$netAmount   = $amount - $platformFee;

// Insert transaction as 'paid'
$pdo->prepare(
    "INSERT INTO transactions (user_id, customer_ip, customer_name, external_id, amount_brl, amount_net_brl, pix_id, status, pix_code, qr_image)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', '', '')"
)->execute([
    $userId,
    $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
    $customerName,
    $externalId,
    $amount,
    $netAmount,
    $externalId
]);
$transactionId = (int)$pdo->lastInsertId();

// Credit user balance
$pdo->prepare("UPDATE users SET balance = balance + ? WHERE id = ?")->execute([$netAmount, $userId]);

// Balance audit log
try {
    $balAfter = $currentBalance + $netAmount;
    $pdo->prepare(
        "INSERT INTO balance_log (user_id, amount, balance_before, balance_after, origin, reference_id, description)
         VALUES (?, ?, ?, ?, 'sale', ?, ?)"
    )->execute([$userId, $netAmount, $currentBalance, $balAfter, $externalId, "Venda Cakto: $productName"]);
} catch (Exception $e) {}

// Notification for user
try {
    $pdo->prepare(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'success')"
    )->execute([
        $userId,
        'Nova venda via Cakto! 🎉',
        "Venda de R$ " . number_format($amount, 2, ',', '.') . " aprovada para \"$productName\". Líquido: R$ " . number_format($netAmount, 2, ',', '.') . " creditado no seu saldo."
    ]);
} catch (Exception $e) {}

// Send welcome email to new users
if ($autoPassword) {
    try {
        require_once __DIR__ . '/vendor/autoload.php';
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = MAIL_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_USER;
        $mail->Password   = MAIL_PASS;
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = MAIL_PORT;
        $mail->CharSet    = 'UTF-8';
        $mail->setFrom(MAIL_USER, MAIL_FROM_NAME);
        $mail->addAddress($customerEmail, $customerName);
        $mail->Subject = 'Seu acesso Ghost Pix está pronto!';
        $mail->Body    = "Olá $customerName!\n\nSua compra foi confirmada. Acesse a plataforma:\n\n🌐 https://pixghost.site\n📧 E-mail: $customerEmail\n🔑 Senha: $autoPassword\n\nConfigure sua chave PIX e comece a usar!\n\nEquipe Ghost Pix";
        $mail->send();
    } catch (Exception $e) {
        error_log("cakto_webhook: email failed - " . $e->getMessage());
    }
}

// Telegram admin notification
if (defined('TELEGRAM_BOT_TOKEN') && TELEGRAM_BOT_TOKEN && defined('TELEGRAM_CHAT_ID') && TELEGRAM_CHAT_ID) {
    $msg = "🛒 *Venda Cakto Aprovada*\n"
         . "💰 R$ " . number_format($amount, 2, ',', '.') . "\n"
         . "👤 $customerName\n"
         . "📧 $customerEmail\n"
         . "📦 $productName\n"
         . "💳 $paymentMethod";
    $ch = curl_init("https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage");
    curl_setopt_array($ch, [
        CURLOPT_POST           => 1,
        CURLOPT_POSTFIELDS     => json_encode(['chat_id' => TELEGRAM_CHAT_ID, 'text' => $msg, 'parse_mode' => 'Markdown']),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 5
    ]);
    curl_exec($ch);
    curl_close($ch);
}

http_response_code(200);
echo json_encode(['ok' => true, 'transaction_id' => $transactionId, 'user_id' => $userId]);
