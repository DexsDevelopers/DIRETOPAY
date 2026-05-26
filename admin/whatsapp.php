<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/WhatsAppService.php';

if (!isAdmin()) {
    redirect('../auth/login.php');
}

// ── AJAX handlers ─────────────────────────────────────────────────────────────
if (isset($_GET['ajax'])) {
    header('Content-Type: application/json');
    $act = $_GET['ajax'];

    if ($act === 'status') {
        echo json_encode(WhatsAppService::getStatus()); exit;
    }

    if ($act === 'qr') {
        $qr = WhatsAppService::getQrBase64();
        if ($qr) {
            echo json_encode(['ok' => true, 'qr' => $qr]);
        } else {
            $s = WhatsAppService::getStatus();
            if (!empty($s['connected'])) {
                echo json_encode(['ok' => true, 'connected' => true]);
            } else {
                echo json_encode(['ok' => false, 'error' => $s['error'] ?? 'QR Code ainda não disponível. Aguarde o bridge iniciar.']);
            }
        }
        exit;
    }

    if ($act === 'disconnect') {
        echo json_encode(WhatsAppService::disconnect()); exit;
    }

    if ($act === 'restart') {
        // Envia requisição de reinício ao bridge
        $ch = curl_init(rtrim(WhatsAppService::getStatus()['url'] ?? 'http://127.0.0.1:3001', '/') . '/restart');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $res = curl_exec($ch);
        curl_close($ch);
        echo json_encode(['ok' => true, 'message' => 'Comando de reinício enviado.']); exit;
    }

    if ($act === 'test') {
        $phone = trim($_POST['phone'] ?? '');
        if (!$phone) { echo json_encode(['ok' => false, 'error' => 'Informe o número']); exit; }
        $ok = WhatsAppService::send($phone, "✅ *Teste LunarPay* — WhatsApp conectado com sucesso! 🎉\n\n_Enviado em: " . date('d/m/Y H:i') . "_");
        echo json_encode(['ok' => $ok, 'phone' => WhatsAppService::formatPhone($phone)]); exit;
    }

    echo json_encode(['ok' => false, 'error' => 'Ação inválida']); exit;
}

// ── Salvar configurações ──────────────────────────────────────────────────────
$success = false;
$error   = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_settings'])) {
    $fields = [
        'wa_bridge_url'              => rtrim(trim($_POST['wa_bridge_url']     ?? 'http://127.0.0.1:3001'), '/'),
        'wa_bridge_secret'           => trim($_POST['wa_bridge_secret']        ?? ''),
        'wa_admin_phone'             => trim($_POST['wa_admin_phone']          ?? ''),
        'whatsapp_enabled'           => isset($_POST['whatsapp_enabled'])    ? '1' : '0',
        'whatsapp_notify_sale'       => isset($_POST['notify_sale'])         ? '1' : '0',
        'whatsapp_notify_withdrawal' => isset($_POST['notify_withdrawal'])    ? '1' : '0',
        'whatsapp_notify_new_user'   => isset($_POST['notify_new_user'])      ? '1' : '0',
        'whatsapp_notify_user_sale'  => isset($_POST['notify_user_sale'])     ? '1' : '0',
    ];
    try {
        $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
        foreach ($fields as $k => $v) {
            $stmt->execute([$k, $v]);
        }
        $success = "Configurações salvas com sucesso!";
    } catch (PDOException $e) {
        // Tentativa de execução simples caso dê erro de colunas duplicadas no execute
        try {
            $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?");
            foreach ($fields as $k => $v) {
                $stmt->execute([$k, $v, $v]);
            }
            $success = "Configurações salvas com sucesso!";
        } catch (PDOException $ex) {
            $error = "Erro ao salvar: " . $ex->getMessage();
        }
    }
}

// ── Ler config atual ──────────────────────────────────────────────────────────
$getSetting = function(string $key, string $default = '') use ($pdo): string {
    try {
        $s = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $s->execute([$key]);
        $val = $s->fetchColumn();
        return ($val === false) ? $default : (string)$val;
    } catch (Throwable $e) { return $default; }
};

$cfg = [
    'bridge_url'        => $getSetting('wa_bridge_url', 'http://127.0.0.1:3001'),
    'bridge_secret'     => $getSetting('wa_bridge_secret'),
    'admin_phone'       => $getSetting('wa_admin_phone'),
    'enabled'           => $getSetting('whatsapp_enabled', '0') === '1',
    'notify_sale'       => $getSetting('whatsapp_notify_sale', '1') !== '0',
    'notify_withdrawal' => $getSetting('whatsapp_notify_withdrawal', '1') !== '0',
    'notify_new_user'   => $getSetting('whatsapp_notify_new_user', '0') === '1',
    'notify_user_sale'  => $getSetting('whatsapp_notify_user_sale', '1') !== '0',
];

try {
    $waCount    = $pdo->query("SELECT COUNT(*) FROM users WHERE whatsapp IS NOT NULL AND whatsapp != '' AND is_admin = 0")->fetchColumn();
    $totalUsers = $pdo->query("SELECT COUNT(*) FROM users WHERE is_admin = 0")->fetchColumn();
} catch (Throwable $e) { $waCount = 0; $totalUsers = 0; }
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Comando Central | Bot WhatsApp</title>
    <link rel="stylesheet" href="../style.css?v=128.0">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* ── Estilos Elite Command Center ── */
        :root {
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.4);
            --bg-card: rgba(30, 41, 59, 0.45);
            --text-main: #f8fafc;
            --text-dim: #94a3b8;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --border: rgba(255, 255, 255, 0.06);
        }

        .cmd-body {
            font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        .header-cmd {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .header-cmd h1 { font-size: 2rem; font-weight: 800; margin: 0; letter-spacing: -0.04em; }
        .header-cmd p { color: var(--text-dim); margin: 0.25rem 0 0; font-size: 0.95rem; }

        /* Stats Grid */
        .stats-cmd {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.25rem;
            margin-bottom: 2rem;
        }

        .card-stat-cmd {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 1.5rem;
            backdrop-filter: blur(12px);
            transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-stat-cmd:hover {
            border-color: var(--primary);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(99, 102, 241, 0.05);
        }

        .stat-icon-cmd {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }

        .val-cmd { font-size: 1.5rem; font-weight: 800; display: block; margin-bottom: 0.25rem; color: #fff; }
        .lab-cmd { color: var(--text-dim); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Info Bar */
        .info-bar-cmd {
            margin-bottom: 2rem;
            background: rgba(99, 102, 241, 0.03);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 0.75rem 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.8rem;
            color: var(--text-dim);
            flex-wrap: wrap;
            gap: 10px;
        }

        /* Hero Grid Layout */
        .hero-grid-cmd {
            display: grid;
            grid-template-columns: 1fr 360px;
            gap: 1.5rem;
            align-items: start;
        }

        @media (max-width: 1100px) {
            .hero-grid-cmd { grid-template-columns: 1fr; }
        }

        .panel-cmd {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 2rem;
            backdrop-filter: blur(15px);
            margin-bottom: 1.5rem;
        }

        .panel-title-cmd {
            margin: 0 0 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.1rem;
            font-weight: 700;
            color: #fff;
        }

        /* Console styling */
        .console-cmd {
            background: #060814;
            border-radius: 16px;
            padding: 1.25rem;
            font-family: 'Courier New', Courier, monospace;
            height: 250px;
            overflow-y: auto;
            border: 1px solid rgba(255,255,255,0.03);
            box-shadow: inset 0 4px 20px rgba(0,0,0,0.5);
            margin-bottom: 1.5rem;
        }

        .line-cmd { margin-bottom: 0.4rem; font-size: 0.82rem; border-left: 2px solid transparent; padding-left: 0.6rem; word-break: break-all; }
        .line-cmd.info { border-color: var(--primary); color: #94a3b8; }
        .line-cmd.sys { border-color: var(--success); color: var(--success); }
        .line-cmd.warn { border-color: var(--warning); color: var(--warning); }
        .line-cmd.err { border-color: var(--danger); color: var(--danger); }

        /* QR Frame */
        .qr-wrapper-cmd {
            background: #ffffff;
            border-radius: 24px;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            color: #0f172a;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            height: 100%;
            justify-content: center;
            min-height: 380px;
        }

        .qr-placeholder-cmd {
            width: 200px;
            height: 200px;
            background: #f8fafc;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            border: 2px dashed #cbd5e1;
        }

        /* Buttons style */
        .btn-cmd {
            padding: 0.75rem 1.25rem;
            border-radius: 14px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: 0.2s;
            border: none;
            cursor: pointer;
            font-size: 0.85rem;
        }

        .btn-cmd-outline {
            background: rgba(255,255,255,0.03);
            color: #fff;
            border: 1px solid var(--border);
        }
        .btn-cmd-outline:hover { background: rgba(255,255,255,0.08); }

        .btn-cmd-danger {
            background: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            border: 1px solid rgba(239, 68, 68, 0.15);
        }
        .btn-cmd-danger:hover { background: var(--danger); color: #fff; }

        .status-badge-cmd {
            padding: 0.4rem 0.85rem;
            border-radius: 99px;
            font-size: 0.7rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
        }

        .badge-cmd-on { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .badge-cmd-off { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .badge-cmd-wait { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

        .pulse-dot-cmd {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
            animation: pulse-anim-cmd 1.5s infinite;
        }
        @keyframes pulse-anim-cmd { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.2)} }

        /* Form Controls */
        .form-label-cmd {
            display: block;
            margin-bottom: 0.4rem;
            font-size: 0.82rem;
            font-weight: 600;
            color: var(--text-dim);
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }
        .form-input-cmd {
            width: 100%;
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid var(--border);
            padding: 0.75rem 1rem;
            border-radius: 12px;
            color: #fff;
            font-family: monospace;
            font-size: 0.85rem;
            transition: 0.2s;
            margin-bottom: 1rem;
        }
        .form-input-cmd:focus {
            border-color: var(--primary);
            outline: none;
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
        }
        .toggle-row-cmd {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        .toggle-row-cmd:last-of-type { border-bottom: none; }
        .toggle-switch-cmd {
            position: relative;
            width: 40px;
            height: 22px;
        }
        .toggle-switch-cmd input { opacity:0; width:0; height:0; }
        .toggle-switch-cmd .slider {
            position: absolute; inset:0; background:rgba(255,255,255,0.08); border-radius:22px; cursor:pointer; transition:0.3s;
        }
        .toggle-switch-cmd .slider:before {
            content:''; position:absolute; width:16px; height:16px; left:3px; top:3px; background:#fff; border-radius:50%; transition:0.3s;
        }
        .toggle-switch-cmd input:checked + .slider { background:#10b981; }
        .toggle-switch-cmd input:checked + .slider:before { transform:translateX(18px); }
    </style>
</head>
<body class="dashboard-body cmd-body">
    <?php include '../includes/sidebar.php'; ?>

    <main class="main-content">
        <header class="header-cmd">
            <div>
                <h1>Centro de Comando</h1>
                <p>Monitoramento e integração do Bot WhatsApp</p>
            </div>
            <div style="display:flex; gap: 0.75rem; align-items:center;">
                <div id="badge-display" class="status-badge-cmd badge-cmd-off">
                    <span class="pulse-dot-cmd"></span>
                    <span id="badge-text">Desconectado</span>
                </div>
                <button onclick="checkStatus(true)" class="btn-cmd btn-cmd-outline" style="padding: 0.5rem 0.8rem;" title="Sincronizar rede">
                    <i class="fas fa-sync" id="sync-icon"></i>
                </button>
            </div>
        </header>

        <?php if ($success): ?>
            <div class="badge paid" style="margin-bottom:1.5rem; padding:12px 16px; border-radius:10px;"><?php echo $success; ?></div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div style="margin-bottom:1.5rem; padding:12px 16px; border-radius:10px; background:rgba(239,68,68,.15); color:#f87171; border:1px solid rgba(239,68,68,.3);"><?php echo $error; ?></div>
        <?php endif; ?>

        <!-- Stats Grid -->
        <div class="stats-cmd">
            <div class="card-stat-cmd">
                <div class="stat-icon-cmd" style="background: rgba(99, 102, 241, 0.12); color: #818cf8;"><i class="fas fa-clock"></i></div>
                <span class="val-cmd" id="stat-uptime">0h 0m 0s</span>
                <span class="lab-cmd">Tempo Sincronizado</span>
            </div>
            <div class="card-stat-cmd">
                <div class="stat-icon-cmd" style="background: rgba(16, 185, 129, 0.12); color: #34d399;"><i class="fas fa-memory"></i></div>
                <span class="val-cmd" id="stat-memory">0 MB</span>
                <span class="lab-cmd">Uso de Heap (RAM)</span>
            </div>
            <div class="card-stat-cmd">
                <div class="stat-icon-cmd" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24;"><i class="fas fa-users"></i></div>
                <span class="val-cmd"><?php echo $waCount; ?> / <?php echo $totalUsers; ?></span>
                <span class="lab-cmd">Membros Com WhatsApp</span>
            </div>
            <div class="card-stat-cmd">
                <div class="stat-icon-cmd" style="background: rgba(239, 68, 68, 0.12); color: #f87171;"><i class="fas fa-bug"></i></div>
                <span class="val-cmd" id="stat-errors">Nenhum</span>
                <span class="lab-cmd">Incidentes</span>
            </div>
        </div>

        <!-- Info Bar -->
        <div class="info-bar-cmd">
            <div><i class="fas fa-link" style="color: var(--primary); margin-right: 5px;"></i> <b>API:</b> <span id="info-api-url"><?php echo htmlspecialchars($cfg['bridge_url']); ?></span></div>
            <div><i class="fas fa-shield-halved" style="color: var(--success); margin-right: 5px;"></i> <b>AUTH:</b> local-bridge</div>
            <div><i class="fas fa-microchip" style="margin-right: 5px;"></i> <b>Engine:</b> Baileys v6.7.23</div>
            <div>Modo: <b>Lite Daemon Bridge v2.0</b></div>
        </div>

        <div class="hero-grid-cmd">
            <!-- Coluna Esquerda: Console & Configs -->
            <div>
                <!-- Console -->
                <div class="panel-cmd">
                    <h3 class="panel-title-cmd"><i class="fas fa-terminal" style="color: var(--primary);"></i> Monitor de Fluxo</h3>
                    <div class="console-cmd" id="cmdConsole">
                        <div class="line-cmd info">> Estabelecendo conexão com o Daemon Bridge...</div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <button onclick="triggerAction('restart')" class="btn-cmd btn-cmd-outline">
                            <i class="fas fa-rotate"></i> Resetar Memória
                        </button>
                        <button onclick="triggerAction('disconnect')" class="btn-cmd btn-cmd-danger">
                            <i class="fas fa-trash-can"></i> Limpeza Total de Sessão (Logout)
                        </button>
                    </div>
                </div>

                <!-- Configurações -->
                <div class="panel-cmd">
                    <h3 class="panel-title-cmd"><i class="fas fa-sliders" style="color: var(--primary);"></i> Ajustes do Sistema</h3>
                    <form method="POST">
                        <input type="hidden" name="save_settings" value="1">

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label class="form-label-cmd">URL do Bridge</label>
                                <input type="text" name="wa_bridge_url" value="<?php echo htmlspecialchars($cfg['bridge_url']); ?>" class="form-input-cmd" placeholder="http://127.0.0.1:3001">
                            </div>
                            <div>
                                <label class="form-label-cmd">Secret Token (Opcional)</label>
                                <input type="password" name="wa_bridge_secret" value="<?php echo htmlspecialchars($cfg['bridge_secret']); ?>" class="form-input-cmd" placeholder="Sem senha">
                            </div>
                        </div>

                        <div>
                            <label class="form-label-cmd">Seu celular administrador (recebe alertas globais)</label>
                            <input type="text" name="wa_admin_phone" value="<?php echo htmlspecialchars($cfg['admin_phone']); ?>" class="form-input-cmd" placeholder="5511999999999">
                        </div>

                        <div class="toggle-row-cmd">
                            <div>
                                <strong style="color: #fff; font-size: 0.9rem;">Habilitar Notificações WhatsApp</strong>
                                <p style="margin: 2px 0 0; font-size: 0.75rem; color: var(--text-dim);">Ativa ou desativa todo o envio de mensagens do bot</p>
                            </div>
                            <label class="toggle-switch-cmd">
                                <input type="checkbox" name="whatsapp_enabled" <?php echo $cfg['enabled'] ? 'checked' : ''; ?>>
                                <span class="slider"></span>
                            </label>
                        </div>

                        <div class="toggle-row-cmd">
                            <div>
                                <strong style="color: #fff; font-size: 0.9rem;">Notificar Vendas (Admin)</strong>
                                <p style="margin: 2px 0 0; font-size: 0.75rem; color: var(--text-dim);">Recebe notificações a cada nova venda bruto/líquido</p>
                            </div>
                            <label class="toggle-switch-cmd">
                                <input type="checkbox" name="notify_sale" <?php echo $cfg['notify_sale'] ? 'checked' : ''; ?>><span class="slider"></span>
                            </label>
                        </div>

                        <div class="toggle-row-cmd">
                            <div>
                                <strong style="color: #fff; font-size: 0.9rem;">Notificar Membros ao Vender</strong>
                                <p style="margin: 2px 0 0; font-size: 0.75rem; color: var(--text-dim);">Envia comemorações automáticas para o WhatsApp do vendedor</p>
                            </div>
                            <label class="toggle-switch-cmd">
                                <input type="checkbox" name="notify_user_sale" <?php echo $cfg['notify_user_sale'] ? 'checked' : ''; ?>><span class="slider"></span>
                            </label>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 1rem;">
                            <div class="toggle-row-cmd" style="border: none; padding: 0;">
                                <div>
                                    <strong style="color: #fff; font-size: 0.9rem;">Notificar Saques</strong>
                                    <p style="margin: 2px 0 0; font-size: 0.75rem; color: var(--text-dim);">Avisa solicitações de saques</p>
                                </div>
                                <label class="toggle-switch-cmd">
                                    <input type="checkbox" name="notify_withdrawal" <?php echo $cfg['notify_withdrawal'] ? 'checked' : ''; ?>><span class="slider"></span>
                                </label>
                            </div>
                            <div class="toggle-row-cmd" style="border: none; padding: 0;">
                                <div>
                                    <strong style="color: #fff; font-size: 0.9rem;">Notificar Novos Cadastros</strong>
                                    <p style="margin: 2px 0 0; font-size: 0.75rem; color: var(--text-dim);">Alerta novos registros de e-mail</p>
                                </div>
                                <label class="toggle-switch-cmd">
                                    <input type="checkbox" name="notify_new_user" <?php echo $cfg['notify_new_user'] ? 'checked' : ''; ?>><span class="slider"></span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" class="btn-cmd btn-cmd-outline" style="width: 100%; background: var(--primary); color: #fff; margin-top: 1.5rem; font-size: 0.9rem;">
                            <i class="fas fa-save"></i> Gravar Ajustes de Sincronização
                        </button>
                    </form>
                </div>

                <!-- Teste rápido de envio -->
                <div class="panel-cmd">
                    <h3 class="panel-title-cmd"><i class="fas fa-paper-plane" style="color: var(--primary);"></i> Enviar Teste de Envoltório</h3>
                    <div style="display: flex; gap: 1rem;">
                        <input type="text" id="test-phone" placeholder="5511999999999" class="form-input-cmd" style="margin:0; flex:1;">
                        <button onclick="sendQuickTest()" class="btn-cmd btn-cmd-outline" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); color: #10b981;">
                            <i class="fab fa-whatsapp"></i> Disparar Teste
                        </button>
                    </div>
                    <div id="test-result" style="display:none; padding:10px 14px; border-radius:10px; font-size:.8rem; margin-top: 1rem;"></div>
                </div>
            </div>

            <!-- Coluna Direita: Painel QR Code / Sincronismo -->
            <div>
                <!-- QR Code wrapper -->
                <div class="panel-cmd" style="height: 100%; min-height: 480px;">
                    <h3 class="panel-title-cmd" style="justify-content: center;"><i class="fab fa-whatsapp" style="color: #25d366;"></i> Conexão WhatsApp</h3>
                    
                    <!-- Conectado -->
                    <div id="connected-panel" style="display:none; text-align:center; padding: 2rem 0;">
                        <div style="width: 130px; height: 130px; background: rgba(16,185,129,0.1); border: 4px solid var(--success); border-radius: 50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 2rem; box-shadow: 0 0 30px rgba(16,185,129,0.2);">
                            <i class="fas fa-check" style="font-size: 3.5rem; color: var(--success);"></i>
                        </div>
                        <h2 style="margin: 0; color: #fff; font-weight: 800;">SISTEMA ATIVO</h2>
                        <p id="phone-info" style="color: var(--text-dim); margin: 0.5rem 0 2rem; font-family: monospace; font-size: 0.9rem;"></p>
                        <p style="color: var(--text-dim); font-size: 0.8rem; line-height: 1.6; max-width: 250px; margin: 0 auto 2rem;">
                            O WhatsApp está ativo e monitorando a fila de saídas. As notificações automáticas de checkout serão disparadas normalmente.
                        </p>
                        <button onclick="triggerAction('disconnect')" class="btn-cmd btn-cmd-danger" style="width: 100%;">
                            <i class="fas fa-unlink"></i> Desvincular Conta
                        </button>
                    </div>

                    <!-- Aguardando QR Code -->
                    <div id="qr-panel" style="text-align: center;">
                        <p style="color: var(--text-dim); font-size: 0.85rem; margin-bottom: 1.5rem;">
                            Aponte a câmera do WhatsApp para o QR Code abaixo para estabelecer a comunicação
                        </p>
                        
                        <div id="qr-container" style="min-height: 220px; display:flex; align-items:center; justify-content:center; background: #fff; border-radius: 20px; padding: 1.5rem; max-width: 250px; margin: 0 auto 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                            <div style="text-align: center; color: #64748b;">
                                <i class="fas fa-spinner fa-spin" style="font-size: 1.8rem; margin-bottom: 10px;"></i>
                                <div style="font-size: 0.8rem; font-weight: bold;">Gerando QR Code...</div>
                            </div>
                        </div>

                        <div style="color: var(--text-dim); font-size: 0.78rem; line-height: 1.6; max-width: 260px; margin: 0 auto 1.5rem;">
                            <i class="fas fa-mobile-screen-button"></i> WhatsApp → <strong>Aparelhos conectados</strong> → <strong>Conectar um aparelho</strong>.
                        </div>

                        <button onclick="loadQrCode(true)" class="btn-cmd btn-cmd-outline" style="width: 100%;">
                            <i class="fas fa-rotate"></i> Recarregar QR Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script src="../script.js?v=128.0"></script>
    <script>
    let isBridgeReady = false;
    let qrTimer = null;

    document.addEventListener('DOMContentLoaded', () => {
        checkStatus(true);
        // Pooling a cada 8s para sincronismo de estado
        setInterval(() => checkStatus(false), 8000);
    });

    function addConsoleLine(msg, type = 'info') {
        const consoleEl = document.getElementById('cmdConsole');
        if (!consoleEl) return;
        const line = document.createElement('div');
        line.className = 'line-cmd ' + type;
        line.innerText = '> [' + new Date().toLocaleTimeString() + '] ' + msg;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    function checkStatus(forceLog = false) {
        const syncIcon = document.getElementById('sync-icon');
        if (syncIcon) syncIcon.classList.add('fa-spin');

        fetch('whatsapp.php?ajax=status')
            .then(r => r.json())
            .then(data => {
                if (syncIcon) syncIcon.classList.remove('fa-spin');
                
                // Atualizar Stats
                document.getElementById('stat-uptime').textContent = data.uptimeFormatted || '0h 0m 0s';
                document.getElementById('stat-memory').textContent = (data.memoryMB || 0) + ' MB';
                document.getElementById('stat-errors').textContent = data.error ? '1 pendente' : 'Nenhum';
                document.getElementById('info-api-url').textContent = data.url || '<?php echo $cfg['bridge_url']; ?>';

                const badge = document.getElementById('badge-display');
                const badgeText = document.getElementById('badge-text');

                if (data.connected && data.ready) {
                    badge.className = 'status-badge-cmd badge-cmd-on';
                    badgeText.textContent = 'Sistema Ativo';
                    
                    document.getElementById('connected-panel').style.display = 'block';
                    document.getElementById('qr-panel').style.display = 'none';
                    
                    const pi = document.getElementById('phone-info');
                    if (pi && data.phoneNumber) pi.textContent = 'Conectado: +' + data.phoneNumber;

                    if (!isBridgeReady || forceLog) {
                        addConsoleLine('WhatsApp conectado com sucesso ao Daemon Core.', 'sys');
                        if (data.phoneNumber) addConsoleLine('Canal ativo com número: ' + data.phoneNumber, 'sys');
                    }
                    isBridgeReady = true;
                    clearQrTimer();
                } else if (data.connected && !data.ready) {
                    badge.className = 'status-badge-cmd badge-cmd-wait';
                    badgeText.textContent = 'Autenticando';
                    if (!isBridgeReady || forceLog) {
                        addConsoleLine('Aguardando sincronização inicial das credenciais...', 'info');
                    }
                    isBridgeReady = false;
                } else {
                    badge.className = 'status-badge-cmd badge-cmd-off';
                    badgeText.textContent = data.error ? 'Erro Bridge' : 'Aguardando QR';
                    
                    document.getElementById('connected-panel').style.display = 'none';
                    document.getElementById('qr-panel').style.display = 'block';
                    
                    if (isBridgeReady || forceLog) {
                        addConsoleLine('Aguardando conexão. Escaneie o QR Code para parear.', 'warn');
                        if (data.error) addConsoleLine('Erro relatado pelo core: ' + data.error, 'err');
                    }
                    isBridgeReady = false;
                    if (data.hasQr && !qrTimer) loadQrCode(false);
                }
            })
            .catch((e) => {
                if (syncIcon) syncIcon.classList.remove('fa-spin');
                setBadgeOffline();
                if (isBridgeReady || forceLog) {
                    addConsoleLine('Falha crítica de comunicação: Bridge Offline.', 'err');
                }
                isBridgeReady = false;
            });
    }

    function setBadgeOffline() {
        const badge = document.getElementById('badge-display');
        const badgeText = document.getElementById('badge-text');
        badge.className = 'status-badge-cmd badge-cmd-off';
        badgeText.textContent = 'Bridge Offline';
        document.getElementById('connected-panel').style.display = 'none';
        document.getElementById('qr-panel').style.display = 'block';
    }

    function loadQrCode(manual = false) {
        const container = document.getElementById('qr-container');
        if (!container) return;
        
        if (manual) {
            container.innerHTML = '<div style="text-align: center; color: #64748b;"><i class="fas fa-spinner fa-spin" style="font-size: 1.8rem; margin-bottom: 10px;"></i><div style="font-size: 0.8rem; font-weight: bold;">Gerando novo QR...</div></div>';
            addConsoleLine('Gerando novo pareamento QR Code...', 'info');
        }

        fetch('whatsapp.php?ajax=qr')
            .then(r => r.json())
            .then(data => {
                if (data.connected) {
                    checkStatus(true); return;
                }
                if (data.qr) {
                    container.innerHTML = `<img src="${data.qr}" alt="QR Code" style="width: 100%; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05);">`;
                    if (manual) addConsoleLine('QR Code atualizado com sucesso no painel.', 'sys');
                    
                    clearQrTimer();
                    // Atualizar a cada 50 segundos para não expirar
                    qrTimer = setInterval(() => loadQrCode(false), 50000);
                } else {
                    container.innerHTML = `<div style="color:var(--danger); font-size:0.75rem; text-align:center;"><i class="fas fa-triangle-exclamation" style="font-size:1.5rem; margin-bottom:10px;"></i><br>${data.error || 'QR indisponível.'}</div>`;
                }
            })
            .catch(() => {
                container.innerHTML = `<div style="color:var(--danger); font-size:0.75rem; text-align:center;"><i class="fas fa-triangle-exclamation" style="font-size:1.5rem; margin-bottom:10px;"></i><br>Erro de rede ao ler QR.</div>`;
            });
    }

    function clearQrTimer() {
        if (qrTimer) { clearInterval(qrTimer); qrTimer = null; }
    }

    function triggerAction(action) {
        let confirmMsg = action === 'disconnect' ? 'Desconectar o WhatsApp da plataforma? Um novo QR Code será necessário.' : 'Tem certeza que deseja resetar a memória do bridge?';
        if (!confirm(confirmMsg)) return;

        addConsoleLine('Enviando comando para o bridge: ' + action.toUpperCase() + '...', 'info');
        fetch('whatsapp.php?ajax=' + action)
            .then(r => r.json())
            .then(data => {
                addConsoleLine('Comando enviado com sucesso!', 'sys');
                setTimeout(() => checkStatus(true), 3000);
            })
            .catch(() => {
                addConsoleLine('Erro ao transmitir comando para o bridge.', 'err');
            });
    }

    function sendQuickTest() {
        const phone = document.getElementById('test-phone').value.trim();
        const result = document.getElementById('test-result');
        if (!phone) { alert('Informe o número.'); return; }

        result.style.display = 'none';
        addConsoleLine('Disparando mensagem de teste de envoltório para: +' + phone, 'info');

        const fd = new FormData();
        fd.append('phone', phone);

        fetch('whatsapp.php?ajax=test', { method: 'POST', body: fd })
            .then(r => r.json())
            .then(data => {
                result.style.display = 'block';
                if (data.ok) {
                    result.className = 'badge paid';
                    result.style.cssText = 'display:block; padding:10px 14px; border-radius:10px; font-size:.8rem; background:rgba(34,197,94,.1); color:#4ade80; border:1px solid rgba(34,197,94,.2);';
                    result.innerHTML = '<i class="fas fa-check-circle"></i> Mensagem enviada com sucesso!';
                    addConsoleLine('Envio de teste confirmado para: +' + phone, 'sys');
                } else {
                    result.style.cssText = 'display:block; padding:10px 14px; border-radius:10px; font-size:.8rem; background:rgba(239,68,68,.1); color:#f87171; border:1px solid rgba(239,68,68,.2);';
                    result.innerHTML = '<i class="fas fa-circle-exclamation"></i> Falha: ' + (data.error || 'WhatsApp conectado?');
                    addConsoleLine('Falha ao enviar teste: ' + (data.error || 'Desconhecido'), 'err');
                }
            })
            .catch(() => {
                result.style.display = 'block';
                result.style.cssText = 'display:block; padding:10px 14px; border-radius:10px; font-size:.8rem; background:rgba(239,68,68,.1); color:#f87171; border:1px solid rgba(239,68,68,.2);';
                result.innerHTML = '<i class="fas fa-circle-exclamation"></i> Erro de rede.';
                addConsoleLine('Erro de rede durante o envio de teste.', 'err');
            });
    }
    </script>
</body>
</html>
