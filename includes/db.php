<?php
require_once __DIR__ . '/Security.php';

// Domínio base para links públicos de checkout
define('APP_CHECKOUT_URL', 'https://diretopay.site');

// Protections que rodam em TODA requisição
send_security_headers();
block_if_bad_ip();
block_suspicious_agents();

if (session_status() === PHP_SESSION_NONE) {
    // Configuração de Sessão Persistente (30 dias)
    $sessionLifetime = 30 * 24 * 60 * 60;
    ini_set('session.gc_maxlifetime', $sessionLifetime);
    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    session_set_cookie_params([
        'lifetime' => $sessionLifetime,
        'path' => '/',
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// Polyfill para getallheaders() caso não exista (comum em Nginx/FPM)
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

date_default_timezone_set('America/Sao_Paulo');
require_once __DIR__ . '/../config.php';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec("SET time_zone = '-03:00'");

    // Tabela de brute-force
    setup_login_attempts_table($pdo);

    // Auto-Migração: Adicionar coluna is_demo se não existir
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN is_demo TINYINT(1) DEFAULT 0");
    } catch (PDOException $e) {}

    // Auto-Migração: Adicionar ip nas transações para anti-bot
    try {
        $pdo->exec("ALTER TABLE transactions ADD COLUMN customer_ip VARCHAR(45) AFTER user_id");
    } catch (PDOException $e) {}

    // Auto-Migração: Adicionar customer_name nas transações
    try {
        $pdo->exec("ALTER TABLE transactions ADD COLUMN customer_name VARCHAR(255) AFTER customer_ip");
    } catch (PDOException $e) {}

    // Auto-Migração: Adicionar external_id nas transações
    try {
        $pdo->exec("ALTER TABLE transactions ADD COLUMN external_id VARCHAR(100) AFTER customer_name");
    } catch (PDOException $e) {}

    // Auto-Migração: Adicionar coluna med nas transações (MED = Mecanismo Especial de Devolução)
    try {
        $pdo->exec("ALTER TABLE transactions ADD COLUMN med TINYINT(1) NOT NULL DEFAULT 0");
    } catch (PDOException $e) {}

    // Auto-Migração: Criar tabela de cupons de desconto
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS coupons (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            user_id     INT NOT NULL,
            code        VARCHAR(50) NOT NULL,
            type        ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
            value       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            scope       ENUM('store','product') NOT NULL DEFAULT 'store',
            product_id  INT NULL,
            min_amount  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            max_uses    INT NULL,
            uses_count  INT NOT NULL DEFAULT 0,
            expires_at  DATETIME NULL,
            active      TINYINT(1) NOT NULL DEFAULT 1,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_coupon_code (code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: Adicionar coupon_id e discount_amount nas orders
    try {
        $pdo->exec("ALTER TABLE orders ADD COLUMN coupon_id INT NULL AFTER status");
    } catch (PDOException $e) {}
    try {
        $pdo->exec("ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER coupon_id");
    } catch (PDOException $e) {}

    // Auto-Migração: Adicionar buyer_user_id nas orders (para vincular compras a usuários logados)
    try {
        $pdo->exec("ALTER TABLE orders ADD COLUMN buyer_user_id INT NULL AFTER buyer_document");
    } catch (PDOException $e) {}

    // Auto-Migração: Tabela para rastrear visitas diárias ao site
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS daily_stats (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            stat_date   DATE NOT NULL,
            stat_key    VARCHAR(50) NOT NULL,
            stat_value  INT NOT NULL DEFAULT 0,
            UNIQUE KEY uq_daily_stat (stat_date, stat_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: Tabela de auditoria de saldo
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS balance_log (
            id              BIGINT AUTO_INCREMENT PRIMARY KEY,
            user_id         INT NOT NULL,
            amount          DECIMAL(12,2) NOT NULL COMMENT 'Valor da operação (+ ou -)',
            balance_before  DECIMAL(12,2) NOT NULL,
            balance_after   DECIMAL(12,2) NOT NULL,
            origin          VARCHAR(50) NOT NULL COMMENT 'sale, withdraw_debit, withdraw_refund, affiliate, admin_profit, admin_adjust, bot_withdraw',
            reference_id    VARCHAR(100) NULL COMMENT 'ID da transação/saque/etc',
            description     VARCHAR(255) NULL,
            ip_address      VARCHAR(45) NULL,
            created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_bl_user (user_id),
            INDEX idx_bl_origin (origin),
            INDEX idx_bl_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: Sistema de anúncios
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS announcements (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            title       VARCHAR(150) NOT NULL,
            message     TEXT NULL,
            media_url   VARCHAR(500) NULL COMMENT 'URL da imagem ou vídeo',
            media_type  ENUM('none','image','video') NOT NULL DEFAULT 'none',
            link_url    VARCHAR(500) NULL,
            link_label  VARCHAR(100) NULL DEFAULT 'Acessar',
            is_active   TINYINT(1) NOT NULL DEFAULT 1,
            priority    INT NOT NULL DEFAULT 0 COMMENT 'Maior = aparece primeiro',
            starts_at   DATETIME NULL,
            expires_at  DATETIME NULL,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ann_active (is_active, starts_at, expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS announcement_dismissals (
            id              INT AUTO_INCREMENT PRIMARY KEY,
            announcement_id INT NOT NULL,
            user_id         INT NOT NULL,
            dismissed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_dismiss (announcement_id, user_id),
            INDEX idx_ad_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: Sistema de Chat Online
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS chat_rooms (
            id              INT AUTO_INCREMENT PRIMARY KEY,
            order_id        INT NULL,
            product_id      INT NULL,
            seller_id       INT NOT NULL,
            buyer_name      VARCHAR(150) NOT NULL,
            buyer_email     VARCHAR(255) NULL,
            chat_token      VARCHAR(64) NOT NULL UNIQUE COMMENT 'Token público para o comprador acessar',
            status          ENUM('open','closed') NOT NULL DEFAULT 'open',
            last_message_at DATETIME NULL,
            created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_cr_seller (seller_id),
            INDEX idx_cr_order (order_id),
            INDEX idx_cr_token (chat_token),
            INDEX idx_cr_status (status, last_message_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS chat_messages (
            id          BIGINT AUTO_INCREMENT PRIMARY KEY,
            room_id     INT NOT NULL,
            sender_type ENUM('buyer','seller','admin') NOT NULL,
            sender_name VARCHAR(150) NOT NULL,
            message     TEXT NOT NULL,
            read_at     DATETIME NULL,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_cm_room (room_id, created_at),
            INDEX idx_cm_unread (room_id, sender_type, read_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: ID do usuário na Comunidade 7K
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN seven_k_id INT NULL DEFAULT NULL");
    } catch (PDOException $e) {}

    // Auto-Migração: Token UTMify por vendedor
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN utmify_api_token VARCHAR(120) NULL DEFAULT NULL");
    } catch (PDOException $e) {}

    // Auto-Migração: Parâmetros UTM nas transações
    foreach (['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_sck','utm_src'] as $_utmCol) {
        try { $pdo->exec("ALTER TABLE transactions ADD COLUMN `$_utmCol` VARCHAR(255) NULL DEFAULT NULL"); } catch (PDOException $e) {}
    }

    // Auto-Migração: Colunas para vincular conta Telegram do usuário
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN telegram_chat_id VARCHAR(50) NULL");
    } catch (PDOException $e) {}
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN telegram_link_token VARCHAR(64) NULL");
    } catch (PDOException $e) {}
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN telegram_link_expires DATETIME NULL");
    } catch (PDOException $e) {}

    // Auto-Migração: Nominal preferido pelo usuário (nominal1 ou nominal2)
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN preferred_nominal VARCHAR(20) NOT NULL DEFAULT 'nominal1'");
    } catch (PDOException $e) {}

    // Auto-Migração: Preferência de saque do usuário (accumulate ou auto_direct)
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN withdraw_preference VARCHAR(20) NOT NULL DEFAULT 'accumulate'");
    } catch (PDOException $e) {}

    // Auto-Migração: Adquirente Ezzy preferida por usuário
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN ezzy_acquirer VARCHAR(100) NULL DEFAULT NULL");
    } catch (PDOException $e) {}

    // Auto-Migração: Coluna affiliate_id (quem indicou o usuário)
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN affiliate_id INT NULL DEFAULT NULL");
    } catch (PDOException $e) {}

    // Auto-Migração: Token de referência para afiliados
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN referral_token VARCHAR(64) NULL DEFAULT NULL");
    } catch (PDOException $e) {}

    // Auto-Migração: Coluna nominal em withdrawals
    try {
        $pdo->exec("ALTER TABLE withdrawals ADD COLUMN nominal VARCHAR(20) DEFAULT 'nominal1'");
    } catch (PDOException $e) {}

    // Auto-Migração: Tabela de variantes de produto
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS product_variants (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            product_id  INT NOT NULL,
            name        VARCHAR(255) NOT NULL,
            description TEXT,
            price       DECIMAL(10,2) NOT NULL,
            stock       INT NOT NULL DEFAULT -1,
            active      TINYINT(1) NOT NULL DEFAULT 1,
            sort_order  INT NOT NULL DEFAULT 0,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_pv_product (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: Flag de variantes em produtos
    try {
        $pdo->exec("ALTER TABLE products ADD COLUMN has_variants TINYINT(1) NOT NULL DEFAULT 0");
    } catch (PDOException $e) {}

    // Auto-Migração: Intervalo de cobrança para assinaturas
    try {
        $pdo->exec("ALTER TABLE products ADD COLUMN subscription_interval ENUM('weekly','monthly','yearly') DEFAULT NULL");
    } catch (PDOException $e) {}

    // Auto-Migração: Tabela de assinaturas recorrentes
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS subscriptions (
            id                  INT AUTO_INCREMENT PRIMARY KEY,
            product_id          INT NOT NULL,
            seller_id           INT NOT NULL,
            subscriber_name     VARCHAR(255) NOT NULL,
            subscriber_email    VARCHAR(255),
            subscriber_document VARCHAR(30),
            status              ENUM('pending','active','cancelled','expired') NOT NULL DEFAULT 'pending',
            billing_amount      DECIMAL(10,2) NOT NULL,
            next_billing_at     DATE,
            created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            cancelled_at        DATETIME NULL,
            INDEX idx_sub_product (product_id),
            INDEX idx_sub_seller  (seller_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: Tabela de pagamentos de assinatura
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS subscription_payments (
            id              INT AUTO_INCREMENT PRIMARY KEY,
            subscription_id INT NOT NULL,
            transaction_id  INT NULL,
            amount          DECIMAL(10,2) NOT NULL,
            status          ENUM('pending','paid','failed','expired') NOT NULL DEFAULT 'pending',
            pix_code        TEXT,
            qr_image        VARCHAR(500),
            due_at          DATE,
            paid_at         DATETIME NULL,
            created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_sp_sub (subscription_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: Chave PIX de reembolso do comprador
    try {
        $pdo->exec("ALTER TABLE orders ADD COLUMN buyer_pix_key VARCHAR(255) NULL AFTER buyer_document");
    } catch (PDOException $e) {}

    // Auto-Migração: Banners da loja pública
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS banners (
            id               INT AUTO_INCREMENT PRIMARY KEY,
            title            VARCHAR(255) NOT NULL DEFAULT '',
            image_url        VARCHAR(500) NOT NULL,
            image_url_mobile VARCHAR(500) NULL,
            link_url         VARCHAR(500) NULL,
            link_target      ENUM('_self','_blank') NOT NULL DEFAULT '_blank',
            active           TINYINT(1) NOT NULL DEFAULT 1,
            sort_order       INT NOT NULL DEFAULT 0,
            created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_banners_active (active, sort_order)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}
    try {
        $pdo->exec("ALTER TABLE banners ADD COLUMN image_url_mobile VARCHAR(500) NULL AFTER image_url");
    } catch (PDOException $e) {}

    // Auto-Migração: Detalhamento de taxas nos saques
    try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN amount_gross DECIMAL(15,2) AFTER user_id"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN fee_platform DECIMAL(15,2) AFTER amount"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN fee_gateway DECIMAL(15,2) AFTER fee_platform"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN is_debited TINYINT(1) DEFAULT 0 AFTER status"); } catch (PDOException $e) {}

    // Auto-Migração: Configurações avançadas de personalização do checkout
    try { $pdo->exec("ALTER TABLE checkouts ADD COLUMN custom_settings TEXT DEFAULT NULL"); } catch (PDOException $e) {}

    // Auto-Migração: Tabela de instâncias do WhatsApp (Failover)
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS whatsapp_instances (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            bridge_url VARCHAR(255) NOT NULL,
            bridge_secret VARCHAR(255) DEFAULT '',
            status VARCHAR(50) DEFAULT 'disconnected',
            phone VARCHAR(50) DEFAULT NULL,
            last_error TEXT DEFAULT NULL,
            priority INT DEFAULT 0,
            is_active TINYINT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // ─── MIGRAÇÕES CONSOLIDADAS (scripts soltos → db.php) ───────────────────────

    // Auto-Migração: remember_token nos users (obrigatório para auto-login)
    try { $pdo->exec("ALTER TABLE users ADD COLUMN remember_token VARCHAR(255) NULL"); } catch (PDOException $e) {}

    // Auto-Migração: api_key nos users (acesso à API REST)
    try { $pdo->exec("ALTER TABLE users ADD COLUMN api_key VARCHAR(64) NULL"); } catch (PDOException $e) {}

    // Auto-Migração: pix_code e qr_image nas transações (sem elas nenhum PIX funciona)
    try { $pdo->exec("ALTER TABLE transactions ADD COLUMN pix_code TEXT NULL AFTER pix_id"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE transactions ADD COLUMN qr_image VARCHAR(500) NULL AFTER pix_code"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE transactions ADD COLUMN callback_url TEXT NULL AFTER qr_image"); } catch (PDOException $e) {}

    // Auto-Migração: colunas críticas em withdrawals (INSERT em triggerAutoWithdraw depende delas)
    try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN pix_key_type VARCHAR(20) DEFAULT NULL"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN description TEXT DEFAULT NULL"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN type VARCHAR(30) DEFAULT 'withdrawal'"); } catch (PDOException $e) {}
    try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN charge_recipient TINYINT(1) DEFAULT 0"); } catch (PDOException $e) {}

    // Auto-Migração: tabela de notificações internas (sino do dashboard)
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type ENUM('info','success','warning','danger') NOT NULL DEFAULT 'info',
            is_read TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_notif_user (user_id),
            INDEX idx_notif_read (user_id, is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: push subscriptions (notificações push web)
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS push_subscriptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            endpoint TEXT NOT NULL,
            p256dh VARCHAR(255) NOT NULL,
            auth VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_push_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: tabela de produtos (catálogo)
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            image_url VARCHAR(500),
            category VARCHAR(100) DEFAULT 'Digital',
            type ENUM('digital','physical','service') DEFAULT 'digital',
            delivery_method VARCHAR(50) DEFAULT '',
            delivery_info TEXT,
            vitrine TINYINT(1) DEFAULT 0,
            status ENUM('active','inactive','pending') DEFAULT 'pending',
            stock INT DEFAULT -1,
            orders_count INT DEFAULT 0,
            avg_rating DECIMAL(3,2) DEFAULT 0.00,
            review_count INT DEFAULT 0,
            has_variants TINYINT(1) NOT NULL DEFAULT 0,
            subscription_interval ENUM('weekly','monthly','yearly') DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_products_user (user_id),
            INDEX idx_products_vitrine (vitrine, status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: avaliações de produtos
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS product_reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            user_id INT NULL,
            buyer_name VARCHAR(255),
            rating TINYINT NOT NULL DEFAULT 5,
            comment TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_reviews_product (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: tabela de pedidos (inclui todas as colunas de ALTER TABLE posteriores)
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            seller_id INT NOT NULL,
            buyer_name VARCHAR(255),
            buyer_document VARCHAR(20),
            buyer_pix_key VARCHAR(255) NULL,
            buyer_email VARCHAR(255) NULL,
            buyer_user_id INT NULL,
            reseller_id INT DEFAULT NULL,
            quantity INT DEFAULT 1,
            amount DECIMAL(10,2) NOT NULL,
            transaction_id INT DEFAULT NULL,
            status ENUM('pending','paid','delivered','cancelled') DEFAULT 'pending',
            delivery_data TEXT,
            delivery_token VARCHAR(64) NULL,
            delivered_content TEXT NULL,
            coupon_id INT NULL,
            discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_orders_seller (seller_id),
            INDEX idx_orders_product (product_id),
            UNIQUE KEY uq_delivery_token (delivery_token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: configurações de loja pública
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS store_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL UNIQUE,
            store_name VARCHAR(255),
            store_description TEXT,
            store_banner VARCHAR(500),
            slug VARCHAR(100) UNIQUE,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: itens de estoque de produtos digitais
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS product_stock_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            content TEXT NOT NULL,
            status ENUM('available','used') DEFAULT 'available',
            order_id INT DEFAULT NULL,
            used_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_stock_product (product_id, status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: tabela de chaves API PixGo (múltiplos gateways)
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS pixgo_apis (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            api_key VARCHAR(255) NOT NULL,
            status ENUM('active','inactive') DEFAULT 'active',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // Auto-Migração: tabela de premiações (claim_award.php auto-cria mas garante aqui)
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS award_claims (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            award_id VARCHAR(50) NOT NULL,
            claimed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            total_at_claim DECIMAL(12,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'pending',
            UNIQUE KEY uniq_user_award (user_id, award_id),
            INDEX idx_award_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (PDOException $e) {}

    // ─────────────────────────────────────────────────────────────────────────────

} catch (PDOException $e) {
    die("Erro ao conectar ao banco de dados: " . $e->getMessage());
}

// Lógica de Auto-Login (Remember Me)
if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_token'])) {
    $token = $_COOKIE['remember_token'];
    $stmt = $pdo->prepare("SELECT * FROM users WHERE remember_token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if ($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['is_admin'] = $user['is_admin'];
    }
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function isAdmin() {
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] == 1;
}

function redirect($path) {
    header("Location: $path");
    exit;
}

// CSRF Protection Functions
function csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function check_csrf($token) {
    if (!isset($_SESSION['csrf_token']) || $token !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode(['error' => 'Erro de segurança: Token CSRF inválido. Recarregue a página.']);
        exit;
    }
    return true;
}

// Structured Logging Function
function write_log($level, $message, $data = []) {
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0777, true);
    }

    $file = $logDir . '/' . date('Y-m-d') . '.log';
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'level' => strtoupper($level), // INFO, ERROR, WARNING, SECURITY
        'message' => $message,
        'user_id' => $_SESSION['user_id'] ?? 'GUEST',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
        'data' => $data
    ];

    file_put_contents($file, json_encode($logEntry) . PHP_EOL, FILE_APPEND);
}

function getUser($userId) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    return $stmt->fetch();
}

/**
 * Ajusta o saldo de um usuário de forma ATÔMICA com auditoria completa.
 *
 * @param int    $userId      ID do usuário
 * @param float  $amount      Valor da operação (positivo para crédito, negativo para débito)
 * @param string $origin      Origem: sale, withdraw_debit, withdraw_refund, affiliate, admin_profit, admin_adjust, bot_withdraw
 * @param string $referenceId ID de referência (transaction_id, withdrawal_id, etc.)
 * @param string $description Descrição legível da operação
 * @param bool   $allowNegative Permitir saldo negativo? (default: false)
 * @return array ['success' => bool, 'balance_before' => float, 'balance_after' => float, 'error' => string|null]
 */
function adjustBalance(int $userId, float $amount, string $origin, string $referenceId = '', string $description = '', bool $allowNegative = false): array {
    global $pdo;

    if ($amount == 0) {
        return ['success' => false, 'error' => 'Valor zero não permitido'];
    }

    $ownTransaction = !$pdo->inTransaction();
    if ($ownTransaction) $pdo->beginTransaction();

    try {
        // SELECT FOR UPDATE = row-level lock, previne race conditions
        $stmt = $pdo->prepare("SELECT balance FROM users WHERE id = ? FOR UPDATE");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        if (!$row) {
            if ($ownTransaction) $pdo->rollBack();
            return ['success' => false, 'error' => 'Usuário não encontrado'];
        }

        $balanceBefore = round((float)$row['balance'], 2);
        $balanceAfter  = round($balanceBefore + $amount, 2);

        // Bloqueia saldo negativo (exceto se explicitamente permitido)
        if (!$allowNegative && $balanceAfter < 0) {
            if ($ownTransaction) $pdo->rollBack();
            return [
                'success' => false,
                'balance_before' => $balanceBefore,
                'error' => "Saldo insuficiente: {$balanceBefore} + {$amount} = {$balanceAfter}"
            ];
        }

        // Atualizar saldo
        $pdo->prepare("UPDATE users SET balance = ? WHERE id = ?")
            ->execute([$balanceAfter, $userId]);

        // Registrar no log de auditoria
        $pdo->prepare("INSERT INTO balance_log (user_id, amount, balance_before, balance_after, origin, reference_id, description, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            ->execute([
                $userId,
                round($amount, 2),
                $balanceBefore,
                $balanceAfter,
                $origin,
                $referenceId ?: null,
                $description ?: null,
                $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
            ]);

        if ($ownTransaction) $pdo->commit();

        write_log('INFO', 'Balance Adjusted', [
            'user_id' => $userId,
            'amount' => $amount,
            'before' => $balanceBefore,
            'after' => $balanceAfter,
            'origin' => $origin,
            'ref' => $referenceId,
        ]);

        return [
            'success' => true,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'error' => null,
        ];
    } catch (Throwable $e) {
        if ($ownTransaction && $pdo->inTransaction()) $pdo->rollBack();
        write_log('ERROR', 'adjustBalance FAILED', [
            'user_id' => $userId, 'amount' => $amount, 'origin' => $origin,
            'error' => $e->getMessage(),
        ]);
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Verifica se um IP atingiu o limite de geração de PIX (3 por minuto)
 */
function checkRateLimit($ip) {
    global $pdo;
    if (empty($ip) || $ip === '0.0.0.0') return true;

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM transactions WHERE customer_ip = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)");
    $stmt->execute([$ip]);
    $count = (int)$stmt->fetchColumn();

    if ($count >= 3) {
        write_log('security', 'Rate limit atingido pelo IP: ' . $ip);
        return false;
    }
    return true;
}

/**
 * Sanitiza e extrai parâmetros UTM de um array de entrada.
 */
function sanitize_utm_params(array $raw): array {
    $allowed = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','sck','src'];
    $result  = [];
    foreach ($allowed as $key) {
        $val = isset($raw[$key]) ? strip_tags(trim((string)$raw[$key])) : null;
        $result[$key] = ($val !== '' && $val !== null) ? substr($val, 0, 255) : null;
    }
    return $result;
}

/**
 * Salva transação de forma resiliente e performática.
 */
function saveTransaction($userId, $amount, $netAmount, $pixId, $pixCode, $qrImage, $callbackUrl = null, $customerName = null, $externalId = null, $type = 'pix', array $utmParams = []) {
    global $pdo;
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    write_log('info', "Gerando PIX R$ $amount para User $userId (IP: $ip)");

    $utmSource   = $utmParams['utm_source']   ?? null;
    $utmMedium   = $utmParams['utm_medium']   ?? null;
    $utmCampaign = $utmParams['utm_campaign'] ?? null;
    $utmContent  = $utmParams['utm_content']  ?? null;
    $utmTerm     = $utmParams['utm_term']     ?? null;
    $utmSck      = $utmParams['sck']          ?? null;
    $utmSrc      = $utmParams['src']          ?? null;

    // Tenta insert completo com UTMs
    try {
        $sql = "INSERT INTO transactions (user_id, customer_ip, customer_name, external_id, amount_brl, amount_net_brl, pix_id, status, pix_code, qr_image, callback_url, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_sck, utm_src)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$userId, $ip, $customerName, $externalId, $amount, $netAmount, $pixId, $pixCode, $qrImage, $callbackUrl, $utmSource, $utmMedium, $utmCampaign, $utmContent, $utmTerm, $utmSck, $utmSrc]);
    } catch (PDOException $e) {
        // Fallback sem colunas UTM (banco ainda não migrado)
        try {
            $sql = "INSERT INTO transactions (user_id, customer_ip, customer_name, external_id, amount_brl, amount_net_brl, pix_id, status, pix_code, qr_image, callback_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            return $stmt->execute([$userId, $ip, $customerName, $externalId, $amount, $netAmount, $pixId, $pixCode, $qrImage, $callbackUrl]);
        } catch (PDOException $e2) {
            try {
                $sql = "INSERT INTO transactions (user_id, amount_brl, amount_net_brl, pix_id, status, pix_code, qr_image)
                        VALUES (?, ?, ?, ?, 'pending', ?, ?)";
                $stmt = $pdo->prepare($sql);
                return $stmt->execute([$userId, $amount, $netAmount, $pixId, $pixCode, $qrImage]);
            } catch (PDOException $e3) {
                try {
                    $stmt = $pdo->prepare("INSERT INTO transactions (user_id, amount_brl, amount_net_brl, pix_id, status) VALUES (?, ?, ?, ?, 'pending')");
                    return $stmt->execute([$userId, $amount, $netAmount, $pixId]);
                } catch (PDOException $e4) {
                    write_log('error', 'Falha crítica ao salvar transação: ' . $e4->getMessage());
                    return false;
                }
            }
        }
    }
}
class Response {
    public static function json($data, $status = 200) {
        ob_clean();
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public static function error($message, $status = 400, $code = null) {
        self::json([
            'success' => false,
            'error' => $message,
            'code' => $code
        ], $status);
    }

    public static function success($data = []) {
        self::json(array_merge(['success' => true], $data));
    }
}

/**
 * Gera uma URL completa (absoluta) de forma robusta,
 * detectando protocolo e subpastas automaticamente.
 */
function getFullUrl($path = '') {
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $host = $_SERVER['SERVER_NAME'] ?? ($_SERVER['HTTP_HOST'] ?? 'localhost');

    // dirname($_SERVER['PHP_SELF']) pode retornar '\' em Windows ou '/' em Linux no root.
    // Uniformizamos para '/' e removemos barras extras.
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['PHP_SELF']));
    $scriptDir = rtrim($scriptDir, '/');

    // Se o path já começa com barra, removemos para evitar "//"
    $path = ltrim($path, '/');

    return $protocol . '://' . $host . $scriptDir . '/' . $path;
}

/**
 * Dispara saque automático para o lojista após venda confirmada,
 * se o Nominal selecionado for o Nominal 3 (sempre automático)
 * ou se a sua preferência de saque for definida como "auto_direct" (sacar a cada venda).
 */
function triggerAutoWithdraw(int $userId, float $amountBrl, float $netAmount, $transactionId): bool {
    global $pdo;

    try {
        // Obter dados do lojista
        $stmt = $pdo->prepare("SELECT email, full_name, pix_key, preferred_nominal, withdraw_preference, commission_rate, whatsapp FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            write_log('WARNING', 'Auto-Withdraw: Lojista nao encontrado', ['user_id' => $userId]);
            return false;
        }

        $preferredNominal = $user['preferred_nominal'] ?? 'nominal1';
        $withdrawPreference = $user['withdraw_preference'] ?? 'accumulate';
        $pixKey = trim($user['pix_key'] ?? '');

        // Verifica se o saque automático está ativo (Nominal 3 força isso, ou preferência auto_direct)
        $isNominal3 = ($preferredNominal === 'nominal3');
        $isAutoDirect = ($withdrawPreference === 'auto_direct');

        if ((!$isNominal3 && !$isAutoDirect) || empty($pixKey)) {
            return false;
        }

        // Deduzir tipo de chave Pix
        $pixKeyType = '';
        if (strpos($pixKey, '@') !== false) {
            $pixKeyType = 'EMAIL';
        } elseif (preg_match('/^[0-9]{11}$/', preg_replace('/\D/', '', $pixKey))) {
            $pixKeyType = 'CPF';
        } elseif (preg_match('/^[0-9]{14}$/', preg_replace('/\D/', '', $pixKey))) {
            $pixKeyType = 'CNPJ';
        } elseif (preg_match('/^\+?[0-9]{10,15}$/', preg_replace('/[^\d]/', '', $pixKey))) {
            $pixKeyType = 'TELEFONE';
        } else {
            $pixKeyType = 'CHAVE_ALEATORIA';
        }

        // Calcular taxas do saque
        $commissionRate = (float)($user['commission_rate'] ?? 5.0);
        $fee_platform = round($amountBrl * ($commissionRate / 100), 2);
        $fee_gateway  = round($amountBrl - $netAmount - $fee_platform, 2);
        if ($fee_gateway < 0) $fee_gateway = 0;

        $pdo->beginTransaction();

        // 1. Debitar saldo bruto imediatamente do lojista
        $adjust = adjustBalance(
            $userId,
            -abs($amountBrl),
            'withdraw_reserve',
            '', // preenchido depois
            "Reserva de saldo para repasse automático da venda #$transactionId"
        );

        if (!$adjust['success']) {
            $pdo->rollBack();
            write_log('ERROR', 'Auto-Withdraw: Falha ao debitar saldo', ['user_id' => $userId, 'error' => $adjust['error']]);
            return false;
        }

        // 2. Registrar pedido de saque como pendente no banco
        $stmtW = $pdo->prepare("INSERT INTO withdrawals (user_id, amount_gross, amount, fee_platform, fee_gateway, pix_key, pix_key_type, description, status, is_debited, nominal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1, ?)");
        $stmtW->execute([
            $userId,
            $amountBrl,
            $netAmount,
            $fee_platform,
            $fee_gateway,
            $pixKey,
            $pixKeyType,
            "Repasse automático da venda #$transactionId",
            $preferredNominal
        ]);
        $wId = $pdo->lastInsertId();

        // Atualiza referência no log de auditoria
        $pdo->prepare("UPDATE balance_log SET reference_id = ? WHERE user_id = ? AND origin = 'withdraw_reserve' AND reference_id = '' ORDER BY id DESC LIMIT 1")
            ->execute(['wd_' . $wId, $userId]);

        $pdo->commit();

        // 3. Executar o pagamento via API da MisticPay (Nominal 3)
        require_once __DIR__ . '/MisticPayService.php';
        $mpRes = MisticPayService::requestWithdraw($netAmount, $pixKey, $pixKeyType, 'Repasse DiretoPay #' . $wId);

        if (($mpRes['http_code'] === 200 || $mpRes['http_code'] === 201) && !empty($mpRes['data']['data']['transactionId'])) {
            $txHash = $mpRes['data']['data']['transactionId'];

            $pdo->beginTransaction();
            $pdo->prepare("UPDATE withdrawals SET status = 'completed', tx_hash = ? WHERE id = ?")->execute([$txHash, $wId]);
            $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Repasse Enviado! 💸', ?, 'success')")
                ->execute([$userId, "O repasse automático de R$ " . number_format($netAmount, 2, ',', '.') . " caiu na sua conta."]);
            $pdo->commit();

            // Notificações por E-mail, Telegram e WhatsApp
            require_once __DIR__ . '/MailService.php';
            require_once __DIR__ . '/TelegramService.php';
            try { MailService::notifyWithdrawalPaid($user['email'], $user['full_name'], $netAmount); } catch (Throwable $e) {}
            try { TelegramService::notifyWithdrawalApproved($user['full_name'], $netAmount, $pixKey, $txHash); } catch (Throwable $e) {}
            try {
                require_once __DIR__ . '/WhatsAppService.php';
                if (!empty($user['whatsapp'])) {
                    WhatsAppService::notifyWithdrawalPaid($user['whatsapp'], $user['full_name'], $netAmount);
                }
                WhatsAppService::notifyWithdrawalPaidAdmin($user['full_name'], $netAmount);
            } catch (Throwable $e) {}

            write_log('INFO', 'Auto-Withdraw: Repasse realizado com sucesso', ['user_id' => $userId, 'amount' => $netAmount, 'wd_id' => $wId]);
            return true;
        } else {
            // Em caso de falha na API, o saque permanece como 'pending' no painel admin para processamento manual/reprocessamento
            $errMsg = $mpRes['data']['message'] ?? ($mpRes['curl_error'] ?: 'API error');
            write_log('ERROR', 'Auto-Withdraw: API de pagamento falhou', ['wd_id' => $wId, 'api_response' => $mpRes]);
            return false;
        }
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        write_log('ERROR', 'Auto-Withdraw: Erro fatal', ['user_id' => $userId, 'error' => $e->getMessage()]);
        return false;
    }
}

/**
 * Processa a comissão do afiliado para uma venda confirmada.
 * Paga R$ 0.05 fixo por transação paga.
 * A cada 100 transações pagas do lojista indicado, credita um bônus adicional de R$ 5.00.
 */
function processAffiliateCommission(int $merchantId, int $transactionId): bool {
    global $pdo;

    try {
        // 1. Verificar se o lojista possui um afiliado
        $stmt = $pdo->prepare("SELECT affiliate_id, full_name FROM users WHERE id = ?");
        $stmt->execute([$merchantId]);
        $merchant = $stmt->fetch();

        if (!$merchant || empty($merchant['affiliate_id'])) {
            return false; // Sem afiliado
        }

        $affiliateId = (int)$merchant['affiliate_id'];

        // 2. Creditar a comissão fixa de R$ 0.05
        $commAmount = 0.05;
        $adjustComm = adjustBalance(
            $affiliateId,
            $commAmount,
            'affiliate',
            'tx_' . $transactionId,
            'Comissão de indicação — venda #' . $transactionId . ' do lojista ' . $merchant['full_name']
        );

        if (!$adjustComm['success']) {
            write_log('WARNING', 'Affiliate: Falha ao creditar comissao fixa', ['merchant_id' => $merchantId, 'affiliate_id' => $affiliateId, 'error' => $adjustComm['error']]);
        }

        // 3. Contar total de transações pagas do lojista indicado para verificação de bônus
        $txCountStmt = $pdo->prepare("SELECT COUNT(*) FROM transactions WHERE user_id = ? AND status = 'paid'");
        $txCountStmt->execute([$merchantId]);
        $totalPaidTransactions = (int)$txCountStmt->fetchColumn();

        // Se bater um múltiplo de 100 (100, 200, 300...), paga o bônus de R$ 5.00
        if ($totalPaidTransactions > 0 && ($totalPaidTransactions % 100) === 0) {
            $bonusAmount = 5.00;
            $adjustBonus = adjustBalance(
                $affiliateId,
                $bonusAmount,
                'affiliate',
                'tx_' . $transactionId,
                'Bônus de milestone (' . $totalPaidTransactions . ' transações) — lojista ' . $merchant['full_name']
            );

            if ($adjustBonus['success']) {
                // Inserir notificação para o afiliado sobre o bônus de milestone
                try {
                    $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Milestone Alcançado! 🎉', ?, 'success')")
                        ->execute([
                            $affiliateId,
                            'Você ganhou um bônus extra de R$ 5,00 porque seu indicado ' . $merchant['full_name'] . ' atingiu ' . $totalPaidTransactions . ' transações intermediadas!'
                        ]);
                } catch (Throwable $e) {}
            } else {
                write_log('WARNING', 'Affiliate: Falha ao creditar bonus de milestone', ['merchant_id' => $merchantId, 'affiliate_id' => $affiliateId, 'total_tx' => $totalPaidTransactions, 'error' => $adjustBonus['error']]);
            }
        }

        return true;
    } catch (Throwable $e) {
        write_log('ERROR', 'Affiliate: Erro ao processar comissao', ['merchant_id' => $merchantId, 'error' => $e->getMessage()]);
        return false;
    }
}

// ─── AUTO-MIGRAÇÃO: Ezzy Banking Settings ─────────────────────────────────
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        `key` VARCHAR(100) PRIMARY KEY,
        `value` TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (PDOException $e) {}

$ezzySettings = [
    'ezzybanking_enabled' => '0',
    'ezzybanking_api_key' => '',
    'ezzybanking_api_secret' => '',
    'ezzybanking_webhook_secret' => '',
    'ezzybanking_fee_percent' => '5',
    'ezzybanking_fee_fixed' => '0.99',
];

foreach ($ezzySettings as $key => $value) {
    try {
        $stmt = $pdo->prepare("INSERT IGNORE INTO settings (`key`, `value`) VALUES (?, ?)");
        $stmt->execute([$key, $value]);
    } catch (PDOException $e) {}
}

// ─── AUTO-MIGRAÇÃO: LunarPay Settings ─────────────────────────────────────
$lunarSettings = [
    'lunarpay_enabled' => '0',
    'lunarpay_client_id' => '',
    'lunarpay_client_secret' => '',
    'lunarpay_webhook_secret' => '',
    'lunarpay_fee_percent' => '5',
    'lunarpay_fee_fixed' => '0.99',
];

foreach ($lunarSettings as $key => $value) {
    try {
        $stmt = $pdo->prepare("INSERT IGNORE INTO settings (`key`, `value`) VALUES (?, ?)");
        $stmt->execute([$key, $value]);
    } catch (PDOException $e) {}
}
?>
