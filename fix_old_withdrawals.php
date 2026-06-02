<?php
require_once 'includes/db.php';
if (!isAdmin()) { http_response_code(403); exit('Unauthorized'); }

$count = $pdo->exec("UPDATE withdrawals SET fee_platform = ROUND(amount * 0.05, 2)");
echo "Sucesso! $count saques foram atualizados com o lucro de 5% sobre o valor.";
?>
