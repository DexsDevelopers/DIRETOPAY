<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/MailService.php';
require_once __DIR__ . '/../includes/TelegramService.php';
try { require_once __DIR__ . '/../includes/PushService.php'; } catch (Throwable $e) {}

$isJsonRequest = strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

if ($isJsonRequest) {
    error_reporting(0);
    ini_set('display_errors', 0);
    header('Content-Type: application/json');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    if (isLoggedIn()) {
        header("Location: /dashboard");
    } else {
        header("Location: /register");
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Validação CSRF
    $csrfToken = $_POST['csrf_token'] ?? '';
    check_csrf($csrfToken);

    // ── Bloqueio de IPs maliciosos ────────────────────────────────────
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $blockedIps = ['103.139.178.103'];
    if (in_array($clientIp, $blockedIps)) {
        write_log('SECURITY', 'Registro bloqueado por IP banido', ['ip' => $clientIp]);
        if ($isJsonRequest) { echo json_encode(['success' => false, 'error' => 'Acesso negado.']); exit; }
        header('HTTP/1.1 403 Forbidden'); exit;
    }

    // ── Rate limit: máx 3 cadastros por IP por hora ───────────────────
    $rlStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR) AND registration_ip = ?");
    try {
        $rlStmt->execute([$clientIp]);
        $regCount = (int)$rlStmt->fetchColumn();
    } catch (PDOException $e) {
        // Coluna registration_ip ainda não existe — cria e ignora
        try { $pdo->exec("ALTER TABLE users ADD COLUMN registration_ip VARCHAR(45) NULL"); } catch (PDOException $e2) {}
        $regCount = 0;
    }
    if ($regCount >= 3) {
        write_log('SECURITY', 'Rate limit de registro por IP', ['ip' => $clientIp, 'count' => $regCount]);
        if ($isJsonRequest) { echo json_encode(['success' => false, 'error' => 'Muitos cadastros deste endereço. Tente novamente mais tarde.']); exit; }
        header("Location: register.php?error=rate_limit"); exit;
    }

    // Se for uma requisição JSON (comum em SPAs/APIs), decodificar o body bruto se o $_POST estiver vazio
    if (empty($_POST) && $isJsonRequest) {
        $rawInput = file_get_contents('php://input');
        $jsonData = json_decode($rawInput, true);
        if ($jsonData) {
            $_POST['email'] = $jsonData['email'] ?? '';
            $_POST['password'] = $jsonData['password'] ?? '';
            $_POST['full_name'] = $jsonData['full_name'] ?? '';
            $_POST['pix_key'] = $jsonData['pix_key'] ?? '';
            $_POST['preferred_nominal'] = $jsonData['preferred_nominal'] ?? 'nominal1';
            $_POST['withdraw_preference'] = $jsonData['withdraw_preference'] ?? 'accumulate';
        }
    }

    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';
    $full_name = strip_tags(trim($_POST['full_name'] ?? ''));
    $pix_key = strip_tags(trim($_POST['pix_key'] ?? ''));

    // ── Validação rigorosa contra injeção e contas de pentest ──────────
    $injectionPatterns = ["'", '"', '--', ';', 'SLEEP', 'SELECT', 'DROP', 'INSERT', 'UPDATE', 'DELETE', 'UNION', 'EXEC', '<script', '0x', '#'];
    foreach ($injectionPatterns as $pattern) {
        if (stripos($full_name, $pattern) !== false || stripos($email, $pattern) !== false) {
            write_log('SECURITY', 'Tentativa de injection no cadastro', ['ip' => $clientIp, 'name' => $full_name, 'email' => $email]);
            if ($isJsonRequest) { echo json_encode(['success' => false, 'error' => 'Cadastro rejeitado por motivos de segurança.']); exit; }
            header("Location: register.php?error=invalid_name"); exit;
        }
    }

    $pentestKeywords = ['pentest', 'bugbounty', 'sqltest', 'bbadmin', 'bbtest', 'admintest'];
    foreach ($pentestKeywords as $keyword) {
        if (stripos($full_name, $keyword) !== false || stripos($email, $keyword) !== false) {
            write_log('SECURITY', 'Cadastro bloqueado: palavra reservada detectada', ['ip' => $clientIp, 'name' => $full_name, 'email' => $email]);
            if ($isJsonRequest) { echo json_encode(['success' => false, 'error' => 'Cadastro não permitido.']); exit; }
            header("Location: register.php?error=invalid_name"); exit;
        }
    }

    if (!preg_match('/^[\p{L}\s\.\-]{2,80}$/u', $full_name)) {
        if ($isJsonRequest) { echo json_encode(['success' => false, 'error' => 'Nome deve conter apenas letras (2–80 caracteres).']); exit; }
        header("Location: register.php?error=invalid_name"); exit;
    }

    // Validar provedor de e-mail (bloquear e-mails temporários)
    $allowedDomains = [
        'gmail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
        'yahoo.com', 'yahoo.com.br', 'icloud.com', 'me.com', 'mac.com',
        'protonmail.com', 'proton.me', 'aol.com',
        'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br', 'globo.com', 'globomail.com',
        'zoho.com', 'yandex.com', 'mail.com', 'gmx.com', 'gmx.net'
    ];
    $emailDomain = strtolower(substr(strrchr($email, '@'), 1));
    if (!in_array($emailDomain, $allowedDomains)) {
        if ($isJsonRequest) {
            echo json_encode(['success' => false, 'error' => 'Use um e-mail de provedor confiável (Gmail, Outlook, Hotmail, Yahoo, iCloud, etc). E-mails temporários não são permitidos.']);
            exit;
        }
        header("Location: register.php?error=invalid_email");
        exit;
    }

    // Verificar se o email já existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        if (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
            echo json_encode(['success' => false, 'error' => 'Este email já está cadastrado.']);
            exit;
        }
        header("Location: register.php?error=exists");
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Garantir que coluna password tem tamanho suficiente para bcrypt hash (60 chars)
    try { $pdo->exec("ALTER TABLE users MODIFY COLUMN password VARCHAR(255)"); } catch (PDOException $e) {
        write_log('WARN', 'ALTER TABLE password falhou: ' . $e->getMessage());
    }

    // Log para diagnóstico
    write_log('DEBUG', 'Registro - hash gerado', [
        'email' => $email,
        'password_length' => strlen($password),
        'hash_length' => strlen($hash),
        'hash_prefix' => substr($hash, 0, 7)
    ]);

    // Check for affiliate cookie
    $affiliateId = null;
    if (isset($_COOKIE['direto_pay_ref'])) {
        $refToken = $_COOKIE['direto_pay_ref'];
        $stmtRef = $pdo->prepare("SELECT id FROM users WHERE referral_token = ?");
        $stmtRef->execute([$refToken]);
        $ref = $stmtRef->fetch();
        if ($ref) {
            $affiliateId = $ref['id'];
        }
    } elseif (isset($_COOKIE['ghost_pix_ref'])) {
        $refToken = $_COOKIE['ghost_pix_ref'];
        $stmtRef = $pdo->prepare("SELECT id FROM users WHERE referral_token = ?");
        $stmtRef->execute([$refToken]);
        $ref = $stmtRef->fetch();
        if ($ref) {
            $affiliateId = $ref['id'];
        }
    }

    // Buscar taxa padrão
    $defTaxStmt = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'default_user_tax'");
    $defaultTax = (float)($defTaxStmt->fetchColumn() ?: '5.0');

    $preferred_nominal = strip_tags(trim($_POST['preferred_nominal'] ?? 'nominal1'));
    if (!in_array($preferred_nominal, ['nominal1', 'nominal2', 'nominal3'])) {
        $preferred_nominal = 'nominal1';
    }

    $withdraw_preference = strip_tags(trim($_POST['withdraw_preference'] ?? 'accumulate'));
    if (!in_array($withdraw_preference, ['accumulate', 'auto_direct'])) {
        $withdraw_preference = 'accumulate';
    }

    // Se nominal3, o saque é automático por padrão
    if ($preferred_nominal === 'nominal3') {
        $withdraw_preference = 'auto_direct';
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO users (email, password, full_name, pix_key, status, affiliate_id, referral_token, commission_rate, registration_ip, preferred_nominal, withdraw_preference) VALUES (?, ?, ?, ?, 'approved', ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$email, $hash, $full_name, $pix_key, $affiliateId, bin2hex(random_bytes(8)), $defaultTax, $clientIp, $preferred_nominal, $withdraw_preference]);
        $newUserId = $pdo->lastInsertId();

        // Verificar se o hash foi salvo corretamente (detectar truncamento)
        $verifyStmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $verifyStmt->execute([$newUserId]);
        $storedHash = $verifyStmt->fetchColumn();
        $hashOk = password_verify($password, $storedHash);
        write_log('DEBUG', 'Verificação pós-registro', [
            'user_id' => $newUserId,
            'hash_length_original' => strlen($hash),
            'hash_length_stored' => strlen($storedHash),
            'hash_match' => $hash === $storedHash,
            'verify_ok' => $hashOk
        ]);
        if (!$hashOk) {
            // Hash foi truncado - forçar update com hash completo
            $pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$hash, $newUserId]);
            write_log('WARN', 'Hash truncado detectado, corrigido via UPDATE', ['user_id' => $newUserId]);
        }

        // Notificação Interna de Aprovação
        try {
            $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Conta Aprovada! ✅', 'Sua conta foi verificada e aprovada automaticamente. Já pode começar a operar!', 'success')")
                ->execute([$newUserId]);
        } catch (PDOException $e) {
            write_log('error', 'Falha ao inserir notificação automática no registro: ' . $e->getMessage());
        }

        // Enviar E-mail de Aprovação
        try {
            MailService::notifyApproval($email, $full_name);
        } catch (Exception $e) {
            write_log('error', 'Falha ao enviar email de aprovação: ' . $e->getMessage());
        }

        // Notificar Admin via Telegram
        try { TelegramService::notifyNewUser($full_name, $email, $_SERVER['REMOTE_ADDR'] ?? ''); } catch (Throwable $e) {}

        // Notificar Admin via WhatsApp
        try {
            require_once __DIR__ . '/../includes/WhatsAppService.php';
            WhatsAppService::notifyNewUser($full_name, $email, $_SERVER['REMOTE_ADDR'] ?? '');
        } catch (Throwable $e) {}

        // Notificar Admin (Push + In-App)
        if (class_exists('PushService')) {
            try { PushService::notifyAdmins('👤 Novo Cadastro', $full_name . ' — ' . $email, 'info'); } catch (Throwable $e) {}
        }

        write_log('INFO', 'Novo usuário registrado', ['user_id' => $newUserId, 'email' => $email]);

        if ($isJsonRequest) {
            echo json_encode(['success' => true, 'message' => 'Conta criada com sucesso!']);
            exit;
        }
        header("Location: login.php?registered=1");
        exit;
    } catch (PDOException $e) {
        write_log('error', 'Erro ao criar conta: ' . $e->getMessage());
        if ($isJsonRequest) {
            echo json_encode(['success' => false, 'error' => 'Erro ao criar conta. Tente novamente.']);
            exit;
        }
        header("Location: register.php?error=unknown");
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <link rel="icon" type="image/png" href="../logo_diretopay.png">
    <title>DiretoPay - Cadastro</title>
    <link rel="stylesheet" href="../style.css?v=125.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        .lp-body { background: #000; font-family: 'Outfit', sans-serif; overflow-x: hidden; }
        .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; }
        .input-glass { background: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; color: #fff !important; transition: all 0.3s ease; }
        .input-glass:focus { border-color: #4ade80 !important; box-shadow: 0 0 15px rgba(74, 222, 128, 0.2); outline: none; }
    </style>
</head>
<body class="lp-body" style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1.5rem;">
    <div class="glass-card" style="width: 100%; max-width: 480px; padding: 2.5rem; animation: fadeInUp 0.8s ease-out;">
        <div style="text-align: center; margin-bottom: 2rem;">
            <img src="../logo-diretopay.webp" style="width: 80px; height: 80px; border-radius: 20px; margin: 0 auto 1.2rem; display: block; object-fit: cover; border: 1px solid var(--border-h); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="font-size: 2rem; font-weight: 800; letter-spacing: -1.2px; margin-bottom: 0.3rem;">Criar Conta</h2>
            <p style="color: var(--text-2); font-size: 0.9rem; font-weight: 500;">Junte-se à rede DiretoPay</p>
        </div>

        <?php if(isset($_GET['error']) && $_GET['error'] == 'exists'): ?>
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--red); padding: 0.8rem; border-radius: 10px; margin-bottom: 1.5rem; font-size: 0.85rem; text-align: center;">
                <i class="fas fa-exclamation-circle"></i> Este email já está cadastrado.
            </div>
        <?php endif; ?>

        <form action="register.php" method="POST">
            <input type="hidden" name="csrf_token" value="<?php echo csrf_token(); ?>">
            <div style="margin-bottom: 1.2rem;">
                <label style="display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-2); margin-bottom: 0.5rem; margin-left: 0.2rem;">Nome Completo</label>
                <div style="position: relative;">
                    <i class="fas fa-user" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-2); font-size: 0.85rem;"></i>
                    <input type="text" name="full_name" required placeholder="Como no seu banco" 
                           style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 0.9rem 1rem 0.9rem 2.6rem; border-radius: 11px; color: var(--text); font-size: 0.95rem; font-family: var(--font); transition: all 0.2s;">
                </div>
            </div>

            <div style="margin-bottom: 1.2rem;">
                <label style="display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-2); margin-bottom: 0.5rem; margin-left: 0.2rem;">Email</label>
                <div style="position: relative;">
                    <i class="fas fa-envelope" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-2); font-size: 0.85rem;"></i>
                    <input type="email" name="email" required placeholder="seu@email.com" 
                           style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 0.9rem 1rem 0.9rem 2.6rem; border-radius: 11px; color: var(--text); font-size: 0.95rem; font-family: var(--font); transition: all 0.2s;">
                </div>
            </div>

            <div style="margin-bottom: 1.2rem;">
                <label style="display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: rgba(255,255,255,0.6); margin-bottom: 0.5rem;">Chave PIX (Qualquer Tipo)</label>
                <div style="position: relative;">
                    <i class="fas fa-key" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); font-size: 0.85rem;"></i>
                    <input type="text" name="pix_key" id="pix_key" required placeholder="E-mail, CPF, Telefone ou Chave Aleatória" class="input-glass"
                           style="width: 100%; padding: 0.9rem 1rem 0.9rem 2.6rem; border-radius: 12px; font-size: 0.95rem;">
                </div>
            </div>

            <div style="margin-bottom: 1.8rem;">
                <label style="display: block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-2); margin-bottom: 0.5rem; margin-left: 0.2rem;">Senha</label>
                <div style="position: relative;">
                    <i class="fas fa-lock" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-2); font-size: 0.85rem;"></i>
                    <input type="password" name="password" required placeholder="Mínimo 6 caracteres" 
                           style="width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 0.9rem 1rem 0.9rem 2.6rem; border-radius: 11px; color: var(--text); font-size: 0.95rem; font-family: var(--font); transition: all 0.2s;">
                </div>
            </div>

            <button type="submit" class="btn-primary">
                Criar Minha Conta <i class="fas fa-paper-plane" style="font-size: 0.8rem; margin-left: 0.4rem;"></i>
            </button>
        </form>

        <div style="margin-top: 1.5rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.25rem;">
            <p style="color: rgba(255,255,255,0.6); font-size: 0.88rem;">
                Já tem uma conta? <a href="login.php" style="color: #fff; font-weight: 700; text-decoration: none;">Entre aqui</a>
            </p>
        </div>
    </div>
    <!-- Filtro removido para aceitar todos os tipos de chaves PIX (E-mail, CPF, Telefone, Aleatória) -->
</body>
</html>

