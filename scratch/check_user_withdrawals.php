<?php
require_once 'includes/db.php';

$email = 'vinicius.assuncao@hotmail.com';
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    echo "User ID: " . $user['id'] . "\n";
    echo "Full Name: " . $user['full_name'] . "\n";
    echo "Balance: " . $user['balance'] . "\n";
    
    $stmt = $pdo->prepare("SELECT * FROM withdrawals WHERE user_id = ? AND status = 'pending'");
    $stmt->execute([$user['id']]);
    $withdrawals = $stmt->fetchAll();
    
    echo "\nPending Withdrawals:\n";
    foreach ($withdrawals as $w) {
        echo "ID: " . $w['id'] . " | Amount: " . $w['amount'] . " | Amount Gross: " . $w['amount_gross'] . " | Status: " . $w['status'] . "\n";
    }
} else {
    echo "User not found.\n";
}
