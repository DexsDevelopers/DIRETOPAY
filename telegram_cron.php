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
    $dayPhrases = [
        0 => [ // Domingo
            "☀️ <b>Bom dia!</b> Domingo também é dia de vender! Os seus concorrentes estão descansando — você não precisa! 💪",
            "🌅 <b>Domingo chegou!</b> Enquanto o mundo dorme até tarde, seus links de vendas trabalham por você. Bora! 🚀",
        ],
        1 => [ // Segunda
            "💪 <b>Segunda-feira, bora!</b> A semana começou e as oportunidades também. Que hoje seja o melhor dia da semana! 🔥",
            "☀️ <b>Bom dia, campeão!</b> Segunda é dia de recomeçar com tudo. A semana passada foi só o aquecimento! 🚀",
            "🌅 <b>Segunda com energia!</b> Cada semana é uma nova chance. Hoje você define o tom da semana toda! 💰",
        ],
        2 => [ // Terça
            "⚡ <b>Bom dia!</b> Terça-feira, o motor já está quente. Hora de acelerar as vendas! 🔥",
            "☀️ <b>Terça animada!</b> Segunda foi só aquecimento, hoje é pra valer! Compartilhe seus links agora! 💪",
        ],
        3 => [ // Quarta
            "🎯 <b>Bom dia!</b> Quarta-feira, metade da semana! Você já chegou até aqui, agora é só continuar! 💪",
            "⚡ <b>Quarta-feira!</b> Meio da semana e muita energia ainda! Bora fechar boas vendas hoje! 🔥",
        ],
        4 => [ // Quinta
            "🚀 <b>Bom dia!</b> Quinta-feira! Um dia só para a sexta... Aproveita e já garante suas vendas! 💰",
            "🎯 <b>Quinta poderosa!</b> Amanhã é sexta mas hoje ainda tem muito pra ganhar! Foco total! 💪",
        ],
        5 => [ // Sexta
            "🎉 <b>SEXTA-FEIRA!</b> Bom dia! O fim de semana chegou — que tal terminar a semana no lucro máximo? 🔥",
            "🥳 <b>Sextou!</b> Mas antes de comemorar, que tal garantir mais algumas vendas pela manhã? 💰",
            "🎊 <b>Bom dia, sexta!</b> A semana está finalizando e você ainda pode bater um recorde hoje! 🏆",
        ],
        6 => [ // Sábado
            "🌟 <b>Bom dia!</b> Sábado de produtividade! Enquanto outros dormem até tarde, você já está no lucro! 💪",
            "⚡ <b>Sábado chegou!</b> Fim de semana não para os campeões. Suas vendas não têm folga! 🚀",
        ],
    ];
    $phrases = $dayPhrases[$dow] ?? $dayPhrases[1];
    return $phrases[array_rand($phrases)];
}

function getAfternoonPhrase(array $stats): string {
    $sales = (int)$stats['sales'];
    if ($sales === 0) {
        $phrases = [
            "🌤 <b>Boa tarde!</b> A manhã passou mas a tarde chegou cheia de oportunidades! Hora de turbinar as vendas! 💪",
            "☀️ <b>Tarde chegando!</b> Ainda não teve venda hoje? A tarde é sua chance de virar o jogo! 🎯",
            "🎯 <b>Boa tarde!</b> O almoço está sendo pago hoje? Corre e compartilha seu link! 🚀",
        ];
    } elseif ($sales < 3) {
        $phrases = [
            "🌤 <b>Boa tarde!</b> Já tem " . $sales . " venda(s) hoje! A tarde promete mais! Continue assim! 🔥",
            "☀️ <b>Tarde produtiva!</b> " . $sales . " venda(s) até agora — o almoço foi pago! Bora mais! 💰",
            "💪 <b>Boa tarde!</b> Manhã boa, tarde vai ser melhor! Já bateu " . $sales . " venda(s)! 🎯",
        ];
    } else {
        $phrases = [
            "🔥 <b>Boa tarde!</b> " . $sales . " vendas e contando! Você está BOMBANDO hoje! 🚀",
            "💰 <b>Tarde milionária!</b> " . $sales . " vendas no bolso! Continue que hoje pode ser recorde! 🏆",
            "🎊 <b>Boa tarde, top vendedor!</b> " . $sales . " vendas hoje! O jantar vai ser especial! 🍽️",
        ];
    }
    return $phrases[array_rand($phrases)];
}

function getEveningPhrase(array $stats): string {
    $sales = (int)$stats['sales'];
    $dow   = (int)date('w');
    if ($dow === 5) { // Sexta
        $base = $sales > 0
            ? "🎉 <b>Boa noite!</b> Sexta com {$sales} venda(s)! O fim de semana pode começar com o bolso cheio! 🥂"
            : "🌙 <b>Boa noite!</b> Sexta chegou! Ainda dá tempo de uma venda antes de aproveitar o finde! 💪";
        return $base;
    }
    if ($sales === 0) {
        $phrases = [
            "🌙 <b>Boa noite!</b> O dia passou mas amanhã é uma nova chance! Prepare seus produtos e links agora! 🚀",
            "🌆 <b>Boa noite!</b> Hoje foi um dia tranquilo. Amanhã você vai arrasar! Já planejou as vendas? 💡",
        ];
    } else {
        $phrases = [
            "🌙 <b>Boa noite!</b> Fechando o dia com {$sales} venda(s)! " . fBRL((float)$stats['net_volume']) . " no bolso! 🎉",
            "🌆 <b>Boa noite!</b> Dia produtivo! {$sales} venda(s) e " . fBRL((float)$stats['net_volume']) . " líquido. Descanse com merecimento! 💤",
            "⭐ <b>Boa noite, campeão!</b> {$sales} venda(s) hoje! O jantar foi garantido! 🍽️",
        ];
    }
    $phrases = $phrases ?? [$base];
    return $phrases[array_rand($phrases)];
}

function getRandomMotivationalTip(): string {
    $tips = [
        "💡 <b>Dica do dia:</b> Compartilhe seu link de vendas no seu status do WhatsApp — alcança mais pessoas!",
        "💡 <b>Dica do dia:</b> Fotos de qualidade vendem mais. Já atualizou as imagens dos seus produtos?",
        "💡 <b>Dica do dia:</b> Um cliente satisfeito indica dois. Trate bem quem comprou!",
        "💡 <b>Dica do dia:</b> Crie urgência na sua oferta. \"Apenas hoje\" ou \"Últimas unidades\" convertem mais!",
        "💡 <b>Dica do dia:</b> Responda rápido as mensagens. Velocidade de resposta aumenta muito a conversão!",
        "💡 <b>Dica do dia:</b> Peça avaliações para seus clientes. Prova social é poderosa!",
        "💡 <b>Dica do dia:</b> Diversifique: crie mais de um produto para aumentar seu ticket médio!",
        "💡 <b>Dica do dia:</b> Use as redes sociais a seu favor. Poste resultados e depoimentos!",
        "💡 <b>Dica do dia:</b> Defina uma meta diária. Quem tem meta, tem foco!",
        "💡 <b>Dica do dia:</b> O PIX é instantâneo — aproveite para vender a qualquer hora do dia!",
    ];
    return $tips[array_rand($tips)];
}

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
            usleep(100000); // 0.1s entre mensagens para não dar flood
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
        try {
            if (TelegramService::sendToUser($user['telegram_chat_id'], $msg)) $sent++;
            else $skip++;
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
        try {
            if (TelegramService::sendToUser($user['telegram_chat_id'], $msg)) $sent++;
            else $skip++;
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
