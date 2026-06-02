<?php
/**
 * SSO Redirect - DiretoPay → 7K CHAT
 * Generates a signed token and redirects user to Academy
 */
require_once 'includes/db.php';

if (!isLoggedIn()) {
    header('Location: /login');
    exit;
}

$userId = $_SESSION['user_id'];
$stmt = $pdo->prepare("SELECT email, full_name FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    header('Location: /dashboard');
    exit;
}

$ssoSecret   = defined('SSO_SECRET')   ? SSO_SECRET   : 'diretopay_7kchat_sso_2026_secure_key';
$academyUrl  = defined('ACADEMY_URL')  ? ACADEMY_URL  : 'https://7kchat.site';

// Fetch total revenue to sync with 7K
$stmtTotal = $pdo->prepare("SELECT SUM(amount_brl) as vol FROM transactions WHERE user_id = ? AND status = 'paid'");
$stmtTotal->execute([$userId]);
$totalRevenue = (float)($stmtTotal->fetch()['vol'] ?? 0);

$payload = [
    'email' => $user['email'],
    'name' => $user['full_name'],
    'total_revenue' => $totalRevenue,
    'from' => 'diretopay',
    'ts' => time(),
    'nonce' => bin2hex(random_bytes(16))
];

$payloadEncoded = base64_encode(json_encode($payload));
$signature = hash_hmac('sha256', $payloadEncoded, $ssoSecret);
$token = $payloadEncoded . '.' . $signature;

header('Location: ' . $academyUrl . '/sso_login.php?token=' . urlencode($token));
exit;
