<?php
/**
 * Script para ativar EzzyBanking
 * Acesse: https://diretopay.site/enable_ezzybanking.php
 */
require_once 'includes/db.php';

if (!isAdmin()) {
    echo 'Acesso negado. Você precisa estar logado como admin.';
    exit;
}

try {
    // Ativar EzzyBanking
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('ezzybanking_enabled', '1') ON DUPLICATE KEY UPDATE `value` = '1'")
        ->execute();

    echo '<pre>';
    echo "✅ EzzyBanking ativado com sucesso!\n\n";
    echo "Próximas etapas:\n";
    echo "1. Acesse: https://diretopay.site/admin/gateways\n";
    echo "2. Clique em 'Ezzy Banking'\n";
    echo "3. Preencha as credenciais:\n";
    echo "   - Client ID (ci)\n";
    echo "   - Client Secret (cs)\n";
    echo "   - Webhook Secret\n";
    echo "   - Taxa % (padrão: 3.99)\n";
    echo "   - Taxa Fixa em R$ (padrão: 0.25)\n";
    echo "4. Clique em 'Salvar configurações'\n";
    echo "\nDepois disso, a interface de seleção de adquirentes aparecerá!\n";
    echo '</pre>';

} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage();
}
