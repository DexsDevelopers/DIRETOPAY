<?php
/**
 * brpix_setup.php — Configura as credenciais BRPix no banco de dados
 * ACESSO ÚNICO: auto-deleta após execução
 * Acesse: https://lunarpay.site/brpix_setup.php
 */
require_once __DIR__ . '/includes/db.php';

$settings = [
    'brpix_enabled'       => '1',
    'brpix_client_id'     => 'f1ef52f801beefc9768b27d076cc0fc14fb4173f59ac7fd9',
    'brpix_client_secret' => '7b1aa61caf850121e7fe06eef4168087a627a7fc6ab3a35b11010378a34c6bce',
    'brpix_fee_percent'   => '8',
    'brpix_fee_fixed'     => '0.99',
    'brpix_webhook_secret'=> '', // preencher após registrar webhook no dashboard BRPix
];

$results = [];
foreach ($settings as $key => $value) {
    try {
        $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")
            ->execute([$key, $value]);
        $results[$key] = 'OK';
    } catch (Throwable $e) {
        $results[$key] = 'ERRO: ' . $e->getMessage();
    }
}

echo '<pre style="font-family:monospace;font-size:14px">';
echo "<b>BRPix Setup</b>\n\n";
foreach ($results as $k => $v) {
    echo str_pad($k, 30) . " → $v\n";
}
echo "\n<b>Gateway BRPix ativo!</b>\n";
echo "Próximo passo: registre o webhook no dashboard BRPix.\n";
echo "  URL: https://lunarpay.site/brpix_webhook.php\n";
echo "  Evento: charge.paid\n";
echo "  Após registrar, copie o Webhook Secret e atualize:\n";
echo "  INSERT INTO settings SET key='brpix_webhook_secret', value='SEU_SECRET';\n";
echo '</pre>';

@unlink(__FILE__);
echo '<br><i style="color:#999">Arquivo deletado automaticamente.</i>';
