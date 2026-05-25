<?php
/**
 * telegram_cron.php — Mensagens proativas agendadas para vendedores
 *
 * Configurar cron jobs no servidor (cron-job.org ou painel de hospedagem):
 *   Manhã (08:00):        GET /telegram_cron.php?secret=SEU_SECRET&mode=morning
 *   Almoço (12:00):       GET /telegram_cron.php?secret=SEU_SECRET&mode=afternoon
 *   Tarde (17:00):        GET /telegram_cron.php?secret=SEU_SECRET&mode=evening
 *   Resumo (22:30):       GET /telegram_cron.php?secret=SEU_SECRET&mode=daily_summary
 */

date_default_timezone_set('America/Sao_Paulo');
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/TelegramService.php';

// ── Autenticação ──────────────────────────────────────────────────────────────
$expectedSecret = defined('TELEGRAM_WEBHOOK_SECRET') ? TELEGRAM_WEBHOOK_SECRET : '';
$incomingSecret = $_GET['secret'] ?? '';
if ($expectedSecret && $incomingSecret !== $expectedSecret) {
    http_response_code(403); exit('Forbidden');
}

$mode = $_GET['mode'] ?? 'morning';
$div  = "\n━━━━━━━━━━━━━━━━━━━━";
$sent = 0;
$skip = 0;

// ── Buscar todos os vendedores com Telegram vinculado ─────────────────────────
$usersStmt = $pdo->query("
    SELECT id, full_name, telegram_chat_id
    FROM users
    WHERE telegram_chat_id IS NOT NULL
      AND telegram_chat_id != ''
      AND status = 'approved'
      AND is_admin = 0
      AND is_demo = 0
");
$users = $usersStmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($users)) {
    echo json_encode(['success' => true, 'sent' => 0, 'message' => 'Nenhum vendedor com Telegram vinculado']);
    exit;
}

// ── Funções auxiliares ────────────────────────────────────────────────────────
function fBRL(float $v): string { return 'R$ ' . number_format($v, 2, ',', '.'); }

function getUserDayStats(PDO $pdo, int $userId): array {
    $today = date('Y-m-d');
    $stmt = $pdo->prepare("
        SELECT
            COUNT(CASE WHEN status = 'paid' THEN 1 END) AS sales,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_brl END), 0) AS volume,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_net_brl END), 0) AS net_volume,
            COUNT(CASE WHEN status != 'paid' THEN 1 END) AS charges
        FROM transactions
        WHERE user_id = ? AND DATE(created_at) = ?
    ");
    $stmt->execute([$userId, $today]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: ['sales' => 0, 'volume' => 0, 'net_volume' => 0, 'charges' => 0];
}

function getUserTotalBalance(PDO $pdo, int $userId): float {
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount_net_brl),0) FROM transactions WHERE user_id=? AND status='paid'");
    $stmt->execute([$userId]);
    $paid = (float)$stmt->fetchColumn();
    $wdStmt = $pdo->prepare("SELECT COALESCE(SUM(amount),0) FROM withdrawals WHERE user_id=? AND status IN ('paid','pending')");
    $wdStmt->execute([$userId]);
    return max(0, $paid - (float)$wdStmt->fetchColumn());
}

// ── Arrays de frases ──────────────────────────────────────────────────────────

function getMorningPhrase(): string {
    $dow = (int)date('w');
    $general = [
        "☀️ <b>Bom dia!</b> Seu concorrente ainda está dormindo. Você já está aqui. Diferença de mentalidade. 🧠",
        "🐓 <b>Bom dia!</b> O galo cantou, o café esfriou, mas o PIX não espera ninguém. Bora! ☕�",
        "🌅 <b>Bom dia!</b> Hoje pode ser o dia que você vai contar pra família no jantar. Ou não. Depende de você. 😂",
        "� <b>Bom dia!</b> O universo não garante nada, mas a LunarPay garante o PIX instantâneo. Foca no que importa! �",
        "🧠 <b>Bom dia!</b> Estatística: 100% das pessoas que desistiram cedo não venderam naquele dia. Não seja estatística! �",
        "☀️ <b>Bom dia!</b> Você acordou. O mercado também. Quem chega primeiro, fica com a venda. Bora! 🎯",
        "🌞 <b>Bom dia!</b> Hoje o sol nasceu. Suas vendas também podem nascer — basta divulgar! �",
        "😂 <b>Bom dia!</b> Relatório científico confirma: pessoas que vendem de manhã ficam de bom humor o dia todo. Coincidência? �",
    ];
    $dayExtra = [
        0 => "� <i>Domingo vendendo? Você é de outro nível. Seus concorrentes estão vendo Netflix.</i> 🎬",
        1 => "💪 <i>Segunda-feira: o dia que separa quem vai crescer essa semana de quem vai só reclamar dela.</i>",
        2 => "⚡ <i>Terça: segunda já passou, agora é sprint. Tudo que não saiu ontem, sai hoje!</i>",
        3 => "⛰️ <i>Quarta = topo da semana. Daqui pra sexta é descida. Aproveita o embalo!</i>",
        4 => "� <i>Quinta: último dia sério da semana. Amanhã é sexta e todo mundo fica animado. Vende agora!</i>",
        5 => "🎉 <i>SEXTOU! Mas calma — primeiro vende, depois comemora. Ordem dos fatores importa!</i> 🥳",
        6 => "😎 <i>Sábado de manhã vendendo? Isso não é trabalho — é vocação. Respeito total!</i>",
    ];
    $phrase = $general[array_rand($general)];
    $extra  = $dayExtra[$dow] ?? '';
    return $extra ? $phrase . "\n\n" . $extra : $phrase;
}

function getAfternoonPhrase(array $stats): string {
    $sales = (int)$stats['sales'];
    if ($sales === 0) {
        $phrases = [
            "🌤 <b>Boa tarde!</b> A manhã foi tranquila? Ótimo — a tarde é onde os fortes viram o jogo! 🎯",
            "😴 <b>Boa tarde!</b> A manhã foi embora sem venda. Mas o dia ainda é jovem. Diferente do boleto de 2019 que nunca veio. 😂",
            "� <b>Boa tarde!</b> O almoço foi gostoso? Agora paga ele com uma venda! Vai lá! 💸",
            "🎯 <b>Boa tarde!</b> Relatório: 0 vendas pela manhã. Previsão do tempo: tempestade de PIX na tarde. Prepare-se! ⛈️�",
        ];
    } elseif ($sales < 3) {
        $phrases = [
            "🌤 <b>Boa tarde!</b> {$sales} venda(s) pela manhã! O almoço foi pago. Agora paga o jantar também! 🍽️🔥",
            "😏 <b>Boa tarde!</b> {$sales} venda(s) no bolso e a tarde inteira pela frente. Isso chama potencial! �",
            "☕ <b>Boa tarde!</b> {$sales} venda(s) de manhã é bom começo. Agora dobra. Simples assim! 💪",
        ];
    } else {
        $phrases = [
            "🔥 <b>Boa tarde!</b> {$sales} VENDAS já?! Isso não é ritmo — isso é FRENESI! Continue! 🚀",
            "🏆 <b>Boa tarde, monstro!</b> {$sales} vendas até agora. Seus concorrentes estão em reunião sobre como vender. 😂",
            "💰 <b>Boa tarde!</b> {$sales} vendas e a tarde nem começou direito. Hoje vai ter record! Eu sinto! 📈",
        ];
    }
    return $phrases[array_rand($phrases)];
}

function getEveningPhrase(array $stats): string {
    $sales = (int)$stats['sales'];
    $dow   = (int)date('w');
    if ($dow === 5 && $sales > 0) {
        return "🎉 <b>Boa noite!</b> Sexta com {$sales} venda(s)! Pode comemorar — você GANHOU hoje! 🥂😂";
    }
    if ($sales === 0) {
        $phrases = [
            "🌙 <b>Boa noite!</b> Hoje foi o dia de descanso mental. Amanhã o PIX vai trabalhar dobrado! 💪",
            "🌆 <b>Boa noite!</b> 0 vendas hoje. Mas 100% de presença. Amanhã é outro dia — e você vai arrasar! 🚀",
            "😂 <b>Boa noite!</b> Hoje o mercado descansou. Pelo menos foi o que você disse pra si mesmo. Amanhã, sem desculpa! 🎯",
            "🦉 <b>Boa noite!</b> Dia zero. Isso acontece. O que não pode é virar rotina. Amanhã você muda o placar! �",
        ];
    } else {
        $net = fBRL((float)$stats['net_volume']);
        $phrases = [
            "🌙 <b>Boa noite!</b> Fechou o dia com {$sales} venda(s) e {$net} no bolso. Dorme com esse sorriso! 😁",
            "🌆 <b>Boa noite!</b> {$sales} venda(s) hoje! O jantar foi garantido e ainda sobrou pro café amanhã! ☕�",
            "⭐ <b>Boa noite!</b> {$sales} venda(s) — o dia prestou. Descansa que amanhã você faz mais! 💤🔥",
            "🛋️ <b>Boa noite!</b> Pode deitar tranquilo — o PIX já caiu, o dinheiro já tá guardado. Missão cumprida! 😌",
        ];
    }
    return $phrases[array_rand($phrases)];
}

function getRandomMotivationalTip(): string {
    $tips = [
        // Dicas engraçadas/irônicas
        "� <b>Fato científico:</b> 9 entre 10 vendedores que compartilharam o link venderam mais. O décimo não compartilhou.",
        "🤔 <b>Reflexão do dia:</b> Seu link de vendas no status do WhatsApp custa R$ 0,00. Não colocar pode custar muito mais.",
        "🧠 <b>Psicologia reversa:</b> Não divulgue seu produto. Deixa os outros venderem enquanto você descansa. Brincadeira — VAI DIVULGAR! 😂",
        "� <b>Dica:</b> Status do WhatsApp = vitrine grátis para 200+ pessoas. Está usando essa vitrine ou deixando ela fechada?",
        "🎯 <b>Verdade inconveniente:</b> Produto que ninguém conhece = produto que ninguém compra. Resolve isso hoje!",
        "⚡ <b>Dica rápida:</b> Resposta demorada = cliente perdido. O PIX é instantâneo — sua resposta também deveria ser!",
        "� <b>Previsão:</b> Você vai vender mais esta semana do que na semana passada. Mas só se divulgar mais. Simples assim!",
        "💀 <b>R.I.P.:</b> às vendas que não aconteceram porque o link não foi compartilhado. Não deixa acontecer hoje!",
        "🤑 <b>Matemática básica:</b> Mais divulgação = mais visitas = mais vendas = mais PIX. Qual parte ainda não ficou clara? 😂",
        "🦅 <b>Mentalidade de águia:</b> Enquanto outros estão no grupo do zap reclamando, você está divulgando. Diferença de resultado!",
        "� <b>Dica visual:</b> Foto boa vende. Foto ruim afasta. Já olhou como está a imagem do seu produto hoje?",
        "🏆 <b>Segredo dos top vendedores:</b> Eles não têm superpoderes. Só divulgam mais e respondem mais rápido. Tá liberado copiar!",
    ];
    return $tips[array_rand($tips)];
}

// ── Títulos para notificações do site ────────────────────────────────────────
$siteMorningTitles   = ['☀️ Bom dia! Bora vender!', '🚀 A manhã é sua!', '🔥 Acorda e fatura!', '🐓 O galo cantou. PIX também!'];
$siteAfternoonTitles = ['🌤 Boa tarde, monstro!', '⚡ A tarde é sua!', '🎯 Virou o jogo hoje?', '💸 O almoço foi pago?'];
$siteEveningTitles   = ['🌙 Como foi hoje?', '🌆 Fechou no positivo?', '⭐ Resumo do dia!', '🛋️ Descansa — você merece!'];
$siteTips = [
    'Compartilhou seu link hoje? Produto que não é visto, não é comprado! 💡',
    'Status do WhatsApp = vitrine grátis. Usa ou não usa? 🤔',
    'Resposta rápida = mais conversão. O PIX não espera. ⚡',
    'Foto boa vende. Foto ruim afasta. Já verificou seu produto? 📸',
    '9 em 10 vendedores que divulgaram, venderam. O outro não divulgou. 😂',
];

// ── MODO: MANHÃ ───────────────────────────────────────────────────────────────
if ($mode === 'morning') {
    foreach ($users as $user) {
        $phrase = getMorningPhrase();
        $tip    = getRandomMotivationalTip();
        $msg    = $phrase . $div . "\n\n" . $tip . "\n\n"
                . "🌙 <i>LunarPay • " . date('H:i') . "</i>";
        try {
            if (TelegramService::sendToUser($user['telegram_chat_id'], $msg)) $sent++;
            else $skip++;
            $pdo->prepare("INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?,?,?,?,NOW())")
                ->execute([$user['id'], 'info', $siteMorningTitles[array_rand($siteMorningTitles)], $siteTips[array_rand($siteTips)]]);
            usleep(100000);
        } catch (Throwable $e) { $skip++; }
    }
}

// ── MODO: ALMOÇO ─────────────────────────────────────────────────────────────
elseif ($mode === 'afternoon') {
    foreach ($users as $user) {
        $stats  = getUserDayStats($pdo, (int)$user['id']);
        $phrase = getAfternoonPhrase($stats);
        $sales  = (int)$stats['sales'];
        $statsLine = $sales > 0
            ? "\n\n📊 <b>Seu dia até agora:</b>\n"
              . "   ✅ {$sales} venda(s) — " . fBRL((float)$stats['net_volume']) . " líquido"
            : "\n\n📊 <i>Nenhuma venda ainda hoje. A tarde é sua!</i>";
        $msg = $phrase . $statsLine . $div . "\n\n"
             . getRandomMotivationalTip() . "\n\n"
             . "🌙 <i>LunarPay • " . date('H:i') . "</i>";
        $siteMsg = $sales > 0 ? "{$sales} venda(s) até agora — " . fBRL((float)$stats['net_volume']) . " no bolso! Bora mais! 🔥" : "Nenhuma venda ainda. A tarde é onde os fortes viram o jogo! 🎯";
        try {
            if (TelegramService::sendToUser($user['telegram_chat_id'], $msg)) $sent++;
            else $skip++;
            $pdo->prepare("INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?,?,?,?,NOW())")
                ->execute([$user['id'], 'info', $siteAfternoonTitles[array_rand($siteAfternoonTitles)], $siteMsg]);
            usleep(100000);
        } catch (Throwable $e) { $skip++; }
    }
}

// ── MODO: TARDE/NOITE ─────────────────────────────────────────────────────────
elseif ($mode === 'evening') {
    foreach ($users as $user) {
        $stats  = getUserDayStats($pdo, (int)$user['id']);
        $phrase = getEveningPhrase($stats);
        $sales  = (int)$stats['sales'];
        $statsLine = $sales > 0
            ? "\n\n📊 <b>Resumo parcial do dia:</b>\n"
              . "   💰 {$sales} venda(s) — " . fBRL((float)$stats['volume']) . " bruto\n"
              . "   💎 Você recebe: " . fBRL((float)$stats['net_volume'])
            : '';
        $msg = $phrase . $statsLine . "\n\n"
             . getRandomMotivationalTip() . $div . "\n\n"
             . "🌙 <i>LunarPay • " . date('H:i') . "</i>";
        $siteMsg = $sales > 0 ? "{$sales} venda(s) hoje — " . fBRL((float)$stats['net_volume']) . " líquido. Dorme com esse sorriso! 😁" : "Hoje foi tranquilo. Amanhã você muda o placar! 💪";
        try {
            if (TelegramService::sendToUser($user['telegram_chat_id'], $msg)) $sent++;
            else $skip++;
            $pdo->prepare("INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?,?,?,?,NOW())")
                ->execute([$user['id'], 'info', $siteEveningTitles[array_rand($siteEveningTitles)], $siteMsg]);
            usleep(100000);
        } catch (Throwable $e) { $skip++; }
    }
}

// ── MODO: RESUMO DIÁRIO ───────────────────────────────────────────────────────
elseif ($mode === 'daily_summary') {
    $dayNames = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    $dayName  = $dayNames[(int)date('w')];
    foreach ($users as $user) {
        $stats   = getUserDayStats($pdo, (int)$user['id']);
        $balance = getUserTotalBalance($pdo, (int)$user['id']);
        $sales   = (int)$stats['sales'];
        $charges = (int)$stats['charges'];

        if ($sales === 0 && $charges === 0) {
            $summary = "😴 <i>Dia tranquilo hoje. Amanhã você vai arrasar!</i>";
            $emoji   = '😴';
        } elseif ($sales === 0) {
            $summary = "⏳ <i>{$charges} cobrança(s) gerada(s), mas nenhuma confirmada hoje.</i>";
            $emoji   = '⏳';
        } elseif ($sales < 3) {
            $summary = "✅ <i>Bom dia! Consistência leva ao sucesso!</i>";
            $emoji   = '✅';
        } elseif ($sales < 8) {
            $summary = "🔥 <i>Dia quente! Você está em ritmo de crescimento!</i>";
            $emoji   = '🔥';
        } else {
            $summary = "🏆 <i>DIA ÉPICO! Você está entre os melhores! Parabéns!</i>";
            $emoji   = '🏆';
        }

        $msg = "📋 <b>RESUMO DO SEU DIA</b> {$emoji}{$div}\n"
             . "📅 <b>{$dayName}, " . date('d/m') . "</b>\n\n"
             . "<b>💰 VENDAS HOJE:</b>\n"
             . "   ✅ Confirmadas: <b>{$sales}</b>\n"
             . "   ⚡ Cobranças geradas: {$charges}\n"
             . ($sales > 0
                 ? "   💵 Volume bruto: <b>" . fBRL((float)$stats['volume']) . "</b>\n"
                 . "   💎 Seu líquido: <b>" . fBRL((float)$stats['net_volume']) . "</b>\n"
                 : "")
             . "\n<b>🏦 SALDO DISPONÍVEL:</b> " . fBRL($balance) . "\n\n"
             . $summary . $div . "\n\n"
             . getRandomMotivationalTip() . "\n\n"
             . "🌙 <i>LunarPay • Resumo automático • " . date('H:i') . "</i>";

        try {
            if (TelegramService::sendToUser($user['telegram_chat_id'], $msg)) $sent++;
            else $skip++;
            usleep(150000);
        } catch (Throwable $e) { $skip++; }
    }
}

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'mode'    => $mode,
    'sent'    => $sent,
    'skipped' => $skip,
    'total'   => count($users),
    'time'    => date('Y-m-d H:i:s'),
]);
