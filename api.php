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
    require_once 'includes/BRPixService.php';
    require_once 'includes/IronPayService.php';

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

    $sigiloEnabled   = $getSetting('sigilopay_enabled') === '1';
    $sigiloPublicKey = $getSetting('sigilopay_public_key');
    $sigiloSecretKey = $getSetting('sigilopay_secret_key');
    $useSigiloPay    = ($sigiloEnabled && $sigiloPublicKey && $sigiloSecretKey);

    $brpixEnabled      = $getSetting('brpix_enabled') === '1';
    $brpixClientId     = $getSetting('brpix_client_id');
    $brpixClientSecret = $getSetting('brpix_client_secret');
    $useBRPix          = ($brpixEnabled && $brpixClientId && $brpixClientSecret);

    $ironpayEnabled     = $getSetting('ironpay_enabled') === '1';
    $ironpayToken       = $getSetting('ironpay_token');
    $ironpayOfferHash   = $getSetting('ironpay_offer_hash');
    $ironpayProductHash = $getSetting('ironpay_product_hash');
    $useIronPay         = ($ironpayEnabled && $ironpayToken && $ironpayOfferHash && $ironpayProductHash);

    write_log('info', "Gateway: sigiloEnabled=$sigiloEnabled useSigiloPay=$useSigiloPay | brpixEnabled=$brpixEnabled useBRPix=$useBRPix | ironpayEnabled=$ironpayEnabled useIronPay=$useIronPay");

    if (!$useSigiloPay && !$useBRPix && !$useIronPay) {
        throw new Exception('Gateway de pagamento não configurado. Contate o administrador.', 503);
    }

    $inputRaw = file_get_contents('php://input');
    $input = json_decode($inputRaw, true);

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $inputRaw && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Erro no formato JSON: ' . json_last_error_msg());
    }

    $rawCallback = $input['callback_url'] ?? null;
    $callbackUrl = ($rawCallback && is_safe_external_url($rawCallback)) ? $rawCallback : null;
    if ($rawCallback && !$callbackUrl) {
        security_log('SSRF_BLOCKED_API', ['callback_url' => $rawCallback]);
    }
    $utmParams = sanitize_utm_params($input['tracking_params'] ?? []);
    $amount = (float)($input['amount'] ?? 0);

    if (!checkRateLimit($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0')) {
        throw new Exception('Limite de geração excedido. Tente novamente em 1 minuto.');
    }

    if ($amount < 2) throw new Exception('Mínimo R$ 2,00.');

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user || $user['status'] != 'approved') {
        throw new Exception('Usuário não está habilitado para receber pagamentos.');
    }

    $externalId    = !empty($input['external_id']) ? (string)$input['external_id'] : ('user_' . $userId . '_' . time());
    $userNominal   = $user['preferred_nominal'] ?? 'nominal1';
    // Taxa por nominal: nominal2 = BRPix (2.99% + R$1,00), nominal1 = padrão (8% + R$0,99)
    $nominalFeePercent = ($userNominal === 'nominal2') ? 4.00 : 8.0;
    $nominalFeeFixed   = ($userNominal === 'nominal2') ? 1.00 : 0.99;

    // ── GATEWAY: IronPay ────────────────────────────────────────────
    if ($useIronPay && !$useBRPix) {
        if (!defined('IRONPAY_TOKEN'))        define('IRONPAY_TOKEN',        $ironpayToken);
        if (!defined('IRONPAY_OFFER_HASH'))   define('IRONPAY_OFFER_HASH',   $ironpayOfferHash);
        if (!defined('IRONPAY_PRODUCT_HASH')) define('IRONPAY_PRODUCT_HASH', $ironpayProductHash);

        $feePercent = $nominalFeePercent;
        $feeFixed   = $nominalFeeFixed;

        $customerData = [
            'name'     => !empty($user['full_name']) ? $user['full_name'] : 'Cliente',
            'email'    => $user['email'] ?? '',
            'phone'    => $user['phone'] ?? '',
            'document' => (!empty($user['cpf']) && $user['cpf'] !== '000.000.000-00') ? $user['cpf'] : '00000000000',
        ];

        write_log('info', "IronPay Request: amount=$amount | externalId=$externalId");
        $ipResult = IronPayService::createCharge($amount, $externalId, $customerData, 'Pagamento LunarPay');
        write_log('info', "IronPay Response: HTTP={$ipResult['http_code']} | " . substr($ipResult['raw'] ?: '(empty)', 0, 500));

        if ($ipResult['curl_error']) {
            throw new Exception('Falha na conexão com o gateway de pagamento. Tente novamente.');
        }

        $ipData = $ipResult['data'];
        $ipCode = $ipResult['http_code'];

        if (($ipCode === 200 || $ipCode === 201) && !empty($ipData['hash'])) {
            $pixId   = $ipData['hash'];
            $pixCode = $ipData['pix']['pix_qr_code'] ?? '';
            $b64raw  = '';

            if (!empty($pixCode)) {
                $qrImage = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($pixCode);
            } else {
                $qrImage = '';
            }

            $gatewayFee  = IronPayService::calculateFee($amount, $feePercent, $feeFixed);
            $platformFee = $amount * ($user['commission_rate'] / 100);
            $netAmount   = max(0, $amount - $gatewayFee - $platformFee);

            saveTransaction($userId, $amount, $netAmount, $pixId, $pixCode, $qrImage, $callbackUrl, 'Cobrança LunarPay', $externalId, 'pix', $utmParams);

            if (class_exists('PushService')) {
                try { PushService::notifyUser($userId, '⚡ PIX Gerado!', 'Cobrança de R$ ' . number_format($amount, 2, ',', '.') . ' gerada.', 'sale_generated'); } catch (Throwable $e) {}
            }
            $txId = (int)$pdo->lastInsertId();
            try { TelegramService::notifyNewCharge($amount, $user['full_name'] ?? 'N/A', $txId); } catch (Throwable $e) {}

            Response::success(['pix_id' => $pixId, 'qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $amount]);
        } else {
            $errMsg = $ipData['message'] ?? ($ipData['error'] ?? 'Erro de comunicação com o gateway');
            write_log('error', "IronPay FALHA: HTTP={$ipResult['http_code']} | $errMsg | response={$ipResult['raw']}");
            throw new Exception('Erro ao processar pagamento: ' . $errMsg);
        }
    }

    // ── GATEWAY: BRPix Solutions ─────────────────────────────────────
    if ($useBRPix) {
        if (!defined('BRPIX_CLIENT_ID'))     define('BRPIX_CLIENT_ID',     $brpixClientId);
        if (!defined('BRPIX_CLIENT_SECRET')) define('BRPIX_CLIENT_SECRET', $brpixClientSecret);

        $feePercent = $nominalFeePercent;
        $feeFixed   = $nominalFeeFixed;

        write_log('info', "BRPix Request: amount=$amount | externalId=$externalId");
        $bpResult = BRPixService::createCharge($amount, $externalId, 'Pagamento LunarPay');
        write_log('info', "BRPix Response: HTTP={$bpResult['http_code']} | " . substr($bpResult['raw'] ?: '(empty)', 0, 500));

        if ($bpResult['curl_error']) {
            throw new Exception('Falha na conexão com o gateway de pagamento. Tente novamente.');
        }

        $bpData = $bpResult['data'];
        $bpCode = $bpResult['http_code'];

        if (($bpCode === 200 || $bpCode === 201) && !empty($bpData['txid'])) {
            $pixId   = $bpData['txid'];
            $pixInfo = $bpData['pix'] ?? [];
            $pixCode = $pixInfo['qr_code']       ?? ($bpData['qr_code']       ?? ($bpData['qr_code_text'] ?? ($bpData['pix_copia_e_cola'] ?? ($bpData['br_code'] ?? ''))));
            $b64raw  = $pixInfo['qr_code_image'] ?? ($bpData['qr_code_image'] ?? '');

            if (!empty($b64raw)) {
                $qrImage = strpos($b64raw, 'data:') === 0 ? $b64raw : 'data:image/png;base64,' . $b64raw;
            } elseif (!empty($pixCode)) {
                $qrImage = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($pixCode);
            } else {
                $qrImage = '';
            }

            $gatewayFee  = BRPixService::calculateFee($amount, $feePercent, $feeFixed);
            $platformFee = $amount * ($user['commission_rate'] / 100);
            $netAmount   = max(0, $amount - $gatewayFee - $platformFee);

            saveTransaction($userId, $amount, $netAmount, $pixId, $pixCode, $qrImage, $callbackUrl, 'Cobrança LunarPay', $externalId, 'pix', $utmParams);

            if (class_exists('PushService')) {
                try { PushService::notifyUser($userId, '⚡ PIX Gerado!', 'Cobrança de R$ ' . number_format($amount, 2, ',', '.') . ' gerada.', 'sale_generated'); } catch (Throwable $e) {}
            }
            $txId = (int)$pdo->lastInsertId();
            try { TelegramService::notifyNewCharge($amount, $user['full_name'] ?? 'N/A', $txId); } catch (Throwable $e) {}
            if (class_exists('PushService')) {
                try { PushService::notifyAdmins('⚡ Nova Cobrança #' . $txId, 'R$ ' . number_format($amount, 2, ',', '.') . ' — ' . ($user['full_name'] ?? 'N/A'), 'info'); } catch (Throwable $e) {}
            }

            Response::success(['pix_id' => $pixId, 'qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $amount]);
        } else {
            $errMsg = $bpData['message'] ?? ($bpData['error'] ?? 'Erro de comunicação com o gateway');
            write_log('error', "BRPix FALHA: HTTP={$bpResult['http_code']} | $errMsg | response={$bpResult['raw']}");
            throw new Exception('Erro ao processar pagamento: ' . $errMsg);
        }
    }

    // ── GATEWAY: SigiloPay ───────────────────────────────────────────
    if ($useSigiloPay) {
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
                'User-Agent: Mozilla/5.0 (compatible; LunarPay/2.0; +https://lunarpay.site)',
            ],
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; LunarPay/2.0; +https://lunarpay.site)',
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $spResponse  = curl_exec($ch);
        $spHttpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $spCurlError = curl_error($ch);
        curl_close($ch);

        write_log('info', "SigiloPay Response: HTTP=$spHttpCode | body=" . substr($spResponse ?: '(empty)', 0, 1000));

        if ($spResponse === false) {
            throw new Exception("Falha na conexão com o gateway de pagamento. Tente novamente.");
        }

        $spRes = json_decode($spResponse, true);

        if (($spHttpCode === 200 || $spHttpCode === 201) && isset($spRes['transactionId'])) {
            $pixId   = $spRes['transactionId'];
            $pixData = $spRes['pix'] ?? [];
            // Tenta vários campos possíveis para o EMV (copia e cola)
            $pixCode = $pixData['code'] ?? ($pixData['qrCode'] ?? ($pixData['emv'] ?? ($pixData['brCode'] ?? '')));
            // pix.base64 é o campo real da SigiloPay (PNG em base64)
            $b64raw  = $pixData['base64'] ?? ($pixData['qrCodeBase64'] ?? ($pixData['qrCodeImage'] ?? ($pixData['imageUrl'] ?? '')));
            if (!empty($b64raw)) {
                $qrImage = strpos($b64raw, 'data:') === 0
                    ? $b64raw
                    : 'data:image/png;base64,' . $b64raw;
            } elseif (!empty($pixCode)) {
                $qrImage = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($pixCode);
            } else {
                $qrImage = '';
            }

            // Salva token do webhook SigiloPay (primeiro uso)
            if (!empty($spRes['token'])) {
                $pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('sigilopay_webhook_token',?) ON DUPLICATE KEY UPDATE `value`=?")
                    ->execute([$spRes['token'], $spRes['token']]);
            }

            $gatewayFee  = (float)($spRes['fee'] ?? (round($amount * ($nominalFeePercent / 100) + $nominalFeeFixed, 2)));
            $platformFee = $amount * ($user['commission_rate'] / 100);
            $netAmount   = max(0, $amount - $gatewayFee - $platformFee);

            saveTransaction($userId, $amount, $netAmount, $pixId, $pixCode, $qrImage, $callbackUrl, 'Cobrança LunarPay', $externalId, 'pix', $utmParams);

            if (class_exists('PushService')) {
                try { PushService::notifyUser($userId, '⚡ PIX Gerado!', 'Cobrança de R$ ' . number_format($amount, 2, ',', '.') . ' gerada.', 'sale_generated'); } catch (Throwable $e) {}
            }
            $txId = (int)$pdo->lastInsertId();
            try { TelegramService::notifyNewCharge($amount, $user['full_name'] ?? 'N/A', $txId); } catch (Throwable $e) {}
            if (class_exists('PushService')) {
                try { PushService::notifyAdmins('⚡ Nova Cobrança #' . $txId, 'R$ ' . number_format($amount, 2, ',', '.') . ' — ' . ($user['full_name'] ?? 'N/A'), 'info'); } catch (Throwable $e) {}
            }

            Response::success(['pix_id' => $pixId, 'qr_image' => $qrImage, 'pix_code' => $pixCode, 'amount' => $amount]);
        } else {
            $errMsg     = $spRes['message'] ?? ($spRes['errorCode'] ?? 'Erro de comunicação com o gateway');
            $errDetails = isset($spRes['details']) ? json_encode($spRes['details']) : '';
            write_log('error', "SigiloPay FALHA: HTTP=$spHttpCode | $errMsg | details=$errDetails | payload=" . json_encode($spPayload) . " | response=$spResponse");
            if ($spHttpCode === 403) {
                throw new Exception('Credenciais do gateway inválidas ou expiradas. Contate o administrador.');
            }
            throw new Exception('Erro ao processar pagamento: ' . $errMsg);
        }
    }

    // SigiloPay é o único gateway — se chegou aqui sem retornar, algo está errado
    throw new Exception('Erro inesperado no processamento do gateway.');

} catch (Throwable $e) {
    if (ob_get_level() > 0) ob_end_clean();
    write_log('error', 'Falha API Crítica: ' . $e->getMessage());
    
    $status = 400;
    if ($e->getCode() >= 400 && $e->getCode() < 600) $status = $e->getCode();
    
    Response::error($e->getMessage(), $status);
}
?>
