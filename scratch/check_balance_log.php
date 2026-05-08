<?php
require_once 'includes/db.php';

$userId = 671; // I need to verify if this is Pedro's ID. 
// Let's find Pedro's ID first.
$email = 'vinicius.assuncao@hotmail.com';
$stmt = $pdo->prepare("SELECT id, balance FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    echo "User ID: " . $user['id'] . "\n";
    echo "Current Balance: " . $user['balance'] . "\n";
    
    echo "\nLast 20 Balance Log entries:\n";
    $stmt = $pdo->prepare("SELECT * FROM balance_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 20");
    $stmt->execute([$user['id']]);
    $logs = $stmt->fetchAll();
    
    foreach ($logs as $log) {
        echo "[{$log['created_at']}] Origin: {$log['origin']} | Amount: {$log['amount']} | Before: {$log['balance_before']} | After: {$log['balance_after']} | Desc: {$log['description']}\n";
    }
} else {
    echo "User not found.\n";
}
