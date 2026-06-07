<?php
/**
 * LunarPay Webhook Receiver
 * Processa eventos de pagamento PIX enviados pela LunarPay.
 * Configure no dashboard LunarPay: URL = https://diretopay.site/lunarpay_webhook.php
 * Eventos: pix.paid, pix.failed, pix.expired
 */

header('Content-Type: application/json');

try {
    require_once 'includes/db.php';
    require_once 'includes/TelegramService.php';
    require_once 'includes/MailService.php';
    require_once 'includes/LunarPayService.php';
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    exit;
}

// Obter payload
$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);

if (!$payload) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Verificar assinatura do webhook
$signature = $_SERVER['HTTP_X_SIGNATURE'] ?? '';
if (!LunarPayService::verifyWebhookSignature($rawInput, $signature)) {
    write_log('SECURITY', 'LunarPay webhook signature invalid', ['payload' => $payload]);
    http_response_code(403);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

// Extrair dados do evento
$eventType = $payload['event'] ?? '';
$transactionData = $payload['data'] ?? [];
$externalId = $transactionData['external_id'] ?? '';
$status = $transactionData['status'] ?? '';
$amount = $transactionData['amount'] ?? 0;
$pixCode = $transactionData['pix_code'] ?? '';
$transactionId = $transactionData['transaction_id'] ?? '';

write_log('INFO', 'LunarPay webhook received', [
    'event' => $eventType,
    'external_id' => $externalId,
    'status' => $status,
    'amount' => $amount
]);

// Processar eventos
switch ($eventType) {
    case 'pix.paid':
        handlePixPaid($externalId, $transactionData);
        break;
    
    case 'pix.failed':
        handlePixFailed($externalId, $transactionData);
        break;
    
    case 'pix.expired':
        handlePixExpired($externalId, $transactionData);
        break;
    
    default:
        write_log('WARN', 'LunarPay unknown event', ['event' => $eventType]);
}

// Responder ao webhook
echo json_encode(['status' => 'ok']);

// ─── HANDLERS ─────────────────────────────────────────────────────────────

function handlePixPaid(string $externalId, array $data): void
{
    global $pdo;
    
    // Buscar transação pelo external_id
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE external_id = ? AND status = 'pending'");
    $stmt->execute([$externalId]);
    $transaction = $stmt->fetch();
    
    if (!$transaction) {
        write_log('WARN', 'LunarPay transaction not found', ['external_id' => $externalId]);
        return;
    }
    
    // Atualizar status para pago
    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE transactions SET status = 'paid', pix_code = ?, paid_at = NOW() WHERE id = ?")
            ->execute([$data['pix_code'] ?? '', $transaction['id']]);
        
        // Creditar saldo do vendedor
        $userId    = $transaction['user_id'];
        $amountBrl = (float)$transaction['amount_brl'];
        $netAmount = (float)$transaction['amount_net_brl'];
        
        // Buscar taxa do usuário e contatos
        $userStmt = $pdo->prepare("SELECT commission_rate, full_name, email, whatsapp FROM users WHERE id = ?");
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch();
        $commissionRate = (float)($user['commission_rate'] ?? 5.0);
        $sellerName = $user['full_name'] ?? 'Vendedor';
        
        $feePlatform = round($amountBrl * ($commissionRate / 100), 2);
        $feeGateway  = round($amountBrl - $netAmount - $feePlatform, 2);
        if ($feeGateway < 0) $feeGateway = 0.00;
        
        // Creditar saldo
        adjustBalance($userId, $netAmount, 'pix_payment', $transaction['id'], 'Recebimento PIX LunarPay #' . $transaction['id']);

        // Creditar comissão da plataforma ao administrador
        if ($feePlatform > 0) {
            $adminStmt = $pdo->query("SELECT id FROM users WHERE is_admin = 1 ORDER BY id ASC LIMIT 1");
            $admin = $adminStmt->fetch();
            if ($admin) {
                adjustBalance(
                    (int)$admin['id'],
                    $feePlatform,
                    'admin_profit',
                    'tx_' . $transaction['id'],
                    'Comissão da venda #' . $transaction['id'] . ' (LunarPay)'
                );
            }
        }
        
        // Registrar log de taxas
        $pdo->prepare("UPDATE transactions SET fee_platform = ?, fee_gateway = ? WHERE id = ?")
            ->execute([$feePlatform, $feeGateway, $transaction['id']]);
        
        $pdo->commit();
        
        // Notificar vendedor
        try {
            TelegramService::notifySale($sellerName, $amountBrl, $netAmount, $feePlatform, $feeGateway);
            MailService::notifyPaymentReceived($user['email'], $sellerName, $amountBrl, $netAmount);
        } catch (Throwable $e) {}
        
        write_log('INFO', 'LunarPay PIX paid', ['transaction_id' => $transaction['id'], 'amount' => $amountBrl]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        write_log('ERROR', 'LunarPay handlePixPaid failed', ['error' => $e->getMessage()]);
    }
}

function handlePixFailed(string $externalId, array $data): void
{
    global $pdo;
    
    $stmt = $pdo->prepare("UPDATE transactions SET status = 'failed' WHERE external_id = ? AND status = 'pending'");
    $stmt->execute([$externalId]);
    
    write_log('INFO', 'LunarPay PIX failed', ['external_id' => $externalId]);
}

function handlePixExpired(string $externalId, array $data): void
{
    global $pdo;
    
    $stmt = $pdo->prepare("UPDATE transactions SET status = 'expired' WHERE external_id = ? AND status = 'pending'");
    $stmt->execute([$externalId]);
    
    write_log('INFO', 'LunarPay PIX expired', ['external_id' => $externalId]);
}
