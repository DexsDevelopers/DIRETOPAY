<?php
/**
 * BRPixService — Integração com a API BRPix Solutions
 * Autenticação: HMAC-SHA256
 * Docs: https://docs.brpixsolutions.com/
 */
class BRPixService
{
    const BASE_URL = 'https://api.brpixsolutions.com';

    // ── Autenticação HMAC-SHA256 ───────────────────────────────────────────────
    private static function buildHeaders(string $method, string $path, string $body = ''): array
    {
        $publicKey = defined('BRPIX_CLIENT_ID')     ? BRPIX_CLIENT_ID     : '';
        $secretKey = defined('BRPIX_CLIENT_SECRET') ? BRPIX_CLIENT_SECRET : '';

        $timestamp = (string) time();
        $nonce     = bin2hex(random_bytes(16));
        $payload   = implode('|', [$method, $path, $timestamp, $nonce, $body]);
        $signature = hash_hmac('sha256', $payload, $secretKey);

        return [
            'X-API-Key: '    . $publicKey,
            'X-Timestamp: '  . $timestamp,
            'X-Nonce: '      . $nonce,
            'X-Signature: '  . $signature,
            'Content-Type: application/json',
            'Accept: application/json',
        ];
    }

    // ── Criar cobrança PIX (Cash-In) ──────────────────────────────────────────
    public static function createCharge(
        float  $amountBrl,
        string $externalId,
        string $description = 'Pagamento DiretoPay',
        int    $expiresIn   = 3600
    ): array {
        $amountCents = (int) round($amountBrl * 100);
        $body = json_encode([
            'amount'             => $amountCents,
            'description'        => $description,
            'external_id'        => $externalId,
            'external_reference' => $externalId,
            'expires_in'         => $expiresIn,
        ], JSON_UNESCAPED_UNICODE);

        $path = '/pix/cash-in';
        $ch   = curl_init(self::BASE_URL . $path);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => self::buildHeaders('POST', $path, $body),
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_IPRESOLVE      => CURL_IPRESOLVE_V4,
        ]);
        $raw      = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        $result = [
            'raw'        => $raw,
            'http_code'  => $httpCode,
            'curl_error' => $curlErr,
            'data'       => json_decode($raw ?: '{}', true) ?: [],
        ];

        // HTTP 202 — BRPix retorna QR code já na resposta inicial (qr_code_image + qr_code_text)
        if ($httpCode === 202) {
            $d = $result['data'];
            $hasQr = !empty($d['qr_code_image']) || !empty($d['qr_code_text']) || !empty($d['pix_copia_e_cola']);
            if ($hasQr) {
                return [
                    'raw'        => $result['raw'],
                    'http_code'  => 200,
                    'curl_error' => '',
                    'data'       => $d,
                ];
            }
            // Fallback: polling se QR não vier na resposta 202
            $txid = $d['txid'] ?? ($d['id'] ?? null);
            if ($txid) {
                for ($i = 0; $i < 6; $i++) {
                    sleep(2);
                    $poll = self::getCharge($txid);
                    $pd   = $poll['data'];
                    if (!empty($pd['pix']['qr_code']) || !empty($pd['pix']['qr_code_image']) || !empty($pd['qr_code']) || !empty($pd['qr_code_image']) || !empty($pd['qr_code_text']) || !empty($pd['br_code'])) {
                        return [
                            'raw'        => $poll['raw'],
                            'http_code'  => 200,
                            'curl_error' => '',
                            'data'       => $pd,
                        ];
                    }
                }
            }
        }

        return $result;
    }

    // ── Buscar cobrança por txid (polling para async 202) ────────────────────
    public static function getCharge(string $txid): array
    {
        $path = '/pix/charge/' . $txid;
        $ch   = curl_init(self::BASE_URL . $path);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => self::buildHeaders('GET', $path, ''),
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_IPRESOLVE      => CURL_IPRESOLVE_V4,
        ]);
        $raw      = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [
            'raw'       => $raw,
            'http_code' => $httpCode,
            'data'      => json_decode($raw ?: '{}', true) ?: [],
        ];
    }

    // ── Verificar assinatura do webhook ───────────────────────────────────────
    public static function verifyWebhookSignature(string $rawBody, string $signature, string $secret): bool
    {
        if (empty($secret)) return true; // sem secret configurado, aceita (log de aviso feito no webhook)
        $expected = hash_hmac('sha256', $rawBody, $secret);
        return hash_equals($expected, $signature);
    }

    // ── Calcular taxa do gateway ──────────────────────────────────────────────
    public static function calculateFee(float $amount, float $feePercent = 8.0, float $feeFixed = 0.99): float
    {
        return round($amount * ($feePercent / 100) + $feeFixed, 2);
    }
}
