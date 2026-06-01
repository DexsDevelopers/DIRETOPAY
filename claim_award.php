<?php
require_once 'includes/db.php';
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) session_start();
if (empty($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Não autenticado']); exit;
}

$userId = (int)$_SESSION['user_id'];
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? 'status';
$awardId = strip_tags(trim($input['award_id'] ?? ''));

// Auto-criar tabela
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS award_claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        award_id VARCHAR(50) NOT NULL,
        claimed_at DATETIME DEFAULT NOW(),
        total_at_claim DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        UNIQUE KEY uniq_user_award (user_id, award_id)
    )");
} catch (PDOException $e) {}

// Busca dados do usuário
$stmt = $pdo->prepare("SELECT full_name, email FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

// Calcula faturamento total
$stmtTotal = $pdo->prepare("SELECT COALESCE(SUM(amount_brl),0) as vol FROM transactions WHERE user_id = ? AND status = 'paid'");
$stmtTotal->execute([$userId]);
$totalPaid = (float)$stmtTotal->fetchColumn();

// Definição dos prêmios
$awards = [
    'placa_10k' => [
        'id'    => 'placa_10k',
        'title' => 'Placa de 10K',
        'goal'  => 10000.00,
        'unit'  => 'BRL',
    ],
    'placa_100k' => [
        'id'    => 'placa_100k',
        'title' => 'Placa de 100K',
        'goal'  => 100000.00,
        'unit'  => 'BRL',
    ],
    'placa_250k' => [
        'id'    => 'placa_250k',
        'title' => 'Placa de 250K',
        'goal'  => 250000.00,
        'unit'  => 'BRL',
    ],
    'placa_500k' => [
        'id'    => 'placa_500k',
        'title' => 'Placa de 500K',
        'goal'  => 500000.00,
        'unit'  => 'BRL',
    ],
    'placa_1m' => [
        'id'    => 'placa_1m',
        'title' => 'Placa de 1 Milhão',
        'goal'  => 1000000.00,
        'unit'  => 'BRL',
    ],
];

if ($action === 'status') {
    $statuses = [];
    foreach ($awards as $id => $aw) {
        $stmtC = $pdo->prepare("SELECT status, claimed_at FROM award_claims WHERE user_id = ? AND award_id = ?");
        $stmtC->execute([$userId, $id]);
        $claim = $stmtC->fetch();
        $statuses[$id] = [
            'claimed'    => (bool)$claim,
            'status'     => $claim['status'] ?? null,
            'claimed_at' => $claim['claimed_at'] ?? null,
            'unlocked'   => $totalPaid >= $aw['goal'],
        ];
    }
    echo json_encode(['success' => true, 'total_paid' => $totalPaid, 'statuses' => $statuses]);
    exit;
}

if ($action === 'claim') {
    if (!isset($awards[$awardId])) {
        echo json_encode(['success' => false, 'error' => 'Prêmio inválido']); exit;
    }
    $aw = $awards[$awardId];
    if ($totalPaid < $aw['goal']) {
        echo json_encode(['success' => false, 'error' => 'Meta não atingida ainda']); exit;
    }
    try {
        $ins = $pdo->prepare("INSERT INTO award_claims (user_id, award_id, total_at_claim, status) VALUES (?,?,?,'pending')
                              ON DUPLICATE KEY UPDATE claimed_at = claimed_at");
        $ins->execute([$userId, $awardId, $totalPaid]);
    } catch (PDOException $e) {}

    write_log('info', "Award claim: user $userId -> $awardId (R$ $totalPaid)");
    echo json_encode([
        'success'   => true,
        'email'     => $user['email'],
        'name'      => $user['full_name'],
        'total_paid'=> $totalPaid,
        'award'     => $aw,
    ]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Ação inválida']);
