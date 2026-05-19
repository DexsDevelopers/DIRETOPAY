<?php
require_once 'includes/db.php';
require_once 'includes/auth.php';

header('Content-Type: application/json');

$user = requireAuth();
if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método inválido.']);
    exit;
}

$body     = json_decode(file_get_contents('php://input'), true);
$key_type = trim($body['key_type']   ?? '');
$key      = trim($body['key']        ?? '');
$amount   = floatval($body['amount'] ?? 0);
$desc     = trim($body['description'] ?? '');

if (!$key || $amount < 0.01) {
    echo json_encode(['success' => false, 'message' => 'Chave e valor são obrigatórios.']);
    exit;
}

// Verificar saldo disponível
$balanceRow = $pdo->prepare("
    SELECT COALESCE(SUM(amount * 0.9), 0) AS balance
    FROM transactions
    WHERE user_id = ? AND status = 'paid'
");
$balanceRow->execute([$user['id']]);
$available = (float)$balanceRow->fetchColumn();

if ($amount > $available) {
    echo json_encode(['success' => false, 'message' => 'Saldo insuficiente para realizar a transferência.']);
    exit;
}

// Registrar transferência pendente na base
$stmt = $pdo->prepare("
    INSERT INTO pix_transfers (user_id, key_type, pix_key, amount, description, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'pending', NOW())
");

try {
    $stmt->execute([$user['id'], $key_type, $key, $amount, $desc]);
    $transferId = $pdo->lastInsertId();

    echo json_encode([
        'success'     => true,
        'transfer_id' => $transferId,
        'message'     => 'Solicitação de transferência registrada. Será processada em breve.',
    ]);
} catch (Exception $e) {
    // Se tabela não existir, criar e tentar novamente
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pix_transfers (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            user_id     INT NOT NULL,
            key_type    VARCHAR(20) NOT NULL,
            pix_key     VARCHAR(255) NOT NULL,
            amount      DECIMAL(10,2) NOT NULL,
            description TEXT,
            status      ENUM('pending','processing','completed','failed') DEFAULT 'pending',
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME DEFAULT NULL
        )
    ");
    $stmt->execute([$user['id'], $key_type, $key, $amount, $desc]);
    $transferId = $pdo->lastInsertId();

    echo json_encode([
        'success'     => true,
        'transfer_id' => $transferId,
        'message'     => 'Solicitação de transferência registrada.',
    ]);
}
