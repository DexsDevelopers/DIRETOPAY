<?php
require_once 'includes/db.php';
header('Content-Type: text/plain; charset=utf-8');

$steps = [];

// ---------- product_variants ----------
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS product_variants (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        product_id  INT NOT NULL,
        name        VARCHAR(255) NOT NULL,
        description TEXT,
        price       DECIMAL(10,2) NOT NULL,
        stock       INT NOT NULL DEFAULT -1,
        active      TINYINT(1) NOT NULL DEFAULT 1,
        sort_order  INT NOT NULL DEFAULT 0,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_pv_product (product_id)
    )");
    $steps[] = "OK: tabela product_variants criada (ou já existia)";
} catch (PDOException $e) { $steps[] = "ERRO product_variants: " . $e->getMessage(); }

// has_variants em products
try { $pdo->exec("ALTER TABLE products ADD COLUMN has_variants TINYINT(1) NOT NULL DEFAULT 0"); $steps[] = "OK: products.has_variants adicionada"; }
catch (PDOException $e) { $steps[] = "SKIP products.has_variants: já existe"; }

// subscription_interval em products
try { $pdo->exec("ALTER TABLE products ADD COLUMN subscription_interval ENUM('weekly','monthly','yearly') DEFAULT NULL"); $steps[] = "OK: products.subscription_interval adicionada"; }
catch (PDOException $e) { $steps[] = "SKIP products.subscription_interval: já existe"; }

// ---------- subscriptions ----------
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS subscriptions (
        id                  INT AUTO_INCREMENT PRIMARY KEY,
        product_id          INT NOT NULL,
        seller_id           INT NOT NULL,
        subscriber_name     VARCHAR(255) NOT NULL,
        subscriber_email    VARCHAR(255),
        subscriber_document VARCHAR(30),
        status              ENUM('pending','active','cancelled','expired') NOT NULL DEFAULT 'pending',
        billing_amount      DECIMAL(10,2) NOT NULL,
        next_billing_at     DATE,
        created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        cancelled_at        DATETIME NULL,
        INDEX idx_sub_product (product_id),
        INDEX idx_sub_seller  (seller_id)
    )");
    $steps[] = "OK: tabela subscriptions criada (ou já existia)";
} catch (PDOException $e) { $steps[] = "ERRO subscriptions: " . $e->getMessage(); }

// ---------- subscription_payments ----------
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS subscription_payments (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        subscription_id INT NOT NULL,
        transaction_id  INT NULL,
        amount          DECIMAL(10,2) NOT NULL,
        status          ENUM('pending','paid','failed','expired') NOT NULL DEFAULT 'pending',
        pix_code        TEXT,
        qr_image        VARCHAR(500),
        due_at          DATE,
        paid_at         DATETIME NULL,
        created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sp_sub (subscription_id)
    )");
    $steps[] = "OK: tabela subscription_payments criada (ou já existia)";
} catch (PDOException $e) { $steps[] = "ERRO subscription_payments: " . $e->getMessage(); }

echo implode("\n", $steps) . "\n\nMigração concluída.";
