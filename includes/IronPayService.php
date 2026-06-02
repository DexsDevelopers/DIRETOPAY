<?php
/**
 * IronPayService — Integração com a API IronPay
 * Autenticação: api_token via query parameter
 * Docs: https://docs.ironpayapp.com.br/
 */
class IronPayService
{
    const BASE_URL = 'https://api.ironpayapp.com.br/api/public/v1';

    // ── Criar transação PIX ───────────────────────────────────────────────────
    public static function createCharge(
        float  $amountBrl,
        string $externalId,
        array  $customer,
        string $description = 'Pagamento DiretoPay',
        int    $expireDays  = 1
    ): array {
        $token       = defined('IRONPAY_TOKEN')        ? IRONPAY_TOKEN        : '';
        $offerHash   = defined('IRONPAY_OFFER_HASH')   ? IRONPAY_OFFER_HASH   : '';
        $productHash = defined('IRONPAY_PRODUCT_HASH') ? IRONPAY_PRODUCT_HASH : '';

        $amountCents = (int) round($amountBrl * 100);

        $phone = preg_replace('/\D/', '', $customer['phone'] ?? '');
        if (empty($phone)) $phone = '11900000000';
        $cpf = preg_replace('/\D/', '', $customer['document'] ?? '');
        if (empty($cpf)) $cpf = '00000000000';
        $name  = !empty($customer['name'])  ? $customer['name']  : 'Cliente';
        $email = !empty($customer['email']) ? $customer['email'] : 'cliente@diretopay.site';

        $body = json_encode([
            'amount'              => $amountCents,
            'offer_hash'          => $offerHash,
            'payment_method'      => 'pix',
            'installments'        => 1,
            'expire_in_days'      => $expireDays,
            'transaction_origin'  => 'api',
            'postback_url'        => 'https://diretopay.site/ironpay_webhook.php',
            'customer' => [
                'name'         => $name,
                'email'        => $email,
                'phone_number' => $phone,
                'document'     => $cpf,
            ],
            'cart' => [[
                'product_hash'   => $productHash,
                'title'          => $description,
                'cover'          => null,
                'price'          => $amountCents,
                'quantity'       => 1,
                'operation_type' => 1,
                'tangible'       => false,
            ]],
            'tracking' => [
                'src'          => '',
                'utm_source'   => 'api',
                'utm_medium'   => 'diretopay',
                'utm_campaign' => $externalId,
                'utm_term'     => '',
                'utm_content'  => '',
            ],
        ], JSON_UNESCAPED_UNICODE);

        $url = self::BASE_URL . '/transactions?api_token=' . urlencode($token);
        $ch  = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
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
    public static function calculateFee(float $amount, float $feePercent = 8.0, float $feeFixed = 0.99): float
    {
        return round($amount * ($feePercent / 100) + $feeFixed, 2);
    }
}
