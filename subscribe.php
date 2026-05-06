<?php
/**
 * subscribe.php — Public endpoint: customer subscribes to a subscription product.
 * Generates the first PIX charge and records the subscription as 'pending'.
 * When webhook confirms payment, the subscription becomes 'active'.
 */
require_once 'includes/db.php';
require_once 'includes/TelegramService.php';
try { require_once 'includes/PushService.php'; } catch (Throwable $e) {}

header('Content-Type: application/json');

try {
    $input          = json_decode(file_get_contents('php://input'), true);
    $productId      = (int)($input['product_id'] ?? 0);
    $variantId      = (int)($input['variant_id'] ?? 0);
    $customerName   = trim($input['customer_name'] ?? '');
    $customerEmail  = trim($input['customer_email'] ?? '');
    $customerDoc    = trim($input['customer_document'] ?? '');

    if (!$productId || !$customerName) {
        throw new Exception('Produto e nome são obrigatórios.');
    }
    if (!$customerEmail) {
        throw new Exception('E-mail é obrigatório para assinaturas.');
    }

    if (!checkRateLimit($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0')) {
        throw new Exception('Limite de requisições excedido. Tente novamente em 1 minuto.');
    }

    // Fetch product (must be subscription type)
    $stmt = $pdo->prepare("SELECT p.*, u.pix_key, u.status AS user_status, u.commission_rate, u.full_name AS seller_name FROM products p JOIN users u ON u.id = p.user_id WHERE p.id = ? AND p.status = 'active' AND p.vitrine = 1");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    if (!$product)                              throw new Exception('Produto não disponível.');
    if ($product['user_status'] !== 'approved') throw new Exception('Vendedor não autorizado.');
    if ($product['type'] !== 'subscription')    throw new Exception('Este produto não é uma assinatura.');
    if (empty($product['pix_key']))             throw new Exception('Vendedor sem chave PIX configurada.');

    // Determine amount (variant or base price)
    $amount = (float)$product['price'];
    if ($variantId) {
        $vs = $pdo->prepare("SELECT price FROM product_variants WHERE id = ? AND product_id = ? AND active = 1");
        $vs->execute([$variantId, $productId]);
        $v = $vs->fetch();
        if ($v) $amount = (float)$v['price'];
    }

    if ($amount < 10) throw new Exception('Valor mínimo é R$ 10,00.');

    $sellerId   = (int)$product['user_id'];
    $externalId = 'sub_new_' . $productId . '_' . time();
    $currentKey = getActivePixGoKey();

    // ── Create subscription record (pending) ──────────────────────────────
    $interval = $product['subscription_interval'] ?? 'monthly';
    $nextBilling = null;
    // next_billing will be set when payment is confirmed via webhook

    $pdo->prepare("INSERT INTO subscriptions (product_id, seller_id, subscriber_name, subscriber_email, subscriber_document, status, billing_amount) VALUES (?,?,?,?,?,?,?)")
        ->execute([$productId, $sellerId, $customerName, $customerEmail, $customerDoc, 'pending', $amount]);
    $subscriptionId = (int)$pdo->lastInsertId();

    // ── Generate first PIX charge ─────────────────────────────────────────
    if ($currentKey === 'SUA_API_KEY_AQUI' || empty($currentKey)) {
        // Simulation mode
        $pixCode = '00020126360014br.gov.bcb.pix0114000000000000005204000053039865802BR5925GHOSTPIX6009SAOPAULO62070503***6304ABCD';
        $qrImage = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=GHOSTPIX_SUB_NEW_' . $subscriptionId;
        $pixId   = 'sim_sub_first_' . time();
        $pixgoFee    = $amount * (8 / 100) + 0.99;
        $platformFee = $amount * ($product['commission_rate'] / 100);
        $netAmount   = $amount - $pixgoFee - $platformFee;

        saveTransaction($sellerId, $amount, $netAmount, $pixId, $pixCode, $qrImage, null, $customerName, $externalId, 'pix');
        $txId = (int)$pdo->lastInsertId();
    } else {
        $data = [
            'amount'      => $amount,
            'description' => 'Assinatura: ' . mb_substr($product['name'], 0, 40),
            'webhook_url' => getFullUrl('webhook.php'),
            'external_id' => $externalId,
            'payer'       => ['name' => $customerName],
        ];
        if ($customerDoc) $data['payer']['document'] = preg_replace('/[^0-9]/', '', $customerDoc);

        $ch = curl_init('https://pixgo.org/api/v1/payment/create');
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($data), CURLOPT_HTTPHEADER => ['x-api-key: ' . $currentKey, 'Content-Type: application/json'], CURLOPT_TIMEOUT => 30]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (!$response) throw new Exception('Falha na conexão com gateway.');
        $res = json_decode($response, true);
        if ($httpCode < 200 || $httpCode >= 300 || empty($res['success'])) {
            throw new Exception('Erro no gateway de pagamento: ' . ($res['message'] ?? 'sem detalhes'));
        }
        $pixData     = $res['data'] ?? [];
        $pixId       = $pixData['payment_id'] ?? '';
        $qrImage     = $pixData['qr_image_url'] ?? '';
        $pixCode     = $pixData['pix_code'] ?? ($pixData['payload'] ?? '');
        $pixgoFee    = $amount * (8 / 100) + 0.99;
        $platformFee = $amount * ($product['commission_rate'] / 100);
        $netAmount   = $amount - $pixgoFee - $platformFee;

        saveTransaction($sellerId, $amount, $netAmount, $pixId, $pixCode, $qrImage, null, $customerName, $externalId, 'pix');
        $txId = (int)$pdo->lastInsertId();
    }

    // ── Record subscription payment ────────────────────────────────────────
    $pdo->prepare("INSERT INTO subscription_payments (subscription_id, transaction_id, amount, pix_code, qr_image, due_at) VALUES (?,?,?,?,?,NOW())")
        ->execute([$subscriptionId, $txId, $amount, $pixCode, $qrImage]);

    // Store subscription_id in transaction external_id so webhook can link them
    $pdo->prepare("UPDATE transactions SET external_id = CONCAT(external_id, ':sub_', ?) WHERE id = ?")
        ->execute([$subscriptionId, $txId]);

    try { TelegramService::notifyNewCharge($amount, $product['seller_name'], $txId); } catch (Throwable $e) {}
    if (class_exists('PushService')) {
        try { PushService::notifyAdmins('🔄 Nova Assinatura #' . $subscriptionId, $customerName . ' — R$ ' . number_format($amount, 2, ',', '.') . '/mês', 'info'); } catch (Throwable $e) {}
    }

    echo json_encode([
        'success'         => true,
        'subscription_id' => $subscriptionId,
        'qr_image'        => $qrImage,
        'pix_code'        => $pixCode,
        'amount'          => $amount,
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
