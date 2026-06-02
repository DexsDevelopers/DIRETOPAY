<?php
/**
 * EzzyBankingService - Integração com API Ezzy Banking
 * Documentação: https://doc.ezzybanking.com.br/
 * 
 * Funcionalidades:
 * - Geração de QR Code PIX (recebimento)
 * - Transferências PIX (envio)
 * - Consulta de transações
 * - Webhook para notificações
 */
class EzzyBankingService
{
    private static function getApiKey(): string
    {
        $stmt = (function_exists('pdo') ? pdo() : (function() {
            global $pdo;
            return $pdo;
        })())->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $stmt->execute(['ezzybanking_api_key']);
        return (string)($stmt->fetchColumn() ?: '');
    }

    private static function getApiSecret(): string
    {
        $stmt = (function_exists('pdo') ? pdo() : (function() {
            global $pdo;
            return $pdo;
        })())->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $stmt->execute(['ezzybanking_api_secret']);
        return (string)($stmt->fetchColumn() ?: '');
    }

    private static function getWebhookSecret(): string
    {
        $stmt = (function_exists('pdo') ? pdo() : (function() {
            global $pdo;
            return $pdo;
        })())->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $stmt->execute(['ezzybanking_webhook_secret']);
        return (string)($stmt->fetchColumn() ?: '');
    }

    private static function isEnabled(): bool
    {
        $stmt = (function_exists('pdo') ? pdo() : (function() {
            global $pdo;
            return $pdo;
        })())->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $stmt->execute(['ezzybanking_enabled']);
        return $stmt->fetchColumn() === '1';
    }

    private static function apiRequest(string $endpoint, array $data = [], string $method = 'POST'): array
    {
        if (!self::isEnabled()) {
            return ['ok' => false, 'error' => 'Ezzy Banking não habilitado'];
        }

        $apiKey = self::getApiKey();
        $apiSecret = self::getApiSecret();

        if (!$apiKey || !$apiSecret) {
            return ['ok' => false, 'error' => 'Credenciais Ezzy Banking não configuradas'];
        }

        $url = 'https://api.ezzybanking.com.br' . $endpoint;

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey,
                'X-API-Secret: ' . $apiSecret,
                'User-Agent: DiretoPay/2.0 (+https://diretopay.site)',
            ],
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return ['ok' => false, 'error' => 'cURL error: ' . $curlError];
        }

        $decoded = json_decode($response, true);

        if ($httpCode >= 200 && $httpCode < 300) {
            return ['ok' => true, 'data' => $decoded, 'http_code' => $httpCode];
        }

        return ['ok' => false, 'error' => $response, 'http_code' => $httpCode];
    }

    /**
     * Gerar QR Code PIX para recebimento
     * 
     * @param float $amount Valor em reais
     * @param string $externalId ID externo único
     * @param array $customer Dados do cliente (name, email, phone, document)
     * @param string $callbackUrl URL de webhook
     * @param string $description Descrição do pagamento
     * @return array
     */
    public static function createPixCharge(
        float $amount,
        string $externalId,
        array $customer,
        string $callbackUrl,
        string $description = 'Pagamento DiretoPay'
    ): array {
        $payload = [
            'amount' => $amount,
            'external_id' => $externalId,
            'description' => $description,
            'callback_url' => $callbackUrl,
            'customer' => [
                'name' => $customer['name'] ?? '',
                'email' => $customer['email'] ?? '',
                'phone' => $customer['phone'] ?? '',
                'document' => $customer['document'] ?? '',
            ],
        ];

        return self::apiRequest('/v1/pix/create', $payload, 'POST');
    }

    /**
     * Transferir PIX (enviar saldo)
     * 
     * @param string $pixKey Chave PIX do destinatário
     * @param float $amount Valor em reais
     * @param string $externalId ID externo único
     * @param string $description Descrição da transferência
     * @return array
     */
    public static function sendPixTransfer(
        string $pixKey,
        float $amount,
        string $externalId,
        string $description = 'Transferência DiretoPay'
    ): array {
        $payload = [
            'pix_key' => $pixKey,
            'amount' => $amount,
            'external_id' => $externalId,
            'description' => $description,
        ];

        return self::apiRequest('/v1/pix/transfer', $payload, 'POST');
    }

    /**
     * Consultar status de uma transação PIX
     * 
     * @param string $transactionId ID da transação
     * @return array
     */
    public static function getTransactionStatus(string $transactionId): array
    {
        return self::apiRequest('/v1/pix/status/' . $transactionId, [], 'GET');
    }

    /**
     * Consultar transação por external_id
     * 
     * @param string $externalId ID externo
     * @return array
     */
    public static function getTransactionByExternalId(string $externalId): array
    {
        return self::apiRequest('/v1/pix/external/' . $externalId, [], 'GET');
    }

    /**
     * Listar transações (com filtros opcionais)
     * 
     * @param array $filters Filtros: start_date, end_date, status, limit, offset
     * @return array
     */
    public static function listTransactions(array $filters = []): array
    {
        $endpoint = '/v1/pix/transactions';
        if (!empty($filters)) {
            $endpoint .= '?' . http_build_query($filters);
        }
        return self::apiRequest($endpoint, [], 'GET');
    }

    /**
     * Verificar assinatura do webhook
     * 
     * @param string $payload Corpo da requisição
     * @param string $signature Assinatura do header X-Signature
     * @return bool
     */
    public static function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $secret = self::getWebhookSecret();
        if (!$secret) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Obter saldo da conta Ezzy Banking
     * 
     * @return array
     */
    public static function getBalance(): array
    {
        return self::apiRequest('/v1/balance', [], 'GET');
    }

    /**
     * Obter informações da conta
     * 
     * @return array
     */
    public static function getAccountInfo(): array
    {
        return self::apiRequest('/v1/account', [], 'GET');
    }
}
