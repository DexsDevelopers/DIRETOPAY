<?php
/**
 * GitHub Auto-Deploy Webhook
 * Configure em: GitHub → Settings → Webhooks → Add webhook
 *   Payload URL : https://pixghost.site/deploy.php
 *   Content type: application/json
 *   Secret      : (valor de DEPLOY_SECRET em config.php)
 *   Events      : Just the push event
 */

define('REPO_DIR', __DIR__);
define('LOG_FILE', __DIR__ . '/deploy.log');
define('BRANCH',   'main');

// Carrega o secret do config
$configFile = __DIR__ . '/config.php';
$deploySecret = '';
if (file_exists($configFile)) {
    $content = file_get_contents($configFile);
    if (preg_match("/define\('DEPLOY_SECRET',\s*'([^']+)'\)/", $content, $m)) {
        $deploySecret = $m[1];
    }
}

function log_deploy(string $msg): void {
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL;
    file_put_contents(LOG_FILE, $line, FILE_APPEND);
}

function respond(int $code, string $msg): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['message' => $msg]);
    exit;
}

$payload = file_get_contents('php://input');

// Verifica assinatura HMAC do GitHub
// Se o secret não estiver configurado, nega TODAS as requisições por segurança
if (empty($deploySecret)) {
    log_deploy('ERROR: DEPLOY_SECRET not configured — refusing all requests');
    respond(403, 'Deploy secret not configured');
}

$sig = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
$expected = 'sha256=' . hash_hmac('sha256', $payload, $deploySecret);
if (!hash_equals($expected, $sig)) {
    log_deploy('ERROR: Invalid signature');
    respond(401, 'Invalid signature');
}

$data = json_decode($payload, true);
$ref  = $data['ref'] ?? '';

// Só processa push para a branch main
if ($ref !== 'refs/heads/' . BRANCH) {
    log_deploy("SKIP: ref=$ref (not main)");
    respond(200, 'Ignored ref: ' . $ref);
}

log_deploy("DEPLOY STARTED — commit: " . ($data['after'] ?? 'unknown'));

// Executa git fetch + reset
$cmd = 'cd ' . escapeshellarg(REPO_DIR)
     . ' && git fetch origin 2>&1'
     . ' && git reset --hard origin/' . BRANCH . ' 2>&1';

$output = shell_exec($cmd);
log_deploy("GIT OUTPUT:\n" . $output);

if (strpos($output, 'HEAD is now at') !== false) {
    log_deploy("DEPLOY SUCCESS");
    respond(200, 'Deployed successfully');
} else {
    log_deploy("DEPLOY WARNING: unexpected output");
    respond(200, 'Deploy ran: ' . trim($output));
}
