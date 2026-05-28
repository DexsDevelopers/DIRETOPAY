<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Captura fatal errors (E_ERROR) que set_exception_handler não captura
register_shutdown_function(function() {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        ob_clean();
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Fatal: ' . $err['message'] . ' in ' . basename($err['file']) . ':' . $err['line']]);
    }
});

require_once 'includes/db.php';

ob_clean();
header('Content-Type: application/json');

set_exception_handler(function($e) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Excecao: ' . $e->getMessage()]);
    exit;
});

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Não autorizado.']);
    exit;
}

$userId = (int)$_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método inválido.']);
    exit;
}

$body     = json_decode(file_get_contents('php://input'), true);
$key_type         = trim($body['key_type']        ?? '');
$key              = trim($body['key']             ?? '');
$amount           = floatval($body['amount']      ?? 0);
$desc             = trim($body['description']     ?? '');
$charge_recipient = !empty($body['charge_recipient']) ? 1 : 0;

if (!$key || $amount < 0.01) {
    echo json_encode(['success' => false, 'message' => 'Chave e valor são obrigatórios.']);
    exit;
}

// Validação CSRF
$headers = getallheaders();
$csrfToken = $headers['X-CSRF-Token'] ?? ($headers['x-csrf-token'] ?? '');
try {
    check_csrf($csrfToken);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Token CSRF inválido ou expirado.']);
    exit;
}

// Obter dados do usuário
$userStmt = $pdo->prepare("SELECT balance, commission_rate, full_name FROM users WHERE id = ?");
$userStmt->execute([$userId]);
$user = $userStmt->fetch();

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Usuário não encontrado.']);
    exit;
}

$userBalance = (float)$user['balance'];
$commissionRate = (float)$user['commission_rate'];
$userName = $user['full_name'] ?: "Usuário #$userId";

// Cálculo de taxas síncronas com o front-end: R$ 4.00 fixo + 0.2% gateway + commission_rate% plataforma
$feeFixed = 4.00;
$feeGatewayRate = 0.002; // 0.2%
$platformRate = $commissionRate / 100.0;

$feeGateway = round($amount * $feeGatewayRate + $feeFixed, 2);
$feePlatform = round($amount * $platformRate, 2);
$totalFee = $feeGateway + $feePlatform;

if ($charge_recipient) {
    // Recipient pays fee: recipient gets less
    // Sender pays exactly $amount. So gross amount is $amount, net amount is $amount - $totalFee
    $amountGross = $amount;
    $amountNet = round(max(0.0, $amount - $totalFee), 2);
} else {
    // Sender pays fee: recipient gets exactly $amount.
    // Sender pays $amount + $totalFee. So gross amount is $amount + $totalFee, net amount is $amount
    $amountGross = round($amount + $totalFee, 2);
    $amountNet = $amount;
}

if ($amountNet < 0.01) {
    echo json_encode(['success' => false, 'message' => 'Valor líquido insuficiente para cobrir as taxas (mínimo líquido R$ 0,01).']);
    exit;
}

// Verificar se já há saques pendentes que consumiriam o saldo (apenas os que ainda NÃO foram debitados)
$pendingStmt = $pdo->prepare("SELECT COALESCE(SUM(amount_gross), 0) FROM withdrawals WHERE user_id = ? AND status = 'pending' AND is_debited = 0");
$pendingStmt->execute([$userId]);
$pendingTotal = (float)$pendingStmt->fetchColumn();
$availableBalance = $userBalance - $pendingTotal;

if ($amountGross > $availableBalance) {
    echo json_encode(['success' => false, 'message' => 'Saldo insuficiente. Saldo disponível para saque: R$ ' . number_format($availableBalance, 2, ',', '.')]);
    exit;
}

// Garantir colunas extras existem
try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN type VARCHAR(30) DEFAULT 'withdrawal'"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN pix_key_type VARCHAR(20) DEFAULT NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN description TEXT DEFAULT NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN charge_recipient TINYINT(1) DEFAULT 0"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN is_debited TINYINT(1) DEFAULT 0"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN amount_gross DECIMAL(15,2) DEFAULT NULL"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN fee_platform DECIMAL(15,2) DEFAULT 0.00"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE withdrawals ADD COLUMN fee_gateway DECIMAL(15,2) DEFAULT 0.00"); } catch (Exception $e) {}

$pdo->beginTransaction();

try {
    // 1. Debitar/Reservar saldo imediatamente
    $adjust = adjustBalance(
        $userId,
        -abs($amountGross),
        'withdraw_reserve',
        '', // Preenchido abaixo
        "Reserva para envio PIX de R$ " . number_format($amountNet, 2, ',', '.') . " (taxa R$ " . number_format($totalFee, 2, ',', '.') . ")"
    );

    if (!$adjust['success']) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Falha ao reservar saldo: ' . $adjust['error']]);
        exit;
    }

    // 2. Registrar na tabela withdrawals
    $insertStmt = $pdo->prepare("
        INSERT INTO withdrawals (user_id, amount_gross, amount, fee_platform, fee_gateway, pix_key, pix_key_type, description, charge_recipient, status, type, is_debited, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pix_transfer', 1, NOW())
    ");
    $insertStmt->execute([
        $userId,
        $amountGross,
        $amountNet,
        $feePlatform,
        $feeGateway,
        $key,
        $key_type,
        $desc ?: null,
        $charge_recipient
    ]);
    
    $transferId = $pdo->lastInsertId();

    // 3. Atualizar referência no log de auditoria
    $pdo->prepare("UPDATE balance_log SET reference_id = ? WHERE user_id = ? AND origin = 'withdraw_reserve' AND reference_id = '' ORDER BY id DESC LIMIT 1")
        ->execute(['wd_' . $transferId, $userId]);

    $pdo->commit();

    // Notificar administradores
    try {
        require_once 'includes/PushService.php';
        PushService::notifyAdmins(
            '💸 Transferência PIX Solicitada',
            $userName . ' — R$ ' . number_format($amountNet, 2, ',', '.') . ' (Bruto: R$ ' . number_format($amountGross, 2, ',', '.') . ') — Chave: ' . $key,
            'warning'
        );
    } catch (Throwable $e) {}

    try {
        require_once 'includes/TelegramService.php';
        TelegramService::notifyWithdrawal($userName, $amountGross, $key, $feePlatform, $feeGateway);
    } catch (Throwable $e) {}

    echo json_encode([
        'success'     => true,
        'transfer_id' => $transferId,
        'message'     => 'Solicitação de PIX registrada. Será processada em breve.',
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    write_log('ERROR', 'send_pix falhou', ['error' => $e->getMessage(), 'user_id' => $userId]);
    echo json_encode(['success' => false, 'message' => 'Erro ao registrar transferência: ' . $e->getMessage()]);
}
