<?php
require_once 'includes/db.php';
$stmt = $pdo->query("SELECT id, amount_gross, amount, fee_platform, fee_gateway FROM withdrawals ORDER BY id DESC LIMIT 10");
echo "<pre>";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
echo "</pre>";
?>
