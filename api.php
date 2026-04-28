<?php
// 1. Cabeçalhos CORS (Devem ser os primeiros a serem enviados)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
header('Content-Type: application/json');

// 2. Responder imediatamente às requisições OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. Início do processamento com proteção total contra erros 500
try {
    ob_start();
    set_time_limit(60);
    
    require_once 'includes/db.php';
    
    // Tenta carregar o serviço de Push, mas ignora se o vendor estiver quebrado
    try {
        require_once 'includes/PushService.php';
    } catch (Throwable $e) {
        write_log('WARNING', 'PushService desativado devido a erro no vendor: ' . $e->getMessage());
    }
    require_once 'includes/TelegramService.php';

    // Autenticação Híbrida 
    $userId = null;
    if (isLoggedIn()) {
        $userId = $_SESSION['user_id'];
        $headers = getallheaders();
        $csrfToken = $headers['X-CSRF-Token'] ?? ($headers['x-csrf-token'] ?? '');
        check_csrf($csrfToken);
    } else {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
        if (preg_match('/Bearer\s+(ghost_\S+)/', $authHeader, $matches)) {
            $apiKey = $matches[1];
            $stmt = $pdo->prepare("SELECT id FROM users WHERE api_key = ? AND status = 'approved'");
            $stmt->execute([$apiKey]);
            $userAuth = $stmt->fetch();
            if ($userAuth) $userId = $userAuth['id'];
        }
    }

    if (!$userId) {
        throw new Exception('Não autorizado.', 401);
    }

    // ── Seleciona gateway ativo ──────────────────────────────────────
    $getSetting = function(string $key) use ($pdo): string {
        $s = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $s->execute([$key]);
        $val = $s->fetchColumn();
        return ($val === false) ? '' : (string)$val;  // não usa ?: para não tratar '0' como vazio
    };

    $pixgoRaw        = $getSetting('pixgo_enabled');
    $pixgoEnabled    = ($pixgoRaw === '') ? 1 : (int)$pixgoRaw;  // default 1 se não configurado

    $sigiloEnabled   = $getSetting('sigilopay_enabled') === '1';
    $sigiloPublicKey = $getSetting('sigilopay_public_key');
    $sigiloSecretKey = $getSetting('sigilopay_secret_key');

    $usePixGo     = ($pixgoEnabled === 1);
    $useSigiloPay = ($sigiloEnabled && $sigiloPublicKey && $sigiloSecretKey);

    write_log('info', "Gateway select: pixgo_raw=$pixgoRaw usePixGo=$usePixGo sigiloEnabled=$sigiloEnabled useSigiloPay=$useSigiloPay");

    if (!$usePixGo && !$useSigiloPay) {
        throw new Exception('Nenhum gateway de pagamento ativo. Contate o administrador.', 503);
    }

    $inputRaw = file_get_contents('php://input');
    $input = json_decode($inputRaw, true);

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $inputRaw && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Erro no formato JSON: ' . json_last_error_msg());
    }

    $callbackUrl = $input['callback_url'] ?? null;
    $amount = (float)($input['amount'] ?? 0);

    if (!checkRateLimit($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0')) {
        throw new Exception('Limite de geração excedido. Tente novamente em 1 minuto.');
    }

    if ($amount < 10) throw new Exception('Mínimo R$ 10,00.');

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || $user['status'] != 'approved') {
        throw new Exception('Usuário não está habilitado para receber pagamentos.');
    }

    $externalId = 'user_' . $userId . '_' . time();

    // ── GATEWAY: SigiloPay ───────────────────────────────────────────
    if ($useSigiloPay && !$usePixGo) {
        $clientData = [
            'name'     => !empty($user['full_name']) ? $user['full_name'] : 'Cliente',
            'email'    => $user['email'] ?? '',
            'phone'    => !empty($user['phone']) ? $user['phone'] : '(11) 9 0000-0000',
            'document' => (!empty($user['cpf']) && $user['cpf'] !== '000.000.000-00')
                            ? $user['cpf']
                            : '147.143.016-24',  // CPF de fallback (obrigatório pela SigiloPay)
        ];

        $spPayload = [
            'identifier'  => $externalId,
            'amount'      => (float)$amount,
            'client'      => $clientData,
            'callbackUrl' => getFullUrl('sigilopay_webhook.php'),
        ];

        write_log('info', "SigiloPay Request: amount=$amount | externalId=$externalId");

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
        $spResponse  = curl_exec($ch);
        $spHttpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $spCurlError = curl_error($ch);
        curl_close($ch);

        write_log('info', "SigiloPay Response: HTTP=$spHttpCode | " . substr($spResponse ?: '(empty)', 0, 500));

        if ($spResponse === false) {
            throw new Exception("Falha na conexão com SigiloPay: $spCurlError");
        }

        $spRes = json_decode($spResponse, true);

        if (($spHttpCode === 200 || $spHttpCode === 201) && isset($spRes['transactionId'])) {
            $pixId   = $spRes['transactionId'];
            $pixData = $spRes['pix'] ?? [];
            // Campos comuns: code/qrCode para o EMV, qrCodeImage/qrCodeBase64 para imagem
            $pixCode = $pixData['code'] ?? ($pixData['qrCode'] ?? ($pixData['emv'] ?? ''));
            $qrImage = $pixData['qrCodeImage'] ?? ($pixData['qrCodeBase64'] ?? '');

            // Salva token do webhook SigiloPay (primeiro uso)
            if (!empty($spRes['token'])) {
                $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('sigilopay_webhook_token',?) ON DUPLICATE KEY UPDATE `value`=?")
                    ->execute([$spRes['token'], $spRes['token']]);
            }

            $platformFee = $amount * ($user['commission_rate'] / 100);
            $gatewayFee  = (float)($spRes['fee'] ?? ($amount * 0.02));
            $netAmount   = $amount - $gatewayFee - $platformFee;

            saveTransaction($userId, $amount, $netAmount, $pixId, $pixCode, $qrImage, $callbackUrl, 'Recarga Ghost Pix', $externalId, 'pix');

            if (class_exists('PushService')) {
                try { PushService::notifyUser($userId, '⚡ PIX Gerado!', 'Cobrança de R$ ' . number_format($amount, 2, ',', '.') . ' gerada.'); } catch (Throwable $e) {}
            }
            $txId = (int)$pdo->lastInsertId();
            try { TelegramService::notifyNewCharge($amount, $user['full_name'] ?? 'N/A', $txId); } catch (Throwable $e) {}
            if (class_exists('PushService')) {
                try { PushService::notifyAdmins('⚡ Nova Cobrança #' . $txId, 'R$ ' . number_format($amount, 2, ',', '.') . ' — ' . ($user['full_name'] ?? 'N/A'), 'info'); } catch (Throwable $e) {}
            }

            Response::success(['pix_id' => $pixId, 'qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $amount]);
        } else {
            $errMsg     = $spRes['message'] ?? ($spRes['errorCode'] ?? 'Erro de comunicação com SigiloPay');
            $errDetails = isset($spRes['details']) ? json_encode($spRes['details']) : '';
            write_log('error', "SigiloPay FALHA: HTTP=$spHttpCode | $errMsg | details=$errDetails | payload=" . json_encode($spPayload) . " | response=$spResponse");
            throw new Exception("Erro SigiloPay: $errMsg (HTTP $spHttpCode)");
        }
    }

    // ── GATEWAY: PixGo ───────────────────────────────────────────────
    $currentPixGoKey = getActivePixGoKey(!empty($user['is_admin']));

    // Ambiente de Simulação / Teste
    if ($currentPixGoKey === 'SUA_API_KEY_AQUI' || empty($currentPixGoKey)) {
        $pixId = 'sim_' . time();
        $qrImage = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TESTE';
        $pixCode = '00020126360014br.gov.bcb.pix0114000000000000005204000053039865802BR5913GHOSTPIX6009SAOPAULO62070503***6304ABCD';
        $pixgoFee = $amount * 0.02;
        if ($amount < 50) $pixgoFee += 1.00;
        $platformFee = $amount * ($user['commission_rate'] / 100);
        $netAmount = $amount - $pixgoFee - $platformFee;

        saveTransaction($userId, $amount, $netAmount, $pixId, $pixCode, $qrImage, $callbackUrl, 'Recarga Ghost Pix', $externalId, 'pix');

        if (class_exists('PushService')) {
            try { PushService::notifyUser($userId, '⚡ PIX Gerado!', 'Cobrança de R$ ' . number_format($amount, 2, ',', '.') . ' gerada.'); } catch (Throwable $e) {}
        }
        $txId = (int)$pdo->lastInsertId();
        try { TelegramService::notifyNewCharge($amount, $user['full_name'] ?? 'N/A', $txId); } catch (Throwable $e) {}
        if (class_exists('PushService')) {
            try { PushService::notifyAdmins('⚡ Nova Cobrança #' . $txId, 'R$ ' . number_format($amount, 2, ',', '.') . ' — ' . ($user['full_name'] ?? 'N/A'), 'info'); } catch (Throwable $e) {}
        }

        Response::success(['qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $amount, 'pix_id' => $pixId]);
    }

    $data = [
        'amount'      => $amount,
        'description' => 'Recarga Ghost Pix',
        'webhook_url' => getFullUrl('webhook.php'),
        'external_id' => $externalId
    ];

    $pixGoUrl = 'https://pixgo.org/api/v1/payment/create';
    write_log('info', "PixGo Request: URL=$pixGoUrl | Body=" . json_encode($data));

    $ch = curl_init($pixGoUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($data),
        CURLOPT_HTTPHEADER     => [
            'X-API-Key: ' . $currentPixGoKey,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $response  = curl_exec($ch);
    $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    $curlErrno = curl_errno($ch);
    curl_close($ch);

    write_log('info', "PixGo Response: HTTP=$httpCode | " . substr($response ?: '(empty)', 0, 500));

    if ($response === false) {
        throw new Exception("Falha na conexão com PixGo: [$curlErrno] $curlError");
    }

    $res = json_decode($response, true);

    if (($httpCode === 200 || $httpCode === 201) && isset($res['success']) && $res['success']) {
        $pixData   = $res['data'] ?? [];
        $pixId     = $pixData['payment_id'] ?? '';
        $qrImage   = $pixData['qr_image_url'] ?? '';
        $pixCode   = $pixData['qr_code'] ?? '';
        $pixgoFee  = $amount * 0.02;
        if ($amount < 50) $pixgoFee += 1.00;
        $platformFee = $amount * ($user['commission_rate'] / 100);
        $netAmount   = $amount - $pixgoFee - $platformFee;
        saveTransaction($userId, $amount, $netAmount, $pixId, $pixCode, $qrImage, $callbackUrl, 'Recarga Ghost Pix', $externalId, 'pix');

        if (class_exists('PushService')) {
            try { PushService::notifyUser($userId, '⚡ PIX Gerado!', 'Cobrança de R$ ' . number_format($amount, 2, ',', '.') . ' gerada.'); } catch (Throwable $e) {}
        }
        $txId = (int)$pdo->lastInsertId();
        try { TelegramService::notifyNewCharge($amount, $user['full_name'] ?? 'N/A', $txId); } catch (Throwable $e) {}
        if (class_exists('PushService')) {
            try { PushService::notifyAdmins('⚡ Nova Cobrança #' . $txId, 'R$ ' . number_format($amount, 2, ',', '.') . ' — ' . ($user['full_name'] ?? 'N/A'), 'info'); } catch (Throwable $e) {}
        }

        Response::success(['pix_id' => $pixId, 'qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $amount]);
    } else {
        $errorMsg = $res['message'] ?? ($res['error'] ?? 'Erro de comunicação com o serviço de pagamento');
        write_log('error', "PixGo FALHA: HTTP=$httpCode | $errorMsg | $response");
        throw new Exception("Erro PixGo: $errorMsg (CS: $httpCode)");
    }

} catch (Throwable $e) {
    if (ob_get_level() > 0) ob_end_clean();
    write_log('error', 'Falha API Crítica: ' . $e->getMessage());
    
    $status = 400;
    if ($e->getCode() >= 400 && $e->getCode() < 600) $status = $e->getCode();
    
    Response::error($e->getMessage(), $status);
}
?>
