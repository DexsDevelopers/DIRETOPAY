<?php
/**
 * SSO Login - Receives token from 7K CHAT → logs into Ghost Pix
 */
require_once 'includes/db.php';

$token = $_GET['token'] ?? '';

if (empty($token)) {
    header('Location: /login');
    exit;
}

$ssoSecret = defined('SSO_SECRET') ? SSO_SECRET : 'ghostpix_7kchat_sso_2026_secure_key';

// Parse token
$parts = explode('.', $token);
if (count($parts) !== 2) {
    header('Location: /login?error=invalid_token');
    exit;
}

[$payloadEncoded, $signature] = $parts;

// Verify signature
$expectedSig = hash_hmac('sha256', $payloadEncoded, $ssoSecret);
if (!hash_equals($expectedSig, $signature)) {
    header('Location: /login?error=invalid_signature');
    exit;
}

$payload = json_decode(base64_decode($payloadEncoded), true);
if (!$payload || !isset($payload['email']) || !isset($payload['ts'])) {
    header('Location: /login?error=invalid_payload');
    exit;
}

// Token expires after 120 seconds
if (time() - $payload['ts'] > 120) {
    header('Location: /login?error=token_expired');
    exit;
}

// Must come from academy
if (($payload['from'] ?? '') !== 'academy') {
    header('Location: /login?error=invalid_source');
    exit;
}

$email = $payload['email'];
$name = $payload['name'] ?? '';

// Find or create user
$stmt = $pdo->prepare("SELECT id, email, full_name, status FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    // ── Validação rigorosa contra injeção e contas de pentest ──────────
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $injectionPatterns = ["'", '"', '--', ';', 'SLEEP', 'SELECT', 'DROP', 'INSERT', 'UPDATE', 'DELETE', 'UNION', 'EXEC', '<script', '0x', '#'];
    foreach ($injectionPatterns as $pattern) {
        if (stripos($name, $pattern) !== false || stripos($email, $pattern) !== false) {
            write_log('SECURITY', 'Tentativa de injection no SSO', ['ip' => $clientIp, 'name' => $name, 'email' => $email]);
            header('Location: /login?error=invalid_payload');
            exit;
        }
    }

    $pentestKeywords = ['pentest', 'bugbounty', 'sqltest', 'bbadmin', 'bbtest', 'admintest'];
    foreach ($pentestKeywords as $keyword) {
        if (stripos($name, $keyword) !== false || stripos($email, $keyword) !== false) {
            write_log('SECURITY', 'SSO bloqueado: palavra reservada detectada', ['ip' => $clientIp, 'name' => $name, 'email' => $email]);
            header('Location: /login?error=invalid_payload');
            exit;
        }
    }

    // Auto-create account
    $randomPass = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
    $defTaxStmt = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'default_user_tax'");
    $defaultTax = (float)($defTaxStmt->fetchColumn() ?: '5.0');
    $stmt = $pdo->prepare("INSERT INTO users (email, password, full_name, status, commission_rate) VALUES (?, ?, ?, 'approved', ?)");
    $stmt->execute([$email, $randomPass, $name, $defaultTax]);
    $userId = $pdo->lastInsertId();
} else {
    if ($user['status'] === 'blocked') {
        header('Location: /login?error=blocked');
        exit;
    }
    $userId = $user['id'];
}

// Log user in
session_regenerate_id(true);
$_SESSION['user_id'] = $userId;

header('Location: /dashboard');
exit;
