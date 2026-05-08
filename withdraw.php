<?php
require_once 'includes/db.php';
try {
    require_once 'includes/PushService.php';
} catch (Throwable $e) {}
require_once 'includes/TelegramService.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

$userId = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

// Validação CSRF
$headers = getallheaders();
$csrfToken = $headers['X-CSRF-Token'] ?? ($headers['x-csrf-token'] ?? '');
check_csrf($csrfToken);

$amount = (float)($input['amount'] ?? 0);

// 1. Taxa de Venda (O que o admin já pagou para o PixGo: 8% + 0.99)
$saleGatewayCost = ($amount * 0.08) + 0.99;

// 2. Taxa de Saque (O que o admin paga para enviar via Sigilo: 0.2% + 4.00)
$sigiloPayoutCost = ($amount * 0.002) + 4.00;

// 3. Lucro da Plataforma (5% fixo ou conforme configurado no usuário)
// Buscaremos a taxa do usuário mais abaixo no código se necessário, 
// por enquanto usamos 5% como base de lucro.
$platformProfit = ($amount * 0.05);

$fee_gateway = round($saleGatewayCost + $sigiloPayoutCost, 2);
$fee_platform = round($platformProfit, 2);
$withdrawFee = $fee_gateway + $fee_platform;

try {
    $stmt = $pdo->prepare("SELECT balance, pix_key FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
} catch (PDOException $e) {
    echo json_encode(['error' => 'Erro de Banco de Dados: Colunas faltando. Por favor, execute a migração acessando ' . (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]/migrate_v2.php"]);
    exit;
}

if ($amount < 20) {
    echo json_encode(['error' => 'O valor mínimo para saque é R$ 20,00.']);
    exit;
}

if ($amount > $user['balance']) {
    echo json_encode(['error' => 'Saldo insuficiente. Seu saldo é R$ ' . number_format($user['balance'], 2, ',', '.') . '.']);
    exit;
}

$netAmount = $amount - $withdrawFee;

if (!$user['pix_key']) {
    echo json_encode(['error' => 'Configure sua chave PIX antes de sacar.']);
    exit;
}

try {
    // Verificar se já há saques pendentes que consumiriam o saldo (apenas os que ainda NÃO foram debitados)
    $pendingStmt = $pdo->prepare("SELECT COALESCE(SUM(amount_gross), 0) FROM withdrawals WHERE user_id = ? AND status = 'pending' AND is_debited = 0");
    $pendingStmt->execute([$userId]);
    $pendingTotal = (float)$pendingStmt->fetchColumn();
    $availableBalance = $user['balance'] - $pendingTotal;

    if ($amount > $availableBalance) {
        echo json_encode(['error' => 'Saldo insuficiente. Saldo disponível para saque: R$ ' . number_format($availableBalance, 2, ',', '.') . ' (considerando saques pendentes).']);
        exit;
    }

    $pdo->beginTransaction();

    // 1. Debitar saldo imediatamente (Reservar)
    $adjust = adjustBalance(
        $userId,
        -abs($amount),
        'withdraw_reserve',
        '', // A ser preenchido com ID do saque depois
        "Reserva de saldo para saque de R$ " . number_format($amount, 2, ',', '.')
    );

    if (!$adjust['success']) {
        $pdo->rollBack();
        echo json_encode(['error' => 'Falha ao reservar saldo: ' . $adjust['error']]);
        exit;
    }

    // 2. Registrar pedido de saque
    $stmt = $pdo->prepare("INSERT INTO withdrawals (user_id, amount_gross, amount, fee_platform, fee_gateway, pix_key, status, is_debited) VALUES (?, ?, ?, ?, ?, ?, 'pending', 1)");
    $stmt->execute([$userId, $amount, $netAmount, $fee_platform, $fee_gateway, $user['pix_key']]);
    $wId = $pdo->lastInsertId();

    // 3. Atualizar log de saldo com o ID do saque (opcional, mas bom para rastreio)
    $pdo->prepare("UPDATE balance_log SET reference_id = ? WHERE user_id = ? AND origin = 'withdraw_reserve' AND reference_id = '' ORDER BY id DESC LIMIT 1")
        ->execute(['wd_' . $wId, $userId]);

    $pdo->commit();
    write_log('INFO', 'Pedido de Saque Realizado', ['user_id' => $userId, 'amount' => $amount, 'platform_fee' => $fee_platform, 'gateway_fee' => $fee_gateway, 'total_fee' => $withdrawFee, 'net' => $netAmount]);
    // Buscar nome do usuário
    $userInfo = $pdo->prepare("SELECT full_name FROM users WHERE id = ?");
    $userInfo->execute([$userId]);
    $userName = $userInfo->fetchColumn() ?: "Usuário #$userId";

    // Notificar Admin (Push + In-App)
    if (class_exists('PushService')) {
        try { PushService::notifyAdmins('🏦 Saque Solicitado', $userName . ' — R$ ' . number_format($amount, 2, ',', '.') . ' — Pix: ' . $user['pix_key'], 'warning'); } catch (Throwable $e) {}
    }
    
    // Notificar Admin via Telegram
    try { TelegramService::notifyWithdrawal($userName, $amount, $user['pix_key'], $fee_platform, $fee_gateway); } catch (Throwable $e) {}
    
    echo json_encode(['status' => 'success', 'message' => 'Solicitação de saque enviada ao administrador!']);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    write_log('ERROR', 'Erro ao processar saque', ['error' => $e->getMessage(), 'user_id' => $userId]);
    echo json_encode(['error' => 'Erro ao processar saque: ' . $e->getMessage()]);
}

