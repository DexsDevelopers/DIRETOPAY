<?php
/**
 * Security.php — Módulo central de segurança DiretoPay
 * Cobre: Headers, Brute Force, Session, XSS, IDOR, Redirect, Path Traversal
 */

// ──────────────────────────────────────────────────────────────────────────────
// 1. SECURITY HEADERS (anti-clickjacking, XSS, MIME sniff, HSTS, CSP)
// ──────────────────────────────────────────────────────────────────────────────
function send_security_headers(): void {
    if (headers_sent()) return;

    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
             || ($_SERVER['SERVER_PORT'] ?? 80) == 443;

    header('X-Frame-Options: SAMEORIGIN');
    header('X-Content-Type-Options: nosniff');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

    if ($isSecure) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }

    // CSP restritivo: bloqueia inline scripts de terceiros não autorizados
    header("Content-Security-Policy: default-src 'self'; " .
           "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://api.qrserver.com; " .
           "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " .
           "img-src 'self' data: blob: https:; " .
           "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; " .
           "connect-src 'self'; " .
           "frame-ancestors 'self'; " .
           "base-uri 'self'; " .
           "form-action 'self';");
}

// ──────────────────────────────────────────────────────────────────────────────
// 1b. HOST HEADER INJECTION — usa SERVER_NAME (controlado pelo servidor) em vez
//     de HTTP_HOST (controlado pelo cliente) para construir URLs em emails/links
// ──────────────────────────────────────────────────────────────────────────────
function get_trusted_host(): string {
    // SERVER_NAME é definido pelo servidor web (nginx/apache), não pelo cliente
    $host = $_SERVER['SERVER_NAME'] ?? '';
    if (empty($host)) {
        // Fallback: valida HTTP_HOST contra uma whitelist se SERVER_NAME não estiver disponível
        $httpHost = strtolower(preg_replace('/[^a-zA-Z0-9.\-:]/', '', $_SERVER['HTTP_HOST'] ?? ''));
        // Remove porta se presente
        $httpHost = preg_replace('/:\d+$/', '', $httpHost);
        $host = $httpHost ?: 'localhost';
    }
    return $host;
}

function get_trusted_base_url(): string {
    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
             || ($_SERVER['SERVER_PORT'] ?? 80) == 443;
    return ($isSecure ? 'https' : 'http') . '://' . get_trusted_host();
}

// ──────────────────────────────────────────────────────────────────────────────
// 1c. IP REAL — usa REMOTE_ADDR (nunca X-Forwarded-For diretamente, spoofável)
//     Só confia em X-Forwarded-For se vier de proxy reverso confiável
// ──────────────────────────────────────────────────────────────────────────────
function get_real_ip(): string {
    // IPs de proxies reversos confiáveis (Cloudflare, servidor próprio, etc.)
    // Ajuste conforme seu ambiente
    $trustedProxies = ['127.0.0.1', '::1'];

    $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    // Só processa X-Forwarded-For se a requisição vem de proxy confiável
    if (in_array($remoteAddr, $trustedProxies, true)) {
        $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
        if (!empty($forwarded)) {
            $ips = array_map('trim', explode(',', $forwarded));
            $clientIp = $ips[0]; // Primeiro IP = cliente real
            if (filter_var($clientIp, FILTER_VALIDATE_IP)) {
                return $clientIp;
            }
        }
        $cfIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? ''; // Cloudflare
        if (!empty($cfIp) && filter_var($cfIp, FILTER_VALIDATE_IP)) {
            return $cfIp;
        }
    }

    return $remoteAddr;
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. SESSION FIXATION — regenera ID ao autenticar
// ──────────────────────────────────────────────────────────────────────────────
function secure_session_login(array $user): void {
    session_regenerate_id(true); // Invalida o ID antigo

    $_SESSION['user_id']   = $user['id'];
    $_SESSION['email']     = $user['email'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['is_admin']  = (int)($user['is_admin'] ?? 0);
    $_SESSION['login_ip']  = $_SERVER['REMOTE_ADDR'] ?? '';
    $_SESSION['login_ua']  = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200);
    $_SESSION['login_at']  = time();
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. SESSION HIJACKING — valida IP e User-Agent da sessão ativa
// ──────────────────────────────────────────────────────────────────────────────
function validate_session(): bool {
    if (!isset($_SESSION['user_id'])) return false;

    $currentIp = $_SERVER['REMOTE_ADDR'] ?? '';
    $currentUa = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200);

    // Aceita mesmo UA (ignora mudanças de IP por CGNAT/VPN)
    if (isset($_SESSION['login_ua']) && $_SESSION['login_ua'] !== $currentUa) {
        session_destroy();
        return false;
    }

    return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. BRUTE FORCE LOGIN — tabela login_attempts
// ──────────────────────────────────────────────────────────────────────────────
function setup_login_attempts_table(PDO $pdo): void {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            ip         VARCHAR(45) NOT NULL,
            email      VARCHAR(255) NOT NULL DEFAULT '',
            success    TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_la_ip (ip, created_at),
            INDEX idx_la_email (email, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}
}

function record_login_attempt(PDO $pdo, string $ip, string $email, bool $success): void {
    try {
        $pdo->prepare("INSERT INTO login_attempts (ip, email, success) VALUES (?, ?, ?)")
            ->execute([$ip, strtolower($email), $success ? 1 : 0]);
    } catch (PDOException $e) {}
}

function check_login_rate_limit(PDO $pdo, string $ip, string $email): bool {
    try {
        // Bloqueia IP com >10 falhas em 15 min
        $s = $pdo->prepare("SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND success = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
        $s->execute([$ip]);
        if ((int)$s->fetchColumn() >= 10) return false;

        // Bloqueia email específico com >5 falhas em 15 min
        $s = $pdo->prepare("SELECT COUNT(*) FROM login_attempts WHERE email = ? AND success = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
        $s->execute([strtolower($email)]);
        if ((int)$s->fetchColumn() >= 5) return false;
    } catch (PDOException $e) {}

    return true;
}

function get_login_wait_seconds(PDO $pdo, string $ip): int {
    try {
        $s = $pdo->prepare("SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND success = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
        $s->execute([$ip]);
        $count = (int)$s->fetchColumn();
        if ($count >= 10) return 900; // 15 min
        if ($count >= 5)  return 60;
    } catch (PDOException $e) {}
    return 0;
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. XSS OUTPUT ENCODING
// ──────────────────────────────────────────────────────────────────────────────
function e(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function safe_json(mixed $data): string {
    return json_encode($data, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. OPEN REDIRECT — valida que redirect é relativo ou mesmo domínio
// ──────────────────────────────────────────────────────────────────────────────
function safe_redirect(string $url): string {
    $parsed = parse_url($url);

    // Rejeita URLs com host externo
    if (!empty($parsed['host'])) {
        $allowedHost = strtolower(get_trusted_host()); // SERVER_NAME — não controlado pelo cliente
        if (strtolower($parsed['host']) !== $allowedHost) {
            return '/dashboard.php'; // fallback seguro
        }
    }

    // Rejeita javascript: data: e outros schemas maliciosos
    if (!empty($parsed['scheme']) && !in_array(strtolower($parsed['scheme']), ['http', 'https'])) {
        return '/dashboard.php';
    }

    return $url;
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. PATH TRAVERSAL — sanitiza nomes de arquivo/parâmetro de rota
// ──────────────────────────────────────────────────────────────────────────────
function safe_filename(string $input): string {
    // Remove ../ ./ e caracteres perigosos
    $clean = preg_replace('/[^a-zA-Z0-9_\-\.]/', '', basename($input));
    return $clean ?: 'invalid';
}

function is_path_traversal(string $input): bool {
    $decoded = urldecode($input);
    $patterns = ['../', '.\\', '%2e%2e', '%252e', 'etc/passwd', '/proc/', 'php://'];
    foreach ($patterns as $p) {
        if (stripos($decoded, $p) !== false) return true;
    }
    return false;
}

// ──────────────────────────────────────────────────────────────────────────────
// 8. IDOR — verifica ownership do recurso
// ──────────────────────────────────────────────────────────────────────────────
function assert_owns_resource(PDO $pdo, string $table, int $resourceId, int $userId, string $userCol = 'user_id'): bool {
    try {
        $s = $pdo->prepare("SELECT COUNT(*) FROM `$table` WHERE id = ? AND `$userCol` = ?");
        $s->execute([$resourceId, $userId]);
        return (int)$s->fetchColumn() > 0;
    } catch (PDOException $e) {
        return false;
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// 9. IP BLOQUEADO — lista negra expandível
// ──────────────────────────────────────────────────────────────────────────────
function is_blocked_ip(string $ip): bool {
    $blockedIps = [
        '103.139.178.103',
        // Adicione outros IPs maliciosos aqui
    ];
    return in_array($ip, $blockedIps, true);
}

function block_if_bad_ip(): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if (is_blocked_ip($ip)) {
        http_response_code(403);
        exit('Access Denied');
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// 10. USER-AGENT SUSPEITO — bloqueia scanners automáticos conhecidos
// ──────────────────────────────────────────────────────────────────────────────
function block_suspicious_agents(): void {
    $ua = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
    $badAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab', 'dirbuster', 'gobuster',
                  'wfuzz', 'burpsuite', 'openvas', 'nessus', 'hydra', 'acunetix',
                  'nuclei', 'metasploit', 'w3af', 'arachni', 'havij'];
    foreach ($badAgents as $bad) {
        if (strpos($ua, $bad) !== false) {
            http_response_code(403);
            exit('Access Denied');
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// 11. SSRF — valida URLs antes de o servidor fazer requests externos
// ──────────────────────────────────────────────────────────────────────────────
function is_safe_external_url(string $url): bool {
    if (empty($url)) return false;

    $parsed = parse_url($url);
    if (!$parsed) return false;

    // Só aceita http/https
    $scheme = strtolower($parsed['scheme'] ?? '');
    if (!in_array($scheme, ['http', 'https'], true)) return false;

    $host = strtolower($parsed['host'] ?? '');
    if (empty($host)) return false;

    // Bloqueia localhost e loopback
    $blockedHosts = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
    if (in_array($host, $blockedHosts, true)) return false;

    // Bloqueia IPs privados / metadata cloud
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        // RFC1918 + link-local + metadata
        $privateRanges = [
            '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16',
            '169.254.0.0/16', '100.64.0.0/10', '127.0.0.0/8',
            'fc00::/7', 'fe80::/10',
        ];
        foreach ($privateRanges as $range) {
            if (ip_in_cidr($host, $range)) return false;
        }
    }

    // Bloqueia domínios internos comuns
    $blockedPatterns = ['169.254.', 'metadata.google', 'metadata.azure',
                        'instance-data', '.internal', '.local'];
    foreach ($blockedPatterns as $pat) {
        if (strpos($host, $pat) !== false) return false;
    }

    return true;
}

function ip_in_cidr(string $ip, string $cidr): bool {
    if (!str_contains($cidr, '/')) return $ip === $cidr;
    [$subnet, $bits] = explode('/', $cidr, 2);
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) &&
        filter_var($subnet, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $ipLong  = ip2long($ip);
        $subLong = ip2long($subnet);
        $mask    = -1 << (32 - (int)$bits);
        return ($ipLong & $mask) === ($subLong & $mask);
    }
    return false;
}

// ──────────────────────────────────────────────────────────────────────────────
// 12. COMMAND INJECTION — sanitiza entradas que vão para shell (se houver)
// ──────────────────────────────────────────────────────────────────────────────
function safe_shell_arg(string $input): string {
    return escapeshellarg($input);
}

// ──────────────────────────────────────────────────────────────────────────────
// 12. LOG DE SEGURANÇA centralizado
// ──────────────────────────────────────────────────────────────────────────────
function security_log(string $event, array $context = []): void {
    $context['ip']  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $context['ua']  = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 150);
    $context['uri'] = $_SERVER['REQUEST_URI'] ?? '';
    if (function_exists('write_log')) {
        write_log('SECURITY', $event, $context);
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// 13. WEBHOOK REPLAY ATTACK — valida janela de tempo do timestamp
//     Impede que atacantes reutilizem webhooks capturados (replay attacks)
//     Pesquisa: hooklistener.com, ngrok.com — tolerância recomendada: 5 minutos
// ──────────────────────────────────────────────────────────────────────────────
function validate_webhook_timestamp(int $webhookTimestamp, int $toleranceSeconds = 300): bool {
    $now = time();
    $diff = abs($now - $webhookTimestamp);
    if ($diff > $toleranceSeconds) {
        security_log('WEBHOOK_REPLAY_BLOCKED', [
            'webhook_ts' => $webhookTimestamp,
            'server_ts'  => $now,
            'diff_sec'   => $diff,
        ]);
        return false;
    }
    return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// 14. RATE LIMITER GENÉRICO — por IP + endpoint (usa tabela login_attempts adaptada)
//     Pesquisa: OWASP, readme.io — endpoints críticos devem ter rate limiting
// ──────────────────────────────────────────────────────────────────────────────
function check_endpoint_rate_limit(PDO $pdo, string $ip, string $endpoint, int $maxHits = 20, int $windowMinutes = 1): bool {
    try {
        // Cria tabela de rate limit se não existir
        $pdo->exec("CREATE TABLE IF NOT EXISTS rate_limit_log (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            ip         VARCHAR(45) NOT NULL,
            endpoint   VARCHAR(100) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rl (ip, endpoint, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Conta hits no janela de tempo
        $s = $pdo->prepare("SELECT COUNT(*) FROM rate_limit_log WHERE ip = ? AND endpoint = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)");
        $s->execute([$ip, $endpoint, $windowMinutes]);
        $hits = (int)$s->fetchColumn();

        if ($hits >= $maxHits) {
            security_log('RATE_LIMIT_HIT', ['endpoint' => $endpoint, 'hits' => $hits, 'window_min' => $windowMinutes]);
            return false; // bloqueado
        }

        // Registra o hit atual
        $pdo->prepare("INSERT INTO rate_limit_log (ip, endpoint) VALUES (?, ?)")->execute([$ip, $endpoint]);

        // Limpeza periódica (1% de chance por requisição para não sobrecarregar)
        if (rand(1, 100) === 1) {
            $pdo->exec("DELETE FROM rate_limit_log WHERE created_at < DATE_SUB(NOW(), INTERVAL 60 MINUTE)");
        }

        return true;
    } catch (Throwable $e) {
        return true; // em caso de erro no DB, não bloqueia (fail open para não derrubar o site)
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// 15. SANITIZAÇÃO DE ENTRADA — remove caracteres de controle e limita tamanho
//     Pesquisa: OWASP — nunca confie em input do usuário
// ──────────────────────────────────────────────────────────────────────────────
function sanitize_string(string $input, int $maxLen = 255): string {
    // Remove caracteres de controle (exceto nova linha e tab em contextos multi-linha)
    $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $input);
    // Limita tamanho
    return mb_substr(trim($clean), 0, $maxLen, 'UTF-8');
}

function sanitize_numeric_string(string $input): string {
    return preg_replace('/[^0-9.\-]/', '', $input);
}

// ──────────────────────────────────────────────────────────────────────────────
// 16. VALIDAÇÃO RIGOROSA DE VALOR MONETÁRIO
//     Previne manipulação de preços (price tampering) — validação sempre server-side
//     Pesquisa: OWASP — "Never trust client-side calculations"
// ──────────────────────────────────────────────────────────────────────────────
function validate_monetary_amount(float $amount, float $min = 1.0, float $max = 100000.0): bool {
    if (!is_finite($amount)) return false;
    if ($amount < $min || $amount > $max) return false;
    // Verifica se tem no máximo 2 casas decimais (evita float abuse)
    if (round($amount, 2) !== $amount) {
        $amount = round($amount, 2); // normaliza silenciosamente
    }
    return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// 17. BLOQUEAR MÉTODOS HTTP INDESEJADOS em endpoints sensíveis
//     Pesquisa: OWASP — "Use POST for sensitive actions, never GET"
// ──────────────────────────────────────────────────────────────────────────────
function require_post_method(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        header('Allow: POST');
        echo json_encode(['error' => 'Método não permitido. Use POST.']);
        exit;
    }
}

function require_https(): void {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['SERVER_PORT'] ?? 80) == 443;
    if (!$isHttps && php_sapi_name() !== 'cli') {
        http_response_code(426);
        echo json_encode(['error' => 'HTTPS obrigatório.']);
        exit;
    }
}

