<?php
ob_start();
require_once 'includes/db.php';
require_once 'includes/TelegramService.php';
try { require_once 'includes/PushService.php'; } catch (Throwable $e) {}

header('Content-Type: application/json');
set_time_limit(60);

try {
    $input        = json_decode(file_get_contents('php://input'), true);
    $productId    = (int)($input['product_id'] ?? 0);
    $variantId    = (int)($input['variant_id'] ?? 0);
    $customerName = trim($input['customer_name'] ?? '');
    $customerDoc  = trim($input['customer_document'] ?? '');
    $couponCode   = strtoupper(trim($input['coupon_code'] ?? ''));
    $buyerPixKey  = trim($input['buyer_pix_key'] ?? '');

    if (!$productId || !$customerName) {
        throw new Exception('Produto e nome são obrigatórios.');
    }

    if (!checkRateLimit($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0')) {
        throw new Exception('Limite de geração excedido. Tente novamente em 1 minuto.');
    }

    // Fetch product
    $stmt = $pdo->prepare("SELECT p.*, u.pix_key, u.status AS user_status, u.commission_rate, u.full_name AS seller_name FROM products p JOIN users u ON u.id = p.user_id WHERE p.id = ? AND p.status = 'active' AND p.vitrine = 1");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    if (!$product) throw new Exception('Produto não disponível.');
    if ($product['user_status'] !== 'approved') throw new Exception('Vendedor não autorizado.');
    if (empty($product['pix_key'])) throw new Exception('Vendedor sem chave PIX configurada.');
    if ($product['type'] === 'subscription') throw new Exception('Use o checkout de assinatura para este produto.');

    // Resolve price: use variant price if applicable
    $selectedVariantName = null;
    if ($variantId) {
        $vStmt = $pdo->prepare("SELECT id, name, price, stock FROM product_variants WHERE id = ? AND product_id = ? AND active = 1");
        $vStmt->execute([$variantId, $productId]);
        $variant = $vStmt->fetch();
        if (!$variant) throw new Exception('Opção de produto inválida.');
        if ($variant['stock'] !== -1 && $variant['stock'] <= 0) throw new Exception('Esta opção está sem estoque.');
        $selectedVariantName = $variant['name'];
        $amount = (float)$variant['price'];
    } elseif (!empty($product['has_variants'])) {
        throw new Exception('Selecione uma opção do produto.');
    } else {
        $amount = (float)$product['price'];
    }
    $originalAmount = $amount;
    $discountAmount = 0;
    $couponId       = null;

    // Aplicar cupom se fornecido
    if ($couponCode) {
        $cStmt = $pdo->prepare("SELECT * FROM coupons WHERE code = ? AND active = 1");
        $cStmt->execute([$couponCode]);
        $coupon = $cStmt->fetch();

        if ($coupon && (int)$coupon['user_id'] === (int)$product['user_id']) {
            $validScope = ($coupon['scope'] === 'store') ||
                          ($coupon['scope'] === 'product' && (int)$coupon['product_id'] === $productId);
            $notExpired = !$coupon['expires_at'] || strtotime($coupon['expires_at']) >= time();
            $hasUses    = $coupon['max_uses'] === null || (int)$coupon['uses_count'] < (int)$coupon['max_uses'];
            $minOk      = $amount >= (float)$coupon['min_amount'];

            if ($validScope && $notExpired && $hasUses && $minOk) {
                $discountAmount = $coupon['type'] === 'percent'
                    ? round($amount * ((float)$coupon['value'] / 100), 2)
                    : min((float)$coupon['value'], $amount);
                $couponId = $coupon['id'];
                $amount   = max(10, $amount - $discountAmount);
            }
        }
    }

    if ($amount < 10) throw new Exception('Valor mínimo é R$ 10,00.');

    // Check if product has stock items (for auto-delivery)
    if ($product['stock'] !== -1 && $product['stock'] <= 0) {
        throw new Exception('Produto sem estoque disponível.');
    }

    // Generate unique delivery token for this order
    $deliveryToken = bin2hex(random_bytes(24));
    $externalId    = 'prod_' . $productId . '_' . time();
    $sellerId      = $product['user_id'];

    // ── Seleciona gateway ativo ──────────────────────────────────────
    $getSetting = function(string $key) use ($pdo): string {
        $s = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $s->execute([$key]);
        $val = $s->fetchColumn();
        return ($val === false) ? '' : (string)$val;
    };
    $pixgoRaw        = $getSetting('pixgo_enabled');
    $pixgoEnabled    = ($pixgoRaw === '') ? 1 : (int)$pixgoRaw;
    $sigiloEnabled   = $getSetting('sigilopay_enabled') === '1';
    $sigiloPublicKey = $getSetting('sigilopay_public_key');
    $sigiloSecretKey = $getSetting('sigilopay_secret_key');
    $usePixGo        = ($pixgoEnabled === 1);
    $useSigiloPay    = ($sigiloEnabled && $sigiloPublicKey && $sigiloSecretKey);

    $currentPixGoKey = getActivePixGoKey();

    // Simulation mode (sem gateway real configurado)
    if (!$useSigiloPay && ($currentPixGoKey === 'SUA_API_KEY_AQUI' || empty($currentPixGoKey))) {
        $pixId   = 'sim_prod_' . time();
        $qrImage = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=GHOSTPIX_PRODUCT';
        $pixCode = '00020126360014br.gov.bcb.pix0114000000000000005204000053039865802BR5913GHOSTPIX6009SAOPAULO62070503***6304ABCD';

        $pixgoFee    = $amount * 0.08 + 0.99;
        $platformFee = $amount * ($product['commission_rate'] / 100);
        $netAmount   = $amount - $pixgoFee - $platformFee;

        saveTransaction($sellerId, $amount, $netAmount, $pixId, $pixCode, $qrImage, null, $customerName, $externalId, 'pix');
        $txId = (int)$pdo->lastInsertId();
        $buyerUserId = $_SESSION['user_id'] ?? null;
        $pdo->prepare("INSERT INTO orders (product_id, seller_id, buyer_name, buyer_document, buyer_pix_key, buyer_user_id, amount, transaction_id, status, delivery_token, coupon_id, discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)")
            ->execute([$productId, $sellerId, $customerName, $customerDoc, $buyerPixKey, $buyerUserId, $amount, $txId, $deliveryToken, $couponId, $discountAmount]);
        if ($couponId) { $pdo->prepare("UPDATE coupons SET uses_count = uses_count + 1 WHERE id = ?")->execute([$couponId]); }
        try { TelegramService::notifyNewCharge($amount, $product['seller_name'], $txId); } catch (Throwable $e) {}
        if (class_exists('PushService')) { try { PushService::notifyAdmins('⚡ Produto #' . $txId, 'R$ ' . number_format($amount, 2, ',', '.') . ' — ' . $product['seller_name'], 'info'); } catch (Throwable $e) {} }
        ob_end_clean();
        echo json_encode(['success' => true, 'qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $amount, 'original_amount' => $originalAmount, 'discount_amount' => $discountAmount, 'delivery_token' => $deliveryToken]);
        exit;
    }

    // ── GATEWAY: SigiloPay ───────────────────────────────────────────
    if ($useSigiloPay && !$usePixGo) {
        $spPayload = [
            'identifier'  => $externalId,
            'amount'      => $amount,
            'client'      => [
                'name'     => $customerName,
                'email'    => 'comprador@pixghost.site',
                'phone'    => '(11) 9 0000-0000',
                'document' => $customerDoc ? preg_replace('/[^0-9]/', '', $customerDoc) : '14714301624',
            ],
            'callbackUrl' => getFullUrl('sigilopay_webhook.php'),
        ];
        write_log('info', "buy_product SigiloPay Request: amount=$amount | externalId=$externalId");
        $ch = curl_init('https://app.sigilopay.com.br/api/v1/gateway/pix/receive');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($spPayload),
            CURLOPT_HTTPHEADER     => ['x-public-key: ' . $sigiloPublicKey, 'x-secret-key: ' . $sigiloSecretKey, 'Content-Type: application/json', 'Accept: application/json'],
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $spResponse  = curl_exec($ch);
        $spHttpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $spCurlError = curl_error($ch);
        curl_close($ch);
        write_log('info', "buy_product SigiloPay Response: HTTP=$spHttpCode | " . substr($spResponse ?: '(empty)', 0, 300));
        if ($spResponse === false) throw new Exception("Falha na conexão com gateway: $spCurlError");
        $spRes = json_decode($spResponse, true);
        if (($spHttpCode === 200 || $spHttpCode === 201) && isset($spRes['transactionId'])) {
            $pixId   = $spRes['transactionId'];
            $pixData = $spRes['pix'] ?? [];
            $pixCode = $pixData['code'] ?? ($pixData['qrCode'] ?? ($pixData['emv'] ?? ''));
            $b64raw  = $pixData['base64'] ?? ($pixData['qrCodeBase64'] ?? '');
            $qrImage = !empty($b64raw) ? (strpos($b64raw, 'data:') === 0 ? $b64raw : 'data:image/png;base64,' . $b64raw) : (!empty($pixCode) ? 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($pixCode) : '');
            if (!empty($spRes['token'])) {
                $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('sigilopay_webhook_token',?) ON DUPLICATE KEY UPDATE `value`=?")->execute([$spRes['token'], $spRes['token']]);
            }
            $gatewayFee  = (float)($spRes['fee'] ?? round($amount * 0.08 + 0.99, 2));
            $platformFee = $amount * ($product['commission_rate'] / 100);
            $netAmount   = $amount - $gatewayFee - $platformFee;
            saveTransaction($sellerId, $amount, $netAmount, $pixId, $pixCode, $qrImage, null, $customerName, $externalId, 'pix');
            $txId = (int)$pdo->lastInsertId();
            $buyerUserId = $_SESSION['user_id'] ?? null;
            $pdo->prepare("INSERT INTO orders (product_id, seller_id, buyer_name, buyer_document, buyer_pix_key, buyer_user_id, amount, transaction_id, status, delivery_token, coupon_id, discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)")
                ->execute([$productId, $sellerId, $customerName, $customerDoc, $buyerPixKey, $buyerUserId, $amount, $txId, $deliveryToken, $couponId, $discountAmount]);
            if ($couponId) { $pdo->prepare("UPDATE coupons SET uses_count = uses_count + 1 WHERE id = ?")->execute([$couponId]); }
            try { TelegramService::notifyNewCharge($amount, $product['seller_name'], $txId); } catch (Throwable $e) {}
            if (class_exists('PushService')) { try { PushService::notifyAdmins('⚡ Produto #' . $txId, 'R$ ' . number_format($amount, 2, ',', '.') . ' — ' . $product['seller_name'], 'info'); } catch (Throwable $e) {} }
            ob_end_clean();
            echo json_encode(['success' => true, 'pix_id' => $pixId, 'qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $amount, 'original_amount' => $originalAmount, 'discount_amount' => $discountAmount, 'delivery_token' => $deliveryToken]);
            exit;
        } else {
            $errMsg = $spRes['message'] ?? ($spRes['errorCode'] ?? 'Erro de comunicação com gateway');
            write_log('error', "buy_product SigiloPay FALHA: HTTP=$spHttpCode | $errMsg");
            throw new Exception("Não foi possível gerar a cobrança: $errMsg");
        }
    }

    // ── GATEWAY: PixGo ───────────────────────────────────────────────
    $data = [
        'amount'      => $amount,
        'description' => 'Compra: ' . mb_substr($product['name'], 0, 40),
        'webhook_url' => getFullUrl('webhook.php'),
        'external_id' => $externalId,
        'payer'       => ['name' => $customerName]
    ];
    if ($customerDoc) $data['payer']['document'] = preg_replace('/[^0-9]/', '', $customerDoc);

    $ch = curl_init('https://pixgo.org/api/v1/payment/create');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($data),
        CURLOPT_HTTPHEADER     => ['x-api-key: ' . $currentPixGoKey, 'Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 30,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    write_log('info', "buy_product PixGo Response: HTTP=$httpCode | " . substr($response ?: '(empty)', 0, 300));
    if (!$response) throw new Exception('Falha na conexão com gateway.');

    $res = json_decode($response, true);
    if ($httpCode >= 200 && $httpCode < 300 && !empty($res['success'])) {
        $pixData = $res['data'] ?? [];
        $pixId   = $pixData['payment_id'] ?? '';
        $qrImage = $pixData['qr_image_url'] ?? '';
        $pixCode = $pixData['pix_code'] ?? ($pixData['payload'] ?? ($pixData['qr_code'] ?? ''));

        $pixgoFee    = $amount * 0.08 + 0.99;
        $platformFee = $amount * ($product['commission_rate'] / 100);
        $netAmount   = $amount - $pixgoFee - $platformFee;

        saveTransaction($sellerId, $amount, $netAmount, $pixId, $pixCode, $qrImage, null, $customerName, $externalId, 'pix');
        $txId = (int)$pdo->lastInsertId();
        $buyerUserId = $_SESSION['user_id'] ?? null;
        $pdo->prepare("INSERT INTO orders (product_id, seller_id, buyer_name, buyer_document, buyer_pix_key, buyer_user_id, amount, transaction_id, status, delivery_token, coupon_id, discount_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)")
            ->execute([$productId, $sellerId, $customerName, $customerDoc, $buyerPixKey, $buyerUserId, $amount, $txId, $deliveryToken, $couponId, $discountAmount]);
        if ($couponId) { $pdo->prepare("UPDATE coupons SET uses_count = uses_count + 1 WHERE id = ?")->execute([$couponId]); }
        try { TelegramService::notifyNewCharge($amount, $product['seller_name'], $txId); } catch (Throwable $e) {}
        if (class_exists('PushService')) { try { PushService::notifyAdmins('⚡ Produto #' . $txId, 'R$ ' . number_format($amount, 2, ',', '.') . ' — ' . $product['seller_name'], 'info'); } catch (Throwable $e) {} }
        ob_end_clean();
        echo json_encode(['success' => true, 'pix_id' => $pixId, 'qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $amount, 'original_amount' => $originalAmount, 'discount_amount' => $discountAmount, 'delivery_token' => $deliveryToken]);
        exit;
    }

    write_log('error', 'buy_product PixGo FALHA: HTTP=' . $httpCode . ' | ' . $response);
    throw new Exception('Erro no gateway de pagamento.');

} catch (Exception $e) {
    if (ob_get_level() > 0) ob_end_clean();
    write_log('error', 'buy_product Falha: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
