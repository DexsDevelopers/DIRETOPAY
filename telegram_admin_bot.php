<?php
/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   Ghost Pix — Telegram Admin Bot                                        ║
 * ║   Comandos exclusivos para administradores via Telegram                 ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Comandos:
 *  /ranking [dias]  — Ranking completo: nomes reais + WhatsApp (padrão: 30 dias)
 *  /ranking7        — Ranking últimos 7 dias
 *  /ranking30       — Ranking últimos 30 dias
 *  /ranking hoje    — Ranking do dia
 *  /resumo          — Resumo geral da plataforma (vendas, usuários, saques)
 *
 * Configuração no config.php:
 *  define('TELEGRAM_BOT_TOKEN', '...');   // Mesmo token do bot admin
 *  define('TELEGRAM_CHAT_ID', '...');     // Chat ID do grupo/canal admin
 */

date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/admin_bot_errors.log');

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/TelegramService.php';

$BOT_TOKEN   = defined('TELEGRAM_BOT_TOKEN') ? TELEGRAM_BOT_TOKEN : '';
$ADMIN_CHAT  = defined('TELEGRAM_CHAT_ID')   ? TELEGRAM_CHAT_ID   : '';

if (!$BOT_TOKEN || !$ADMIN_CHAT) {
    http_response_code(200);
    exit('OK');
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function adminSend(string $chatId, string $text): void {
    global $BOT_TOKEN;
    $ch = curl_init("https://api.telegram.org/bot{$BOT_TOKEN}/sendMessage");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode([
            'chat_id'                  => $chatId,
            'text'                     => $text,
            'parse_mode'               => 'HTML',
            'disable_web_page_preview' => true,
        ]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT    => 15,
    ]);
    curl_exec($ch);
    curl_close($ch);
}

function div(): string { return "━━━━━━━━━━━━━━━━━━━━"; }
function fmt(float $v): string { return 'R$ ' . number_format($v, 2, ',', '.'); }

// ── Parse update ─────────────────────────────────────────────────────────────
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { http_response_code(200); exit('OK'); }

$msg     = $input['message'] ?? null;
if (!$msg || !isset($msg['text'])) { http_response_code(200); exit('OK'); }

$chatId  = (string)($msg['chat']['id'] ?? '');
$text    = trim($msg['text'] ?? '');

// Só responde ao chat admin
if ($chatId !== (string)$ADMIN_CHAT) {
    http_response_code(200);
    exit('OK');
}

// Parse command + arg
$command = '';
$arg     = '';
if (str_starts_with($text, '/')) {
    $parts   = explode(' ', $text, 2);
    $command = strtolower(trim($parts[0], '/'));
    $arg     = trim($parts[1] ?? '');
}

// ══════════════════════════════════════════════════════════════════════════════
// /ranking [dias|hoje|7|30]
// ══════════════════════════════════════════════════════════════════════════════
if (in_array($command, ['ranking', 'ranking7', 'ranking30'])) {
    // Determinar período
    if ($command === 'ranking7') {
        $days = 7;
    } elseif ($command === 'ranking30') {
        $days = 30;
    } elseif (strtolower($arg) === 'hoje') {
        $days = 1;
    } elseif (is_numeric($arg) && (int)$arg > 0) {
        $days = (int)$arg;
    } else {
        $days = 30;
    }

    $label = $days === 1 ? 'Hoje' : "Últimos {$days} dias";

    $stmt = $pdo->prepare("
        SELECT u.id, u.full_name, u.whatsapp, u.email,
               COUNT(t.id) AS sales,
               COALESCE(SUM(t.amount_brl), 0) AS volume,
               COALESCE(SUM(t.amount_net_brl), 0) AS net_volume
        FROM users u
        LEFT JOIN transactions t
            ON u.id = t.user_id
            AND t.status = 'paid'
            AND t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        WHERE u.status = 'approved' AND u.is_admin = 0 AND u.is_demo = 0
        GROUP BY u.id
        ORDER BY volume DESC
        LIMIT 15
    ");
    $stmt->execute([$days]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $totalSellers = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE status = 'approved' AND is_admin = 0 AND is_demo = 0")->fetchColumn();
    $totalVol = array_sum(array_column($rows, 'volume'));

    $medals = ['🥇','🥈','🥉'];
    $reply  = "🏆 <b>RANKING ADMIN — {$label}</b>\n" . div() . "\n\n";

    $pos = 0;
    foreach ($rows as $i => $r) {
        if ((float)$r['volume'] <= 0) continue;
        $pos++;
        $medal = $medals[$i] ?? "{$pos}º";
        $wa    = $r['whatsapp']
            ? "\n       📱 <code>{$r['whatsapp']}</code>"
            : "\n       📧 <code>{$r['email']}</code>";
        $gross = number_format((float)$r['volume'], 2, ',', '.');
        $net   = number_format((float)$r['net_volume'], 2, ',', '.');
        $reply .= "{$medal} <b>{$r['full_name']}</b>{$wa}\n"
               .  "       {$r['sales']}x — R$ {$gross} bruto | R$ {$net} líquido\n\n";
    }

    if ($pos === 0) {
        $reply .= "<i>Nenhuma venda no período.</i>\n\n";
    }

    $reply .= div() . "\n"
           .  "👥 <b>{$totalSellers}</b> vendedores ativos\n"
           .  "💰 Volume total: <b>" . number_format($totalVol, 2, ',', '.') . "</b>\n"
           .  "\n🤖 <i>Ghost Pix Admin • " . date('d/m/Y H:i') . "</i>";

    adminSend($chatId, $reply);
    http_response_code(200);
    exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /resumo — Visão geral da plataforma
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'resumo') {
    $todayVol   = (float)$pdo->query("SELECT COALESCE(SUM(amount_brl),0) FROM transactions WHERE status='paid' AND DATE(created_at)=CURDATE()")->fetchColumn();
    $todayCnt   = (int)$pdo->query("SELECT COUNT(*) FROM transactions WHERE status='paid' AND DATE(created_at)=CURDATE()")->fetchColumn();
    $monthVol   = (float)$pdo->query("SELECT COALESCE(SUM(amount_brl),0) FROM transactions WHERE status='paid' AND created_at >= DATE_FORMAT(CURDATE(),'%Y-%m-01')")->fetchColumn();
    $totalUsers = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE status='approved' AND is_admin=0 AND is_demo=0")->fetchColumn();
    $pendingWd  = (int)$pdo->query("SELECT COUNT(*) FROM withdrawals WHERE status='pending'")->fetchColumn();
    $pendingWdVol = (float)$pdo->query("SELECT COALESCE(SUM(amount),0) FROM withdrawals WHERE status='pending'")->fetchColumn();

    $reply = "📊 <b>RESUMO DA PLATAFORMA</b>\n" . div() . "\n\n"
           . "🗓 <b>Hoje</b>\n"
           . "    {$todayCnt} vendas — " . fmt($todayVol) . "\n\n"
           . "📅 <b>Este mês</b>\n"
           . "    " . fmt($monthVol) . " em vendas\n\n"
           . "👥 <b>Vendedores ativos:</b> {$totalUsers}\n"
           . "🏦 <b>Saques pendentes:</b> {$pendingWd} — " . fmt($pendingWdVol) . "\n\n"
           . "🤖 <i>Ghost Pix Admin • " . date('d/m/Y H:i') . "</i>";

    adminSend($chatId, $reply);
    http_response_code(200);
    exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /ajuda — Lista de comandos admin
// ══════════════════════════════════════════════════════════════════════════════
if (in_array($command, ['ajuda', 'help', 'start'])) {
    $reply = "🤖 <b>Ghost Pix — Bot Admin</b>\n" . div() . "\n\n"
           . "Comandos disponíveis:\n\n"
           . "🏆 <b>/ranking</b> — Ranking 30 dias (nomes + WhatsApp)\n"
           . "🏆 <b>/ranking hoje</b> — Ranking do dia\n"
           . "🏆 <b>/ranking 7</b> — Ranking últimos 7 dias\n"
           . "🏆 <b>/ranking7</b> — Atalho para 7 dias\n"
           . "📊 <b>/resumo</b> — Visão geral da plataforma\n\n"
           . "<i>Apenas este chat autorizado recebe respostas.</i>";

    adminSend($chatId, $reply);
    http_response_code(200);
    exit;
}

http_response_code(200);
exit('OK');
