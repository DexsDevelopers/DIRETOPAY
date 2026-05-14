<?php
// Ghost Pix — Template de Configuração
// Renomeie este arquivo para config.php e preencha seus dados.
// NUNCA envie o seu config.php real para o GitHub!

// Configurações do Banco de Dados
define('DB_HOST', 'localhost');
define('DB_USER', 'seu_usuario');
define('DB_PASS', 'sua_senha');
define('DB_NAME', 'seu_banco');

// Auto-Deploy GitHub Webhook
define('DEPLOY_SECRET', 'sua_chave_secreta_deploy'); // Gere com: openssl rand -hex 20

// Configurações do PixGo.org
define('PIXGO_API_KEY', 'sua_chave_pixgo');
define('PIXGO_PROJECT_ID', ''); 

// Telegram Bot Configuration (Admin)
define('TELEGRAM_BOT_TOKEN', ''); 
define('TELEGRAM_CHAT_ID', '');   

// Telegram Bot Configuration (Usuários)
define('TELEGRAM_USER_BOT_TOKEN', '');    // Token do bot para usuários
define('TELEGRAM_USER_BOT_SECRET', '');   // Secret para webhook (qualquer string aleatória)
define('TELEGRAM_USER_BOT_USERNAME', ''); // Username do bot (sem @)

// 7K Community Bot — DM automática de venda
define('SEVEN_K_WEBHOOK_SECRET', 'lunarpay_7kchat_webhook_2026'); // Deve ser igual ao LUNAR_WEBHOOK_SECRET no .env do 7kchat.site

// Gmail SMTP Configuration
define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_PORT', 587);
define('MAIL_USER', ''); // Seu e-mail do Gmail
define('MAIL_PASS', ''); // Sua Senha de App do Google (16 caracteres)
define('MAIL_FROM_NAME', 'Ghost Pix');
?>
