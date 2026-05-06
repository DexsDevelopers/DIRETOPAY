<?php
require_once 'includes/db.php';
$stmt = $pdo->prepare("SELECT id, full_name, email FROM users WHERE email LIKE '%richard%'");
$stmt->execute();
echo "<pre>";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
echo "</pre>";
?>
