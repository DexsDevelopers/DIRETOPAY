<?php
/**
 * Script temporário para configurar as credenciais reais da Mistic Pay no banco de dados.
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'includes/db.php';

echo "<h2>DiretoPay - Configuração Mistic Pay</h2>";

$settings = [
    'misticpay_client_id' => 'ci_q9zb1me65lzl8iu',
    'misticpay_client_secret' => 'cs_2pwrt02ofgbl27w9h574s79x6',
    'misticpay_enabled' => '1'
];

foreach ($settings as $key => $value) {
    $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?");
    $stmt->execute([$key, $value, $value]);
    echo "<p>✓ Chave <strong>$key</strong> configurada com sucesso!</p>";
}

echo "<p style='color:green; font-weight:bold;'>Configuração concluída com sucesso!</p>";
