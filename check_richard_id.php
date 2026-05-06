<?php
require_once 'includes/db.php';
$stmt = $pdo->prepare("SELECT id, full_name, amount, fee_platform, created_at FROM withdrawals WHERE user_id = 76 ORDER BY created_at DESC");
$stmt->execute();
echo "<pre>";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
echo "</pre>";
?>
