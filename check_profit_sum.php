<?php
require_once 'includes/db.php';
$sum = $pdo->query("SELECT SUM(fee_platform) FROM withdrawals WHERE status = 'completed'")->fetchColumn();
$count = $pdo->query("SELECT COUNT(*) FROM withdrawals WHERE status = 'completed'")->fetchColumn();
echo "Total Profit: R$ " . number_format($sum, 2) . " ($count saques pagos)";
?>
