<?php
/**
 * EzzyBankingService — Integração com API Ezzy Banking
 *
 * Documentação oficial: https://doc.ezzybanking.com.br/
 * Base URL: https://ws.ezzybanking.com.br
 *
 * Autenticação: headers  ci: CLIENT_ID  +  cs: CLIENT_SECRET
 * (no painel: INTEGRAÇÃO VIA API → Obter chave)
 *
 * Endpoints confirmados:
 *   POST /api/v1/gateway/request-qrcode   → gerar QR Code PIX
 *   POST /api/v1/gateway/transfer-pix     → transferência PIX (saque)
 *
 * Campos do body:
 *   QR Code → valor (float), expiracao (int, seg), callbackUrl, devedor{cpf|cnpj, nome}
 *   Transfer → valor (float), pixKey (string), callbackUrl (string)
 *
 * Nota: api_key salvo no banco mapeia para "ci" (Client ID)
 *       api_secret salvo no banco mapeia para "cs" (Client Secret)
 */
class EzzyBankingService
{
    private const BASE_URL = 'https://ws.ezzybanking.com.br';

    // ─── Credenciais ───────────────────────────────────────────────────────────

    private static function getClientId(): string
    {
        global $pdo;
        $stmt = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = 'ezzybanking_api_key'");
        $stmt->execute();
        return (string)($stmt->fetchColumn() ?: '');
    }

    private static function getClientSecret(): string
    {
        global $pdo;
        $stmt = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = 'ezzybanking_api_secret'");
        $stmt->execute();
        return (string)($stmt->fetchColumn() ?: '');
    }

    private static function getWebhookSecret(): string
    {
        global $pdo;
        $stmt = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = 'ezzybanking_webhook_secret'");
        $stmt->execute();
        return (string)($stmt->fetchColumn() ?: '');
    }

    public static function isEnabled(): bool
    {
        global $pdo;
        $stmt = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = 'ezzybanking_enabled'");
        $stmt->execute();
        return $stmt->fetchColumn() === '1';
    }

    // ─── HTTP ──────────────────────────────────────────────────────────────────

    /**
     * Executa requisição autenticada para a API Ezzy Banking.
     * Autenticação via headers  ci  (Client ID) e  cs  (Client Secret).
     */
    private static function apiRequest(string $endpoint, array $data = [], string $method = 'POST'): array
    {
        if (!self::isEnabled()) {
            return ['ok' => false, 'error' => 'Ezzy Banking não habilitado'];
        }

        $ci = self::getClientId();
        $cs = self::getClientSecret();

        if (!$ci || !$cs) {
            return ['ok' => false, 'error' => 'Credenciais Ezzy Banking não configuradas (ci/cs)'];
        }

        $url = self::BASE_URL . $endpoint;

        $ch = curl_init($url);
        $headers = [
            'ci: ' . $ci,
            'cs: ' . $cs,
            'Content-Type: application/json',
            'User-Agent: DiretoPay/2.0 (+https://diretopay.site)',
        ];

        $curlOpts = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ];

        if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
            $curlOpts[CURLOPT_CUSTOMREQUEST] = $method;
            $curlOpts[CURLOPT_POSTFIELDS]    = json_encode($data);
        } else {
            $curlOpts[CURLOPT_CUSTOMREQUEST] = $method;
            if (!empty($data)) {
                $url .= (strpos($url, '?') === false ? '?' : '&') . http_build_query($data);
                curl_setopt($ch, CURLOPT_URL, $url);
            }
        }

        curl_setopt_array($ch, $curlOpts);

        $response  = curl_exec($ch);
        $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return ['ok' => false, 'error' => 'cURL error: ' . $curlError, 'http_code' => 0];
        }

        $decoded = json_decode($response, true);
        $jsonError = json_last_error_msg();

        if ($httpCode >= 200 && $httpCode < 300) {
            if ($decoded === null && !empty($response)) {
                // Resposta não é JSON válido mas HTTP foi sucesso (ex: servidor retornou HTML)
                return ['ok' => false, 'error' => 'Resposta inválida da API (não é JSON): ' . $jsonError, 'http_code' => $httpCode];
            }
            return ['ok' => true, 'data' => $decoded ?? [], 'http_code' => $httpCode];
        }

        $errMsg = (is_array($decoded) && !empty($decoded['error']))
            ? $decoded['error']
            : ($response ?: "HTTP $httpCode");

        return ['ok' => false, 'error' => $errMsg, 'data' => $decoded, 'http_code' => $httpCode];
    }

    // ─── PIX — Recebimento ─────────────────────────────────────────────────────

    /**
     * Gerar QR Code PIX para recebimento.
     *
     * Endpoint: POST /api/v1/gateway/request-qrcode
     *
     * Body enviado:
     *   valor      (float)  — valor em reais  ex: 29.90
     *   expiracao  (int)    — expiração em segundos  ex: 3600
     *   callbackUrl (string) — URL do seu webhook
     *   devedor    (object)
     *     cpf|cnpj (string) — documento sem máscara
     *     nome     (string) — nome do pagador
     *
     * Resposta esperada contém os campos do QR Code gerado.
     * Campos mapeados: txid, pixCopiaECola, imagemQrcode (base64), valor, expiracao.
     */
    public static function createPixCharge(
        float  $amount,
        string $externalId,
        array  $customer,
        string $callbackUrl,
        string $description = 'Pagamento DiretoPay',
        ?string $acquirer = null
    ): array {
        $doc  = preg_replace('/\D/', '', $customer['document'] ?? '');
        $nome = trim($customer['name'] ?? 'Cliente');

        // Detecta CPF (11 dígitos) ou CNPJ (14 dígitos)
        $devedorDoc = (strlen($doc) === 14) ? ['cnpj' => $doc] : ['cpf' => $doc ?: '00000000000'];

        $payload = [
            'valor'       => round($amount, 2),
            'expiracao'   => 3600,          // 1 hora
            'callbackUrl' => $callbackUrl,
            'devedor'     => array_merge($devedorDoc, ['nome' => $nome]),
        ];

        // externalId não está na doc oficial, mas pode ser aceito como campo adicional
        if ($externalId) {
            $payload['externalId'] = $externalId;
        }

        $acquirer = trim((string)($acquirer ?? ''));
        if ($acquirer !== '') {
            // A Ezzy pode aceitar nomes diferentes conforme a versão/tenant.
            // Enviamos apenas o campo principal escolhido pelo sistema.
            $payload['acquirer'] = $acquirer;
        }

        $result = self::apiRequest('/api/v1/gateway/request-qrcode', $payload, 'POST');

        // Normaliza a resposta para campos internos padronizados pelo DiretoPay
        if ($result['ok'] && is_array($result['data'])) {
            $d = $result['data'];
            $result['data'] = array_merge($d, [
                // IDs — tenta vários nomes que a API pode usar
                'transaction_id' => $d['txid']          ?? ($d['id']            ?? ($d['transactionId'] ?? ($externalId ?: ''))),
                // PIX copia-e-cola
                'pix_code'       => $d['pixCopiaECola'] ?? ($d['pix_code']      ?? ($d['copiaECola']    ?? ($d['brCode'] ?? ''))),
                // Imagem base64 do QR Code
                'qr_code_image'  => $d['imagemQrcode']  ?? ($d['qr_code_image'] ?? ($d['qrCodeImage']   ?? '')),
            ]);
        }

        return $result;
    }

    // ─── PIX — Envio / Saque ───────────────────────────────────────────────────

    /**
     * Transferir PIX (enviar / sacar).
     *
     * Endpoint: POST /api/v1/gateway/transfer-pix
     *
     * Body enviado:
     *   valor       (float)  — valor em reais
     *   pixKey      (string) — chave PIX do destinatário (CPF, CNPJ, email, telefone, aleatória)
     *   callbackUrl (string) — URL do seu webhook
     *
     * Resposta: id, endToEndId, pixKey, payment.amount, message, status
     */
    public static function sendPixTransfer(
        string $pixKey,
        float  $amount,
        string $externalId   = '',
        string $description  = 'Transferência DiretoPay',
        string $callbackUrl  = ''
    ): array {
        $payload = [
            'valor'       => round($amount, 2),
            'pixKey'      => $pixKey,
            'callbackUrl' => $callbackUrl ?: '',
        ];

        return self::apiRequest('/api/v1/gateway/transfer-pix', $payload, 'POST');
    }

    // ─── Webhook ───────────────────────────────────────────────────────────────

    /**
     * Verifica assinatura HMAC-SHA256 do webhook.
     * Usa o  Webhook Secret  configurado nas settings.
     * Retorna true se válido ou se nenhum secret estiver configurado
     * (gateway sem secret = aceita todos — menos seguro, mas não quebra).
     */
    public static function verifyWebhookSignature(string $rawPayload, string $signature): bool
    {
        $secret = self::getWebhookSecret();
        if (!$secret) {
            return true; // sem secret configurado → não valida
        }
        if (!$signature) {
            return false;
        }
        $expected = hash_hmac('sha256', $rawPayload, $secret);
        return hash_equals($expected, ltrim($signature, 'sha256='));
    }

    // ─── Consultas ─────────────────────────────────────────────────────────────

    /**
     * Consultar saldo da conta.
     * Tenta múltiplos endpoints conhecidos com fallback.
     * Se nenhum funcionar, retorna erro.
     */
    public static function getBalance(): array
    {
        // Lista de endpoints para tentar (em ordem de preferência)
        $endpoints = [
            '/api/v1/account/balance',
            '/api/v1/account',           // alternativa: dados da conta incluem saldo
            '/api/v1/balance',
            '/api/v1/saldo',
        ];

        $lastError = null;

        foreach ($endpoints as $endpoint) {
            $result = self::apiRequest($endpoint, [], 'GET');

            if (!$result['ok']) {
                $lastError = $result['error'] ?? 'Falha desconhecida';
                continue; // Tenta próximo endpoint
            }

            // Normaliza campos de saldo para exibição no dashboard
            if (!is_array($result['data'])) {
                $lastError = 'Resposta da API não é um array';
                continue;
            }

            $d = $result['data'];
            $result['data']['available_balance'] = (float)(
                $d['saldoDisponivel'] ?? $d['available_balance'] ?? $d['balance'] ?? $d['available'] ?? 0
            );
            $result['data']['blocked_balance'] = (float)(
                $d['saldoBloqueado'] ?? $d['blocked_balance'] ?? $d['blocked'] ?? 0
            );
            $result['data']['name'] = $d['nome'] ?? $d['name'] ?? $d['accountName'] ?? $d['nomeCompleto'] ?? '';

            return $result;
        }

        // Se chegou aqui, nenhum endpoint funcionou
        return ['ok' => false, 'error' => $lastError ?? 'Não foi possível obter saldo da conta Ezzy Banking', 'data' => null];
    }

    /**
     * Informações da conta (nome, documento, banco).
     */
    public static function getAccountInfo(): array
    {
        return self::apiRequest('/api/v1/account', [], 'GET');
    }

    /**
     * Lista adquirentes disponíveis na conta Ezzy.
     * Tenta múltiplos endpoints conhecidos e normaliza a resposta.
     */
    public static function listAcquirers(): array
    {
        $paths = [
            '/api/v1/acquirers',
            '/api/v1/adquirente',
            '/api/v1/my-acquirer',
            '/api/v1/account/acquirers',
            '/api/v1/gateway/adquirentes',
            '/api/v1/gateway/acquirer',
        ];

        foreach ($paths as $path) {
            $res = self::apiRequest($path, [], 'GET');
            if (!$res['ok'] || !is_array($res['data'])) {
                continue;
            }

            $items = self::normalizeAcquirers($res['data']);
            if (!empty($items)) {
                return ['ok' => true, 'data' => $items, 'source' => $path, 'http_code' => $res['http_code'] ?? 200];
            }
        }

        return ['ok' => false, 'error' => 'Nenhuma lista de adquirentes disponível na API Ezzy Banking'];
    }

    private static function normalizeAcquirers(array $data): array
    {
        $candidates = [];

        if (isset($data[0]) && is_array($data[0])) {
            $candidates = $data;
        } else {
            foreach (['data', 'items', 'acquirers', 'adquirentes', 'results'] as $key) {
                if (!empty($data[$key]) && is_array($data[$key])) {
                    $candidates = $data[$key];
                    break;
                }
            }
        }

        $normalized = [];
        foreach ($candidates as $item) {
            if (!is_array($item)) continue;
            $code = trim((string)($item['code'] ?? $item['name'] ?? $item['slug'] ?? $item['adquirente'] ?? $item['acquirer'] ?? ''));
            $label = trim((string)($item['label'] ?? $item['name'] ?? $item['title'] ?? $code));
            if ($code === '') continue;
            $normalized[] = ['code' => $code, 'label' => $label];
        }

        // fallback para respostas simples: lista de strings
        if (empty($normalized) && isset($data[0]) && is_string($data[0])) {
            foreach ($data as $item) {
                $code = trim((string)$item);
                if ($code === '') continue;
                $normalized[] = ['code' => $code, 'label' => $code];
            }
        }

        $seen = [];
        $unique = [];
        foreach ($normalized as $item) {
            if (isset($seen[$item['code']])) continue;
            $seen[$item['code']] = true;
            $unique[] = $item;
        }

        return $unique;
    }
}
