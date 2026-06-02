<?php
/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   DiretoPay — Telegram Admin Bot v2                                     ║
 * ║   Notificações push + comandos exclusivos para administradores          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Comandos disponíveis:
 *   /start | /ajuda     — lista de comandos
 *   /resumo             — visão geral da plataforma (hoje + mês)
 *   /vendas [N]         — vendas das últimas N horas (padrão 24h)
 *   /ranking [dias]     — ranking de vendedores por volume
 *   /saques             — saques pendentes com botões Pagar/Rejeitar
 *   /usuarios           — últimos 10 cadastros com botões Aprovar/Bloquear
 *   /pendentes          — produtos aguardando aprovação
 *   /buscar {email}     — buscar usuário por e-mail
 *   /saldo {id}         — saldo e dados do usuário
 *   /taxa {id} {rate}   — alterar taxa de comissão do usuário
 *   /bloquear {id}      — bloquear usuário
 *   /aprovar {id}       — aprovar usuário
 *   /resetsenha {id}    — resetar senha do usuário
 *   /alertas            — alertas do sistema (saques altos, erros)
 *   /financeiro         — resumo financeiro detalhado (taxas, lucro plataforma)
 *
 * Webhook a registrar:
 *   POST https://api.telegram.org/bot{TOKEN}/setWebhook
 *   {"url": "https://SEU_DOMINIO/telegram_admin_bot.php"}
 */

date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/admin_bot_errors.log');

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/TelegramService.php';

$BOT_TOKEN  = defined('TELEGRAM_BOT_TOKEN') ? TELEGRAM_BOT_TOKEN : '';
$ADMIN_CHAT = defined('TELEGRAM_CHAT_ID')   ? TELEGRAM_CHAT_ID   : '';

if (!$BOT_TOKEN || !$ADMIN_CHAT) {
    http_response_code(200);
    exit('OK');
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function adminSend(string $chatId, string $text, array $keyboard = []): ?int
{
    global $BOT_TOKEN;
    $payload = [
        'chat_id'                  => $chatId,
        'text'                     => $text,
        'parse_mode'               => 'HTML',
        'disable_web_page_preview' => true,
    ];
    if ($keyboard) {
        $payload['reply_markup'] = ['inline_keyboard' => $keyboard];
    }
    $ch = curl_init("https://api.telegram.org/bot{$BOT_TOKEN}/sendMessage");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 15,
    ]);
    $raw = curl_exec($ch);
    curl_close($ch);
    $res = json_decode($raw ?: '{}', true);
    return $res['ok'] ? ($res['result']['message_id'] ?? null) : null;
}

function adminEdit(string $chatId, int $msgId, string $text, array $keyboard = []): void
{
    global $BOT_TOKEN;
    $payload = [
        'chat_id'                  => $chatId,
        'message_id'               => $msgId,
        'text'                     => $text,
        'parse_mode'               => 'HTML',
        'disable_web_page_preview' => true,
    ];
    if ($keyboard) $payload['reply_markup'] = ['inline_keyboard' => $keyboard];
    $ch = curl_init("https://api.telegram.org/bot{$BOT_TOKEN}/editMessageText");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 10,
    ]);
    curl_exec($ch);
    curl_close($ch);
}

function adminAnswer(string $cbId, string $text = '', bool $alert = false): void
{
    global $BOT_TOKEN;
    $ch = curl_init("https://api.telegram.org/bot{$BOT_TOKEN}/answerCallbackQuery");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode(['callback_query_id' => $cbId, 'text' => $text, 'show_alert' => $alert]),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 5,
    ]);
    curl_exec($ch);
    curl_close($ch);
}

function div(): string  { return "━━━━━━━━━━━━━━━━━━━━━━"; }
function fmt(float $v): string { return 'R$ ' . number_format($v, 2, ',', '.'); }
function foot(): string { return "\n\n" . div() . "\n🤖 <i>DiretoPay Admin • " . date('d/m/Y H:i') . "</i>"; }
function pct(float $a, float $b): string {
    if ($b <= 0) return '0%';
    return number_format(($a / $b) * 100, 1) . '%';
}

// ── Parse update ─────────────────────────────────────────────────────────────

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { http_response_code(200); exit('OK'); }

// ══════════════════════════════════════════════════════════════════════════════
// CALLBACK QUERY (botões inline)
// ══════════════════════════════════════════════════════════════════════════════
if (isset($input['callback_query'])) {
    $cb     = $input['callback_query'];
    $cbId   = $cb['id'];
    $chatId = (string) $cb['message']['chat']['id'];
    $msgId  = (int)    $cb['message']['message_id'];
    $data   = $cb['data'] ?? '';

    if ($chatId !== (string)$ADMIN_CHAT) {
        adminAnswer($cbId, '❌ Não autorizado.', true);
        http_response_code(200); exit;
    }

    // ── Aprovar / Rejeitar saque ──────────────────────────────────────────
    if (preg_match('/^a2_wd_(approve|reject)_(\d+)$/', $data, $m)) {
        $action = $m[1];
        $wdId   = (int) $m[2];

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("SELECT w.*, u.full_name, u.pix_key AS upix FROM withdrawals w JOIN users u ON u.id = w.user_id WHERE w.id = ? FOR UPDATE");
            $stmt->execute([$wdId]);
            $wd = $stmt->fetch();

            if (!$wd || $wd['status'] !== 'pending') {
                $pdo->rollBack();
                adminAnswer($cbId, '⚠️ Saque não encontrado ou já processado.', true);
                http_response_code(200); exit;
            }

            $pixKey = $wd['pix_key'] ?? $wd['upix'] ?? '—';

            if ($action === 'approve') {
                $result = adjustBalance((int)$wd['user_id'], -abs((float)$wd['amount']), 'withdraw_debit', 'wd_' . $wdId, 'Saque #' . $wdId . ' aprovado');
                if (!$result['success']) {
                    $pdo->rollBack();
                    adminAnswer($cbId, '❌ Saldo insuficiente: ' . $result['error'], true);
                    http_response_code(200); exit;
                }
                $pdo->prepare("UPDATE withdrawals SET status = 'completed' WHERE id = ?")->execute([$wdId]);
                $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Saque Enviado! 💸', ?, 'success')")
                    ->execute([$wd['user_id'], 'Seu saque de ' . fmt((float)$wd['amount']) . ' foi processado com sucesso.']);
                $pdo->commit();

                adminAnswer($cbId, '✅ Saque pago!');
                adminEdit($chatId, $msgId,
                    "✅ <b>SAQUE #$wdId PAGO</b>\n" . div() . "\n\n"
                    . "👤 <b>Usuário:</b> {$wd['full_name']}\n"
                    . "💵 <b>Valor:</b>   " . fmt((float)$wd['amount']) . "\n"
                    . "🔑 <b>PIX:</b>     <code>{$pixKey}</code>\n"
                    . "💰 <b>Saldo:</b>   " . fmt($result['balance_before']) . " → " . fmt($result['balance_after']) . "\n\n"
                    . "✅ <i>Pago via Telegram Bot — " . date('d/m H:i') . "</i>"
                );
            } else {
                $pdo->prepare("UPDATE withdrawals SET status = 'rejected' WHERE id = ?")->execute([$wdId]);
                $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Saque Rejeitado ❌', ?, 'warning')")
                    ->execute([$wd['user_id'], 'Seu saque de ' . fmt((float)$wd['amount']) . ' foi rejeitado.']);
                $pdo->commit();

                adminAnswer($cbId, '❌ Saque rejeitado.');
                adminEdit($chatId, $msgId,
                    "❌ <b>SAQUE #$wdId REJEITADO</b>\n" . div() . "\n\n"
                    . "👤 <b>Usuário:</b> {$wd['full_name']}\n"
                    . "💵 <b>Valor:</b>   " . fmt((float)$wd['amount']) . "\n\n"
                    . "🔒 <i>Saldo não debitado.</i>\n"
                    . "❌ <i>Rejeitado via Telegram Bot — " . date('d/m H:i') . "</i>"
                );
            }
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            adminAnswer($cbId, '❌ Erro: ' . $e->getMessage(), true);
        }
        http_response_code(200); exit;
    }

    // ── Aprovar / Bloquear usuário ────────────────────────────────────────
    if (preg_match('/^a2_user_(approve|block)_(\d+)$/', $data, $m)) {
        $action = $m[1];
        $uid    = (int) $m[2];

        $stmt = $pdo->prepare("SELECT id, full_name, email, status FROM users WHERE id = ?");
        $stmt->execute([$uid]);
        $u = $stmt->fetch();

        if (!$u) {
            adminAnswer($cbId, '❌ Usuário não encontrado.', true);
            http_response_code(200); exit;
        }

        $newStatus = $action === 'approve' ? 'approved' : 'blocked';
        $pdo->prepare("UPDATE users SET status = ? WHERE id = ?")->execute([$newStatus, $uid]);

        $icon  = $action === 'approve' ? '✅' : '🔴';
        $label = $action === 'approve' ? 'APROVADO' : 'BLOQUEADO';

        adminAnswer($cbId, "{$icon} Usuário {$label}!");
        adminEdit($chatId, $msgId,
            "{$icon} <b>USUÁRIO {$label}</b>\n" . div() . "\n\n"
            . "👤 <b>Nome:</b>   {$u['full_name']}\n"
            . "📧 <b>Email:</b>  <code>{$u['email']}</code>\n"
            . "🆔 <b>ID:</b>     #{$uid}\n\n"
            . "<i>{$icon} Alterado via Telegram Bot — " . date('d/m H:i') . "</i>"
        );
        http_response_code(200); exit;
    }

    // ── Aprovar / Recusar produto ─────────────────────────────────────────
    if (preg_match('/^a2_prod_(approve|reject)_(\d+)$/', $data, $m)) {
        $action    = $m[1];
        $productId = (int) $m[2];

        $stmt = $pdo->prepare("SELECT p.id, p.name, p.price, u.full_name AS seller, u.id AS uid FROM products p JOIN users u ON u.id = p.user_id WHERE p.id = ?");
        $stmt->execute([$productId]);
        $p = $stmt->fetch();

        if (!$p) {
            adminAnswer($cbId, '❌ Produto não encontrado.', true);
            http_response_code(200); exit;
        }

        if ($action === 'approve') {
            $pdo->prepare("UPDATE products SET status = 'active', updated_at = NOW() WHERE id = ?")->execute([$productId]);
            $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, '✅ Produto Aprovado!', ?, 'success')")
                ->execute([$p['uid'], 'Seu produto "' . $p['name'] . '" foi aprovado e já está disponível.']);
            adminAnswer($cbId, '✅ Produto aprovado!');
            adminEdit($chatId, $msgId,
                "✅ <b>PRODUTO #$productId APROVADO</b>\n" . div() . "\n\n"
                . "📦 <b>Produto:</b>  {$p['name']}\n"
                . "💵 <b>Preço:</b>    " . fmt((float)$p['price']) . "\n"
                . "🏪 <b>Vendedor:</b> {$p['seller']}\n\n"
                . "✅ <i>Aprovado via Telegram Bot — " . date('d/m H:i') . "</i>"
            );
        } else {
            $pdo->prepare("UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id = ?")->execute([$productId]);
            $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, '❌ Produto Reprovado', ?, 'warning')")
                ->execute([$p['uid'], 'Seu produto "' . $p['name'] . '" não foi aprovado. Entre em contato com o suporte.']);
            adminAnswer($cbId, '❌ Produto recusado.');
            adminEdit($chatId, $msgId,
                "❌ <b>PRODUTO #$productId RECUSADO</b>\n" . div() . "\n\n"
                . "📦 <b>Produto:</b>  {$p['name']}\n"
                . "🏪 <b>Vendedor:</b> {$p['seller']}\n\n"
                . "❌ <i>Recusado via Telegram Bot — " . date('d/m H:i') . "</i>"
            );
        }
        http_response_code(200); exit;
    }

    adminAnswer($cbId);
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// MENSAGEM / COMANDO
// ══════════════════════════════════════════════════════════════════════════════
$msg = $input['message'] ?? null;
if (!$msg || !isset($msg['text'])) { http_response_code(200); exit('OK'); }

$chatId = (string)($msg['chat']['id'] ?? '');
$text   = trim($msg['text'] ?? '');

if ($chatId !== (string)$ADMIN_CHAT) {
    http_response_code(200); exit('OK');
}

$parts   = explode(' ', $text, 3);
$command = strtolower(ltrim($parts[0], '/'));
if (strpos($command, '@') !== false) $command = explode('@', $command)[0];
$arg1 = trim($parts[1] ?? '');
$arg2 = trim($parts[2] ?? '');

// ══════════════════════════════════════════════════════════════════════════════
// /start | /ajuda | /help
// ══════════════════════════════════════════════════════════════════════════════
if (in_array($command, ['start', 'ajuda', 'help'])) {
    $pendWd = (int)$pdo->query("SELECT COUNT(*) FROM withdrawals WHERE status='pending'")->fetchColumn();
    $pendUsr = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE status='pending' AND is_admin=0")->fetchColumn();
    $pendProd = (int)$pdo->query("SELECT COUNT(*) FROM products WHERE status='pending'")->fetchColumn();

    $alerts = '';
    if ($pendWd > 0)   $alerts .= "\n💸 <b>{$pendWd}</b> saque(s) pendentes";
    if ($pendUsr > 0)  $alerts .= "\n👤 <b>{$pendUsr}</b> usuário(s) aguardando aprovação";
    if ($pendProd > 0) $alerts .= "\n📦 <b>{$pendProd}</b> produto(s) aguardando revisão";
    $alertBlock = $alerts ? "\n\n⚠️ <b>PENDÊNCIAS AGORA:</b>" . $alerts : "\n\n✅ Nenhuma pendência no momento.";

    adminSend($chatId,
        "🤖 <b>DiretoPay — Bot Admin v2</b>\n" . div() . "\n\n"
        . "<b>📊 Relatórios:</b>\n"
        . "/resumo — Visão geral da plataforma\n"
        . "/vendas [horas] — Vendas das últimas N horas\n"
        . "/ranking [dias] — Ranking de vendedores\n"
        . "/financeiro — Receita e taxas detalhadas\n"
        . "/alertas — Movimentações suspeitas\n\n"
        . "<b>⚙️ Gestão:</b>\n"
        . "/saques — Saques pendentes (Pagar/Rejeitar)\n"
        . "/usuarios — Últimos cadastros (Aprovar/Bloquear)\n"
        . "/pendentes — Produtos para revisar\n"
        . "/buscar {email} — Buscar usuário\n\n"
        . "<b>🔧 Ações diretas:</b>\n"
        . "/saldo {id} — Saldo e dados do usuário\n"
        . "/taxa {id} {%} — Alterar taxa de comissão\n"
        . "/aprovar {id} — Aprovar usuário\n"
        . "/bloquear {id} — Bloquear usuário\n"
        . "/resetsenha {id} — Gerar nova senha\n\n"
        . "<b>🏆 Ranking:</b>\n"
        . "/ranking — Todos os tempos\n"
        . "/ranking hoje — Dia atual\n"
        . "/ranking 7 — Últimos 7 dias\n"
        . "/ranking 30 — Últimos 30 dias"
        . $alertBlock
        . foot()
    );
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /resumo — Visão geral
// ══════════════════════════════════════════════════════════════════════════════
if (in_array($command, ['resumo', 'overview'])) {
    $s = $pdo->query("
        SELECT
            (SELECT COUNT(*) FROM transactions WHERE status='paid' AND DATE(created_at)=CURDATE()) AS today_cnt,
            (SELECT COALESCE(SUM(amount_brl),0) FROM transactions WHERE status='paid' AND DATE(created_at)=CURDATE()) AS today_vol,
            (SELECT COALESCE(SUM(amount_brl - amount_net_brl),0) FROM transactions WHERE status='paid' AND DATE(created_at)=CURDATE()) AS today_fee,
            (SELECT COUNT(*) FROM transactions WHERE status='paid' AND YEAR(created_at)=YEAR(NOW()) AND MONTH(created_at)=MONTH(NOW())) AS month_cnt,
            (SELECT COALESCE(SUM(amount_brl),0) FROM transactions WHERE status='paid' AND YEAR(created_at)=YEAR(NOW()) AND MONTH(created_at)=MONTH(NOW())) AS month_vol,
            (SELECT COALESCE(SUM(amount_brl - amount_net_brl),0) FROM transactions WHERE status='paid' AND YEAR(created_at)=YEAR(NOW()) AND MONTH(created_at)=MONTH(NOW())) AS month_fee,
            (SELECT COUNT(*) FROM users WHERE status='approved' AND is_admin=0 AND is_demo=0) AS active_users,
            (SELECT COUNT(*) FROM users WHERE status='pending' AND is_admin=0) AS pending_users,
            (SELECT COUNT(*) FROM users WHERE DATE(created_at)=CURDATE() AND is_admin=0) AS new_today,
            (SELECT COUNT(*) FROM withdrawals WHERE status='pending') AS pending_wd,
            (SELECT COALESCE(SUM(amount),0) FROM withdrawals WHERE status='pending') AS pending_wd_vol,
            (SELECT COUNT(*) FROM products WHERE status='pending') AS pending_prod,
            (SELECT COUNT(*) FROM transactions WHERE status='pending' AND DATE(created_at)=CURDATE()) AS open_charges
    ")->fetch();

    $avgToday = (int)$s['today_cnt'] > 0 ? (float)$s['today_vol'] / (int)$s['today_cnt'] : 0;

    adminSend($chatId,
        "📊 <b>RESUMO DA PLATAFORMA</b>\n" . div() . "\n\n"
        . "🗓 <b>HOJE — " . date('d/m/Y') . "</b>\n"
        . "   💰 " . (int)$s['today_cnt'] . " vendas — " . fmt((float)$s['today_vol']) . "\n"
        . "   💎 Taxas arrecadadas: " . fmt((float)$s['today_fee']) . "\n"
        . "   🎯 Ticket médio: " . fmt($avgToday) . "\n"
        . "   ⚡ Cobranças abertas: " . (int)$s['open_charges'] . "\n\n"
        . "📅 <b>ESTE MÊS — " . date('m/Y') . "</b>\n"
        . "   💰 " . (int)$s['month_cnt'] . " vendas — " . fmt((float)$s['month_vol']) . "\n"
        . "   💎 Taxas arrecadadas: " . fmt((float)$s['month_fee']) . "\n\n"
        . "👥 <b>USUÁRIOS</b>\n"
        . "   Ativos: " . (int)$s['active_users'] . " | Novos hoje: " . (int)$s['new_today'] . "\n"
        . "   Aguardando aprovação: " . (int)$s['pending_users'] . "\n\n"
        . "⚠️ <b>PENDÊNCIAS</b>\n"
        . "   💸 Saques: " . (int)$s['pending_wd'] . " — " . fmt((float)$s['pending_wd_vol']) . "\n"
        . "   📦 Produtos: " . (int)$s['pending_prod']
        . foot()
    );
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /vendas [horas]
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'vendas') {
    $hours = is_numeric($arg1) && (int)$arg1 > 0 ? (int)$arg1 : 24;
    $stmt = $pdo->prepare("
        SELECT t.id, t.amount_brl, t.amount_net_brl, t.customer_name, t.created_at,
               u.full_name AS seller
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        WHERE t.status = 'paid' AND t.created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        ORDER BY t.created_at DESC LIMIT 20
    ");
    $stmt->execute([$hours]);
    $rows = $stmt->fetchAll();

    $totVol = (float)$pdo->prepare("SELECT COALESCE(SUM(amount_brl),0) FROM transactions WHERE status='paid' AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)")->execute([$hours]) ? 0 : 0;
    $sumStmt = $pdo->prepare("SELECT COUNT(*) AS cnt, COALESCE(SUM(amount_brl),0) AS vol, COALESCE(SUM(amount_brl - amount_net_brl),0) AS fee FROM transactions WHERE status='paid' AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)");
    $sumStmt->execute([$hours]);
    $sum = $sumStmt->fetch();

    if (!$rows) {
        adminSend($chatId, "📭 Nenhuma venda nas últimas {$hours}h." . foot());
        http_response_code(200); exit;
    }

    $out = "💰 <b>VENDAS — últimas {$hours}h</b>\n" . div() . "\n\n"
         . "📊 " . (int)$sum['cnt'] . " vendas — " . fmt((float)$sum['vol']) . " bruto | " . fmt((float)$sum['fee']) . " taxas\n\n";

    foreach (array_slice($rows, 0, 15) as $t) {
        $time  = date('H:i', strtotime($t['created_at']));
        $gross = fmt((float)$t['amount_brl']);
        $buyer = htmlspecialchars($t['customer_name'] ?: 'Anônimo');
        $seller = htmlspecialchars($t['seller']);
        $out .= "• {$time} <b>{$gross}</b> — {$buyer} → <i>{$seller}</i>\n";
    }

    if (count($rows) > 15) $out .= "\n<i>... e mais " . (count($rows) - 15) . " venda(s)</i>";
    $out .= foot();

    adminSend($chatId, $out);
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /financeiro — Receita e taxas detalhadas
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'financeiro') {
    $s = $pdo->query("
        SELECT
            (SELECT COALESCE(SUM(amount_brl),0) FROM transactions WHERE status='paid') AS total_gross,
            (SELECT COALESCE(SUM(amount_net_brl),0) FROM transactions WHERE status='paid') AS total_net,
            (SELECT COALESCE(SUM(amount_brl-amount_net_brl),0) FROM transactions WHERE status='paid') AS total_fee,
            (SELECT COALESCE(SUM(amount_brl),0) FROM transactions WHERE status='paid' AND YEAR(created_at)=YEAR(NOW()) AND MONTH(created_at)=MONTH(NOW())) AS month_gross,
            (SELECT COALESCE(SUM(amount_brl-amount_net_brl),0) FROM transactions WHERE status='paid' AND YEAR(created_at)=YEAR(NOW()) AND MONTH(created_at)=MONTH(NOW())) AS month_fee,
            (SELECT COALESCE(SUM(amount_brl),0) FROM transactions WHERE status='paid' AND DATE(created_at)=CURDATE()) AS today_gross,
            (SELECT COALESCE(SUM(amount_brl-amount_net_brl),0) FROM transactions WHERE status='paid' AND DATE(created_at)=CURDATE()) AS today_fee,
            (SELECT COALESCE(SUM(amount),0) FROM withdrawals WHERE status='completed') AS total_paid_wd,
            (SELECT COALESCE(SUM(amount),0) FROM withdrawals WHERE status='pending') AS pending_wd,
            (SELECT COUNT(*) FROM withdrawals WHERE status='completed') AS wd_cnt,
            (SELECT COUNT(*) FROM transactions WHERE status='paid') AS tx_cnt
    ")->fetch();

    $retainRate = (float)$s['total_gross'] > 0 ? ((float)$s['total_fee'] / (float)$s['total_gross']) * 100 : 0;

    adminSend($chatId,
        "💎 <b>FINANCEIRO DA PLATAFORMA</b>\n" . div() . "\n\n"
        . "🗓 <b>Hoje</b>\n"
        . "   Bruto: " . fmt((float)$s['today_gross']) . " | Taxas: " . fmt((float)$s['today_fee']) . "\n\n"
        . "📅 <b>Este mês</b>\n"
        . "   Bruto: " . fmt((float)$s['month_gross']) . " | Taxas: " . fmt((float)$s['month_fee']) . "\n\n"
        . "🏆 <b>Total histórico (" . number_format((int)$s['tx_cnt']) . " vendas)</b>\n"
        . "   Volume bruto: " . fmt((float)$s['total_gross']) . "\n"
        . "   Repassado líquido: " . fmt((float)$s['total_net']) . "\n"
        . "   💎 Taxas retidas: " . fmt((float)$s['total_fee']) . " (" . number_format($retainRate, 2) . "%)\n\n"
        . "🏦 <b>Saques</b>\n"
        . "   Total enviado: " . fmt((float)$s['total_paid_wd']) . " (" . (int)$s['wd_cnt'] . "x)\n"
        . "   Aguardando: " . fmt((float)$s['pending_wd'])
        . foot()
    );
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /alertas — Movimentações suspeitas + altos valores
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'alertas') {
    $out = "🚨 <b>ALERTAS DO SISTEMA</b>\n" . div() . "\n\n";
    $hasAlert = false;

    // Saques altos (> R$ 1.000)
    $bigWd = $pdo->query("SELECT w.id, w.amount, w.pix_key, u.full_name FROM withdrawals w JOIN users u ON u.id = w.user_id WHERE w.status='pending' AND w.amount > 1000 ORDER BY w.amount DESC LIMIT 5")->fetchAll();
    if ($bigWd) {
        $hasAlert = true;
        $out .= "💸 <b>Saques altos pendentes (>R$1.000):</b>\n";
        foreach ($bigWd as $w) {
            $out .= "   #" . $w['id'] . " — " . fmt((float)$w['amount']) . " — " . htmlspecialchars($w['full_name']) . "\n";
        }
        $out .= "\n";
    }

    // Usuários com muitas pendentes em 1h (possível fraude)
    $suspicious = $pdo->query("
        SELECT u.full_name, COUNT(*) AS cnt, COALESCE(SUM(t.amount_brl),0) AS vol
        FROM transactions t JOIN users u ON u.id = t.user_id
        WHERE t.status='pending' AND t.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        GROUP BY u.id HAVING cnt >= 5
        ORDER BY cnt DESC LIMIT 5
    ")->fetchAll();
    if ($suspicious) {
        $hasAlert = true;
        $out .= "🔍 <b>Atividade suspeita (≥5 cobranças/hora):</b>\n";
        foreach ($suspicious as $s) {
            $out .= "   " . htmlspecialchars($s['full_name']) . " — " . $s['cnt'] . "x cobranças — " . fmt((float)$s['vol']) . "\n";
        }
        $out .= "\n";
    }

    // Transações de alto valor nas últimas 24h (> R$ 500 cada)
    $highVal = $pdo->query("
        SELECT t.id, t.amount_brl, t.customer_name, u.full_name AS seller, t.created_at
        FROM transactions t JOIN users u ON u.id = t.user_id
        WHERE t.status='paid' AND t.amount_brl > 500 AND t.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY t.amount_brl DESC LIMIT 5
    ")->fetchAll();
    if ($highVal) {
        $hasAlert = true;
        $out .= "⭐ <b>Vendas altas (>R$500) nas últimas 24h:</b>\n";
        foreach ($highVal as $t) {
            $time = date('d/m H:i', strtotime($t['created_at']));
            $out .= "   #" . $t['id'] . " " . fmt((float)$t['amount_brl']) . " — " . htmlspecialchars($t['customer_name'] ?: 'Anônimo') . " ({$time})\n";
        }
        $out .= "\n";
    }

    // Usuários com status pending há mais de 24h
    $longPending = $pdo->query("SELECT id, full_name, email, created_at FROM users WHERE status='pending' AND is_admin=0 AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) ORDER BY created_at ASC LIMIT 5")->fetchAll();
    if ($longPending) {
        $hasAlert = true;
        $out .= "🕐 <b>Cadastros pendentes há +24h:</b>\n";
        foreach ($longPending as $u) {
            $when = date('d/m H:i', strtotime($u['created_at']));
            $out .= "   #" . $u['id'] . " " . htmlspecialchars($u['full_name']) . " — desde {$when}\n";
        }
        $out .= "\n";
    }

    if (!$hasAlert) {
        $out .= "✅ <b>Nenhum alerta no momento.</b>\nTudo aparentemente normal por aqui! 🟢";
    }

    $out .= foot();
    adminSend($chatId, $out);
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /saques — Saques pendentes com botões
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'saques') {
    $rows = $pdo->query("
        SELECT w.id, w.amount, w.pix_key, w.created_at, u.full_name, u.id AS uid, u.balance
        FROM withdrawals w JOIN users u ON u.id = w.user_id
        WHERE w.status = 'pending' ORDER BY w.amount DESC LIMIT 8
    ")->fetchAll();

    if (!$rows) {
        adminSend($chatId, "✅ Nenhum saque pendente no momento! Tudo limpo. 👍" . foot());
        http_response_code(200); exit;
    }

    $total = array_sum(array_column($rows, 'amount'));
    adminSend($chatId, "💸 <b>" . count($rows) . " saques pendentes</b> — total " . fmt($total) . "\n<i>Use os botões pra processar cada um:</i>");

    foreach ($rows as $w) {
        $when = date('d/m H:i', strtotime($w['created_at']));
        $pixKey = $w['pix_key'] ?? '—';
        $text = "💸 <b>SAQUE #{$w['id']}</b>\n" . div() . "\n\n"
              . "👤 <b>Usuário:</b> " . htmlspecialchars($w['full_name']) . " (#{$w['uid']})\n"
              . "💵 <b>Valor:</b>   " . fmt((float)$w['amount']) . "\n"
              . "💰 <b>Saldo:</b>   " . fmt((float)$w['balance']) . "\n"
              . "🔑 <b>PIX:</b>     <code>{$pixKey}</code>\n"
              . "🕐 <b>Solicitado:</b> {$when}";
        $kb = [[
            ['text' => '✅ Pagar', 'callback_data' => "a2_wd_approve_{$w['id']}"],
            ['text' => '❌ Rejeitar', 'callback_data' => "a2_wd_reject_{$w['id']}"],
        ]];
        adminSend($chatId, $text, $kb);
    }
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /usuarios — Últimos cadastros com botões
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'usuarios') {
    $rows = $pdo->query("
        SELECT u.id, u.full_name, u.email, u.status, u.created_at,
               u.pix_key, u.whatsapp,
               COUNT(t.id) AS tx_cnt, COALESCE(SUM(t.amount_brl),0) AS tx_vol
        FROM users u
        LEFT JOIN transactions t ON t.user_id = u.id AND t.status = 'paid'
        WHERE u.is_admin = 0 AND u.is_demo = 0
        GROUP BY u.id
        ORDER BY u.created_at DESC LIMIT 10
    ")->fetchAll();

    if (!$rows) {
        adminSend($chatId, "Nenhum usuário encontrado." . foot());
        http_response_code(200); exit;
    }

    foreach ($rows as $u) {
        $when = date('d/m/Y H:i', strtotime($u['created_at']));
        $st   = $u['status'] === 'approved' ? '✅' : ($u['status'] === 'blocked' ? '🔴' : '⏳');
        $stLabel = strtoupper($u['status']);
        $pix  = $u['pix_key'] ? "\n🔑 <b>PIX:</b>  <code>{$u['pix_key']}</code>" : '';
        $wa   = $u['whatsapp'] ? "\n📱 <b>WA:</b>   <code>{$u['whatsapp']}</code>" : '';
        $sales = (int)$u['tx_cnt'] > 0 ? "\n💰 <b>Vendas:</b> " . (int)$u['tx_cnt'] . "x — " . fmt((float)$u['tx_vol']) : "\n💰 <b>Vendas:</b> nenhuma";

        $text = "{$st} <b>USUÁRIO #{$u['id']} — {$stLabel}</b>\n" . div() . "\n\n"
              . "👤 <b>Nome:</b>   " . htmlspecialchars($u['full_name']) . "\n"
              . "📧 <b>Email:</b>  <code>{$u['email']}</code>"
              . $pix . $wa . $sales . "\n"
              . "🕐 <b>Cadastro:</b> {$when}";

        $kb = [];
        if ($u['status'] === 'pending') {
            $kb = [[
                ['text' => '✅ Aprovar', 'callback_data' => "a2_user_approve_{$u['id']}"],
                ['text' => '🔴 Bloquear', 'callback_data' => "a2_user_block_{$u['id']}"],
            ]];
        } elseif ($u['status'] === 'approved') {
            $kb = [[
                ['text' => '🔴 Bloquear', 'callback_data' => "a2_user_block_{$u['id']}"],
            ]];
        } else {
            $kb = [[
                ['text' => '✅ Reativar', 'callback_data' => "a2_user_approve_{$u['id']}"],
            ]];
        }

        adminSend($chatId, $text, $kb);
    }
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /pendentes — Produtos aguardando revisão
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'pendentes') {
    $rows = $pdo->query("
        SELECT p.id, p.name, p.price, p.category, p.type, p.created_at, u.full_name AS seller
        FROM products p JOIN users u ON u.id = p.user_id
        WHERE p.status = 'pending' ORDER BY p.created_at ASC LIMIT 8
    ")->fetchAll();

    if (!$rows) {
        adminSend($chatId, "✅ Nenhum produto aguardando revisão! Tudo em dia. 👍" . foot());
        http_response_code(200); exit;
    }

    adminSend($chatId, "📦 <b>" . count($rows) . " produto(s) aguardando revisão:</b>");

    foreach ($rows as $p) {
        $when = date('d/m H:i', strtotime($p['created_at']));
        $text = "🛍️ <b>PRODUTO #{$p['id']}</b>\n" . div() . "\n\n"
              . "📦 <b>Nome:</b>     " . htmlspecialchars($p['name']) . "\n"
              . "💵 <b>Preço:</b>    " . fmt((float)$p['price']) . "\n"
              . "🏪 <b>Vendedor:</b> " . htmlspecialchars($p['seller']) . "\n"
              . "🏷️ <b>Categoria:</b> " . htmlspecialchars($p['category'] ?? '—') . "\n"
              . "📋 <b>Tipo:</b>     " . htmlspecialchars($p['type'] ?? 'digital') . "\n"
              . "🕐 <b>Enviado:</b>  {$when}";
        $kb = [[
            ['text' => '✅ Aprovar', 'callback_data' => "a2_prod_approve_{$p['id']}"],
            ['text' => '❌ Recusar', 'callback_data' => "a2_prod_reject_{$p['id']}"],
        ]];
        adminSend($chatId, $text, $kb);
    }
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /buscar {email} — Buscar usuário
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'buscar') {
    if (!$arg1) { adminSend($chatId, "⚠️ Use: /buscar email@exemplo.com"); http_response_code(200); exit; }

    $stmt = $pdo->prepare("
        SELECT u.*, COUNT(t.id) AS tx_cnt, COALESCE(SUM(t.amount_brl),0) AS tx_vol,
               COALESCE(SUM(t.amount_net_brl),0) AS tx_net
        FROM users u
        LEFT JOIN transactions t ON t.user_id = u.id AND t.status='paid'
        WHERE u.email LIKE ? OR u.full_name LIKE ?
        GROUP BY u.id LIMIT 3
    ");
    $stmt->execute(["%{$arg1}%", "%{$arg1}%"]);
    $rows = $stmt->fetchAll();

    if (!$rows) { adminSend($chatId, "❌ Nenhum usuário encontrado para: <code>{$arg1}</code>" . foot()); http_response_code(200); exit; }

    foreach ($rows as $u) {
        $st   = $u['status'] === 'approved' ? '✅ Aprovado' : ($u['status'] === 'blocked' ? '🔴 Bloqueado' : '⏳ Pendente');
        $when = date('d/m/Y', strtotime($u['created_at']));
        $pix  = $u['pix_key'] ?? '—';
        $wa   = $u['whatsapp'] ? "\n📱 <b>WhatsApp:</b>  <code>{$u['whatsapp']}</code>" : '';
        $ref  = $u['referral_token'] ?? '—';

        adminSend($chatId,
            "🔍 <b>USUÁRIO #{$u['id']}</b>\n" . div() . "\n\n"
            . "👤 <b>Nome:</b>       " . htmlspecialchars($u['full_name']) . "\n"
            . "📧 <b>Email:</b>      <code>{$u['email']}</code>\n"
            . "🔖 <b>Status:</b>     {$st}\n"
            . "💵 <b>Saldo:</b>      " . fmt((float)$u['balance']) . "\n"
            . "📉 <b>Taxa:</b>       " . $u['commission_rate'] . "%\n"
            . "🔑 <b>PIX:</b>        <code>{$pix}</code>"
            . $wa . "\n"
            . "💰 <b>Vendas:</b>     " . (int)$u['tx_cnt'] . "x — " . fmt((float)$u['tx_vol']) . " bruto\n"
            . "💎 <b>Líquido:</b>    " . fmt((float)$u['tx_net']) . "\n"
            . "🔗 <b>Ref. token:</b> <code>{$ref}</code>\n"
            . "📅 <b>Cadastro:</b>   {$when}"
            . foot()
        );
    }
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /saldo {id} — Saldo detalhado do usuário
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'saldo') {
    $id = (int)$arg1;
    if (!$id) { adminSend($chatId, "⚠️ Use: /saldo 15"); http_response_code(200); exit; }

    $stmt = $pdo->prepare("
        SELECT u.*, COUNT(t.id) AS tx_cnt, COALESCE(SUM(t.amount_brl),0) AS tx_vol,
               (SELECT COUNT(*) FROM withdrawals WHERE user_id = u.id AND status='pending') AS wd_pend,
               (SELECT COALESCE(SUM(amount),0) FROM withdrawals WHERE user_id = u.id AND status='completed') AS wd_total
        FROM users u
        LEFT JOIN transactions t ON t.user_id = u.id AND t.status='paid'
        WHERE u.id = ?
        GROUP BY u.id
    ");
    $stmt->execute([$id]);
    $u = $stmt->fetch();

    if (!$u) { adminSend($chatId, "❌ Usuário #{$id} não encontrado." . foot()); http_response_code(200); exit; }

    $st = $u['status'] === 'approved' ? '✅' : ($u['status'] === 'blocked' ? '🔴' : '⏳');
    adminSend($chatId,
        "💰 <b>SALDO — #{$id}</b>\n" . div() . "\n\n"
        . "{$st} <b>Nome:</b>         " . htmlspecialchars($u['full_name']) . "\n"
        . "📧 <b>Email:</b>        <code>{$u['email']}</code>\n"
        . "💵 <b>Saldo atual:</b>  " . fmt((float)$u['balance']) . "\n"
        . "📉 <b>Taxa:</b>         " . $u['commission_rate'] . "%\n\n"
        . "📊 <b>Histórico:</b>\n"
        . "   Vendas: " . (int)$u['tx_cnt'] . "x — " . fmt((float)$u['tx_vol']) . " bruto\n"
        . "   Saques pagos: " . fmt((float)$u['wd_total']) . "\n"
        . "   Saques pendentes: " . (int)$u['wd_pend']
        . foot()
    );
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /taxa {id} {rate} — Alterar comissão
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'taxa') {
    $id   = (int)$arg1;
    $rate = (float)str_replace(',', '.', $arg2);
    if (!$id || $rate < 0 || $rate > 50) { adminSend($chatId, "⚠️ Use: /taxa 15 8.5 (valor entre 0–50)"); http_response_code(200); exit; }

    $stmt = $pdo->prepare("SELECT id, full_name, commission_rate FROM users WHERE id = ? AND is_admin = 0");
    $stmt->execute([$id]);
    $u = $stmt->fetch();

    if (!$u) { adminSend($chatId, "❌ Usuário #{$id} não encontrado." . foot()); http_response_code(200); exit; }

    $old = $u['commission_rate'];
    $pdo->prepare("UPDATE users SET commission_rate = ? WHERE id = ?")->execute([$rate, $id]);

    adminSend($chatId,
        "✅ <b>TAXA ATUALIZADA — #{$id}</b>\n" . div() . "\n\n"
        . "👤 <b>Nome:</b>  " . htmlspecialchars($u['full_name']) . "\n"
        . "📉 <b>Antes:</b> {$old}%\n"
        . "✅ <b>Agora:</b>  {$rate}%"
        . foot()
    );
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /aprovar {id} — Aprovar usuário
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'aprovar') {
    $id = (int)$arg1;
    if (!$id) { adminSend($chatId, "⚠️ Use: /aprovar 15"); http_response_code(200); exit; }

    $stmt = $pdo->prepare("SELECT id, full_name, email, status FROM users WHERE id = ? AND is_admin = 0");
    $stmt->execute([$id]);
    $u = $stmt->fetch();

    if (!$u) { adminSend($chatId, "❌ Usuário #{$id} não encontrado." . foot()); http_response_code(200); exit; }
    if ($u['status'] === 'approved') { adminSend($chatId, "ℹ️ Usuário #{$id} já está aprovado." . foot()); http_response_code(200); exit; }

    $pdo->prepare("UPDATE users SET status = 'approved' WHERE id = ?")->execute([$id]);
    adminSend($chatId, "✅ <b>Usuário #{$id} aprovado!</b>\n👤 " . htmlspecialchars($u['full_name']) . "\n📧 <code>{$u['email']}</code>" . foot());
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /bloquear {id} — Bloquear usuário
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'bloquear') {
    $id = (int)$arg1;
    if (!$id) { adminSend($chatId, "⚠️ Use: /bloquear 15"); http_response_code(200); exit; }

    $stmt = $pdo->prepare("SELECT id, full_name, email FROM users WHERE id = ? AND is_admin = 0");
    $stmt->execute([$id]);
    $u = $stmt->fetch();

    if (!$u) { adminSend($chatId, "❌ Usuário #{$id} não encontrado." . foot()); http_response_code(200); exit; }

    $pdo->prepare("UPDATE users SET status = 'blocked' WHERE id = ?")->execute([$id]);
    adminSend($chatId, "🔴 <b>Usuário #{$id} bloqueado.</b>\n👤 " . htmlspecialchars($u['full_name']) . "\n📧 <code>{$u['email']}</code>" . foot());
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /resetsenha {id} — Resetar senha
// ══════════════════════════════════════════════════════════════════════════════
if ($command === 'resetsenha') {
    $id = (int)$arg1;
    if (!$id) { adminSend($chatId, "⚠️ Use: /resetsenha 15"); http_response_code(200); exit; }

    $stmt = $pdo->prepare("SELECT id, full_name, email FROM users WHERE id = ? AND is_admin = 0");
    $stmt->execute([$id]);
    $u = $stmt->fetch();

    if (!$u) { adminSend($chatId, "❌ Usuário #{$id} não encontrado." . foot()); http_response_code(200); exit; }

    $newPass = substr(bin2hex(random_bytes(5)), 0, 8);
    $hashed  = password_hash($newPass, PASSWORD_DEFAULT);
    $pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$hashed, $id]);

    adminSend($chatId,
        "🔑 <b>SENHA RESETADA — #{$id}</b>\n" . div() . "\n\n"
        . "👤 <b>Nome:</b>  " . htmlspecialchars($u['full_name']) . "\n"
        . "📧 <b>Email:</b> <code>{$u['email']}</code>\n"
        . "🔑 <b>Nova senha:</b> <code>{$newPass}</code>\n\n"
        . "<i>⚠️ Envie com segurança ao usuário.</i>"
        . foot()
    );
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// /ranking [dias|hoje|7|30]
// ══════════════════════════════════════════════════════════════════════════════
if (in_array($command, ['ranking', 'ranking7', 'ranking30'])) {
    if ($command === 'ranking7')       { $days = 7;  $allTime = false; }
    elseif ($command === 'ranking30')  { $days = 30; $allTime = false; }
    elseif (strtolower($arg1) === 'hoje') { $days = 1; $allTime = false; }
    elseif (is_numeric($arg1) && (int)$arg1 > 0) { $days = (int)$arg1; $allTime = false; }
    else { $days = 0; $allTime = true; }

    $label = $allTime ? 'Todos os Tempos' : ($days === 1 ? 'Hoje' : "Últimos {$days} dias");

    if ($allTime) {
        $stmt = $pdo->prepare("
            SELECT u.id, u.full_name, u.whatsapp, u.email, u.commission_rate,
                   COUNT(t.id) AS sales,
                   COALESCE(SUM(t.amount_brl), 0) AS volume,
                   COALESCE(SUM(t.amount_net_brl), 0) AS net_volume,
                   COALESCE(SUM(t.amount_brl - t.amount_net_brl), 0) AS fee_vol
            FROM users u
            LEFT JOIN transactions t ON u.id = t.user_id AND t.status='paid'
            WHERE u.status='approved' AND u.is_demo=0 AND u.is_admin=0
            GROUP BY u.id ORDER BY volume DESC LIMIT 15
        ");
        $stmt->execute();
    } else {
        $stmt = $pdo->prepare("
            SELECT u.id, u.full_name, u.whatsapp, u.email, u.commission_rate,
                   COUNT(t.id) AS sales,
                   COALESCE(SUM(t.amount_brl), 0) AS volume,
                   COALESCE(SUM(t.amount_net_brl), 0) AS net_volume,
                   COALESCE(SUM(t.amount_brl - t.amount_net_brl), 0) AS fee_vol
            FROM users u
            LEFT JOIN transactions t ON u.id = t.user_id AND t.status='paid'
                AND t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            WHERE u.status='approved' AND u.is_demo=0 AND u.is_admin=0
            GROUP BY u.id ORDER BY volume DESC LIMIT 15
        ");
        $stmt->execute([$days]);
    }
    $rows = $stmt->fetchAll();

    $totalSellers = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE status='approved' AND is_admin=0 AND is_demo=0")->fetchColumn();
    $totalVol     = array_sum(array_column($rows, 'volume'));
    $totalFees    = array_sum(array_column($rows, 'fee_vol'));
    $medals = ['🥇','🥈','🥉'];

    $reply = "🏆 <b>RANKING — {$label}</b>\n" . div() . "\n\n";
    $pos   = 0;
    foreach ($rows as $i => $r) {
        if ((float)$r['volume'] <= 0) continue;
        $pos++;
        $medal   = $medals[$i] ?? "{$pos}º";
        $contact = $r['whatsapp'] ? "📱 <code>{$r['whatsapp']}</code>" : "📧 <code>{$r['email']}</code>";
        $gross   = number_format((float)$r['volume'], 2, ',', '.');
        $net     = number_format((float)$r['net_volume'], 2, ',', '.');
        $reply  .= "{$medal} <b>" . htmlspecialchars($r['full_name']) . "</b>\n"
                .  "   {$contact}\n"
                .  "   {$r['sales']}x vendas — R$ {$gross} bruto | R$ {$net} líquido\n\n";
    }

    if ($pos === 0) $reply .= "<i>Nenhuma venda no período.</i>\n\n";

    $reply .= div() . "\n"
           .  "👥 <b>{$totalSellers}</b> vendedores ativos\n"
           .  "💰 Volume: <b>R$ " . number_format($totalVol, 2, ',', '.') . "</b>\n"
           .  "💎 Taxas: <b>R$ " . number_format($totalFees, 2, ',', '.') . "</b>\n"
           .  "\n🤖 <i>DiretoPay Admin • " . date('d/m/Y H:i') . "</i>";

    adminSend($chatId, $reply);
    http_response_code(200); exit;
}

// ══════════════════════════════════════════════════════════════════════════════
// Fallback
// ══════════════════════════════════════════════════════════════════════════════
if (str_starts_with($text, '/')) {
    adminSend($chatId, "❓ Comando não reconhecido. Use /ajuda para ver os comandos disponíveis." . foot());
}

http_response_code(200);
exit('OK');
