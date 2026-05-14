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

    if ($totalAmount < 1) {
        throw new Exception('O valor mínimo de transação é R$ 1,00.');
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

    // ── Gateway: SigiloPay ───────────────────────────────────────────
    $getSetting = function(string $key) use ($pdo): string {
        $s = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $s->execute([$key]);
        $val = $s->fetchColumn();
        return ($val === false) ? '' : (string)$val;
    };

    $sigiloEnabled   = $getSetting('sigilopay_enabled') === '1';
    $sigiloPublicKey = $getSetting('sigilopay_public_key');
    $sigiloSecretKey = $getSetting('sigilopay_secret_key');

    if (!$sigiloEnabled || !$sigiloPublicKey || !$sigiloSecretKey) {
        throw new Exception('Gateway de pagamento não configurado. Contate o administrador.');
    }

    $externalId = 'chk_' . $checkoutId . '_' . time();

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

} catch (Exception $e) {
    if (ob_get_level() > 0) ob_end_clean();
    write_log('error', 'Checkout Falha: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
