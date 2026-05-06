<?php
require_once 'includes/db.php';
$stmt = $pdo->query("SELECT id, amount, fee_platform FROM withdrawals LIMIT 20");
echo "<pre>";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
echo "</pre>";
?>
