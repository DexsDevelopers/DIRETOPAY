<?php
/**
 * UtmifyService.php — Envia eventos de conversão para a UTMify
 *
 * Endpoint oficial: POST https://api.utmify.com.br/api-credentials/orders
 * Docs: https://utmify.help.center
 *
 * Cada vendedor tem seu próprio token UTMify cadastrado no perfil (utmify_api_token).
 */
class UtmifyService
{
    private const ENDPOINT = 'https://api.utmify.com.br/api-credentials/orders';

    /**
     * Dispara o evento de venda aprovada para a UTMify.
     *
     * @param string      $apiToken         Token x-api-token do vendedor (perfil)
     * @param array       $transaction      Linha da tabela transactions
     * @param array       $product          Dados do produto (id, name, price)
     * @param array|null  $customer         ['name', 'email', 'phone', 'document']
     * @param bool        $isTest           true apenas em testes manuais
     */
    public static function notifySale(
        string $apiToken,
        array  $transaction,
        array  $product     = [],
        array  $customer    = [],
        bool   $isTest      = false
    ): array {
        if (empty($apiToken)) {
            return ['success' => false, 'error' => 'Token UTMify não configurado'];
        }

        $amountCents    = (int)round((float)($transaction['amount_brl']     ?? 0) * 100);
        $netCents       = (int)round((float)($transaction['amount_net_brl'] ?? 0) * 100);
        $gatewayFee     = max(0, $amountCents - $netCents);

        // Normaliza método de pagamento para os valores aceitos pela UTMify
        $rawMethod      = strtolower($transaction['type'] ?? 'pix');
        $methodMap      = ['pix' => 'pix', 'credit_card' => 'credit_card', 'boleto' => 'boleto', 'card' => 'credit_card'];
        $paymentMethod  = $methodMap[$rawMethod] ?? 'pix';

        // UTMify exige formato ISO 8601
        $toIso = fn($dt) => $dt ? date('Y-m-d\TH:i:s', strtotime($dt)) : date('Y-m-d\TH:i:s');
        $createdAt  = $toIso($transaction['created_at']  ?? null);
        $approvedAt = $toIso($transaction['updated_at']  ?? null);

        // Produto
        $productId      = (string)($product['id']    ?? $transaction['id'] ?? '0');
        $productName    = $product['name']            ?? 'Produto LunarPay';
        $planId         = (string)($product['plan_id'] ?? $productId);
        $planName       = $product['plan_name']       ?? $productName;

        // Tracking UTMs (vindos das colunas da transação)
        $trackingParams = [
            'sck'          => self::nullOrStr($transaction['utm_sck']      ?? null),
            'src'          => self::nullOrStr($transaction['utm_src']      ?? null),
            'utm_term'     => self::nullOrStr($transaction['utm_term']     ?? null),
            'utm_medium'   => self::nullOrStr($transaction['utm_medium']   ?? null),
            'utm_source'   => self::nullOrStr($transaction['utm_source']   ?? null),
            'utm_content'  => self::nullOrStr($transaction['utm_content']  ?? null),
            'utm_campaign' => self::nullOrStr($transaction['utm_campaign'] ?? null),
        ];

        $payload = [
            'isTest'        => $isTest,
            'status'        => 'paid',
            'orderId'       => (string)($transaction['pix_id'] ?? $transaction['id']),
            'platform'      => 'LunarPay',
            'createdAt'     => $createdAt,
            'approvedDate'  => $approvedAt,
            'refundedAt'    => null,
            'paymentMethod' => $paymentMethod,
            'customer'      => [
                'name'     => $customer['name']     ?? ($transaction['customer_name'] ?? 'Cliente'),
                'email'    => $customer['email']    ?? '',
                'phone'    => $customer['phone']    ?? null,
                'country'  => 'BR',
                'document' => $customer['document'] ?? null,
            ],
            'products' => [[
                'id'            => $productId,
                'name'          => $productName,
                'planId'        => $planId,
                'planName'      => $planName,
                'quantity'      => 1,
                'priceInCents'  => $amountCents,
            ]],
            'commission' => [
                'totalPriceInCents'       => $amountCents,
                'gatewayFeeInCents'       => $gatewayFee,
                'userCommissionInCents'   => $netCents,
            ],
            'trackingParameters' => $trackingParams,
        ];

        return self::post($apiToken, $payload);
    }

    /**
     * Notifica reembolso/estorno para a UTMify.
     */
    public static function notifyRefund(string $apiToken, array $transaction): array
    {
        if (empty($apiToken)) {
            return ['success' => false, 'error' => 'Token UTMify não configurado'];
        }

        $payload = [
            'isTest'        => false,
            'status'        => 'refunded',
            'orderId'       => (string)($transaction['pix_id'] ?? $transaction['id']),
            'platform'      => 'LunarPay',
            'createdAt'     => $transaction['created_at']  ?? date('Y-m-d H:i:s'),
            'approvedDate'  => $transaction['updated_at']  ?? date('Y-m-d H:i:s'),
            'refundedAt'    => date('Y-m-d H:i:s'),
            'paymentMethod' => 'pix',
            'customer'      => ['name' => $transaction['customer_name'] ?? '', 'email' => '', 'phone' => null, 'country' => 'BR', 'document' => null],
            'products'      => [['id' => '0', 'name' => 'Produto LunarPay', 'planId' => '0', 'planName' => 'Produto', 'quantity' => 1, 'priceInCents' => (int)round((float)($transaction['amount_brl'] ?? 0) * 100)]],
            'commission'    => ['totalPriceInCents' => 0, 'gatewayFeeInCents' => 0, 'userCommissionInCents' => 0],
            'trackingParameters' => ['sck' => null, 'src' => null, 'utm_term' => null, 'utm_medium' => null, 'utm_source' => null, 'utm_content' => null, 'utm_campaign' => null],
        ];

        return self::post($apiToken, $payload);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static function nullOrStr(?string $value): ?string
    {
        return (isset($value) && $value !== '') ? $value : null;
    }

    private static function post(string $apiToken, array $payload): array
    {
        $ch = curl_init(self::ENDPOINT);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'x-api-token: ' . $apiToken,
                'User-Agent: LunarPay/1.0',
            ],
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $body     = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        $success = $httpCode >= 200 && $httpCode < 300;

        if (function_exists('write_log')) {
            write_log($success ? 'INFO' : 'WARNING', 'UTMify notify', [
                'http_code'   => $httpCode,
                'response'    => substr($body ?: '', 0, 500),
                'curl_err'    => $curlErr ?: null,
                'order_id'    => $payload['orderId'],
                'customer_email' => $payload['customer']['email'] ?? '',
                'payload_json'   => substr(json_encode($payload), 0, 800),
            ]);
        }

        return [
            'success'   => $success,
            'http_code' => $httpCode,
            'response'  => $body,
            'error'     => $curlErr ?: null,
        ];
    }
}
