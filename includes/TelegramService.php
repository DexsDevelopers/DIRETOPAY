<?php
/**
 * TelegramService - Envia notificações via Telegram Bot API
 */
class TelegramService
{
    private static function divider(): string { return "━━━━━━━━━━━━━━━━━━━━"; }
    private static function footer(): string  { return "\n" . self::divider() . "\n🤖 <i>LunarPay • " . date('d/m/Y \à\s H:i') . "</i>"; }

    private static function token(): string  { return defined('TELEGRAM_BOT_TOKEN') ? TELEGRAM_BOT_TOKEN : ''; }
    private static function chatId(): string { return defined('TELEGRAM_CHAT_ID')   ? TELEGRAM_CHAT_ID   : ''; }

    private static function api(string $method, array $payload): array
    {
        $token = self::token();
        if (!$token) return ['ok' => false];
        $ch = curl_init("https://api.telegram.org/bot{$token}/{$method}");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_CONNECTTIMEOUT => 5,
        ]);
        $raw = curl_exec($ch);
        curl_close($ch);
        return json_decode($raw ?: '{}', true) ?: ['ok' => false];
    }

    public static function send(string $message, string $parseMode = 'HTML'): bool
    {
        $token  = self::token();
        $chatId = self::chatId();
        if (empty($token) || empty($chatId)) return false;

        $res = self::api('sendMessage', [
            'chat_id'                  => $chatId,
            'text'                     => $message,
            'parse_mode'               => $parseMode,
            'disable_web_page_preview' => true,
        ]);
        return !empty($res['ok']);
    }

    public static function sendWithKeyboard(string $message, array $keyboard, string $chatId = '', string $parseMode = 'HTML'): ?int
    {
        $chatId = $chatId ?: self::chatId();
        if (!self::token() || !$chatId) return null;

        $res = self::api('sendMessage', [
            'chat_id'                  => $chatId,
            'text'                     => $message,
            'parse_mode'               => $parseMode,
            'disable_web_page_preview' => true,
            'reply_markup'             => ['inline_keyboard' => $keyboard],
        ]);
        return $res['ok'] ? ($res['result']['message_id'] ?? null) : null;
    }

    public static function editMessageText(string $text, int $messageId, string $chatId = '', array $keyboard = []): bool
    {
        $chatId = $chatId ?: self::chatId();
        $payload = [
            'chat_id'                  => $chatId,
            'message_id'               => $messageId,
            'text'                     => $text,
            'parse_mode'               => 'HTML',
            'disable_web_page_preview' => true,
        ];
        if ($keyboard) $payload['reply_markup'] = ['inline_keyboard' => $keyboard];
        $res = self::api('editMessageText', $payload);
        return !empty($res['ok']);
    }

    public static function answerCallback(string $callbackQueryId, string $text = '', bool $alert = false): bool
    {
        $res = self::api('answerCallbackQuery', [
            'callback_query_id' => $callbackQueryId,
            'text'              => $text,
            'show_alert'        => $alert,
        ]);
        return !empty($res['ok']);
    }

    public static function replyTo(string $chatId, string $message, string $parseMode = 'HTML'): bool
    {
        if (!self::token()) return false;
        $res = self::api('sendMessage', [
            'chat_id'                  => $chatId,
            'text'                     => $message,
            'parse_mode'               => $parseMode,
            'disable_web_page_preview' => true,
        ]);
        return !empty($res['ok']);
    }

    // ─── VENDA CONFIRMADA ────────────────────────────────────────────
    public static function notifySale(
        float $amount, float $netAmount, string $customerName,
        string $merchantName, int $transactionId, string $source = 'PIX'
    ): bool {
        $gross    = number_format($amount,    2, ',', '.');
        $net      = number_format($netAmount, 2, ',', '.');
        $fee      = number_format($amount - $netAmount, 2, ',', '.');
        $msg =
            "� <b>VENDA CONFIRMADA</b>\n" . self::divider() . "\n\n"
          . "💵 <b>Valor Bruto:</b>   R$ {$gross}\n"
          . "💎 <b>Valor Líquido:</b> R$ {$net}\n"
          . "📉 <b>Taxa Total:</b>    R$ {$fee}\n\n"
          . "👤 <b>Pagador:</b>    {$customerName}\n"
          . "🏪 <b>Vendedor:</b>   {$merchantName}\n"
          . "🔗 <b>Origem:</b>     {$source}\n"
          . "🆔 <b>TX:</b>         <code>#{$transactionId}</code>"
          . self::footer();
        return self::send($msg);
    }

    // ─── NOVA COBRANÇA GERADA ────────────────────────────────────────
    public static function notifyNewCharge(
        float $amount, string $merchantName, int $transactionId,
        string $customerName = '', string $source = 'PIX'
    ): bool {
        $amountFmt = number_format($amount, 2, ',', '.');
        $payerLine = $customerName ? "\n👤 <b>Pagador:</b>  {$customerName}" : '';
        $msg =
            "⚡ <b>NOVA COBRANÇA GERADA</b>\n" . self::divider() . "\n\n"
          . "💵 <b>Valor:</b>    R$ {$amountFmt}"
          . $payerLine . "\n"
          . "🏪 <b>Vendedor:</b> {$merchantName}\n"
          . "🔗 <b>Origem:</b>   {$source}\n"
          . "🆔 <b>TX:</b>       <code>#{$transactionId}</code>"
          . self::footer();
        return self::send($msg);
    }

    // ─── NOVO CADASTRO ───────────────────────────────────────────────
    public static function notifyNewUser(string $name, string $email, string $ip = ''): bool
    {
        $ipLine = $ip ? "\n🌐 <b>IP:</b>      <code>{$ip}</code>" : '';
        $msg =
            "🆕 <b>NOVO CADASTRO</b>\n" . self::divider() . "\n\n"
          . "� <b>Nome:</b>    {$name}\n"
          . "📧 <b>E-mail:</b>  <code>{$email}</code>"
          . $ipLine
          . self::footer();
        return self::send($msg);
    }

    // ─── SAQUE SOLICITADO ────────────────────────────────────────────
    public static function notifyWithdrawal(string $userName, float $grossAmount, string $pixKey, float $platformFee = 3.50, float $sigiloFee = 0.00): bool
    {
        $gross = number_format($grossAmount, 2, ',', '.');
        $net   = number_format($grossAmount - $platformFee - $sigiloFee, 2, ',', '.');
        $pFee  = number_format($platformFee, 2, ',', '.');
        $sFee  = number_format($sigiloFee, 2, ',', '.');
        
        $msg =
            "🏦 <b>SAQUE SOLICITADO</b>\n" . self::divider() . "\n\n"
          . "👤 <b>Usuário:</b>       {$userName}\n"
          . "💵 <b>Valor Bruto:</b>    R$ {$gross}\n"
          . "📉 <b>Taxa SigiloPay:</b> R$ {$sFee}\n"
          . "💰 <b>Meu Lucro:</b>      R$ {$pFee}\n"
          . "💎 <b>Valor a Pagar:</b>  R$ {$net}\n"
          . "🔑 <b>Chave PIX:</b>   <code>{$pixKey}</code>\n\n"
          . "⚠️ <i>Aguardando aprovação manual.</i>"
          . self::footer();
        return self::send($msg);
    }

    // ─── SAQUE APROVADO ──────────────────────────────────────────────
    public static function notifyWithdrawalApproved(string $userName, float $amount, string $pixKey, string $txHash = ''): bool
    {
        $amountFmt = number_format($amount, 2, ',', '.');
        $hashLine  = $txHash ? "\n🧾 <b>Hash/Ref:</b> <code>{$txHash}</code>" : '';
        $msg =
            "✅ <b>SAQUE APROVADO</b>\n" . self::divider() . "\n\n"
          . "👤 <b>Usuário:</b> {$userName}\n"
          . "💸 <b>Valor:</b>   R$ {$amountFmt}\n"
          . "🔑 <b>Pix:</b>     <code>{$pixKey}</code>"
          . $hashLine
          . self::footer();
        return self::send($msg);
    }

    // ─── SAQUE REJEITADO ─────────────────────────────────────────────
    public static function notifyWithdrawalRejected(string $userName, float $amount): bool
    {
        $amountFmt = number_format($amount, 2, ',', '.');
        $msg =
            "❌ <b>SAQUE REJEITADO</b>\n" . self::divider() . "\n\n"
          . "👤 <b>Usuário:</b> {$userName}\n"
          . "💵 <b>Valor:</b>   R$ {$amountFmt}\n\n"
          . "ℹ️ <i>O saldo foi devolvido ao usuário automaticamente.</i>"
          . self::footer();
        return self::send($msg);
    }

    // ─── USUÁRIO APROVADO / BLOQUEADO ────────────────────────────────
    public static function notifyUserStatusChanged(string $userName, string $email, string $newStatus): bool
    {
        $icons  = ['approved' => '✅', 'blocked' => '🔴', 'pending' => '🕐', 'demo' => '🎭'];
        $labels = ['approved' => 'APROVADO',  'blocked' => 'BLOQUEADO', 'pending' => 'PENDENTE', 'demo' => 'DEMO'];
        $icon   = $icons[$newStatus]  ?? '🔄';
        $label  = $labels[$newStatus] ?? strtoupper($newStatus);
        $msg =
            "{$icon} <b>USUÁRIO {$label}</b>\n" . self::divider() . "\n\n"
          . "👤 <b>Nome:</b>   {$userName}\n"
          . "� <b>E-mail:</b> <code>{$email}</code>\n"
          . "🔖 <b>Status:</b> {$label}"
          . self::footer();
        return self::send($msg);
    }

    // ─── NOVO PRODUTO CRIADO (com botões aprovar/recusar) ───────────
    public static function notifyNewProduct(string $sellerName, string $productName, float $price, string $category = ''): bool
    {
        return (bool) self::notifyNewProductAdmin($sellerName, $productName, $price, 0, $category);
    }

    public static function notifyNewProductAdmin(
        string $sellerName, string $productName, float $price,
        int $productId = 0, string $category = ''
    ): ?int {
        $priceFmt = number_format($price, 2, ',', '.');
        $catLine  = $category ? "\n🏷️ <b>Categoria:</b> {$category}" : '';
        $idLine   = $productId ? "\n🆔 <b>ID:</b>        <code>#{$productId}</code>" : '';
        $msg =
            "🛍️ <b>NOVO PRODUTO CADASTRADO</b>\n" . self::divider() . "\n\n"
          . "📦 <b>Produto:</b>  {$productName}\n"
          . "💵 <b>Preço:</b>    R$ {$priceFmt}\n"
          . "🏪 <b>Vendedor:</b> {$sellerName}"
          . $catLine
          . $idLine . "\n\n"
          . "⚠️ <i>Aguardando revisão. Use os botões abaixo ou o painel.</i>"
          . self::footer();

        $keyboard = $productId ? [[
            ['text' => '✅ Aprovar', 'callback_data' => "prod_approve_{$productId}"],
            ['text' => '❌ Recusar', 'callback_data' => "prod_reject_{$productId}"],
        ]] : [];

        return $keyboard
            ? self::sendWithKeyboard($msg, $keyboard)
            : (self::send($msg) ? 1 : null);
    }

    // ─── PRODUTO APROVADO / RECUSADO ─────────────────────────────────
    public static function notifyProductStatus(int $productId, string $productName, string $sellerName, string $status, string $reason = ''): bool
    {
        $icon   = $status === 'active' ? '✅' : '❌';
        $label  = $status === 'active' ? 'APROVADO' : 'RECUSADO';
        $rLine  = $reason ? "\n💬 <b>Motivo:</b> {$reason}" : '';
        $msg =
            "{$icon} <b>PRODUTO {$label}</b>\n" . self::divider() . "\n\n"
          . "📦 <b>Produto:</b>  {$productName}\n"
          . "🏪 <b>Vendedor:</b> {$sellerName}\n"
          . "🆔 <b>ID:</b>       <code>#{$productId}</code>"
          . $rLine
          . self::footer();
        return self::send($msg);
    }

    // ─── PIX EXPIRADO (alto valor) ───────────────────────────────────
    public static function notifyPixExpired(float $amount, string $merchantName, int $transactionId): bool
    {
        if ($amount < 50) return false;
        $amountFmt = number_format($amount, 2, ',', '.');
        $msg =
            "⏰ <b>PIX EXPIRADO SEM PAGAMENTO</b>\n" . self::divider() . "\n\n"
          . "💵 <b>Valor:</b>    R$ {$amountFmt}\n"
          . "🏪 <b>Vendedor:</b> {$merchantName}\n"
          . "🆔 <b>TX:</b>       <code>#{$transactionId}</code>"
          . self::footer();
        return self::send($msg);
    }

    // ─── ATIVIDADE NO BOT DE USUÁRIOS ────────────────────────────────────
    public static function notifyBotActivity(string $icon, string $title, string $details): bool
    {
        $msg =
            "{$icon} <b>{$title}</b>\n" . self::divider() . "\n\n"
          . $details . "\n\n"
          . "📱 <i>Via Bot de Usuários</i>"
          . self::footer();
        return self::send($msg);
    }

    // ─── RANKING ADMIN (nomes completos + WhatsApp) ──────────────────────
    public static function notifyAdminRanking(\PDO $pdo, string $period = '30'): bool
    {
        $days = (int)$period;
        if ($days <= 0) $days = 30;

        $stmt = $pdo->prepare("
            SELECT u.id, u.full_name, u.whatsapp, u.email,
                   COUNT(t.id) AS sales,
                   COALESCE(SUM(t.amount_brl), 0) AS volume,
                   COALESCE(SUM(t.amount_net_brl), 0) AS net_volume
            FROM users u
            LEFT JOIN transactions t
                ON u.id = t.user_id
                AND t.status = 'paid'
                AND t.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            WHERE u.status = 'approved' AND u.is_admin = 0 AND u.is_demo = 0
            GROUP BY u.id
            ORDER BY volume DESC
            LIMIT 15
        ");
        $stmt->execute([$days]);
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $totalSellers = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE status = 'approved' AND is_admin = 0 AND is_demo = 0")->fetchColumn();
        $totalVol     = 0;
        foreach ($rows as $r) $totalVol += (float)$r['volume'];

        $medals = ['🥇','🥈','🥉'];
        $msg = "🏆 <b>RANKING ADMIN — Últimos {$days} dias</b>\n" . self::divider() . "\n\n";

        $pos = 0;
        foreach ($rows as $i => $r) {
            if ((float)$r['volume'] <= 0) continue;
            $pos++;
            $medal  = $medals[$i] ?? "{$pos}º";
            $wa     = $r['whatsapp'] ? "\n       📱 <code>{$r['whatsapp']}</code>" : '';
            $net    = number_format((float)$r['net_volume'], 2, ',', '.');
            $gross  = number_format((float)$r['volume'], 2, ',', '.');
            $msg   .= "{$medal} <b>{$r['full_name']}</b>{$wa}\n"
                   .  "       {$r['sales']}x vendas — R$ {$gross} bruto / R$ {$net} líquido\n\n";
        }

        $totalFmt = number_format($totalVol, 2, ',', '.');
        $msg .= self::divider() . "\n"
              . "👥 <b>{$totalSellers}</b> vendedores ativos\n"
              . "💰 Volume total: <b>R$ {$totalFmt}</b>"
              . self::footer();

        return self::send($msg);
    }

    // ─── ALERTA DE ERRO / SISTEMA ────────────────────────────────────────
    public static function notifySystemAlert(string $title, string $detail): bool
    {
        $msg =
            "🚨 <b>ALERTA DO SISTEMA</b>\n" . self::divider() . "\n\n"
          . "⚠️ <b>{$title}</b>\n\n"
          . "<code>{$detail}</code>"
          . self::footer();
        return self::send($msg);
    }

    // ─── ENVIAR MENSAGEM VIA USER BOT (para vendedor específico) ─────────────
    public static function sendToUser(string $chatId, string $message): bool
    {
        $token = defined('TELEGRAM_USER_BOT_TOKEN') ? TELEGRAM_USER_BOT_TOKEN : '';
        if (!$token || !$chatId) return false;
        $ch = curl_init("https://api.telegram.org/bot{$token}/sendMessage");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode([
                'chat_id'                  => $chatId,
                'text'                     => $message,
                'parse_mode'               => 'HTML',
                'disable_web_page_preview' => true,
            ]),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 10,
        ]);
        $raw = curl_exec($ch);
        curl_close($ch);
        $res = json_decode($raw ?: '{}', true) ?: [];
        return !empty($res['ok']);
    }

    // ─── PIX GERADO NO PRODUTO DO VENDEDOR ───────────────────────────────────
    public static function notifyPixGenerated(string $userChatId, float $amount, string $customerName, string $checkoutName, int $txId): bool
    {
        $amtFmt = number_format($amount, 2, ',', '.');
        $h = (int)date('H');
        $tips = [
            "💡 <i>Dica: responda rápido se o cliente precisar de suporte!</i>",
            "💡 <i>Enquanto aguarda, que tal compartilhar seu link de vendas?</i>",
            "💡 <i>Confirmação chega em segundos após o pagamento!</i>",
        ];
        $tip = $tips[array_rand($tips)];
        $msg =
            "⚡ <b>PIX GERADO!</b>\n" . self::divider() . "\n\n"
          . "💵 <b>Valor:</b> R$ {$amtFmt}\n"
          . "👤 <b>Cliente:</b> " . htmlspecialchars($customerName ?: 'Não informado') . "\n"
          . "🛍 <b>Produto:</b> " . htmlspecialchars($checkoutName) . "\n"
          . "🆔 <b>TX:</b> <code>#{$txId}</code>\n\n"
          . "⏳ <i>Aguardando pagamento...</i>\n\n"
          . $tip
          . "\n\n🌙 <i>LunarPay • " . date('H:i') . "</i>";
        return self::sendToUser($userChatId, $msg);
    }

    // ─── VISITA NO CHECKOUT DO VENDEDOR ──────────────────────────────────────
    public static function notifyCheckoutVisit(string $userChatId, string $checkoutName, string $ip = ''): bool
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
            "👁️ <b>VISITA NO CHECKOUT</b>\n" . self::divider() . "\n\n"
          . $phrase . "\n\n"
          . "🛍 <b>Produto:</b> " . htmlspecialchars($checkoutName) . "\n\n"
          . "<i>Nenhuma ação necessária — só acompanhe!</i>"
          . "\n\n🌙 <i>LunarPay • " . date('H:i') . "</i>";
        return self::sendToUser($userChatId, $msg);
    }

    // ─── MENSAGEM DE VENDA COMEMORATIVA (variada por hora/dia) ───────────────
    public static function getSaleCelebrationMsg(float $amount, float $netAmount, string $customerName, int $txId, string $checkoutName = ''): string
    {
        $gross = number_format($amount,    2, ',', '.');
        $net   = number_format($netAmount, 2, ',', '.');
        $fee   = number_format($amount - $netAmount, 2, ',', '.');
        $h   = (int)date('H');
        $dow = (int)date('w'); // 0=Dom, 5=Sex, 6=Sab

        // Frases por horário
        if ($h >= 5 && $h < 12) {
            $celebs = [
                "☀️ <b>BORA! Manhã que começa com venda é dia ABENÇOADO!</b> 🎉",
                "🌅 <b>Café da manhã pago!</b> O PIX chegou antes do sol esquentar! ☕🔥",
                "🚀 <b>Nem acordou direito e já faturou!</b> Isso é diferenciado! 💪",
                "⚡ <b>Nem 12h e já está no lucro!</b> Seus concorrentes ainda estão dormindo! �",
                "🌄 <b>Manhã dourada!</b> Enquanto todo mundo toma café, você fatura! ☕💰",
                "🐓 <b>O galo cantou e veio venda junto!</b> Que início de dia INCRÍVEL! 🎯",
                "💸 <b>Bom dia com dinheiro no bolso!</b> Isso sim é acordar bem! 🌞",
                "🧠 <b>Acordou e já vendeu.</b> Outros vão acordar e ver a notificação. Diferença de mentalidade! 🔥",
            ];
        } elseif ($h >= 12 && $h < 15) {
            $celebs = [
                "🍽️ <b>O almoço de hoje tá pago e ainda sobrou!</b> VENDA CONFIRMADA! 😋🎉",
                "🌤 <b>Hora do almoço com venda!</b> Vai no restaurante mais caro hoje! 🥩",
                "🍕 <b>Pizza no almoço? Que nada — você merece o rodízio completo!</b> 💰😂",
                "🥗 <b>Enquanto o Brasil dorme depois do almoço, você fatura!</b> Raça! 💪",
                "☀️ <b>Meio-dia de glória!</b> O PIX não faz hora de almoço — e nem você! ⚡",
                "🤑 <b>Hora do almoço chegou junto com o dinheiro!</b> Destino duplo! 🎯",
                "🔔 <b>DING DING DING!</b> Mais uma venda no relógio do almoço! 🏆",
            ];
        } elseif ($h >= 15 && $h < 18) {
            $celebs = [
                "☕ <b>Cafézinho da tarde com DINHEIRO!</b> Tá voando alto! 🎉",
                "💪 <b>Tarde rasgando!</b> Enquanto outros procrastinam, você fatura! 🔥",
                "🎯 <b>Acertou de novo!</b> Essa tarde tá rendendo mais que o esperado! 💰",
                "⚡ <b>Tarde com energia máxima!</b> Venda no bolso, foco no próximo! 😎🚀",
                "🌤 <b>Tarde produtiva!</b> O mercado gosta de quem não para! 💸",
                "😂 <b>Seu chefe de emprego anterior devia estar com inveja agora!</b> VENDEU! 🤣",
                "🏃 <b>Tarde de sprint!</b> Mais uma conversão no seu histórico! 📈",
                "🔥 <b>Fogo na tarde!</b> O PIX caiu e o sorriso apareceu! 😁�",
            ];
        } elseif ($h >= 18 && $h < 22) {
            $celebs = [
                "🌙 <b>Jantar pago com venda!</b> Escolhe o restaurante que quiser hoje! 🍽️😂",
                "🌆 <b>Final de dia com PIX confirmado!</b> Isso é fechar bem! 🎉",
                "🌃 <b>Noite chegando e o dinheiro já veio antes!</b> Sequência certa! 💰🔥",
                "🥂 <b>Hora do brinde!</b> Vendeu no fim do dia = dia completo! ✨",
                "🌟 <b>Dia finalizado com chave de ouro!</b> Não foi fácil? Foi MUITO! 🔑💪",
                "🛋️ <b>Vai descansar, mas o dinheiro JÁ está guardado!</b> Merecido! 😌💸",
                "🌜 <b>A noite tá começando e você já ganhou!</b> Isso é estratégia! 🧠",
                "🎆 <b>FOGOS MENTAIS!</b> Mais uma venda no final do expediente! 🎉🎊",
            ];
        } else {
            $celebs = [
                "🦉 <b>MADRUGADA PRODUTIVA!</b> O dinheiro não dorme — e nem você! 💰😂",
                "🌙 <b>Venda de madrugada!</b> Enquanto o mundo dorme, você FATURA! 🚀",
                "⭐ <b>Às [hora] da manhã e já vendeu!</b> Isso é compromisso diferenciado! 💪",
                "🌌 <b>As estrelas viram a notificação antes de você!</b> PIX confirmado! 🎉",
                "🧛 <b>Vendeu de madrugada!</b> Isso não é trabalho, é vocação! 🔥",
                "😴 <b>O Brasil dormindo e você faturando.</b> Enquanto isso... 💸�",
                "🌠 <b>Estrela cadente ou PIX caindo?</b> Os dois! VENDA CONFIRMADA! ✨",
            ];
        }

        // Extra por dia da semana
        $dayExtras = [];
        if ($dow === 5) $dayExtras[] = "🎉 <i>SEXTA COM VENDA! Vai comemorar hoje à noite com o dinheiro da LunarPay!</i> 🥳";
        elseif ($dow === 6) $dayExtras[] = "📅 <i>Sábado? Você não descansa! Respeito enorme!</i> 💪";
        elseif ($dow === 0) $dayExtras[] = "🌟 <i>DOMINGO vendendo! Você é de outro nível!</i> 🏆";
        elseif ($dow === 1) $dayExtras[] = "💪 <i>Segunda com venda! A semana já começou no positivo!</i> 🚀";
        elseif ($dow === 3) $dayExtras[] = "⛰️ <i>Quarta-feira = topo da montanha da semana. E você vendeu lá em cima!</i>";

        // Frases motivacionais aleatórias extras
        $extras = [
            "💡 <i>Cada venda é um passo a mais na direção certa!</i>",
            "📈 <i>Consistência + LunarPay = resultado garantido!</i>",
            "🧠 <i>Mentalidade de crescimento em ação!</i>",
            "🎯 <i>Foco no próximo! Essa foi só o aquecimento!</i>",
            "🔑 <i>Você descobriu o segredo: não parar nunca!</i>",
            "🏆 <i>Vencedores vendem enquanto outros reclamam!</i>",
            "💎 <i>Diamante se forma sob pressão — e você tá brilhando!</i>",
        ];

        $celeb = $celebs[array_rand($celebs)];
        $extra = !empty($dayExtras) ? "\n\n" . $dayExtras[0] : "\n\n" . $extras[array_rand($extras)];
        $prodLine = $checkoutName ? "\n🛍 <b>Produto:</b> " . htmlspecialchars($checkoutName) : '';

        return
            "💰 {$celeb}\n" . self::divider() . "\n\n"
          . "💵 <b>Valor Bruto:</b>   R$ {$gross}\n"
          . "💎 <b>Você recebe:</b>   R$ {$net}\n"
          . "📉 <b>Taxa:</b>          R$ {$fee}\n"
          . "👤 <b>Cliente:</b> " . htmlspecialchars($customerName ?: 'Anônimo') . $prodLine . "\n"
          . "🆔 <b>TX:</b> <code>#{$txId}</code>"
          . $extra
          . "\n\n🌙 <i>LunarPay • " . date('H:i') . "</i>";
    }
}
