<?php
/**
 * Script de Instalação do Banco de Dados DiretoPay
 * 
 * Este script cria automaticamente:
 * - O banco de dados (se não existir)
 * - Todas as tabelas necessárias
 * - Configurações padrão
 * 
 * Uso: Acesse https://diretopay.site/install_database.php
 * 
 * ⚠️ SEGURANÇA: Delete este arquivo após a instalação!
 */

// Configurações (mesmas do config.php)
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'u853242961_diretopay_user');
define('DB_PASS', 'Lucastav8012@');
define('DB_NAME', 'u853242961_diretopay2');

// Auto-deletar após execução
$autoDelete = isset($_GET['auto_delete']) ? true : false;

// Habilitar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalação DiretoPay - Banco de Dados</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 40px; line-height: 1.6; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { font-size: 2rem; margin-bottom: 10px; color: #10b981; }
        .subtitle { color: #888; margin-bottom: 30px; font-size: 0.9rem; }
        .section { background: #111; border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .section h2 { font-size: 1.1rem; margin-bottom: 15px; color: #fff; }
        .success { color: #10b981; }
        .error { color: #ef4444; }
        .warning { color: #f59e0b; }
        .info { color: #3b82f6; }
        pre { background: #1a1a1a; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 0.85rem; margin: 10px 0; }
        code { color: #10b981; }
        .btn { display: inline-block; background: #10b981; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; cursor: pointer; border: none; }
        .btn:hover { background: #059669; }
        .btn-danger { background: #ef4444; }
        .btn-danger:hover { background: #dc2626; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ Instalação do Banco de Dados</h1>
        <p class="subtitle">DiretoPay — Sistema de Pagamentos PIX</p>

        <?php
        try {
            // 1. Conectar ao MySQL (sem selecionar banco)
            $pdo = new PDO("mysql:host=" . DB_HOST, DB_USER, DB_PASS);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            echo '<div class="section">';
            echo '<h2>✅ Conexão MySQL estabelecida</h2>';
            echo '<p>Host: <code>' . DB_HOST . '</code></p>';
            echo '<p>Usuário: <code>' . DB_USER . '</code></p>';
            echo '</div>';

            // 2. Criar banco de dados se não existir
            echo '<div class="section">';
            echo '<h2>📦 Criando banco de dados...</h2>';
            
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            echo '<p class="success">✅ Banco de dados <code>' . DB_NAME . '</code> criado/verificado</p>';
            echo '</div>';

            // 3. Selecionar banco de dados
            $pdo->exec("USE `" . DB_NAME . "`");
            echo '<div class="section">';
            echo '<h2>🔗 Banco de dados selecionado</h2>';
            echo '</div>';

            // 4. Criar tabelas
            echo '<div class="section">';
            echo '<h2>📋 Criando tabelas...</h2>';
            
            $tables = [
                // Tabela de usuários
                "CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    pix_key VARCHAR(255),
                    whatsapp VARCHAR(20),
                    telegram_chat_id VARCHAR(50),
                    balance DECIMAL(15,2) DEFAULT 0.00,
                    commission_rate DECIMAL(5,2) DEFAULT 5.00,
                    status ENUM('pending','approved','suspended','banned') DEFAULT 'pending',
                    is_admin TINYINT(1) DEFAULT 0,
                    is_demo TINYINT(1) DEFAULT 0,
                    affiliate_id INT NULL,
                    referral_token VARCHAR(20) UNIQUE,
                    telegram_link_token VARCHAR(50),
                    telegram_link_expires DATETIME,
                    preferred_nominal ENUM('nominal1','nominal2','nominal3') DEFAULT 'nominal1',
                    withdraw_preference ENUM('accumulate','auto_direct') DEFAULT 'accumulate',
                    registration_ip VARCHAR(45),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_status (status),
                    INDEX idx_affiliate (affiliate_id),
                    INDEX idx_referral (referral_token)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de transações
                "CREATE TABLE IF NOT EXISTS transactions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    customer_ip VARCHAR(45),
                    customer_name VARCHAR(255),
                    external_id VARCHAR(100),
                    amount DECIMAL(15,2) NOT NULL,
                    net_amount DECIMAL(15,2) NOT NULL,
                    fee_platform DECIMAL(15,2) DEFAULT 0.00,
                    fee_gateway DECIMAL(15,2) DEFAULT 0.00,
                    pix_id VARCHAR(100),
                    pix_code TEXT,
                    qr_image TEXT,
                    status ENUM('pending','paid','expired','failed','refunded') DEFAULT 'pending',
                    gateway VARCHAR(50),
                    med TINYINT(1) NOT NULL DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    paid_at DATETIME,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user (user_id),
                    INDEX idx_status (status),
                    INDEX idx_external (external_id),
                    INDEX idx_created (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de saques
                "CREATE TABLE IF NOT EXISTS withdrawals (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    amount_gross DECIMAL(15,2) NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    fee_platform DECIMAL(15,2) DEFAULT 0.00,
                    fee_gateway DECIMAL(15,2) DEFAULT 0.00,
                    pix_key VARCHAR(255) NOT NULL,
                    pix_key_type VARCHAR(20),
                    description TEXT,
                    charge_recipient TINYINT(1) DEFAULT 0,
                    status ENUM('pending','completed','rejected','cancelled') DEFAULT 'pending',
                    type VARCHAR(30) DEFAULT 'withdrawal',
                    is_debited TINYINT(1) DEFAULT 0,
                    nominal VARCHAR(20) DEFAULT 'nominal1',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    processed_at DATETIME,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user (user_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de checkouts
                "CREATE TABLE IF NOT EXISTS checkouts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    slug VARCHAR(100) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    title VARCHAR(255),
                    description TEXT,
                    custom_settings TEXT,
                    active TINYINT(1) DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user (user_id),
                    INDEX idx_slug (slug),
                    INDEX idx_active (active)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de itens de checkout
                "CREATE TABLE IF NOT EXISTS checkout_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    checkout_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    price DECIMAL(15,2) NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (checkout_id) REFERENCES checkouts(id) ON DELETE CASCADE,
                    INDEX idx_checkout (checkout_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de produtos
                "CREATE TABLE IF NOT EXISTS products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    price DECIMAL(15,2) NOT NULL,
                    active TINYINT(1) DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user (user_id),
                    INDEX idx_active (active)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de cupons
                "CREATE TABLE IF NOT EXISTS coupons (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    code VARCHAR(50) NOT NULL,
                    type ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
                    value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                    scope ENUM('store','product') NOT NULL DEFAULT 'store',
                    product_id INT NULL,
                    min_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                    max_uses INT NULL,
                    uses_count INT NOT NULL DEFAULT 0,
                    expires_at DATETIME NULL,
                    active TINYINT(1) NOT NULL DEFAULT 1,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY uq_coupon_code (code),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de assinaturas
                "CREATE TABLE IF NOT EXISTS subscriptions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    price DECIMAL(15,2) NOT NULL,
                    interval_days INT NOT NULL,
                    active TINYINT(1) DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user (user_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de pagamentos de assinatura
                "CREATE TABLE IF NOT EXISTS subscription_payments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    subscription_id INT NOT NULL,
                    transaction_id INT,
                    amount DECIMAL(15,2) NOT NULL,
                    status ENUM('pending','paid','failed') DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
                    INDEX idx_subscription (subscription_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de banners
                "CREATE TABLE IF NOT EXISTS banners (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    image_url VARCHAR(500),
                    link_url VARCHAR(500),
                    active TINYINT(1) DEFAULT 1,
                    order_index INT DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de anúncios
                "CREATE TABLE IF NOT EXISTS announcements (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type ENUM('info','warning','success','error') DEFAULT 'info',
                    active TINYINT(1) DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de dismissals de anúncios
                "CREATE TABLE IF NOT EXISTS announcement_dismissals (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    announcement_id INT NOT NULL,
                    dismissed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY uq_user_announcement (user_id, announcement_id),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de chat rooms
                "CREATE TABLE IF NOT EXISTS chat_rooms (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    token VARCHAR(50) UNIQUE NOT NULL,
                    transaction_id INT,
                    seller_id INT NOT NULL,
                    buyer_name VARCHAR(255),
                    buyer_email VARCHAR(255),
                    status ENUM('active','closed') DEFAULT 'active',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_token (token),
                    INDEX idx_seller (seller_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de mensagens de chat
                "CREATE TABLE IF NOT EXISTS chat_messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    room_id INT NOT NULL,
                    sender_id INT NULL,
                    sender_type ENUM('seller','buyer','system') NOT NULL,
                    message TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
                    INDEX idx_room (room_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de log de saldo
                "CREATE TABLE IF NOT EXISTS balance_log (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    balance_after DECIMAL(15,2) NOT NULL,
                    origin VARCHAR(50) NOT NULL,
                    reference_id VARCHAR(100),
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user (user_id),
                    INDEX idx_origin (origin),
                    INDEX idx_reference (reference_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de estatísticas diárias
                "CREATE TABLE IF NOT EXISTS daily_stats (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    date DATE UNIQUE NOT NULL,
                    visits INT DEFAULT 0,
                    signups INT DEFAULT 0,
                    transactions INT DEFAULT 0,
                    revenue DECIMAL(15,2) DEFAULT 0.00,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de instâncias WhatsApp
                "CREATE TABLE IF NOT EXISTS whatsapp_instances (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    api_url VARCHAR(500) NOT NULL,
                    api_key VARCHAR(255) NOT NULL,
                    active TINYINT(1) DEFAULT 1,
                    priority INT DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de domínios de merchant
                "CREATE TABLE IF NOT EXISTS merchant_domains (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    domain VARCHAR(255) UNIQUE NOT NULL,
                    verified TINYINT(1) DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user (user_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de notificações
                "CREATE TABLE IF NOT EXISTS notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    type ENUM('info','success','warning','error') DEFAULT 'info',
                    read TINYINT(1) DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user (user_id),
                    INDEX idx_read (read)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de settings
                "CREATE TABLE IF NOT EXISTS settings (
                    `key` VARCHAR(100) PRIMARY KEY,
                    `value` TEXT
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de login attempts
                "CREATE TABLE IF NOT EXISTS login_attempts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    ip VARCHAR(45) NOT NULL,
                    attempts INT DEFAULT 1,
                    last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    blocked_until DATETIME NULL,
                    INDEX idx_ip (ip)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Tabela de orders
                "CREATE TABLE IF NOT EXISTS orders (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    customer_name VARCHAR(255),
                    customer_email VARCHAR(255),
                    customer_phone VARCHAR(20),
                    total_amount DECIMAL(15,2) NOT NULL,
                    status ENUM('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
                    coupon_id INT NULL,
                    discount_amount DECIMAL(15,2) DEFAULT 0.00,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user (user_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            ];

            foreach ($tables as $sql) {
                try {
                    $pdo->exec($sql);
                    $tableName = preg_match('/CREATE TABLE IF NOT EXISTS\s+(\w+)/i', $sql, $matches) ? $matches[1] : 'tabela';
                    echo '<p class="success">✅ Tabela <code>' . $tableName . '</code> criada/verificada</p>';
                } catch (PDOException $e) {
                    echo '<p class="error">❌ Erro ao criar tabela: ' . $e->getMessage() . '</p>';
                }
            }
            echo '</div>';

            // 5. Inserir configurações padrão
            echo '<div class="section">';
            echo '<h2>⚙️ Inserindo configurações padrão...</h2>';
            
            $defaultSettings = [
                // Ezzy Banking
                'ezzybanking_enabled' => '0',
                'ezzybanking_api_key' => '',
                'ezzybanking_api_secret' => '',
                'ezzybanking_webhook_secret' => '',
                'ezzybanking_fee_percent' => '5',
                'ezzybanking_fee_fixed' => '0.99',
                
                // LunarPay
                'lunarpay_enabled' => '0',
                'lunarpay_client_id' => '',
                'lunarpay_client_secret' => '',
                'lunarpay_webhook_secret' => '',
                'lunarpay_fee_percent' => '5',
                'lunarpay_fee_fixed' => '0.99',
                
                // SigiloPay
                'sigilopay_enabled' => '0',
                'sigilopay_public_key' => '',
                'sigilopay_secret_key' => '',
                
                // BRPix
                'brpix_enabled' => '0',
                'brpix_client_id' => '',
                'brpix_client_secret' => '',
                'brpix_fee_percent' => '8',
                'brpix_fee_fixed' => '0.99',
                
                // MisticPay
                'misticpay_enabled' => '0',
                'misticpay_api_key' => '',
                'misticpay_fee_percent' => '5',
                'misticpay_fee_fixed' => '0.99',
                
                // IronPay
                'ironpay_enabled' => '0',
                'ironpay_api_key' => '',
                'ironpay_fee_percent' => '5',
                'ironpay_fee_fixed' => '0.99',
                
                // Taxa padrão de usuários
                'default_user_tax' => '5.0',
            ];

            foreach ($defaultSettings as $key => $value) {
                try {
                    $stmt = $pdo->prepare("INSERT IGNORE INTO settings (`key`, `value`) VALUES (?, ?)");
                    $stmt->execute([$key, $value]);
                    echo '<p class="success">✅ Setting <code>' . $key . '</code> inserido</p>';
                } catch (PDOException $e) {
                    echo '<p class="warning">⚠️ Setting <code>' . $key . '</code> já existe</p>';
                }
            }
            echo '</div>';

            // 6. Conclusão
            echo '<div class="section">';
            echo '<h2 class="success">🎉 Instalação concluída com sucesso!</h2>';
            echo '<p>O banco de dados <code>' . DB_NAME . '</code> está pronto para uso.</p>';
            echo '<p class="warning">⚠️ <strong>Importante:</strong> Delete este arquivo por segurança!</p>';
            echo '</div>';

            // Auto-deletar se solicitado
            if ($autoDelete) {
                @unlink(__FILE__);
                echo '<div class="section">';
                echo '<h2 class="success">🗑️ Arquivo deletado automaticamente</h2>';
                echo '</div>';
            } else {
                echo '<a href="?auto_delete=1" class="btn btn-danger">🗑️ Deletar este arquivo</a>';
            }

        } catch (PDOException $e) {
            echo '<div class="section">';
            echo '<h2 class="error">❌ Erro na instalação</h2>';
            echo '<p class="error">' . $e->getMessage() . '</p>';
            echo '</div>';
        }
        ?>
    </div>
</body>
</html>
