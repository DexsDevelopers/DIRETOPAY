<?php
require_once 'includes/db.php';

header('Content-Type: application/json');

if (!isAdmin()) {
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

try {
    // Garantir colunas extras existem antes de consultar
    foreach ([
        "ALTER TABLE withdrawals ADD COLUMN type VARCHAR(30) DEFAULT 'withdrawal'",
        "ALTER TABLE withdrawals ADD COLUMN pix_key_type VARCHAR(20) DEFAULT NULL",
        "ALTER TABLE withdrawals ADD COLUMN description TEXT DEFAULT NULL",
        "ALTER TABLE withdrawals ADD COLUMN nominal VARCHAR(20) DEFAULT 'nominal1'",
    ] as $ddl) {
        try { $pdo->exec($ddl); } catch (Exception $e) { /* já existe */ }
    }

    $status = $_GET['status'] ?? 'all';
    $search = trim($_GET['search'] ?? '');
    $nominalFilter = trim($_GET['nominal'] ?? '');

    // Stats
    $pendingCount  = (int)$pdo->query("SELECT COUNT(*) FROM withdrawals WHERE status = 'pending'")->fetchColumn();
    $pendingAmount = (float)($pdo->query("SELECT COALESCE(SUM(amount),0) FROM withdrawals WHERE status = 'pending'")->fetchColumn() ?: 0);
    $paidAmount    = (float)($pdo->query("SELECT COALESCE(SUM(amount),0) FROM withdrawals WHERE status = 'completed'")->fetchColumn() ?: 0);
    $paidCount     = (int)$pdo->query("SELECT COUNT(*) FROM withdrawals WHERE status = 'completed'")->fetchColumn();
    $rejectedCount = (int)$pdo->query("SELECT COUNT(*) FROM withdrawals WHERE status = 'rejected'")->fetchColumn();
    $todayPending  = (int)$pdo->query("SELECT COUNT(*) FROM withdrawals WHERE status = 'pending' AND DATE(created_at) = CURDATE()")->fetchColumn();
    
    $totalProfit   = (float)($pdo->query("SELECT COALESCE(SUM(fee_platform),0) FROM withdrawals WHERE status = 'completed'")->fetchColumn() ?: 0);
    $pendingGross  = (float)($pdo->query("SELECT COALESCE(SUM(amount_gross),0) FROM withdrawals WHERE status = 'pending'")->fetchColumn() ?: 0);

    // Stats por nominal (pendentes)
    $pendingNominal1Count  = (int)$pdo->query("SELECT COUNT(*) FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE w.status = 'pending' AND COALESCE(w.nominal, u.preferred_nominal, 'nominal1') = 'nominal1'")->fetchColumn();
    $pendingNominal1Amount = (float)($pdo->query("SELECT COALESCE(SUM(w.amount),0) FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE w.status = 'pending' AND COALESCE(w.nominal, u.preferred_nominal, 'nominal1') = 'nominal1'")->fetchColumn() ?: 0);
    $pendingNominal2Count  = (int)$pdo->query("SELECT COUNT(*) FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE w.status = 'pending' AND COALESCE(w.nominal, u.preferred_nominal, 'nominal1') = 'nominal2'")->fetchColumn();
    $pendingNominal2Amount = (float)($pdo->query("SELECT COALESCE(SUM(w.amount),0) FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE w.status = 'pending' AND COALESCE(w.nominal, u.preferred_nominal, 'nominal1') = 'nominal2'")->fetchColumn() ?: 0);
    $pendingNominal3Count  = (int)$pdo->query("SELECT COUNT(*) FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE w.status = 'pending' AND COALESCE(w.nominal, u.preferred_nominal, 'nominal1') = 'nominal3'")->fetchColumn();
    $pendingNominal3Amount = (float)($pdo->query("SELECT COALESCE(SUM(w.amount),0) FROM withdrawals w JOIN users u ON w.user_id = u.id WHERE w.status = 'pending' AND COALESCE(w.nominal, u.preferred_nominal, 'nominal1') = 'nominal3'")->fetchColumn() ?: 0);

    // Main query - use w.* like get_admin_data.php does
    $sql = "SELECT w.id, w.user_id, w.amount, w.amount_gross, w.fee_platform, w.fee_gateway, w.pix_key,
                   COALESCE(w.type,'withdrawal') AS type,
                   COALESCE(w.pix_key_type,'') AS pix_key_type,
                   COALESCE(w.description,'') AS description,
                   COALESCE(w.nominal, u.preferred_nominal, 'nominal1') AS nominal,
                   w.status, w.tx_hash, w.created_at,
                   u.email, u.full_name AS user_full_name, u.pix_key AS user_pix_key
            FROM withdrawals w
            JOIN users u ON w.user_id = u.id
            WHERE 1=1";
    $params = [];

    if ($status !== 'all') {
        $sql .= " AND w.status = ?";
        $params[] = $status;
    }

    if (!empty($nominalFilter)) {
        $sql .= " AND COALESCE(w.nominal, u.preferred_nominal, 'nominal1') = ?";
        $params[] = $nominalFilter;
    }

    if (!empty($search)) {
        $sql .= " AND (u.full_name LIKE ? OR u.email LIKE ? OR COALESCE(w.pix_key, u.pix_key) LIKE ?)";
        $like = "%$search%";
        array_push($params, $like, $like, $like);
    }

    $date = trim($_GET['date'] ?? '');
    if (!empty($date) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        $sql .= " AND DATE(w.created_at) = ?";
        $params[] = $date;
    }

    $sql .= " ORDER BY w.created_at DESC LIMIT 200";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Normalize data - fill missing fields from users table
    $withdrawals = array_map(function($w) {
        $w['full_name'] = $w['full_name'] ?: $w['user_full_name'];
        $w['pix_key']   = $w['pix_key'] ?: $w['user_pix_key'];
        unset($w['user_full_name'], $w['user_pix_key']);
        return $w;
    }, $rows);

    echo json_encode([
        'success' => true,
        'stats' => [
            'pending_count'  => $pendingCount,
            'pending_amount' => $pendingAmount,
            'pending_gross'  => $pendingGross,
            'paid_amount'    => $paidAmount,
            'paid_count'     => $paidCount,
            'rejected_count' => $rejectedCount,
            'today_pending'  => $todayPending,
            'total_profit'   => $totalProfit,
            'pending_nominal1_count'  => $pendingNominal1Count,
            'pending_nominal1_amount' => $pendingNominal1Amount,
            'pending_nominal2_count'  => $pendingNominal2Count,
            'pending_nominal2_amount' => $pendingNominal2Amount,
            'pending_nominal3_count'  => $pendingNominal3Count,
            'pending_nominal3_amount' => $pendingNominal3Amount,
        ],
        'withdrawals' => $withdrawals,
    ]);
} catch (Throwable $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
