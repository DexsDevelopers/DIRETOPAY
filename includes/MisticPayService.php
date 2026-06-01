<?php
/**
 * MisticPayService — Integração com a API Mistic Pay
 * Autenticação: ci (Client ID) e cs (Client Secret) via headers HTTP
 * Docs: https://docs.misticpay.com/
 */
class MisticPayService
{
    const BASE_URL = 'https://api.misticpay.com/api';

    // ── Criar transação PIX (Cash-In) ──────────────────────────────────────────
    public static function createCharge(
        float  $amountBrl,
        string $externalId,
        array  $customer,
        string $description = 'Pagamento DiretoPay',
        string $webhookUrl  = ''
    ): array {
        $clientId     = defined('MISTICPAY_CLIENT_ID')     ? MISTICPAY_CLIENT_ID     : '';
        $clientSecret = defined('MISTICPAY_CLIENT_SECRET') ? MISTICPAY_CLIENT_SECRET : '';

        // Limpa o documento (CPF) - remover pontos, traços, etc.
        $cpf = preg_replace('/\D/', '', $customer['document'] ?? '');
        if (empty($cpf)) $cpf = '00000000000';
        $name = !empty($customer['name']) ? $customer['name'] : 'Cliente';

        $bodyData = [
            'amount'          => $amountBrl,
            'payerName'       => $name,
            'payerDocument'   => $cpf,
            'transactionId'   => $externalId,
            'description'     => $description,
        ];

        if (!empty($webhookUrl)) {
            $bodyData['projectWebhook'] = $webhookUrl;
        }

        $body = json_encode($bodyData, JSON_UNESCAPED_UNICODE);

        $url = self::BASE_URL . '/transactions/create';
        $ch  = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => [
                'ci: ' . $clientId,
                'cs: ' . $clientSecret,
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $raw      = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        return [
            'raw'        => $raw,
            'http_code'  => $httpCode,
            'curl_error' => $curlErr,
            'data'       => json_decode($raw ?: '{}', true) ?: [],
        ];
    }

    // ── Calcular taxa ─────────────────────────────────────────────────────────
    public static function calculateFee(float $amount, float $feePercent = 3.0, float $feeFixed = 0.50): float
    {
        return round($amount * ($feePercent / 100) + $feeFixed, 2);
    }

    // ── Consultar Informações do Usuário (Saldos) ──────────────────────────────
    public static function getUserInfo(): array {
        $clientId     = defined('MISTICPAY_CLIENT_ID')     ? MISTICPAY_CLIENT_ID     : '';
        $clientSecret = defined('MISTICPAY_CLIENT_SECRET') ? MISTICPAY_CLIENT_SECRET : '';

        if (empty($clientId) || empty($clientSecret)) {
            global $pdo;
            if (isset($pdo)) {
                $clientId = $pdo->query("SELECT `value` FROM settings WHERE `key`='misticpay_client_id'")->fetchColumn() ?: '';
                $clientSecret = $pdo->query("SELECT `value` FROM settings WHERE `key`='misticpay_client_secret'")->fetchColumn() ?: '';
            }
        }

        $url = self::BASE_URL . '/users/info';
        $ch  = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'ci: ' . $clientId,
                'cs: ' . $clientSecret,
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $raw      = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        return [
            'raw'        => $raw,
            'http_code'  => $httpCode,
            'curl_error' => $curlErr,
            'data'       => json_decode($raw ?: '{}', true) ?: [],
        ];
    }

    // ── Solicitar Saque PIX (Cash-Out) ──────────────────────────────────────────
    public static function requestWithdraw(
        float  $amount,
        string $pixKey,
        string $pixKeyType,
        string $description = 'Saque DiretoPay',
        string $webhookUrl  = ''
    ): array {
        $clientId     = defined('MISTICPAY_CLIENT_ID')     ? MISTICPAY_CLIENT_ID     : '';
        $clientSecret = defined('MISTICPAY_CLIENT_SECRET') ? MISTICPAY_CLIENT_SECRET : '';

        if (empty($clientId) || empty($clientSecret)) {
            global $pdo;
            if (isset($pdo)) {
                $clientId = $pdo->query("SELECT `value` FROM settings WHERE `key`='misticpay_client_id'")->fetchColumn() ?: '';
                $clientSecret = $pdo->query("SELECT `value` FROM settings WHERE `key`='misticpay_client_secret'")->fetchColumn() ?: '';
            }
        }

        // Limpa a chave se for CPF/CNPJ/Telefone para garantir compatibilidade
        $cleanPixKey = $pixKey;
        if (in_array(strtoupper($pixKeyType), ['CPF', 'CNPJ', 'TELEFONE'])) {
            $cleanPixKey = preg_replace('/\D/', '', $pixKey);
        }

        // Garante formato aceito de pixKeyType na Mistic Pay
        $typeMap = [
            'CPF'             => 'CPF',
            'CNPJ'            => 'CNPJ',
            'EMAIL'           => 'EMAIL',
            'TELEFONE'        => 'TELEFONE',
            'CHAVE_ALEATORIA' => 'CHAVE_ALEATORIA',
            'ALEATORIA'       => 'CHAVE_ALEATORIA',
            'E-MAIL'          => 'EMAIL',
            'PHONE'           => 'TELEFONE',
            'CELULAR'         => 'TELEFONE',
        ];
        $mappedType = $typeMap[strtoupper($pixKeyType)] ?? 'CHAVE_ALEATORIA';

        $bodyData = [
            'amount'      => $amount,
            'pixKey'      => $cleanPixKey,
            'pixKeyType'  => $mappedType,
            'description' => $description,
        ];

        if (!empty($webhookUrl)) {
            $bodyData['projectWebhook'] = $webhookUrl;
        }

        $body = json_encode($bodyData, JSON_UNESCAPED_UNICODE);

        $url = self::BASE_URL . '/transactions/withdraw';
        $ch  = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => [
                'ci: ' . $clientId,
                'cs: ' . $clientSecret,
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $raw      = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        return [
            'raw'        => $raw,
            'http_code'  => $httpCode,
            'curl_error' => $curlErr,
            'data'       => json_decode($raw ?: '{}', true) ?: [],
        ];
    }

    // ── Verificar Status da Transação ──────────────────────────────────────────
    public static function checkTransaction(string $transactionId): array {
        $clientId     = defined('MISTICPAY_CLIENT_ID')     ? MISTICPAY_CLIENT_ID     : '';
        $clientSecret = defined('MISTICPAY_CLIENT_SECRET') ? MISTICPAY_CLIENT_SECRET : '';

        if (empty($clientId) || empty($clientSecret)) {
            global $pdo;
            if (isset($pdo)) {
                $clientId = $pdo->query("SELECT `value` FROM settings WHERE `key`='misticpay_client_id'")->fetchColumn() ?: '';
                $clientSecret = $pdo->query("SELECT `value` FROM settings WHERE `key`='misticpay_client_secret'")->fetchColumn() ?: '';
            }
        }

        $body = json_encode(['transactionId' => $transactionId], JSON_UNESCAPED_UNICODE);

        $url = self::BASE_URL . '/transactions/check';
        $ch  = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST  => 'GET',
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => [
                'ci: ' . $clientId,
                'cs: ' . $clientSecret,
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $raw      = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        return [
            'raw'        => $raw,
            'http_code'  => $httpCode,
            'curl_error' => $curlErr,
            'data'       => json_decode($raw ?: '{}', true) ?: [],
        ];
    }
}
