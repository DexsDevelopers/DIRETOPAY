<?php
require_once 'includes/db.php';
try {
    $pdo->exec("ALTER TABLE withdrawals ADD COLUMN amount_gross DECIMAL(15,2) AFTER user_id");
    echo "amount_gross added\n";
} catch (Exception $e) { echo $e->getMessage() . "\n"; }

try {
    $pdo->exec("ALTER TABLE withdrawals ADD COLUMN fee_platform DECIMAL(15,2) AFTER amount");
    echo "fee_platform added\n";
} catch (Exception $e) { echo $e->getMessage() . "\n"; }

try {
    $pdo->exec("ALTER TABLE withdrawals ADD COLUMN fee_gateway DECIMAL(15,2) AFTER fee_platform");
    echo "fee_gateway added\n";
} catch (Exception $e) { echo $e->getMessage() . "\n"; }
