<?php
/**
 * WhatsAppService — Envia mensagens via bridge Baileys local (whatsapp-bridge/index.js)
 * Sem Puppeteer, sem Chromium, sem mensalidade — 100% próprio.
 */
class WhatsAppService
{
    private static function divider(): string { return "━━━━━━━━━━━━━━━━━━━━"; }
    private static function footer(): string  { return "\n" . self::divider() . "\n🤖 _LunarPay • " . date('d/m/Y \à\s H:i') . "_"; }

    private static function getConfig(): array
    {
        global $pdo;
        static $cache = null;
        if ($cache !== null) return $cache;
        try {
            $keys = ['wa_bridge_url','wa_bridge_secret','wa_admin_phone',
                     'whatsapp_enabled','whatsapp_notify_sale','whatsapp_notify_withdrawal',
                     'whatsapp_notify_new_user','whatsapp_notify_user_sale'];
            $in   = implode(',', array_fill(0, count($keys), '?'));
            $stmt = $pdo->prepare("SELECT `key`, `value` FROM settings WHERE `key` IN ($in)");
            $stmt->execute($keys);
            $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            $cache = [
                'bridge_url'        => rtrim($rows['wa_bridge_url']                ?? 'http://127.0.0.1:3001', '/'),
                'bridge_secret'     => $rows['wa_bridge_secret']                   ?? '',
                'admin_phone'       => $rows['wa_admin_phone']                     ?? '',
                'enabled'           => ($rows['whatsapp_enabled']                  ?? '0') === '1',
                'notify_sale'       => ($rows['whatsapp_notify_sale']              ?? '1') !== '0',
                'notify_withdrawal' => ($rows['whatsapp_notify_withdrawal']        ?? '1') !== '0',
                'notify_new_user'   => ($rows['whatsapp_notify_new_user']          ?? '0') === '1',
                'notify_user_sale'  => ($rows['whatsapp_notify_user_sale']         ?? '1') !== '0',
            ];
        } catch (Throwable $e) {
            $cache = ['bridge_url' => 'http://127.0.0.1:3001', 'bridge_secret' => '', 'admin_phone' => '',
                      'enabled' => false, 'notify_sale' => true, 'notify_withdrawal' => true,
                      'notify_new_user' => false, 'notify_user_sale' => true];
        }
        return $cache;
    }

    /** Faz requisição ao bridge Baileys local */
    private static function request(string $method, string $path, array $body = []): array
    {
        $cfg  = self::getConfig();
        $url  = $cfg['bridge_url'] . '/' . ltrim($path, '/');
        $headers = ['Content-Type: application/json', 'Accept: application/json'];
        if (!empty($cfg['bridge_secret'])) $headers[] = 'X-Bridge-Secret: ' . $cfg['bridge_secret'];
        $ch = curl_init($url);
        $opts = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_TIMEOUT        => 8,
            CURLOPT_CONNECTTIMEOUT => 3,
        ];
        if ($method === 'POST') {
            $opts[CURLOPT_POST]       = true;
            $opts[CURLOPT_POSTFIELDS] = json_encode($body);
        }
        curl_setopt_array($ch, $opts);
        $raw  = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err  = curl_error($ch);
        curl_close($ch);
        if ($err) return ['ok' => false, 'error' => $err, 'http_code' => 0];
        $data = json_decode($raw ?: '{}', true) ?: [];
        $data['http_code'] = $code;
        return $data;
    }

    /** Envia mensagem via bridge Baileys */
    public static function send(string $phone, string $message): bool
    {
        $cfg = self::getConfig();
        if (!$cfg['enabled']) return false;
        $phone = self::formatPhone($phone);
        if (!$phone) return false;
        $res = self::request('POST', 'send', ['phone' => $phone, 'message' => $message]);
        return !empty($res['ok']);
    }

    /** Normaliza número para o padrão brasileiro */
    public static function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($phone) < 10) return '';
        if (strpos($phone, '55') !== 0) $phone = '55' . $phone;
        return $phone;
    }

    public static function sendAdmin(string $message): bool
    {
        $cfg = self::getConfig();
        if (empty($cfg['admin_phone'])) return false;
        return self::send($cfg['admin_phone'], $message);
    }

    public static function isEnabled(): bool
    {
        $cfg = self::getConfig();
        return $cfg['enabled'] && !empty($cfg['bridge_url']);
    }

    public static function getStatus(): array  { return self::request('GET', 'status'); }
    public static function getQrBase64(): string { return self::request('GET', 'qr')['qr'] ?? ''; }
    public static function disconnect(): array  { return self::request('GET', 'disconnect'); }

    public static function testConnection(string $phone): array
    {
        $ok = self::send($phone, "✅ *Teste LunarPay* — WhatsApp conectado!\n\n_" . date('d/m/Y H:i') . "_");
        return ['ok' => $ok, 'error' => $ok ? null : 'Bridge offline ou número inválido.'];
    }

    // ─── NOTIFICAÇÕES ────────────────────────────────────────────────────────

    /** Venda confirmada (notifica admin) */
    public static function notifySale(float $amount, float $netAmount, string $customerName, string $merchantName, int $transactionId, string $source = 'PIX'): bool
    {
        $cfg = self::getConfig();
        if (!$cfg['notify_sale']) return false;
        $gross = number_format($amount,    2, ',', '.');
        $net   = number_format($netAmount, 2, ',', '.');
        $fee   = number_format($amount - $netAmount, 2, ',', '.');
        $msg =
            "💰 *VENDA CONFIRMADA*\n" . self::divider() . "\n\n"
          . "💵 *Valor Bruto:*   R$ {$gross}\n"
          . "💎 *Valor Líquido:* R$ {$net}\n"
          . "📉 *Taxa Total:*    R$ {$fee}\n\n"
          . "👤 *Pagador:*    {$customerName}\n"
          . "🏪 *Vendedor:*   {$merchantName}\n"
          . "🔗 *Origem:*     {$source}\n"
          . "🆔 *TX:*         #{$transactionId}"
          . self::footer();
        return self::sendAdmin($msg);
    }

    /** Venda comemorativa para o próprio vendedor */
    public static function notifySaleToUser(string $phone, float $amount, float $netAmount, string $customerName, int $txId, string $checkoutName = ''): bool
    {
        $cfg = self::getConfig();
        if (!$cfg['notify_user_sale'] || !$cfg['enabled']) return false;
        $gross    = number_format($amount,    2, ',', '.');
        $net      = number_format($netAmount, 2, ',', '.');
        $fee      = number_format($amount - $netAmount, 2, ',', '.');
        $prodLine = $checkoutName ? "\n🛍 *Produto:* {$checkoutName}" : '';
        $celebs   = [
            "🔥 *PIX CAIU!* O cliente pagou e nem pediu desconto. Raro demais! 😂",
            "🤑 *Cliente pagou na hora.* Sem enrolação, sem negociação. O sonho! 🙌",
            "🚨 *ALERTA DE RIQUEZA:* saldo aumentou. Seu eu do passado ficaria com inveja. 📈",
            "💸 *O PIX caiu tão rápido* que o banco achou que era engano. Mas não era. É lucro! 😎",
            "🏆 *CONQUISTA DESBLOQUEADA:* mais uma venda. Próximo nível: série no Netflix! 🎬",
            "👻 *O cliente apareceu, pagou e sumiu.* Igual fantasma, mas o dinheiro ficou! 💰",
            "⚡ *PIX aprovado em tempo recorde.* Mais rápido que sua Wi-Fi! 😂",
            "🎯 *Venda confirmada.* Enquanto outros reclamam, você já faturou! 🔥",
        ];
        $celeb = $celebs[array_rand($celebs)];
        $msg   =
            "💰 {$celeb}\n" . self::divider() . "\n\n"
          . "💵 *Valor Bruto:*   R$ {$gross}\n"
          . "💎 *Você recebe:*   R$ {$net}\n"
          . "📉 *Taxa:*          R$ {$fee}\n"
          . "👤 *Cliente:* " . ($customerName ?: 'Anônimo') . $prodLine . "\n"
          . "🆔 *TX:* #{$txId}"
          . "\n\n🌙 _LunarPay • " . date('H:i') . "_";
        return self::send($phone, $msg);
    }

    /** Saque solicitado (notifica admin) */
    public static function notifyWithdrawal(string $userName, float $grossAmount, string $pixKey, float $platformFee = 3.50, float $sigiloFee = 0.00): bool
    {
        $cfg = self::getConfig();
        if (!$cfg['notify_withdrawal']) return false;
        $gross = number_format($grossAmount, 2, ',', '.');
        $net   = number_format($grossAmount - $platformFee - $sigiloFee, 2, ',', '.');
        $pFee  = number_format($platformFee, 2, ',', '.');
        $msg   =
            "🏦 *SAQUE SOLICITADO*\n" . self::divider() . "\n\n"
          . "👤 *Usuário:*       {$userName}\n"
          . "💵 *Valor Bruto:*   R$ {$gross}\n"
          . "💰 *Meu Lucro:*     R$ {$pFee}\n"
          . "💎 *Valor a Pagar:* R$ {$net}\n"
          . "🔑 *Chave PIX:* {$pixKey}\n\n"
          . "⚠️ _Aguardando aprovação manual._"
          . self::footer();
        return self::sendAdmin($msg);
    }

    /** Novo cadastro (notifica admin) */
    public static function notifyNewUser(string $name, string $email, string $ip = ''): bool
    {
        $cfg    = self::getConfig();
        if (!$cfg['notify_new_user']) return false;
        $ipLine = $ip ? "\n🌐 *IP:* {$ip}" : '';
        $msg    =
            "🆕 *NOVO CADASTRO*\n" . self::divider() . "\n\n"
          . "👤 *Nome:*   {$name}\n"
          . "📧 *E-mail:* {$email}"
          . $ipLine
          . self::footer();
        return self::sendAdmin($msg);
    }
}
