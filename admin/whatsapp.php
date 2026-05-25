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
        $success = "Configurações salvas!";
    } catch (PDOException $e) {
        $error = "Erro ao salvar: " . $e->getMessage();
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
    <title>WhatsApp Bot - LunarPay Admin</title>
    <link rel="stylesheet" href="../style.css?v=125.0">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .wa-status-badge { display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border-radius:20px; font-size:.85rem; font-weight:600; }
        .wa-status-badge.connected    { background:rgba(34,197,94,.15); color:#4ade80; border:1px solid rgba(34,197,94,.3); }
        .wa-status-badge.disconnected { background:rgba(239,68,68,.15); color:#f87171; border:1px solid rgba(239,68,68,.3); }
        .wa-status-badge.unknown      { background:rgba(100,116,139,.15); color:#94a3b8; border:1px solid rgba(100,116,139,.3); }
        .pulse-dot { width:8px; height:8px; border-radius:50%; background:currentColor; }
        .pulse-dot.live { animation:pulse-anim 1.5s infinite; }
        @keyframes pulse-anim { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
        .qr-spinner { display:flex; flex-direction:column; align-items:center; gap:12px; color:var(--text-3); font-size:.85rem; padding:2rem 0; }
        .qr-spinner i { font-size:2rem; animation:spin 1s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .step-badge { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:#25d366; color:#000; font-size:.72rem; font-weight:700; margin-right:8px; flex-shrink:0; }
        .step-row { display:flex; align-items:flex-start; gap:0; margin-bottom:10px; font-size:.88rem; color:var(--text-2); line-height:1.4; }
        .toggle-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.05); }
        .toggle-row:last-child { border-bottom:none; }
        .toggle-label { font-size:.9rem; color:var(--text-2); }
        .toggle-label small { display:block; font-size:.75rem; color:var(--text-3); margin-top:2px; }
        .custom-toggle { position:relative; width:44px; height:24px; flex-shrink:0; }
        .custom-toggle input { opacity:0; width:0; height:0; }
        .custom-toggle .slider { position:absolute; inset:0; background:rgba(255,255,255,.1); border-radius:24px; cursor:pointer; transition:.3s; }
        .custom-toggle .slider:before { content:''; position:absolute; width:18px; height:18px; left:3px; top:3px; background:#fff; border-radius:50%; transition:.3s; }
        .custom-toggle input:checked + .slider { background:#25d366; }
        .custom-toggle input:checked + .slider:before { transform:translateX(20px); }
        .wa-green { color:#25d366; }
        .cmd-box { background:rgba(0,0,0,.4); border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:10px 14px; font-family:monospace; font-size:.8rem; color:#4ade80; margin-top:6px; word-break:break-all; }
        .info-box { padding:12px 16px; background:rgba(37,211,102,.05); border:1px solid rgba(37,211,102,.15); border-radius:10px; font-size:.8rem; color:var(--text-3); line-height:1.6; }
        .warn-box  { padding:12px 16px; background:rgba(245,158,11,.07); border:1px solid rgba(245,158,11,.2);  border-radius:10px; font-size:.8rem; color:#fbbf24; line-height:1.6; }
    </style>
</head>
<body class="dashboard-body">
    <?php include '../includes/sidebar.php'; ?>

    <main class="main-content">
        <header class="top-header">
            <div>
                <h1><i class="fab fa-whatsapp wa-green" style="margin-right:10px;"></i>WhatsApp Bot</h1>
                <p style="color:var(--text-3); font-size:.9rem;">100% gratuito — roda no seu próprio servidor, sem mensalidade</p>
            </div>
            <div id="status-badge" class="wa-status-badge unknown">
                <span class="pulse-dot"></span> <span id="status-text">Verificando...</span>
            </div>
        </header>

        <?php if ($success): ?>
            <div class="badge paid" style="margin-bottom:1rem; padding:12px 16px; border-radius:10px;"><?php echo $success; ?></div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div style="margin-bottom:1rem; padding:12px 16px; border-radius:10px; background:rgba(239,68,68,.15); color:#f87171; border:1px solid rgba(239,68,68,.3);"><?php echo $error; ?></div>
        <?php endif; ?>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; align-items:start;">

            <!-- ── COLUNA ESQUERDA ── -->
            <div style="display:flex; flex-direction:column; gap:1.5rem;">

                <!-- Instalação do Bridge -->
                <div class="card glass">
                    <div class="card-header">
                        <div class="card-title-group">
                            <div class="card-icon"><i class="fab fa-node-js" style="color:#68d391;"></i></div>
                            <h3 class="card-title">Instalar o Bridge (1x)</h3>
                        </div>
                    </div>
                    <div style="margin-top:1rem; display:flex; flex-direction:column; gap:8px;">
                        <div class="step-row"><span class="step-badge">1</span>Acesse seu servidor via SSH e vá até a pasta do projeto:</div>
                        <div class="cmd-box">cd /var/www/html/whatsapp-bridge</div>

                        <div class="step-row" style="margin-top:6px;"><span class="step-badge">2</span>Instale as dependências (apenas na primeira vez):</div>
                        <div class="cmd-box">npm install</div>

                        <div class="step-row" style="margin-top:6px;"><span class="step-badge">3</span>Inicie o bridge em segundo plano com PM2:</div>
                        <div class="cmd-box">npm install -g pm2<br>WA_SECRET=SUA_SENHA_AQUI pm2 start index.js --name wa-bridge<br>pm2 save && pm2 startup</div>

                        <div class="step-row" style="margin-top:6px;"><span class="step-badge">4</span>Verifique se está rodando:</div>
                        <div class="cmd-box">pm2 status</div>

                        <div class="warn-box" style="margin-top:8px;">
                            <i class="fas fa-triangle-exclamation"></i>
                            Requer <strong>Node.js 18+</strong> instalado no servidor. O bridge só precisa ser iniciado uma vez e permanece ativo.
                        </div>
                    </div>
                </div>

                <!-- Configurações do Bridge -->
                <div class="card glass">
                    <div class="card-header">
                        <div class="card-title-group">
                            <div class="card-icon"><i class="fas fa-gear"></i></div>
                            <h3 class="card-title">Configurar Conexão</h3>
                        </div>
                    </div>
                    <form method="POST" style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">
                        <input type="hidden" name="save_settings" value="1">

                        <div>
                            <label class="stat-label" style="display:block; margin-bottom:6px;">URL do Bridge</label>
                            <input type="text" name="wa_bridge_url"
                                   value="<?php echo htmlspecialchars($cfg['bridge_url']); ?>"
                                   placeholder="http://127.0.0.1:3001"
                                   style="width:100%; background:rgba(0,0,0,.3); border:1px solid var(--border); padding:.8rem; border-radius:10px; color:#fff; font-family:monospace;">
                            <small style="color:var(--text-3); font-size:.75rem;">Se rodar no mesmo servidor, mantenha http://127.0.0.1:3001</small>
                        </div>

                        <div>
                            <label class="stat-label" style="display:block; margin-bottom:6px;">Secret do Bridge (WA_SECRET)</label>
                            <input type="password" name="wa_bridge_secret"
                                   value="<?php echo htmlspecialchars($cfg['bridge_secret']); ?>"
                                   placeholder="Mesma senha usada no WA_SECRET ao iniciar"
                                   style="width:100%; background:rgba(0,0,0,.3); border:1px solid var(--border); padding:.8rem; border-radius:10px; color:#fff; font-family:monospace;">
                        </div>

                        <div>
                            <label class="stat-label" style="display:block; margin-bottom:6px;">Seu número WhatsApp (notificações admin)</label>
                            <input type="text" name="wa_admin_phone"
                                   value="<?php echo htmlspecialchars($cfg['admin_phone']); ?>"
                                   placeholder="5511999999999"
                                   style="width:100%; background:rgba(0,0,0,.3); border:1px solid var(--border); padding:.8rem; border-radius:10px; color:#fff;">
                            <small style="color:var(--text-3); font-size:.75rem;">DDI + DDD + número, sem + ou espaços</small>
                        </div>

                        <div class="toggle-row" style="border:none; padding:0;">
                            <div class="toggle-label">
                                <strong>Habilitar WhatsApp</strong>
                                <small>Ativa o envio de notificações</small>
                            </div>
                            <label class="custom-toggle">
                                <input type="checkbox" name="whatsapp_enabled" <?php echo $cfg['enabled'] ? 'checked' : ''; ?>>
                                <span class="slider"></span>
                            </label>
                        </div>

                        <button type="submit" class="btn-primary" style="width:100%; padding:.9rem;">
                            <i class="fas fa-save" style="margin-right:8px;"></i> Salvar Configurações
                        </button>
                    </form>
                </div>

                <!-- Teste -->
                <div class="card glass">
                    <div class="card-header">
                        <div class="card-title-group">
                            <div class="card-icon"><i class="fas fa-paper-plane"></i></div>
                            <h3 class="card-title">Enviar Mensagem de Teste</h3>
                        </div>
                    </div>
                    <div style="margin-top:1.5rem; display:flex; flex-direction:column; gap:1rem;">
                        <input type="text" id="test-phone" placeholder="5511999999999"
                               style="width:100%; background:rgba(0,0,0,.3); border:1px solid var(--border); padding:.8rem; border-radius:10px; color:#fff;">
                        <button onclick="sendTest()" style="width:100%; padding:.9rem; background:rgba(37,211,102,.12); border:1px solid rgba(37,211,102,.3); color:#25d366; border-radius:10px; cursor:pointer; font-weight:600; font-size:.9rem;">
                            <i class="fab fa-whatsapp" style="margin-right:8px;"></i> Enviar Teste
                        </button>
                        <div id="test-result" style="display:none; padding:10px 14px; border-radius:8px; font-size:.85rem;"></div>
                    </div>
                </div>
            </div>

            <!-- ── COLUNA DIREITA ── -->
            <div style="display:flex; flex-direction:column; gap:1.5rem;">

                <!-- QR Code / Conexão -->
                <div class="card glass">
                    <div class="card-header">
                        <div class="card-title-group">
                            <div class="card-icon wa-green"><i class="fab fa-whatsapp"></i></div>
                            <h3 class="card-title">Conectar Número</h3>
                        </div>
                    </div>
                    <div style="margin-top:1.5rem;">

                        <!-- Painel: conectado -->
                        <div id="connected-panel" style="display:none; text-align:center; padding:1.5rem;">
                            <div style="font-size:3rem; margin-bottom:1rem;">📱</div>
                            <div class="wa-status-badge connected" style="margin:0 auto 1rem;">
                                <span class="pulse-dot live"></span> WhatsApp Conectado!
                            </div>
                            <p id="phone-info" style="color:var(--text-3); font-size:.85rem; margin-bottom:1.5rem;"></p>
                            <p style="color:var(--text-3); font-size:.82rem; margin-bottom:1.5rem;">Seu número está ativo. As notificações de vendas serão enviadas automaticamente. 🎉</p>
                            <button onclick="disconnectWA()" style="padding:.7rem 1.5rem; background:rgba(239,68,68,.15); border:1px solid rgba(239,68,68,.3); color:#f87171; border-radius:10px; cursor:pointer; font-size:.85rem;">
                                <i class="fas fa-unlink" style="margin-right:6px;"></i> Desconectar
                            </button>
                        </div>

                        <!-- Painel: QR Code -->
                        <div id="qr-panel">
                            <p style="text-align:center; color:var(--text-3); font-size:.85rem; margin-bottom:1.2rem;">
                                Escaneie o QR Code com seu WhatsApp para conectar
                            </p>
                            <div id="qr-container" style="text-align:center; min-height:260px; display:flex; align-items:center; justify-content:center;">
                                <div class="qr-spinner">
                                    <i class="fas fa-spinner"></i>
                                    <span>Aguardando bridge...</span>
                                </div>
                            </div>
                            <div style="margin-top:1rem; text-align:center; color:var(--text-3); font-size:.8rem; line-height:1.6;">
                                <i class="fas fa-mobile-screen-button"></i>
                                WhatsApp → <strong>Dispositivos conectados</strong> → <strong>Conectar dispositivo</strong>
                            </div>
                            <button onclick="loadQr()" style="margin-top:1rem; width:100%; padding:.7rem; background:rgba(255,255,255,.05); border:1px solid var(--border); color:var(--text-2); border-radius:10px; cursor:pointer; font-size:.85rem;">
                                <i class="fas fa-rotate" style="margin-right:6px;"></i> Atualizar QR Code
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Notificações -->
                <div class="card glass">
                    <div class="card-header">
                        <div class="card-title-group">
                            <div class="card-icon"><i class="fas fa-bell"></i></div>
                            <h3 class="card-title">Notificações</h3>
                        </div>
                    </div>
                    <form method="POST" style="margin-top:1.2rem;">
                        <input type="hidden" name="save_settings" value="1">
                        <input type="hidden" name="wa_bridge_url"    value="<?php echo htmlspecialchars($cfg['bridge_url']); ?>">
                        <input type="hidden" name="wa_bridge_secret" value="<?php echo htmlspecialchars($cfg['bridge_secret']); ?>">
                        <input type="hidden" name="wa_admin_phone"   value="<?php echo htmlspecialchars($cfg['admin_phone']); ?>">
                        <?php if ($cfg['enabled']): ?><input type="hidden" name="whatsapp_enabled" value="on"><?php endif; ?>

                        <div class="toggle-row">
                            <div class="toggle-label">💰 <strong>Venda confirmada</strong> (admin)<small>Você recebe notificação de cada venda</small></div>
                            <label class="custom-toggle"><input type="checkbox" name="notify_sale" <?php echo $cfg['notify_sale'] ? 'checked' : ''; ?>><span class="slider"></span></label>
                        </div>
                        <div class="toggle-row">
                            <div class="toggle-label">📱 <strong>Venda para o vendedor</strong><small>O membro recebe no WhatsApp dele ao vender</small></div>
                            <label class="custom-toggle"><input type="checkbox" name="notify_user_sale" <?php echo $cfg['notify_user_sale'] ? 'checked' : ''; ?>><span class="slider"></span></label>
                        </div>
                        <div class="toggle-row">
                            <div class="toggle-label">🏦 <strong>Saque solicitado</strong><small>Notifica quando membro pede saque</small></div>
                            <label class="custom-toggle"><input type="checkbox" name="notify_withdrawal" <?php echo $cfg['notify_withdrawal'] ? 'checked' : ''; ?>><span class="slider"></span></label>
                        </div>
                        <div class="toggle-row">
                            <div class="toggle-label">🆕 <strong>Novo cadastro</strong><small>Notifica quando alguém se registra</small></div>
                            <label class="custom-toggle"><input type="checkbox" name="notify_new_user" <?php echo $cfg['notify_new_user'] ? 'checked' : ''; ?>><span class="slider"></span></label>
                        </div>

                        <button type="submit" class="btn-primary" style="width:100%; padding:.9rem; margin-top:1rem;">
                            <i class="fas fa-save" style="margin-right:8px;"></i> Salvar Notificações
                        </button>
                    </form>
                </div>

                <!-- Membros com WhatsApp -->
                <div class="card glass">
                    <div class="card-header">
                        <div class="card-title-group">
                            <div class="card-icon"><i class="fas fa-users"></i></div>
                            <h3 class="card-title">WhatsApp dos Membros</h3>
                        </div>
                    </div>
                    <div style="margin-top:1rem;">
                        <div style="display:flex; gap:1rem; margin-bottom:1rem;">
                            <div style="flex:1; padding:1rem; background:rgba(37,211,102,.07); border:1px solid rgba(37,211,102,.2); border-radius:10px; text-align:center;">
                                <div style="font-size:1.8rem; font-weight:700; color:#25d366;"><?php echo $waCount; ?></div>
                                <div style="font-size:.75rem; color:var(--text-3);">Com WhatsApp</div>
                            </div>
                            <div style="flex:1; padding:1rem; background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:10px; text-align:center;">
                                <div style="font-size:1.8rem; font-weight:700; color:var(--text-2);"><?php echo $totalUsers; ?></div>
                                <div style="font-size:.75rem; color:var(--text-3);">Total membros</div>
                            </div>
                        </div>
                        <div class="info-box">
                            <i class="fas fa-circle-info wa-green"></i>
                            Membros cadastram o número em <strong>Minha Conta → WhatsApp</strong>. A cada venda, a notificação vai pro WhatsApp deles automaticamente.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>

    <script src="../script.js?v=124.0"></script>
    <script>
    let qrInterval = null;

    document.addEventListener('DOMContentLoaded', () => {
        checkStatus();
        // Polling a cada 8s enquanto na página
        setInterval(checkStatus, 8000);
    });

    function checkStatus() {
        fetch('whatsapp.php?ajax=status')
            .then(r => r.json())
            .then(data => updateUI(data))
            .catch(() => setBadge('unknown', 'Bridge offline'));
    }

    function updateUI(data) {
        if (data.connected && data.ready) {
            setBadge('connected', 'Conectado');
            document.getElementById('connected-panel').style.display = 'block';
            document.getElementById('qr-panel').style.display        = 'none';
            clearQrInterval();
            const pi = document.getElementById('phone-info');
            if (pi && data.phoneNumber) pi.textContent = 'Número: +' + data.phoneNumber;
        } else if (data.connected && !data.ready) {
            setBadge('unknown', 'Autenticando...');
        } else {
            setBadge('disconnected', data.error ? 'Bridge offline' : 'Aguardando QR');
            document.getElementById('connected-panel').style.display = 'none';
            document.getElementById('qr-panel').style.display        = 'block';
            if (data.hasQr && !qrInterval) loadQr();
        }
    }

    function setBadge(cls, text) {
        const b = document.getElementById('status-badge');
        const t = document.getElementById('status-text');
        b.className = 'wa-status-badge ' + cls;
        t.textContent = text;
        const dot = b.querySelector('.pulse-dot');
        dot.classList.toggle('live', cls === 'connected');
    }

    function loadQr() {
        const c = document.getElementById('qr-container');
        if (!c) return;
        c.innerHTML = '<div class="qr-spinner"><i class="fas fa-spinner"></i><span>Gerando QR Code...</span></div>';

        fetch('whatsapp.php?ajax=qr')
            .then(r => r.json())
            .then(data => {
                if (data.connected) {
                    checkStatus(); return;
                }
                if (data.qr) {
                    const img = document.createElement('img');
                    img.src   = data.qr;
                    img.alt   = 'QR Code WhatsApp';
                    img.style = 'border-radius:12px; max-width:250px; border:4px solid rgba(37,211,102,.35); background:#fff; padding:8px;';
                    c.innerHTML = '';
                    c.appendChild(img);
                    // Atualiza QR automaticamente a cada 55s (expira em 60s)
                    clearQrInterval();
                    qrInterval = setInterval(loadQr, 55000);
                } else {
                    c.innerHTML = '<div class="qr-spinner" style="color:#f87171;"><i class="fas fa-triangle-exclamation"></i><span>' + (data.error || 'QR não disponível. O bridge está rodando?') + '</span></div>';
                }
            })
            .catch(() => {
                c.innerHTML = '<div class="qr-spinner" style="color:#f87171;"><i class="fas fa-triangle-exclamation"></i><span>Bridge não encontrado em<br><?php echo htmlspecialchars($cfg['bridge_url']); ?></span></div>';
            });
    }

    function clearQrInterval() {
        if (qrInterval) { clearInterval(qrInterval); qrInterval = null; }
    }

    function disconnectWA() {
        if (!confirm('Desconectar o WhatsApp? Um novo QR Code será gerado.')) return;
        fetch('whatsapp.php?ajax=disconnect')
            .then(r => r.json())
            .then(() => { setTimeout(checkStatus, 3500); })
            .catch(() => alert('Erro ao desconectar.'));
    }

    function sendTest() {
        const phone  = document.getElementById('test-phone').value.trim();
        const result = document.getElementById('test-result');
        if (!phone) { alert('Informe o número.'); return; }

        result.style.display = 'none';
        const fd = new FormData();
        fd.append('phone', phone);
        fetch('whatsapp.php?ajax=test', { method: 'POST', body: fd })
            .then(r => r.json())
            .then(data => {
                result.style.display = 'block';
                if (data.ok) {
                    result.style.cssText = 'display:block; padding:10px 14px; border-radius:8px; font-size:.85rem; background:rgba(34,197,94,.15); color:#4ade80; border:1px solid rgba(34,197,94,.3);';
                    result.textContent = '✅ Enviado para ' + (data.phone || phone);
                } else {
                    result.style.cssText = 'display:block; padding:10px 14px; border-radius:8px; font-size:.85rem; background:rgba(239,68,68,.15); color:#f87171; border:1px solid rgba(239,68,68,.3);';
                    result.textContent = '❌ ' + (data.error || 'Falha — WhatsApp conectado?');
                }
            })
            .catch(() => { result.style.display = 'block'; result.textContent = '❌ Erro de rede.'; });
    }
    </script>
</body>
</html>
