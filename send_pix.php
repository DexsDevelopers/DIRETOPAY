<?php
require_once 'includes/db.php';
require_once 'includes/auth.php';

header('Content-Type: application/json');

// Captura qualquer erro PHP e retorna JSON em vez de HTML
set_exception_handler(function($e) {
    echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
    exit;
});

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

// Verificar saldo disponível (amount_net_brl = valor já descontado da taxa)
$balanceRow = $pdo->prepare("
    SELECT COALESCE(SUM(amount_net_brl), 0) AS balance
    FROM transactions
    WHERE user_id = ? AND status = 'paid'
");
$balanceRow->execute([$user['id']]);
$available = (float)$balanceRow->fetchColumn();

if ($amount > $available) {
    echo json_encode(['success' => false, 'message' => 'Saldo insuficiente para realizar a transferência.']);
    exit;
}

// Garantir que a coluna type existe em withdrawals
try {
    $pdo->exec("ALTER TABLE withdrawals ADD COLUMN type VARCHAR(30) DEFAULT 'withdrawal' AFTER status");
} catch (Exception $e) { /* coluna já existe */ }
try {
    $pdo->exec("ALTER TABLE withdrawals ADD COLUMN pix_key_type VARCHAR(20) DEFAULT NULL AFTER pix_key");
} catch (Exception $e) { /* coluna já existe */ }
try {
    $pdo->exec("ALTER TABLE withdrawals ADD COLUMN description TEXT DEFAULT NULL AFTER pix_key_type");
} catch (Exception $e) { /* coluna já existe */ }

// Registrar como saque especial do tipo pix_transfer na tabela withdrawals
$insertStmt = $pdo->prepare("
    INSERT INTO withdrawals (user_id, amount, amount_gross, fee_platform, fee_gateway, pix_key, pix_key_type, description, status, type, created_at)
    VALUES (?, ?, ?, 0, 0, ?, ?, ?, 'pending', 'pix_transfer', NOW())
");

try {
    $insertStmt->execute([$user['id'], $amount, $amount, $key, $key_type, $desc ?: null]);
    $transferId = $pdo->lastInsertId();

    echo json_encode([
        'success'     => true,
        'transfer_id' => $transferId,
        'message'     => 'Solicitação de PIX registrada. Será processada em breve.',
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao registrar transferência: ' . $e->getMessage()]);
}
