<?php
ob_start();
require_once 'includes/db.php';
require_once 'includes/TelegramService.php';
try { require_once 'includes/PushService.php'; } catch (Throwable $e) {}

header('Content-Type: application/json');
set_time_limit(60);

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $checkoutId = (int)($input['checkout_id'] ?? 0);
    $customerName = trim($input['customer_name'] ?? '');
    $customerDocument = trim($input['customer_document'] ?? ''); // CPF opcional

    if ($checkoutId <= 0) {
        throw new Exception('Checkout inválido.');
    }

    // Anti-bot: Rate Limit check
    if (!checkRateLimit($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0')) {
        throw new Exception('Limite de geração excedido. Tente novamente em 1 minuto.');
    }

    // Buscar Checkout
    $stmt = $pdo->prepare("SELECT * FROM checkouts WHERE id = ? AND active = 1");
    $stmt->execute([$checkoutId]);
    $checkout = $stmt->fetch();

    if (!$checkout) {
        throw new Exception('Checkout não encontrado ou inativo.');
    }

    // Buscar Itens e calcular total
    $stmt = $pdo->prepare("SELECT SUM(price) as total_amount FROM checkout_items WHERE checkout_id = ?");
    $stmt->execute([$checkoutId]);
    $totalAmount = (float)$stmt->fetchColumn();

    if ($totalAmount < 10) {
        throw new Exception('O valor mínimo de transação é R$ 10,00.');
    }

    // Buscar User / Lojista
    $userId = $checkout['user_id'];
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || $user['status'] != 'approved') {
        throw new Exception('O recebedor não está apto a receber pagamentos no momento.');
    }
    if (empty($user['pix_key'])) {
        throw new Exception('O recebedor não possui chave PIX configurada.');
    }

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

    $externalId = 'chk_' . $checkoutId . '_' . time();

    // Ambiente de Simulação / Teste
    $currentPixGoKey = getActivePixGoKey();
    if (!$useSigiloPay && ($currentPixGoKey === 'SUA_API_KEY_AQUI' || empty($currentPixGoKey))) {
        $pixId = 'sim_chk_' . time();
        $qrImage = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TESTE';
        $pixCode = '00020126360014br.gov.bcb.pix0114000000000000005204000053039865802BR5913GHOSTPIX6009SAOPAULO62070503***6304ABCD';
        $pixgoFee = $totalAmount * 0.08 + 0.99;
        $platformFee = $totalAmount * ($user['commission_rate'] / 100);
        $netAmount = $totalAmount - $pixgoFee - $platformFee;

        saveTransaction($userId, $totalAmount, $netAmount, $pixId, $pixCode, $qrImage, null, $customerName, $externalId, 'pix');
        $txId = (int)$pdo->lastInsertId();
        try { TelegramService::notifyNewCharge($totalAmount, $user['full_name'] ?? 'N/A', $txId); } catch (Throwable $e) {}
        if (class_exists('PushService')) { try { PushService::notifyAdmins('⚡ Checkout #' . $txId, 'R$ ' . number_format($totalAmount, 2, ',', '.') . ' — ' . ($user['full_name'] ?? 'N/A'), 'info'); } catch (Throwable $e) {} }

        ob_end_clean();
        echo json_encode(['success' => true, 'qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $totalAmount, 'pix_id' => $pixId]);
        exit;
    }

    // ── GATEWAY: SigiloPay ───────────────────────────────────────────
    if ($useSigiloPay && !$usePixGo) {
        $spPayload = [
            'identifier'  => $externalId,
            'amount'      => $totalAmount,
            'client'      => [
                'name'     => empty($customerName) ? 'Cliente Checkout' : $customerName,
                'email'    => (!empty($user['email'])) ? $user['email'] : 'comprador@pixghost.site',
                'phone'    => '(11) 9 0000-0000',
                'document' => !empty($customerDocument) ? preg_replace('/[^0-9]/', '', $customerDocument) : '147.143.016-24',
            ],
            'callbackUrl' => getFullUrl('sigilopay_webhook.php'),
        ];

        write_log('info', "Checkout SigiloPay Request: amount=$totalAmount | externalId=$externalId");

        $ch = curl_init('https://app.sigilopay.com.br/api/v1/gateway/pix/receive');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($spPayload),
            CURLOPT_HTTPHEADER     => [
                'x-public-key: ' . $sigiloPublicKey,
                'x-secret-key: ' . $sigiloSecretKey,
                'Content-Type: application/json',
                'Accept: application/json',
            ],
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $spResponse = curl_exec($ch);
        $spHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $spCurlError = curl_error($ch);
        curl_close($ch);

        write_log('info', "Checkout SigiloPay Response: HTTP=$spHttpCode | " . substr($spResponse ?: '(empty)', 0, 300));

        if ($spResponse === false) {
            throw new Exception("Falha na conexão com gateway de pagamento: $spCurlError");
        }

        $spRes = json_decode($spResponse, true);

        if (($spHttpCode === 200 || $spHttpCode === 201) && isset($spRes['transactionId'])) {
            $pixId   = $spRes['transactionId'];
            $pixData = $spRes['pix'] ?? [];
            $pixCode = $pixData['code'] ?? ($pixData['qrCode'] ?? ($pixData['emv'] ?? ''));
            $b64raw  = $pixData['base64'] ?? ($pixData['qrCodeBase64'] ?? '');
            if (!empty($b64raw)) {
                $qrImage = strpos($b64raw, 'data:') === 0 ? $b64raw : 'data:image/png;base64,' . $b64raw;
            } elseif (!empty($pixCode)) {
                $qrImage = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($pixCode);
            } else {
                $qrImage = '';
            }

            if (!empty($spRes['token'])) {
                $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('sigilopay_webhook_token',?) ON DUPLICATE KEY UPDATE `value`=?")
                    ->execute([$spRes['token'], $spRes['token']]);
            }

            $gatewayFee  = (float)($spRes['fee'] ?? round($totalAmount * 0.08 + 0.99, 2));
            $platformFee = $totalAmount * ($user['commission_rate'] / 100);
            $netAmount   = $totalAmount - $gatewayFee - $platformFee;

            saveTransaction($userId, $totalAmount, $netAmount, $pixId, $pixCode, $qrImage, null, $customerName, $externalId, 'pix');
            $txId = (int)$pdo->lastInsertId();
            try { TelegramService::notifyNewCharge($totalAmount, $user['full_name'] ?? 'N/A', $txId); } catch (Throwable $e) {}
            if (class_exists('PushService')) { try { PushService::notifyAdmins('⚡ Checkout #' . $txId, 'R$ ' . number_format($totalAmount, 2, ',', '.') . ' — ' . ($user['full_name'] ?? 'N/A'), 'info'); } catch (Throwable $e) {} }

            ob_end_clean();
            echo json_encode(['success' => true, 'pix_id' => $pixId, 'qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $totalAmount]);
            exit;
        } else {
            $errMsg = $spRes['message'] ?? ($spRes['errorCode'] ?? 'Erro de comunicação com gateway');
            write_log('error', "Checkout SigiloPay FALHA: HTTP=$spHttpCode | $errMsg | $spResponse");
            throw new Exception("Não foi possível gerar a cobrança: $errMsg");
        }
    }

    // ── GATEWAY: PixGo ───────────────────────────────────────────────
    $data = [
        'amount' => $totalAmount,
        'description' => 'Pedido em ' . mb_substr($checkout['title'], 0, 30),
        'webhook_url' => getFullUrl('webhook.php'),
        'external_id' => $externalId,
        'payer' => [
            'name' => empty($customerName) ? 'Cliente Checkout' : $customerName
        ]
    ];

    if (!empty($customerDocument)) {
        $data['payer']['document'] = preg_replace('/[^0-9]/', '', $customerDocument);
    }

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
    $curlError = curl_error($ch);
    curl_close($ch);

    write_log('info', "Checkout PixGo Response: HTTP=$httpCode | " . substr($response ?: '(empty)', 0, 300));

    if ($response === false) {
        throw new Exception("Falha na conexão com gateway de pagamento.");
    }

    $res = json_decode($response, true);
    if ($httpCode >= 200 && $httpCode < 300 && isset($res['success']) && $res['success']) {
        $pixData = $res['data'] ?? [];
        $pixId   = $pixData['payment_id'] ?? '';
        $qrImage = $pixData['qr_image_url'] ?? '';
        $pixCode = $pixData['pix_code'] ?? ($pixData['payload'] ?? ($pixData['qr_code'] ?? ($pixData['qrcodepix'] ?? '')));

        $pixgoFee    = $totalAmount * 0.08 + 0.99;
        $platformFee = $totalAmount * ($user['commission_rate'] / 100);
        $netAmount   = $totalAmount - $pixgoFee - $platformFee;
        saveTransaction($userId, $totalAmount, $netAmount, $pixId, $pixCode, $qrImage, null, $customerName, $externalId, 'pix');

        $txId = (int)$pdo->lastInsertId();
        try { TelegramService::notifyNewCharge($totalAmount, $user['full_name'] ?? 'N/A', $txId); } catch (Throwable $e) {}
        if (class_exists('PushService')) { try { PushService::notifyAdmins('⚡ Checkout #' . $txId, 'R$ ' . number_format($totalAmount, 2, ',', '.') . ' — ' . ($user['full_name'] ?? 'N/A'), 'info'); } catch (Throwable $e) {} }

        ob_end_clean();
        echo json_encode(['success' => true, 'pix_id' => $pixId, 'qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $totalAmount]);
        exit;
    } else {
        write_log('error', 'Checkout PixGo FALHA: HTTP=' . $httpCode . ' | ' . $response);
        throw new Exception('Não foi possível gerar a cobrança devido a um erro no gateway.');
    }

} catch (Exception $e) {
    if (ob_get_level() > 0) ob_end_clean();
    write_log('error', 'Checkout Falha: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
