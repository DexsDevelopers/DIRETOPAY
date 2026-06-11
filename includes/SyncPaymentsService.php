<?php
class SyncPaymentsService
{
    const BASE_URL = 'https://api.syncpayments.com.br';

    private static function getCredentials(): array
    {
        global $pdo;
        $clientId = '31e87bbb-7aff-47cf-8537-9de170825ac9';
        $clientSecret = 'f41b988d-f79d-44f9-8c5d-d4ae1df423fc';
        if (isset($pdo)) {
            $dbId = $pdo->query("SELECT `value` FROM settings WHERE `key`='syncpayments_client_id'")->fetchColumn();
            $dbSecret = $pdo->query("SELECT `value` FROM settings WHERE `key`='syncpayments_client_secret'")->fetchColumn();
            if (!empty($dbId)) $clientId = trim($dbId);
            if (!empty($dbSecret)) $clientSecret = trim($dbSecret);
        }
        return [
            'client_id' => $clientId,
            'client_secret' => $clientSecret
        ];
    }

    public static function getWebhookSecret(): string
    {
        global $pdo;
        if (isset($pdo)) {
            return $pdo->query("SELECT `value` FROM settings WHERE `key`='syncpayments_webhook_secret'")->fetchColumn() ?: '';
        }
        return '';
    }

    public static function getAccessToken(): string
    {
        global $pdo;
        if (isset($pdo)) {
            $cachedToken = $pdo->query("SELECT `value` FROM settings WHERE `key`='syncpayments_access_token'")->fetchColumn();
            $expiresAtStr = $pdo->query("SELECT `value` FROM settings WHERE `key`='syncpayments_token_expires_at'")->fetchColumn();
            
            if (!empty($cachedToken) && !empty($expiresAtStr)) {
                if (strtotime($expiresAtStr) > (time() + 300)) {
                    return trim($cachedToken);
                }
            }
        }

        $creds = self::getCredentials();
        $headers = [
            'Content-Type: application/json',
            'Accept: application/json'
        ];
        $body = json_encode([
            'client_id' => $creds['client_id'],
            'client_secret' => $creds['client_secret']
        ]);

        $url = self::BASE_URL . '/api/partner/v1/auth-token';
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => true
        ]);
        $raw = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $res = json_decode($raw ?: '{}', true) ?: [];
        if ($httpCode === 200 && !empty($res['access_token'])) {
            $newToken = trim($res['access_token']);
            $expiresIn = (int)($res['expires_in'] ?? 3600);
            $expiresAtStr = date('Y-m-d H:i:s', time() + $expiresIn);

            if (isset($pdo)) {
                $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?");
                $stmt->execute(['syncpayments_access_token', $newToken, $newToken]);
                $stmt->execute(['syncpayments_token_expires_at', $expiresAtStr, $expiresAtStr]);
            }
            return $newToken;
        }

        throw new Exception("SyncPayments Authentication Failure (HTTP $httpCode).");
    }

    public static function createCharge(
        float  $amountBrl,
        string $externalId,
        array  $customer,
        string $description = 'Pagamento Nominal 6',
        string $callbackUrl  = ''
    ): array {
        try {
            $token = self::getAccessToken();
        } catch (Throwable $e) {
            return ['raw' => '', 'http_code' => 401, 'curl_error' => $e->getMessage(), 'data' => []];
        }

        $rawDoc = $customer['document'] ?? '';
        $doc = preg_replace('/[^0-9]/', '', (string)$rawDoc);
        if (strlen($doc) !== 11 && strlen($doc) !== 14) {
            $doc = '14714301624'; // CPF matemático válido
        }

        $name = !empty($customer['name']) ? trim($customer['name']) : 'Cliente';
        $email = trim($customer['email'] ?? '') ?: 'comprador@email.com';
        $phone = preg_replace('/\D/', '', $customer['phone'] ?? '') ?: '11999999999';

        $headers = [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
            'Accept: application/json'
        ];

        $bodyData = [
            'amount' => round($amountBrl, 2),
            'description' => $description,
            'client' => [
                'name' => $name,
                'cpf' => $doc,
                'email' => $email,
                'phone' => $phone
            ]
        ];

        if (!empty($callbackUrl)) {
            $bodyData['webhook_url'] = $callbackUrl;
        }

        $body = json_encode($bodyData, JSON_UNESCAPED_UNICODE);

        $ch = curl_init(self::BASE_URL . '/api/partner/v1/cash-in');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => true
        ]);
        $raw = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        $data = json_decode($raw ?: '{}', true) ?: [];
        if ($httpCode === 200 && is_array($data)) {
            $data['transaction_id'] = $data['identifier'] ?? '';
            $data['pix_code']       = $data['pix_code'] ?? '';
            $data['qr_code_image']  = '';
        }

        return ['raw' => $raw, 'http_code' => $httpCode, 'curl_error' => $curlErr, 'data' => $data];
    }

    public static function requestWithdraw(
        float  $amount,
        string $pixKey,
        string $pixKeyType,
        string $reference = ''
    ): array {
        try {
            $token = self::getAccessToken();
        } catch (Throwable $e) {
            return ['raw' => '', 'http_code' => 401, 'curl_error' => $e->getMessage(), 'data' => []];
        }

        $cleanPixKeyType = strtoupper(trim($pixKeyType));
        $typeMap = [
            'CPF' => 'CPF', 'CNPJ' => 'CNPJ', 'EMAIL' => 'EMAIL', 
            'TELEFONE' => 'PHONE', 'PHONE' => 'PHONE', 'CELULAR' => 'PHONE',
            'CHAVE_ALEATORIA' => 'EVP', 'ALEATORIA' => 'EVP', 'RANDOM' => 'EVP', 'EVP' => 'EVP'
        ];
        $mappedType = $typeMap[$cleanPixKeyType] ?? 'EVP';

        $cleanPixKey = trim($pixKey);
        if (in_array($mappedType, ['CPF', 'CNPJ', 'PHONE'])) {
            $cleanPixKey = preg_replace('/\D/', '', $pixKey);
        }

        $docType = 'cpf';
        $docNumber = '14714301624';
        $cleanDigits = preg_replace('/\D/', '', $cleanPixKey);
        if (strlen($cleanDigits) === 11 && ($mappedType === 'CPF' || $mappedType === 'EVP')) {
            $docType = 'cpf';
            $docNumber = $cleanDigits;
        } elseif (strlen($cleanDigits) === 14 && ($mappedType === 'CNPJ' || $mappedType === 'EVP')) {
            $docType = 'cnpj';
            $docNumber = $cleanDigits;
        }

        $headers = [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
            'Accept: application/json'
        ];

        $bodyData = [
            'amount' => round($amount, 2),
            'description' => !empty($reference) ? $reference : 'Saque Nominal 6',
            'pix_key_type' => $mappedType,
            'pix_key' => $cleanPixKey,
            'document' => [
                'type' => $docType,
                'number' => $docNumber
            ]
        ];

        $body = json_encode($bodyData, JSON_UNESCAPED_UNICODE);

        $ch = curl_init(self::BASE_URL . '/api/partner/v1/cash-out');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => true
        ]);
        $raw = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        return ['raw' => $raw, 'http_code' => $httpCode, 'curl_error' => $curlErr, 'data' => json_decode($raw ?: '{}', true) ?: []];
    }

    public static function getBalance(): array
    {
        try {
            $token = self::getAccessToken();
        } catch (Throwable $e) {
            return ['success' => false, 'raw' => '', 'http_code' => 401, 'curl_error' => $e->getMessage()];
        }

        $headers = [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ];

        $ch = curl_init(self::BASE_URL . '/api/partner/v1/balance');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => true
        ]);
        $raw = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        if ($httpCode === 200 && !empty($raw)) {
            $data = json_decode($raw, true);
            if (is_array($data) && isset($data['balance'])) {
                return [
                    'success'           => true,
                    'availableBalance'  => (float)$data['balance'],
                    'blockedBalance'    => 0.00,
                    'raw'               => $raw
                ];
            }
        }
        return ['success' => false, 'raw' => $raw, 'http_code' => $httpCode, 'curl_error' => $curlErr];
    }

    public static function verifyWebhookSignature(string $authHeader): bool
    {
        $secret = self::getWebhookSecret();
        if (empty($secret)) return true;
        if (empty($authHeader)) return false;
        $cleanHeader = trim(str_replace('Bearer', '', $authHeader));
        return hash_equals(trim($secret), $cleanHeader);
    }
}
