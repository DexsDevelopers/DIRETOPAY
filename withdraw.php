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

// Rate Limiting — máx 5 saques/minuto por IP, 3/minuto por usuário
// Pesquisa: OWASP — endpoints financeiros devem ter rate limiting rigoroso
$clientIp = get_real_ip();
if (!check_endpoint_rate_limit($pdo, $clientIp, 'withdraw', 5, 1)) {
    http_response_code(429);
    echo json_encode(['error' => 'Muitas solicitações. Aguarde 1 minuto e tente novamente.']);
    exit;
}
if (!check_endpoint_rate_limit($pdo, 'user_' . $userId, 'withdraw', 3, 1)) {
    http_response_code(429);
    echo json_encode(['error' => 'Limite de saques por minuto atingido. Aguarde e tente novamente.']);
    exit;
}

// Validação CSRF
$headers = getallheaders();
$csrfToken = $headers['X-CSRF-Token'] ?? ($headers['x-csrf-token'] ?? '');
check_csrf($csrfToken);

$amount = (float)($input['amount'] ?? 0);

// Como o saldo do lojista já é creditado líquido de taxas de venda/plataforma nos webhooks,
// no saque cobra-se apenas a taxa de processamento de transferência Pix do gateway de payout (0.2% + R$4,00).
$fee_gateway = round(($amount * 0.002) + 4.00, 2);
$fee_platform = 0.00;
$withdrawFee = $fee_gateway;

try {
    $stmt = $pdo->prepare("SELECT balance, pix_key, preferred_nominal FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
} catch (PDOException $e) {
    echo json_encode(['error' => 'Erro interno do sistema. Contate o suporte.']);
    exit;
}

$userNominal = $user['preferred_nominal'] ?? 'nominal1';
$minWithdraw = 20.00;
if ($userNominal === 'nominal1') {
    $minWithdraw = 25.00;
} elseif ($userNominal === 'nominal2') {
    $minWithdraw = 5.00;
} elseif ($userNominal === 'nominal3') {
    $minWithdraw = 10.00;
}

if ($amount < $minWithdraw) {
    echo json_encode(['error' => 'O valor mínimo para saque na rota ' . strtoupper($userNominal) . ' é R$ ' . number_format($minWithdraw, 2, ',', '.') . '.']);
    exit;
}

// ── Exigir ao menos 1 transação paga real (não simulação) ──────────
$txCheck = $pdo->prepare("
    SELECT COUNT(*) FROM transactions 
    WHERE user_id = ? AND status = 'paid' 
      AND pix_id NOT LIKE 'sim_%'
      AND amount_brl >= 10
");
$txCheck->execute([$userId]);
if ((int)$txCheck->fetchColumn() === 0) {
    write_log('SECURITY', 'Saque negado: sem transações pagas reais', ['user_id' => $userId, 'amount' => $amount]);
    echo json_encode(['error' => 'Não é possível sacar sem ter recebido pagamentos reais confirmados.']);
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

    $userNominal = $user['preferred_nominal'] ?? 'nominal1';
    // 2. Registrar pedido de saque
    $stmt = $pdo->prepare("INSERT INTO withdrawals (user_id, amount_gross, amount, fee_platform, fee_gateway, pix_key, status, is_debited, nominal) VALUES (?, ?, ?, ?, ?, ?, 'pending', 1, ?)");
    $stmt->execute([$userId, $amount, $netAmount, $fee_platform, $fee_gateway, $user['pix_key'], $userNominal]);
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
    
    // Notificar Admin via Telegram e WhatsApp
    try { TelegramService::notifyWithdrawal($userName, $amount, $user['pix_key'], $fee_platform, $fee_gateway, $userNominal); } catch (Throwable $e) {}
    try {
        require_once __DIR__ . '/includes/WhatsAppService.php';
        WhatsAppService::notifyWithdrawal($userName, $amount, $user['pix_key'], $fee_platform, $fee_gateway, $userNominal);
    } catch (Throwable $e) {}
    
    echo json_encode(['status' => 'success', 'message' => 'Solicitação de saque enviada ao administrador!']);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    write_log('ERROR', 'Erro ao processar saque', ['error' => $e->getMessage(), 'user_id' => $userId]);
    echo json_encode(['error' => 'Erro ao processar saque. Contate o suporte.']);
}

