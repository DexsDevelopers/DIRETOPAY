<?php
/**
 * WhatsAppService — Envia mensagens via bridge Baileys local com suporte a failover de múltiplos números.
 * Sem Puppeteer, sem Chromium, sem mensalidade — 100% próprio.
 */
class WhatsAppService
{
    private static function divider(): string { return "━━━━━━━━━━━━━━━━━━━━"; }
    private static function footer(): string  { return "\n" . self::divider() . "\n🤖 _DiretoPay • " . date('d/m/Y \à\s H:i') . "_"; }

    private static function checkAndMigrateInstances()
    {
        global $pdo;
        static $checked = false;
        if ($checked) return;
        $checked = true;
        
        try {
            $count = (int)$pdo->query("SELECT COUNT(*) FROM whatsapp_instances")->fetchColumn();
            if ($count === 0) {
                // Tenta ler a configuração antiga
                $s = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = 'wa_bridge_url'");
                $s->execute();
                $oldUrl = $s->fetchColumn();
                
                if (!empty($oldUrl)) {
                    $s2 = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = 'wa_bridge_secret'");
                    $s2->execute();
                    $oldSecret = $s2->fetchColumn() ?: '';
                    
                    // Insere como instância padrão
                    $stmt = $pdo->prepare("INSERT INTO whatsapp_instances (name, bridge_url, bridge_secret, priority, is_active) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute(['Instância Padrão', rtrim($oldUrl, '/'), $oldSecret, 0, 1]);
                }
            }
        } catch (Throwable $e) {
            // Ignora se der erro
        }
    }

    private static function getConfig(): array
    {
        global $pdo;
        static $cache = null;
        if ($cache !== null) return $cache;
        self::checkAndMigrateInstances();
        try {
            $keys = ['wa_admin_phone',
                     'whatsapp_enabled','whatsapp_notify_sale','whatsapp_notify_withdrawal',
                     'whatsapp_notify_new_user','whatsapp_notify_user_sale'];
            $in   = implode(',', array_fill(0, count($keys), '?'));
            $stmt = $pdo->prepare("SELECT `key`, `value` FROM settings WHERE `key` IN ($in)");
            $stmt->execute($keys);
            $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            $cache = [
                'admin_phone'       => $rows['wa_admin_phone']                     ?? '',
                'enabled'           => ($rows['whatsapp_enabled']                  ?? '0') === '1',
                'notify_sale'       => ($rows['whatsapp_notify_sale']              ?? '1') !== '0',
                'notify_withdrawal' => ($rows['whatsapp_notify_withdrawal']        ?? '1') !== '0',
                'notify_new_user'   => ($rows['whatsapp_notify_new_user']          ?? '0') === '1',
                'notify_user_sale'  => ($rows['whatsapp_notify_user_sale']         ?? '1') !== '0',
            ];
        } catch (Throwable $e) {
            $cache = ['admin_phone' => '',
                      'enabled' => false, 'notify_sale' => true, 'notify_withdrawal' => true,
                      'notify_new_user' => false, 'notify_user_sale' => true];
        }
        return $cache;
    }

    /** Faz requisição a uma instância específica do bridge Baileys */
    private static function requestToInstance(string $method, string $path, array $body, array $instance): array
    {
        $url = rtrim($instance['bridge_url'], '/') . '/' . ltrim($path, '/');
        $headers = ['Content-Type: application/json', 'Accept: application/json'];
        if (!empty($instance['bridge_secret'])) {
            $headers[] = 'X-Bridge-Secret: ' . $instance['bridge_secret'];
        }
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

    public static function updateInstanceStatus(int $id, string $status, ?string $phone, ?string $error)
    {
        global $pdo;
        try {
            $stmt = $pdo->prepare("UPDATE whatsapp_instances SET status = ?, phone = ?, last_error = ? WHERE id = ?");
            $stmt->execute([$status, $phone, $error, $id]);
        } catch (Throwable $e) {
            // Ignora
        }
    }

    /** Envia mensagem via bridge Baileys — Failover transparente */
    public static function send(string $phone, string $message): bool
    {
        global $pdo;
        $cfg = self::getConfig();
        if (!$cfg['enabled']) return false;
        
        $phone = self::formatPhone($phone);
        if (!$phone) return false;
        
        self::checkAndMigrateInstances();
        
        try {
            $stmt = $pdo->query("SELECT * FROM whatsapp_instances WHERE is_active = 1 ORDER BY priority ASC, id ASC");
            $instances = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            return false;
        }
        
        if (empty($instances)) {
            return false;
        }
        
        foreach ($instances as $inst) {
            $res = self::requestToInstance('POST', 'send', ['phone' => $phone, 'message' => $message], $inst);
            
            if (!empty($res['ok'])) {
                $connectedPhone = $res['senderPhone'] ?? ($inst['phone'] ?: null);
                if ($inst['status'] !== 'connected' || $inst['phone'] !== $connectedPhone) {
                    self::updateInstanceStatus((int)$inst['id'], 'connected', $connectedPhone, null);
                }
                return true;
            } else {
                $errorMsg = $res['error'] ?? ('Erro HTTP ' . ($res['http_code'] ?? 'desconhecido'));
                self::updateInstanceStatus((int)$inst['id'], 'disconnected', null, $errorMsg);
            }
        }
        
        return false;
    }

    /** Normaliza número para o padrão brasileiro */
    public static function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($phone) < 10) return '';
        if (strpos($phone, '55') !== 0) $phone = '55' . $phone;
        return $phone;
    }

    /** Envia mensagem de boas-vindas personalizada */
    public static function sendWelcomeMessage(string $phone, string $name): bool
    {
        $firstName = explode(' ', trim($name))[0] ?: 'Vendedor';
        $msg = 
            "👋 *Olá, {$firstName}!* Seja muito bem-vindo(a) à *DiretoPay*! 🚀\n\n"
          . "Seu número de WhatsApp foi vinculado com sucesso para receber notificações em tempo real.\n\n"
          . "💡 *Confira nossas principais funcionalidades:*\n"
          . "💰 *Notificação de Vendas:* Receba alertas comemorativos e detalhes de cada venda realizada diretamente no seu WhatsApp!\n"
          . "🏦 *Status de Saques:* Acompanhe a solicitação e a confirmação de depósitos de seus saques.\n"
          . "🛒 *Checkout de Alta Conversão:* Crie checkouts personalizados e impulsione suas vendas.\n\n"
          . "Ficamos muito felizes em ter você conosco! Boas vendas! 🌙";
        return self::send($phone, $msg);
    }

    public static function sendAdmin(string $message): bool
    {
        $cfg = self::getConfig();
        if (empty($cfg['admin_phone'])) return false;
        return self::send($cfg['admin_phone'], $message);
    }

    public static function isEnabled(): bool
    {
        global $pdo;
        $cfg = self::getConfig();
        if (!$cfg['enabled']) return false;
        
        try {
            $count = (int)$pdo->query("SELECT COUNT(*) FROM whatsapp_instances WHERE is_active = 1")->fetchColumn();
            return $count > 0;
        } catch (Throwable $e) {
            return false;
        }
    }

    // Métodos para interagir com uma instância específica via ID
    
    public static function getInstance(int $id): ?array
    {
        global $pdo;
        self::checkAndMigrateInstances();
        try {
            $stmt = $pdo->prepare("SELECT * FROM whatsapp_instances WHERE id = ?");
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
        } catch (Throwable $e) {
            return null;
        }
    }

    public static function getStatusById(int $id): array
    {
        $inst = self::getInstance($id);
        if (!$inst) return ['ok' => false, 'error' => 'Instância não encontrada.'];
        
        $res = self::requestToInstance('GET', 'status', [], $inst);
        if (!empty($res['ok'])) {
            $status = ($res['connected'] && $res['ready']) ? 'connected' : 'disconnected';
            self::updateInstanceStatus($id, $status, $res['phoneNumber'] ?? null, $res['error'] ?? null);
        } else {
            self::updateInstanceStatus($id, 'offline', null, $res['error'] ?? 'Bridge inacessível');
        }
        
        $res['url'] = $inst['bridge_url'];
        return $res;
    }

    public static function getQrBase64ById(int $id): string
    {
        $inst = self::getInstance($id);
        if (!$inst) return '';
        $res = self::requestToInstance('GET', 'qr', [], $inst);
        return $res['qr'] ?? '';
    }

    public static function disconnectById(int $id): array
    {
        $inst = self::getInstance($id);
        if (!$inst) return ['ok' => false, 'error' => 'Instância não encontrada.'];
        
        $res = self::requestToInstance('GET', 'disconnect', [], $inst);
        self::updateInstanceStatus($id, 'disconnected', null, null);
        return $res;
    }

    public static function restartById(int $id): array
    {
        $inst = self::getInstance($id);
        if (!$inst) return ['ok' => false, 'error' => 'Instância não encontrada.'];
        
        return self::requestToInstance('GET', 'restart', [], $inst);
    }
    
    public static function testConnectionById(int $id, string $phone): array
    {
        $inst = self::getInstance($id);
        if (!$inst) return ['ok' => false, 'error' => 'Instância não encontrada.'];
        
        $phone = self::formatPhone($phone);
        if (!$phone) return ['ok' => false, 'error' => 'Número de telefone inválido.'];
        
        $message = "✅ *Teste DiretoPay* — Instância [" . $inst['name'] . "] conectada com sucesso!\n\n_" . date('d/m/Y H:i') . "_";
        $res = self::requestToInstance('POST', 'send', ['phone' => $phone, 'message' => $message], $inst);
        
        if (!empty($res['ok'])) {
            $connectedPhone = $res['phone'] ?? null;
            self::updateInstanceStatus($id, 'connected', $connectedPhone, null);
            return ['ok' => true];
        } else {
            $err = $res['error'] ?? 'Erro desconhecido';
            self::updateInstanceStatus($id, 'disconnected', null, $err);
            return ['ok' => false, 'error' => $err];
        }
    }

    // Métodos legados com retrocompatibilidade automática usando a primeira instância

    public static function getStatus(): array
    {
        global $pdo;
        self::checkAndMigrateInstances();
        try {
            $firstId = (int)$pdo->query("SELECT id FROM whatsapp_instances ORDER BY priority ASC, id ASC LIMIT 1")->fetchColumn();
            if ($firstId) return self::getStatusById($firstId);
        } catch (Throwable $e) {}
        return ['ok' => false, 'connected' => false, 'ready' => false, 'error' => 'Nenhuma instância configurada.'];
    }

    public static function getQrBase64(): string
    {
        global $pdo;
        try {
            $firstId = (int)$pdo->query("SELECT id FROM whatsapp_instances ORDER BY priority ASC, id ASC LIMIT 1")->fetchColumn();
            if ($firstId) return self::getQrBase64ById($firstId);
        } catch (Throwable $e) {}
        return '';
    }

    public static function disconnect(): array
    {
        global $pdo;
        try {
            $firstId = (int)$pdo->query("SELECT id FROM whatsapp_instances ORDER BY priority ASC, id ASC LIMIT 1")->fetchColumn();
            if ($firstId) return self::disconnectById($firstId);
        } catch (Throwable $e) {}
        return ['ok' => false, 'error' => 'Nenhuma instância configurada.'];
    }

    public static function testConnection(string $phone): array
    {
        $ok = self::send($phone, "✅ *Teste DiretoPay* — WhatsApp conectado!\n\n_" . date('d/m/Y H:i') . "_");
        return ['ok' => $ok, 'error' => $ok ? null : 'Bridges offline ou número inválido.'];
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
          . "\n\n🌙 _DiretoPay • " . date('H:i') . "_";
        return self::send($phone, $msg);
    }

    /** Saque solicitado (notifica admin) */
    public static function notifyWithdrawal(string $userName, float $grossAmount, string $pixKey, float $platformFee = 3.50, float $sigiloFee = 0.00, string $nominal = 'nominal1'): bool
    {
        $cfg = self::getConfig();
        if (!$cfg['notify_withdrawal']) return false;
        $gross = number_format($grossAmount, 2, ',', '.');
        $net   = number_format($grossAmount - $platformFee - $sigiloFee, 2, ',', '.');
        $pFee  = number_format($platformFee, 2, ',', '.');
        
        $nominalLabel = ($nominal === 'nominal2') ? 'BRPix (nominal2)' : 'SigiloPay (nominal1)';
        
        $msg   =
            "🏦 *SAQUE SOLICITADO*\n" . self::divider() . "\n\n"
          . "👤 *Usuário:*       {$userName}\n"
          . "💵 *Valor Bruto:*   R$ {$gross}\n"
          . "💰 *Meu Lucro:*     R$ {$pFee}\n"
          . "💎 *Valor a Pagar:* R$ {$net}\n"
          . "🔑 *Chave PIX:* {$pixKey}\n"
          . "🏦 *Nominal/Gateway:* {$nominalLabel}\n\n"
          . "⚠️ _Aguardando aprovação manual._"
          . self::footer();
        return self::sendAdmin($msg);
    }

    /** Saque aprovado/pago (notifica o usuário) */
    public static function notifyWithdrawalPaid(string $phone, string $userName, float $amount): bool
    {
        $cfg = self::getConfig();
        if (!$cfg['enabled']) return false;
        $amtFmt = number_format($amount, 2, ',', '.');
        $firstName = explode(' ', trim($userName))[0] ?: 'Vendedor';
        $msg =
            "✅ *SAQUE ENVIADO!*\n" . self::divider() . "\n\n"
          . "🎉 Olá, {$firstName}! Seu saque foi processado e o valor já foi enviado para a sua chave PIX cadastrada.\n\n"
          . "💰 *Valor:* R$ {$amtFmt}\n\n"
          . "🚀 Obrigado por usar a nossa plataforma. Desejamos muito sucesso em suas vendas!"
          . "\n\n💸 _DiretoPay • " . date('H:i') . "_";
        return self::send($phone, $msg);
    }

    /** Saque rejeitado/estornado (notifica o usuário) */
    public static function notifyWithdrawalRejected(string $phone, string $userName, float $amount): bool
    {
        $cfg = self::getConfig();
        if (!$cfg['enabled']) return false;
        $amtFmt = number_format($amount, 2, ',', '.');
        $firstName = explode(' ', trim($userName))[0] ?: 'Vendedor';
        $msg =
            "❌ *SAQUE REJEITADO*\n" . self::divider() . "\n\n"
          . "⚠️ Olá, {$firstName}. O seu saque no valor de *R$ {$amtFmt}* não pôde ser concluído.\n\n"
          . "🔄 *Status:* Estornado para o seu saldo da plataforma.\n"
          . "📌 Por favor, verifique os seus dados cadastrais e tente solicitar novamente."
          . "\n\n🛡️ _DiretoPay • " . date('H:i') . "_";
        return self::send($phone, $msg);
    }

    /** Saque aprovado/pago (notifica o admin) */
    public static function notifyWithdrawalPaidAdmin(string $userName, float $amount): bool
    {
        $cfg = self::getConfig();
        if (!$cfg['notify_withdrawal']) return false;
        $amtFmt = number_format($amount, 2, ',', '.');
        $msg =
            "✅ *SAQUE ENVIADO (ADMIN)*\n" . self::divider() . "\n\n"
          . "👤 *Vendedor:* {$userName}\n"
          . "💵 *Valor Pago:* R$ {$amtFmt}\n\n"
          . "📈 Saque aprovado e debitado com sucesso no painel."
          . self::footer();
        return self::sendAdmin($msg);
    }

    /** Saque rejeitado/estornado (notifica o admin) */
    public static function notifyWithdrawalRejectedAdmin(string $userName, float $amount): bool
    {
        $cfg = self::getConfig();
        if (!$cfg['notify_withdrawal']) return false;
        $amtFmt = number_format($amount, 2, ',', '.');
        $msg =
            "❌ *SAQUE REJEITADO (ADMIN)*\n" . self::divider() . "\n\n"
          . "👤 *Vendedor:* {$userName}\n"
          . "💵 *Valor:* R$ {$amtFmt}\n\n"
          . "⚠️ Saque recusado e saldo estornado no painel."
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

    /** Converte HTML simples do Telegram para Markdown do WhatsApp */
    public static function formatHtmlToWhatsApp(string $html): string
    {
        $text = $html;
        $text = preg_replace('/<\/?b>/i', '*', $text);
        $text = preg_replace('/<\/?strong>/i', '*', $text);
        $text = preg_replace('/<\/?i>/i', '_', $text);
        $text = preg_replace('/<\/?em>/i', '_', $text);
        $text = preg_replace('/<\/?code>/i', '`', $text);
        $text = strip_tags($text);
        return $text;
    }

    /** PIX gerado no produto do vendedor */
    public static function notifyPixGenerated(string $phone, float $amount, string $customerName, string $checkoutName, int $txId): bool
    {
        $amtFmt = number_format($amount, 2, ',', '.');
        $tips = [
            "💡 _Dica: responda rápido se o cliente precisar de suporte!_",
            "💡 _Enquanto aguarda, que tal compartilhar seu link de vendas?_",
            "💡 _Confirmação chega em segundos após o pagamento!_",
        ];
        $tip = $tips[array_rand($tips)];
        $msg =
            "⚡ *PIX GERADO!*\n" . self::divider() . "\n\n"
          . "💵 *Valor:* R$ {$amtFmt}\n"
          . "👤 *Cliente:* " . ($customerName ?: 'Não informado') . "\n"
          . "🛍 *Produto:* " . $checkoutName . "\n"
          . "🆔 *TX:* #{$txId}\n\n"
          . "⏳ _Aguardando pagamento..._\n\n"
          . $tip
          . "\n\n🌙 _DiretoPay • " . date('H:i') . "_";
        return self::send($phone, $msg);
    }

    /** Visita no checkout do vendedor */
    public static function notifyCheckoutVisit(string $phone, string $checkoutName, string $ip = ''): bool
    {
        $phrases = [
            "👀 Alguém está olhando seu produto com interesse! Dedos cruzados! 🤞",
            "🔔 Visita no seu checkout! Pode ser uma venda chegando!",
            "👁️ Um potencial cliente está no seu checkout agora!",
            "🛒 Alguém abriu seu produto! A conversão pode estar perto!",
            "🎯 Visitante no seu checkout! Tudo pronto para a venda?",
        ];
        $phrase = $phrases[array_rand($phrases)];
        $msg =
            "👁️ *VISITA NO CHECKOUT*\n" . self::divider() . "\n\n"
          . $phrase . "\n\n"
          . "🛍 *Produto:* " . $checkoutName . "\n\n"
          . "_Nenhuma ação necessária — só acompanhe!_"
          . "\n\n🌙 _DiretoPay • " . date('H:i') . "_";
        return self::send($phone, $msg);
    }
}
