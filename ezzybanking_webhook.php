<?php
/**
 * Ezzy Banking Webhook Receiver
 * Processa eventos de pagamento PIX enviados pela Ezzy Banking.
 * Configure no dashboard Ezzy Banking: URL = https://diretopay.site/ezzybanking_webhook.php
 * Eventos: pix.paid, pix.failed, pix.expired
 */

header('Content-Type: application/json');

try {
    require_once 'includes/db.php';
    require_once 'includes/TelegramService.php';
    require_once 'includes/MailService.php';
    require_once 'includes/EzzyBankingService.php';
    try { require_once 'includes/WhatsAppService.php'; } catch (Throwable $e) {}
    try { require_once 'includes/PushService.php';     } catch (Throwable $e) {}
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
if ($signature && !EzzyBankingService::verifyWebhookSignature($rawInput, $signature)) {
    write_log('SECURITY', 'Ezzy Banking webhook signature invalid', ['payload' => $payload]);
    http_response_code(403);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

// Extrair dados do evento
$eventType     = $payload['event'] ?? '';
$transactionData = $payload['data'] ?? [];
$externalId    = $transactionData['external_id'] ?? '';
$status        = $transactionData['status'] ?? '';
$amount        = $transactionData['amount'] ?? 0;
$pixCode       = $transactionData['pix_code'] ?? '';
$transactionId = $transactionData['transaction_id'] ?? '';

write_log('INFO', 'Ezzy Banking webhook received', [
    'event'       => $eventType,
    'external_id' => $externalId,
    'status'      => $status,
    'amount'      => $amount
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
        write_log('WARN', 'Ezzy Banking unknown event', ['event' => $eventType]);
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
        write_log('WARN', 'Ezzy Banking transaction not found', ['external_id' => $externalId]);
        return;
    }
    
    // Atualizar status para pago
    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE transactions SET status = 'paid', pix_code = ?, paid_at = NOW() WHERE id = ?")
            ->execute([$data['pix_code'] ?? '', $transaction['id']]);
        
        // Creditar saldo do vendedor
        $userId = $transaction['user_id'];
        $amount = (float)$transaction['amount_brl'];
        
        // Buscar dados do usuário (taxa + contatos)
        $userStmt = $pdo->prepare("SELECT commission_rate, full_name, email, whatsapp FROM users WHERE id = ?");
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch();
        $commissionRate = (float)($user['commission_rate'] ?? 5.0);
        
        // Calcular valor líquido — EzzyBanking cobra na origem (fee_gateway = 0)
        $feeGateway  = 0.00;
        $feePlatform = round($amount * ($commissionRate / 100), 2);
        $netAmount   = max(0, $amount - $feePlatform);
        
        // Creditar saldo
        adjustBalance($userId, $netAmount, 'pix_payment', $transaction['id'], 'Recebimento PIX EzzyBanking #' . $transaction['id']);
        
        // Registrar log de taxas
        $pdo->prepare("UPDATE transactions SET fee_platform = ?, fee_gateway = ? WHERE id = ?")
            ->execute([$feePlatform, $feeGateway, $transaction['id']]);
        
        $pdo->commit();

        $txId      = $transaction['id'];
        $sellerName = $user['full_name'] ?? 'Vendedor';
        
        // ─── Notificações (fora da transação DB) ────────────────────────
        // Telegram Admin
        try {
            TelegramService::notifySale($sellerName, $amount, $netAmount, $feePlatform, $feeGateway);
        } catch (Throwable $e) {}

        // E-mail
        try {
            MailService::notifyPaymentReceived($user['email'], $sellerName, $amount, $netAmount);
        } catch (Throwable $e) {}

        // WhatsApp
        try {
            if (class_exists('WhatsAppService') && WhatsAppService::isEnabled()) {
                if (!empty($user['whatsapp'])) {
                    WhatsAppService::notifyPixPaid($user['whatsapp'], $sellerName, $amount, $netAmount, $txId);
                }
                WhatsAppService::notifyPixPaidAdmin($sellerName, $amount, $netAmount, $txId);
            }
        } catch (Throwable $e) {
            write_log('WARN', 'EzzyBanking WhatsApp notify failed', ['error' => $e->getMessage()]);
        }

        // Push Notification (vendedor)
        try {
            if (class_exists('PushService')) {
                PushService::notifyUser(
                    $userId,
                    '💰 Pagamento Recebido!',
                    'R$ ' . number_format($amount, 2, ',', '.') . ' pago via PIX (EzzyBanking)',
                    'sale_paid'
                );
                PushService::notifyAdmins(
                    '💰 PIX Pago #' . $txId,
                    'R$ ' . number_format($amount, 2, ',', '.') . ' — ' . $sellerName,
                    'success'
                );
            }
        } catch (Throwable $e) {
            write_log('WARN', 'EzzyBanking Push notify failed', ['error' => $e->getMessage()]);
        }

        // Notificação interna no dashboard
        try {
            $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'success')")
                ->execute([
                    $userId,
                    'Pagamento Recebido! 💰',
                    'Você recebeu R$ ' . number_format($amount, 2, ',', '.') . ' via PIX. Líquido: R$ ' . number_format($netAmount, 2, ',', '.'),
                ]);
        } catch (Throwable $e) {}
        
        write_log('INFO', 'Ezzy Banking PIX paid', ['transaction_id' => $txId, 'amount' => $amount, 'net' => $netAmount]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        write_log('ERROR', 'Ezzy Banking handlePixPaid failed', ['error' => $e->getMessage()]);
    }
}

function handlePixFailed(string $externalId, array $data): void
{
    global $pdo;
    
    $stmt = $pdo->prepare("UPDATE transactions SET status = 'failed' WHERE external_id = ? AND status = 'pending'");
    $stmt->execute([$externalId]);
    
    write_log('INFO', 'Ezzy Banking PIX failed', ['external_id' => $externalId]);
}

function handlePixExpired(string $externalId, array $data): void
{
    global $pdo;
    
    $stmt = $pdo->prepare("UPDATE transactions SET status = 'expired' WHERE external_id = ? AND status = 'pending'");
    $stmt->execute([$externalId]);
    
    write_log('INFO', 'Ezzy Banking PIX expired', ['external_id' => $externalId]);
}
