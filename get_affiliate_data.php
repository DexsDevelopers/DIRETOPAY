<?php
session_start();
require_once 'includes/db.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'error' => 'Não autenticado']);
    exit;
}

$userId = $_SESSION['user_id'];

// Dados do usuário
$stmt = $pdo->prepare("SELECT referral_token, full_name FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(['success' => false, 'error' => 'Usuário não encontrado']);
    exit;
}

$refToken = $user['referral_token'] ?? '';
$refLink = get_trusted_base_url() . "/register?ref=" . $refToken;

// Taxa de comissão de afiliado
$affRateStmt = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'affiliate_commission_rate'");
$affRate = (float)($affRateStmt->fetchColumn() ?: 10);

// Indicados diretos
$stmt = $pdo->prepare("SELECT id, full_name, created_at, status FROM users WHERE affiliate_id = ? ORDER BY created_at DESC");
$stmt->execute([$userId]);
$referrals = $stmt->fetchAll();

// Calcular ganhos totais de afiliado
// Somamos o lucro gerado por cada indicado
$totalEarnings = 0;
$earningsThisMonth = 0;
$activeReferrals = 0;

$currentMonth = date('Y-m');

foreach ($referrals as &$ref) {
    if ($ref['status'] === 'approved') {
        $activeReferrals++;
    }

    // Calcular comissão gerada por este indicado (R$ 0,05 fixo + R$ 5,00 milestone bônus)
    // Buscamos diretamente as entradas correspondentes no balance_log do afiliado
    $earnStmt = $pdo->prepare("
        SELECT 
            COALESCE(SUM(bl.amount), 0) as total,
            COALESCE(SUM(
                CASE WHEN DATE_FORMAT(bl.created_at, '%Y-%m') = ? 
                THEN bl.amount 
                ELSE 0 END
            ), 0) as this_month
        FROM balance_log bl
        JOIN transactions t ON CONCAT('tx_', t.id) = bl.reference_id
        WHERE bl.user_id = ? AND bl.origin = 'affiliate' AND t.user_id = ?
    ");
    $earnStmt->execute([$currentMonth, $userId, $ref['id']]);
    $earnings = $earnStmt->fetch();

    $refEarnings = max(0, (float)$earnings['total']);
    $refEarningsMonth = max(0, (float)$earnings['this_month']);

    $totalEarnings += $refEarnings;
    $earningsThisMonth += $refEarningsMonth;

    // Contar transações do indicado
    $txCountStmt = $pdo->prepare("SELECT COUNT(*) FROM transactions WHERE user_id = ? AND status = 'paid'");
    $txCountStmt->execute([$ref['id']]);
    $txCount = (int)$txCountStmt->fetchColumn();

    $ref['transactions_count'] = $txCount;
    $ref['earnings'] = number_format($refEarnings, 2, ',', '.');
    $ref['created_at_fmt'] = date('d/m/Y H:i', strtotime($ref['created_at']));
    $ref['initial'] = mb_strtoupper(mb_substr($ref['full_name'], 0, 1));
}
unset($ref);

echo json_encode([
    'success' => true,
    'ref_link' => $refLink,
    'ref_token' => $refToken,
    'commission_rate' => $affRate,
    'total_referrals' => count($referrals),
    'active_referrals' => $activeReferrals,
    'total_earnings' => number_format($totalEarnings, 2, ',', '.'),
    'earnings_this_month' => number_format($earningsThisMonth, 2, ',', '.'),
    'referrals' => array_map(function($r) {
        return [
            'name' => $r['full_name'],
            'initial' => $r['initial'],
            'status' => $r['status'],
            'created_at' => $r['created_at_fmt'],
            'transactions' => $r['transactions_count'],
            'earnings' => $r['earnings'],
        ];
    }, $referrals)
]);
