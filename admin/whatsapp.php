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
    $instanceId = isset($_REQUEST['instance_id']) ? (int)$_REQUEST['instance_id'] : 0;

    if ($act === 'status') {
        if ($instanceId) {
            echo json_encode(WhatsAppService::getStatusById($instanceId));
        } else {
            echo json_encode(WhatsAppService::getStatus());
        }
        exit;
    }

    if ($act === 'qr') {
        if (!$instanceId) { echo json_encode(['ok' => false, 'error' => 'Instância não informada.']); exit; }
        $qr = WhatsAppService::getQrBase64ById($instanceId);
        if ($qr) {
            echo json_encode(['ok' => true, 'qr' => $qr]);
        } else {
            $s = WhatsAppService::getStatusById($instanceId);
            if (!empty($s['connected'])) {
                echo json_encode(['ok' => true, 'connected' => true]);
            } else {
                echo json_encode(['ok' => false, 'error' => $s['error'] ?? 'QR Code ainda não disponível.']);
            }
        }
        exit;
    }

    if ($act === 'disconnect') {
        if (!$instanceId) { echo json_encode(['ok' => false, 'error' => 'Instância não informada.']); exit; }
        echo json_encode(WhatsAppService::disconnectById($instanceId)); exit;
    }

    if ($act === 'restart') {
        if (!$instanceId) { echo json_encode(['ok' => false, 'error' => 'Instância não informada.']); exit; }
        echo json_encode(WhatsAppService::restartById($instanceId)); exit;
    }

    if ($act === 'test') {
        $phone = trim($_POST['phone'] ?? '');
        if (!$phone) { echo json_encode(['ok' => false, 'error' => 'Informe o número']); exit; }
        if (!$instanceId) { echo json_encode(['ok' => false, 'error' => 'Instância não informada.']); exit; }
        $res = WhatsAppService::testConnectionById($instanceId, $phone);
        echo json_encode(['ok' => $res['ok'], 'error' => $res['error'] ?? null, 'phone' => WhatsAppService::formatPhone($phone)]); exit;
    }

    if ($act === 'add') {
        $name = trim($_POST['name'] ?? '');
        $url = rtrim(trim($_POST['bridge_url'] ?? ''), '/');
        $secret = trim($_POST['bridge_secret'] ?? '');
        $priority = (int)($_POST['priority'] ?? 0);

        if (!$name || !$url) {
            echo json_encode(['ok' => false, 'error' => 'Nome e URL do Bridge são obrigatórios.']); exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO whatsapp_instances (name, bridge_url, bridge_secret, priority, is_active) VALUES (?, ?, ?, ?, 1)");
            $stmt->execute([$name, $url, $secret, $priority]);
            echo json_encode(['ok' => true, 'message' => 'Instância adicionada com sucesso.']);
        } catch (Throwable $e) {
            echo json_encode(['ok' => false, 'error' => 'Erro ao salvar: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($act === 'edit') {
        if (!$instanceId) { echo json_encode(['ok' => false, 'error' => 'Instância não informada.']); exit; }
        $name = trim($_POST['name'] ?? '');
        $url = rtrim(trim($_POST['bridge_url'] ?? ''), '/');
        $secret = trim($_POST['bridge_secret'] ?? '');
        $priority = (int)($_POST['priority'] ?? 0);
        $isActive = isset($_POST['is_active']) ? (int)$_POST['is_active'] : 1;

        if (!$name || !$url) {
            echo json_encode(['ok' => false, 'error' => 'Nome e URL do Bridge são obrigatórios.']); exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE whatsapp_instances SET name = ?, bridge_url = ?, bridge_secret = ?, priority = ?, is_active = ? WHERE id = ?");
            $stmt->execute([$name, $url, $secret, $priority, $isActive, $instanceId]);
            echo json_encode(['ok' => true, 'message' => 'Instância atualizada com sucesso.']);
        } catch (Throwable $e) {
            echo json_encode(['ok' => false, 'error' => 'Erro ao salvar: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($act === 'delete') {
        if (!$instanceId) { echo json_encode(['ok' => false, 'error' => 'Instância não informada.']); exit; }
        try {
            $stmt = $pdo->prepare("DELETE FROM whatsapp_instances WHERE id = ?");
            $stmt->execute([$instanceId]);
            echo json_encode(['ok' => true, 'message' => 'Instância excluída com sucesso.']);
        } catch (Throwable $e) {
            echo json_encode(['ok' => false, 'error' => 'Erro ao excluir: ' . $e->getMessage()]);
        }
        exit;
    }

    if ($act === 'toggle') {
        if (!$instanceId) { echo json_encode(['ok' => false, 'error' => 'Instância não informada.']); exit; }
        try {
            $stmt = $pdo->prepare("UPDATE whatsapp_instances SET is_active = 1 - is_active WHERE id = ?");
            $stmt->execute([$instanceId]);
            $newVal = $pdo->query("SELECT is_active FROM whatsapp_instances WHERE id = $instanceId")->fetchColumn();
            echo json_encode(['ok' => true, 'active' => $newVal == 1]);
        } catch (Throwable $e) {
            echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }

    if ($act === 'pairing-code') {
        if (!$instanceId) { echo json_encode(['ok' => false, 'error' => 'Instância não informada.']); exit; }
        $phone = trim($_POST['phone'] ?? '');
        if (!$phone) { echo json_encode(['ok' => false, 'error' => 'Telefone não informado.']); exit; }
        
        $s = $pdo->prepare("SELECT bridge_url FROM whatsapp_instances WHERE id = ?");
        $s->execute([$instanceId]);
        $url = rtrim($s->fetchColumn(), '/');
        if (!$url) { echo json_encode(['ok' => false, 'error' => 'URL da instância não encontrada.']); exit; }
        
        $ch = curl_init("$url/pairing-code");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['phone' => $phone]));
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        
        if ($err) {
            echo json_encode(['ok' => false, 'error' => 'Erro ao comunicar com o bridge: ' . $err]);
        } else {
            echo $response;
        }
        exit;
    }

    echo json_encode(['ok' => false, 'error' => 'Ação inválida']); exit;
}

// ── Salvar configurações globais ──────────────────────────────────────────────
$success = false;
$error   = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_settings'])) {
    $fields = [
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
        $success = "Configurações globais salvas com sucesso!";
    } catch (PDOException $e) {
        try {
            $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?");
            foreach ($fields as $k => $v) {
                $stmt->execute([$k, $v, $v]);
            }
            $success = "Configurações globais salvas com sucesso!";
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
    'admin_phone'       => $getSetting('wa_admin_phone'),
    'enabled'           => $getSetting('whatsapp_enabled', '0') === '1',
    'notify_sale'       => $getSetting('whatsapp_notify_sale', '1') !== '0',
    'notify_withdrawal' => $getSetting('whatsapp_notify_withdrawal', '1') !== '0',
    'notify_new_user'   => $getSetting('whatsapp_notify_new_user', '0') === '1',
    'notify_user_sale'  => $getSetting('whatsapp_notify_user_sale', '1') !== '0',
];

// Carrega todas as instâncias cadastradas
try {
    $stmt = $pdo->query("SELECT * FROM whatsapp_instances ORDER BY priority ASC, id ASC");
    $instances = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $e) {
    $instances = [];
}

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
    <title>Comando Central | Bot WhatsApp Failover</title>
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

        /* Hero Grid Layout */
        .hero-grid-cmd {
            display: grid;
            grid-template-columns: 1fr 380px;
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
            height: 200px;
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
            min-height: 350px;
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
        .badge-cmd-off { background: rgba(255, 255, 255, 0.08); color: #94a3b8; }
        .badge-cmd-wait { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .badge-cmd-err { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

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

        /* Instâncias Table/List Styling */
        .instances-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
        }
        .instances-table th, .instances-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        .instances-table th {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-dim);
            letter-spacing: 0.05em;
        }
        .instances-table tbody tr {
            transition: 0.2s;
            cursor: pointer;
        }
        .instances-table tbody tr:hover {
            background: rgba(255, 255, 255, 0.02);
        }
        .instances-table tbody tr.active-row {
            background: rgba(99, 102, 241, 0.08);
            border-left: 3px solid var(--primary);
        }
        .td-name { font-weight: 600; color: #fff; }
        .td-url { font-family: monospace; font-size: 0.8rem; color: var(--text-dim); }

        /* Glassmorphism Modal */
        .glass-modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0; top: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(8px);
            align-items: center;
            justify-content: center;
        }
        .modal-content {
            background: rgba(20, 28, 48, 0.95);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 2rem;
            width: 480px;
            max-width: 90%;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #fff; }
        .modal-close {
            color: var(--text-dim);
            font-size: 1.2rem;
            cursor: pointer;
            transition: 0.2s;
        }
        .modal-close:hover { color: #fff; }
    </style>
</head>
<body class="dashboard-body cmd-body">
    <?php include '../includes/sidebar.php'; ?>

    <main class="main-content">
        <header class="header-cmd">
            <div>
                <h1>Centro de Comando WhatsApp</h1>
                <p>Gerenciamento de múltiplos números com failover dinâmico</p>
            </div>
            <div>
                <button onclick="openAddModal()" class="btn-cmd btn-cmd-outline" style="background: var(--primary); color: #fff; border:none;">
                    <i class="fas fa-plus"></i> Nova Instância
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
                <div class="stat-icon-cmd" style="background: rgba(99, 102, 241, 0.12); color: #818cf8;"><i class="fab fa-whatsapp"></i></div>
                <span class="val-cmd"><?php echo count($instances); ?></span>
                <span class="lab-cmd">Instâncias Cadastradas</span>
            </div>
            <div class="card-stat-cmd">
                <div class="stat-icon-cmd" style="background: rgba(16, 185, 129, 0.12); color: #34d399;"><i class="fas fa-link"></i></div>
                <span class="val-cmd">
                    <?php 
                    $actCount = 0;
                    foreach ($instances as $i) if ($i['is_active']) $actCount++;
                    echo $actCount;
                    ?>
                </span>
                <span class="lab-cmd">Bridges Ativos</span>
            </div>
            <div class="card-stat-cmd">
                <div class="stat-icon-cmd" style="background: rgba(245, 158, 11, 0.12); color: #fbbf24;"><i class="fas fa-users"></i></div>
                <span class="val-cmd"><?php echo $waCount; ?> / <?php echo $totalUsers; ?></span>
                <span class="lab-cmd">Clientes com WhatsApp</span>
            </div>
            <div class="card-stat-cmd">
                <div class="stat-icon-cmd" style="background: rgba(239, 68, 68, 0.12); color: #f87171;"><i class="fas fa-shield-halved"></i></div>
                <span class="val-cmd"><?php echo $cfg['enabled'] ? 'ATIVO' : 'DESATIVADO'; ?></span>
                <span class="lab-cmd">Status Notificações</span>
            </div>
        </div>

        <div class="hero-grid-cmd">
            <!-- Coluna Esquerda: Lista de Instâncias & Configs -->
            <div>
                <!-- Lista de Instâncias -->
                <div class="panel-cmd" style="padding-bottom: 1.5rem;">
                    <h3 class="panel-title-cmd"><i class="fas fa-list-check" style="color: var(--primary);"></i> Instâncias do WhatsApp Bridge</h3>
                    
                    <?php if (empty($instances)): ?>
                        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-dim);">
                            <i class="fab fa-whatsapp" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                            <p style="margin: 0; font-size: 0.95rem;">Nenhuma instância configurada.</p>
                            <p style="margin: 5px 0 0; font-size: 0.8rem;">Adicione uma instância do bridge acima para iniciar o pareamento.</p>
                        </div>
                    <?php else: ?>
                        <div style="overflow-x: auto;">
                            <table class="instances-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Bridge URL</th>
                                        <th>Status</th>
                                        <th>Número</th>
                                        <th>Prioridade</th>
                                        <th style="text-align: right;">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($instances as $inst): 
                                        $statusClass = 'badge-cmd-off';
                                        $statusText = 'Offline';
                                        if ($inst['is_active']) {
                                            if ($inst['status'] === 'connected') {
                                                $statusClass = 'badge-cmd-on';
                                                $statusText = 'Conectado';
                                            } elseif ($inst['status'] === 'disconnected') {
                                                $statusClass = 'badge-cmd-wait';
                                                $statusText = 'Desconectado';
                                            } else {
                                                $statusClass = 'badge-cmd-err';
                                                $statusText = 'Desconectado';
                                            }
                                        } else {
                                            $statusText = 'Inativo';
                                        }
                                    ?>
                                        <tr id="inst-row-<?php echo $inst['id']; ?>" onclick="selectInstance(<?php echo $inst['id']; ?>)">
                                            <td class="td-name">
                                                <i class="fab fa-whatsapp" style="color:#25d366; margin-right: 5px;"></i>
                                                <?php echo htmlspecialchars($inst['name']); ?>
                                            </td>
                                            <td class="td-url"><?php echo htmlspecialchars($inst['bridge_url']); ?></td>
                                            <td>
                                                <span class="status-badge-cmd <?php echo $statusClass; ?>">
                                                    <span class="pulse-dot-cmd"></span>
                                                    <span><?php echo $statusText; ?></span>
                                                </span>
                                            </td>
                                            <td style="font-family: monospace; font-size: 0.85rem;">
                                                <?php echo $inst['phone'] ? ('+' . $inst['phone']) : '<span style="opacity: 0.3;">—</span>'; ?>
                                            </td>
                                            <td>
                                                <span class="badge" style="background: rgba(255,255,255,0.04); padding: 3px 8px; font-weight: bold;">
                                                    <?php echo $inst['priority']; ?>
                                                </span>
                                            </td>
                                            <td style="text-align: right;" onclick="event.stopPropagation()">
                                                <button onclick="openEditModal(<?php echo htmlspecialchars(json_encode($inst)); ?>)" class="btn-cmd btn-cmd-outline" style="padding: 0.4rem 0.6rem; font-size: 0.75rem;" title="Editar">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button onclick="deleteInstance(<?php echo $inst['id']; ?>, '<?php echo htmlspecialchars($inst['name']); ?>')" class="btn-cmd btn-cmd-danger" style="padding: 0.4rem 0.6rem; font-size: 0.75rem;" title="Excluir">
                                                    <i class="fas fa-trash-can"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Configurações de Alertas Globais -->
                <div class="panel-cmd">
                    <h3 class="panel-title-cmd"><i class="fas fa-sliders" style="color: var(--primary);"></i> Ajustes Globais de Notificações</h3>
                    <form method="POST">
                        <input type="hidden" name="save_settings" value="1">

                        <div>
                            <label class="form-label-cmd">Celular administrador global (recebe alertas de vendas/saques)</label>
                            <input type="text" name="wa_admin_phone" value="<?php echo htmlspecialchars($cfg['admin_phone']); ?>" class="form-input-cmd" placeholder="5511999999999">
                        </div>

                        <div class="toggle-row-cmd">
                            <div>
                                <strong style="color: #fff; font-size: 0.9rem;">Habilitar Notificações WhatsApp</strong>
                                <p style="margin: 2px 0 0; font-size: 0.75rem; color: var(--text-dim);">Ativa ou desativa todo o envio de mensagens do bot no sistema</p>
                            </div>
                            <label class="toggle-switch-cmd">
                                <input type="checkbox" name="whatsapp_enabled" <?php echo $cfg['enabled'] ? 'checked' : ''; ?>>
                                <span class="slider"></span>
                            </label>
                        </div>

                        <div class="toggle-row-cmd">
                            <div>
                                <strong style="color: #fff; font-size: 0.9rem;">Notificar Vendas (Admin)</strong>
                                <p style="margin: 2px 0 0; font-size: 0.75rem; color: var(--text-dim);">Recebe notificações a cada nova venda bruto/líquido no celular admin</p>
                            </div>
                            <label class="toggle-switch-cmd">
                                <input type="checkbox" name="notify_sale" <?php echo $cfg['notify_sale'] ? 'checked' : ''; ?>><span class="slider"></span>
                            </label>
                        </div>

                        <div class="toggle-row-cmd">
                            <div>
                                <strong style="color: #fff; font-size: 0.9rem;">Notificar Membros ao Vender</strong>
                                <p style="margin: 2px 0 0; font-size: 0.75rem; color: var(--text-dim);">Envia comemorações automáticas para o WhatsApp do vendedor cadastrado</p>
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
                            <i class="fas fa-save"></i> Gravar Ajustes de Notificações Globais
                        </button>
                    </form>
                </div>
            </div>

            <!-- Coluna Direita: Painel Interativo da Instância Selecionada -->
            <div>
                <div class="panel-cmd" id="interactive-panel" style="min-height: 480px; position: sticky; top: 1.5rem;">
                    <!-- Nenhuma instância selecionada -->
                    <div id="no-instance-selected" style="text-align: center; padding: 6rem 1.5rem; color: var(--text-dim);">
                        <i class="fas fa-computer-mouse" style="font-size: 3rem; color: var(--primary); margin-bottom: 1.5rem; opacity: 0.4;"></i>
                        <h4 style="color:#fff; margin:0 0 10px; font-weight:700;">Painel de Controle</h4>
                        <p style="margin: 0; font-size: 0.82rem; line-height: 1.5;">Clique em uma instância do bridge na lista ao lado para conectá-la, visualizar o terminal de logs e o QR code.</p>
                    </div>

                    <!-- Conteúdo dinâmico da instância -->
                    <div id="instance-selected-panel" style="display: none;">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 1rem; margin-bottom: 1.5rem;">
                            <div>
                                <h3 id="panel-inst-name" style="margin:0; font-size:1.15rem; font-weight:800; color:#fff;">Nome da Instância</h3>
                                <span id="panel-inst-url" style="font-family:monospace; font-size:0.75rem; color:var(--text-dim);">http://127.0.0.1:3001</span>
                            </div>
                            <button onclick="syncCurrentInstance()" class="btn-cmd btn-cmd-outline" style="padding: 0.5rem 0.6rem; font-size:0.8rem;" title="Sincronizar">
                                <i class="fas fa-sync" id="panel-sync-icon"></i>
                            </button>
                        </div>

                        <!-- Conectado -->
                        <div id="panel-connected" style="display: none; text-align: center; padding: 1rem 0;">
                            <div style="width: 100px; height: 100px; background: rgba(16,185,129,0.08); border: 3px solid var(--success); border-radius: 50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 1.5rem; box-shadow: 0 0 30px rgba(16,185,129,0.15);">
                                <i class="fas fa-check" style="font-size: 2.5rem; color: var(--success);"></i>
                            </div>
                            <h3 style="margin: 0; color: #fff; font-weight: 800;">CONEXÃO ATIVA</h3>
                            <p id="panel-phone-info" style="color: var(--text-dim); margin: 0.5rem 0 1.5rem; font-family: monospace; font-size: 0.85rem;"></p>
                            <p style="color: var(--text-dim); font-size: 0.78rem; line-height: 1.5; margin: 0 auto 1.5rem; max-width: 280px;">
                                Esta instância está ativa e processando a fila de notificações normalmente.
                            </p>
                        </div>

                        <!-- QR Code / Pareamento -->
                        <div id="panel-qr-pane" style="display: none; text-align: center;">
                            <p style="color: var(--text-dim); font-size: 0.8rem; margin-bottom: 1rem;">
                                Conecte seu WhatsApp lendo o QR Code ou usando um Código de Pareamento.
                            </p>
                            
                            <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 1rem;">
                                <button onclick="toggleConnectMode('qr')" id="btn-mode-qr" class="btn-cmd btn-cmd-outline" style="background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3);">Via QR Code</button>
                                <button onclick="toggleConnectMode('code')" id="btn-mode-code" class="btn-cmd btn-cmd-outline">Via Código</button>
                            </div>
                        
                            <!-- Container QR -->
                            <div id="connect-mode-qr">
                                <div id="panel-qr-container" style="min-height: 190px; display:flex; align-items:center; justify-content:center; background: #fff; border-radius: 16px; padding: 1rem; max-width: 200px; margin: 0 auto 1.25rem; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
                                    <div style="text-align: center; color: #64748b;">
                                        <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
                                        <div style="font-size: 0.75rem; font-weight: bold;">Gerando QR Code...</div>
                                    </div>
                                </div>
                                <div style="color: var(--text-dim); font-size: 0.72rem; line-height: 1.5; max-width: 260px; margin: 0 auto 1.25rem;">
                                    <i class="fas fa-mobile-screen-button"></i> Menu WhatsApp → <strong>Aparelhos conectados</strong> → <strong>Conectar aparelho</strong>.
                                </div>
                            </div>
                        
                            <!-- Container Código -->
                            <div id="connect-mode-code" style="display: none; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-align: left;">
                                <label class="form-label-cmd" style="text-align: left; margin-bottom: 8px;">Digite o número do WhatsApp (com DDD)</label>
                                <div style="display: flex; gap: 8px;">
                                    <input type="text" id="pairing-phone-input" class="form-input-cmd" placeholder="Ex: 5511999999999" style="margin: 0;">
                                    <button onclick="requestPairingCode()" id="btn-req-code" class="btn-cmd" style="background: var(--primary); color: #fff; border: none; padding: 0.5rem 1rem;">
                                        Gerar
                                    </button>
                                </div>
                                
                                <div id="pairing-code-display" style="display: none; margin-top: 1.5rem; text-align: center;">
                                    <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 8px;">Seu Código:</div>
                                    <div id="the-pairing-code" style="font-size: 2rem; font-weight: 800; letter-spacing: 0.2em; color: #fff; background: rgba(16,185,129,0.1); border: 1px dashed #10b981; border-radius: 12px; padding: 1rem; user-select: all;">----</div>
                                    <div style="color: var(--text-dim); font-size: 0.72rem; line-height: 1.5; margin-top: 12px;">
                                        <i class="fas fa-mobile-screen-button"></i> Menu WhatsApp → Aparelhos conectados → Conectar aparelho → <strong>Conectar com número de telefone</strong>.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Offline -->
                        <div id="panel-offline" style="display: none; text-align: center; padding: 1.5rem 0;">
                            <div style="width: 80px; height: 80px; background: rgba(239,68,68,0.08); border: 3px solid var(--danger); border-radius: 50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 1.5rem;">
                                <i class="fas fa-triangle-exclamation" style="font-size: 2.2rem; color: var(--danger);"></i>
                            </div>
                            <h3 style="margin: 0; color: #fff; font-weight: 800;">DAEMON OFFLINE</h3>
                            <p style="color: var(--text-dim); font-size: 0.78rem; line-height: 1.5; margin: 0.5rem auto 1.5rem; max-width: 280px;">
                                O bridge desta porta não pôde ser contatado. Certifique-se de que a API esteja rodando via SSH/Terminal e que a URL esteja correta.
                            </p>
                            <div id="panel-last-error" style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); padding:10px; border-radius:10px; color:#f87171; font-family:monospace; font-size:0.75rem; text-align:left; max-height:80px; overflow-y:auto; margin-bottom:1.5rem; word-break:break-all;"></div>
                        </div>

                        <!-- Console Logs -->
                        <div style="margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 1.5rem;">
                            <h4 style="margin: 0 0 10px; font-size: 0.85rem; font-weight: 700; color: #fff;"><i class="fas fa-terminal"></i> Terminal da Instância</h4>
                            <div class="console-cmd" id="panel-console" style="height: 140px;">
                                <div class="line-cmd info">> Selecione uma ação para interagir...</div>
                            </div>
                        </div>

                        <!-- Teste rápido de envio -->
                        <div id="panel-test-section" style="margin-top: 1rem; background:rgba(0,0,0,0.15); padding:1rem; border-radius:16px; border:1px solid rgba(255,255,255,0.02);">
                            <h4 style="margin: 0 0 8px; font-size: 0.8rem; font-weight: 700; color:#fff;"><i class="fas fa-paper-plane"></i> Testar Envio por este número</h4>
                            <div style="display: flex; gap: 0.5rem;">
                                <input type="text" id="test-phone" placeholder="5511999999999" class="form-input-cmd" style="margin:0; flex:1; padding: 0.5rem 0.75rem; font-size:0.8rem;">
                                <button onclick="sendQuickTest()" class="btn-cmd btn-cmd-outline" style="padding: 0.5rem 0.8rem; font-size:0.8rem; background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); color: #10b981;">
                                    Disparar
                                </button>
                            </div>
                            <div id="test-result" style="display:none; padding:8px 12px; border-radius:8px; font-size:.72rem; margin-top: 8px;"></div>
                        </div>

                        <!-- Daemon Control Buttons -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1.5rem;">
                            <button onclick="triggerInstanceAction('restart')" class="btn-cmd btn-cmd-outline" style="font-size:0.8rem; padding:0.6rem;">
                                <i class="fas fa-rotate"></i> Reiniciar Bridge
                            </button>
                            <button onclick="triggerInstanceAction('disconnect')" class="btn-cmd btn-cmd-danger" style="font-size:0.8rem; padding:0.6rem;">
                                <i class="fas fa-unlink"></i> Desvincular Conta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Glass Modals -->
    <!-- Modal Adicionar Instância -->
    <div id="add-modal" class="glass-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Adicionar WhatsApp Bridge</h3>
                <span class="modal-close" onclick="closeModal('add-modal')">&times;</span>
            </div>
            <form id="add-instance-form" onsubmit="saveInstance(event, 'add')">
                <div>
                    <label class="form-label-cmd">Nome da Instância (Identificador)</label>
                    <input type="text" name="name" required class="form-input-cmd" placeholder="Ex: Número Principal, Chip Suporte">
                </div>
                <div>
                    <label class="form-label-cmd">URL do Bridge (Endereço Local)</label>
                    <input type="text" name="bridge_url" required class="form-input-cmd" placeholder="Ex: http://127.0.0.1:3001">
                </div>
                <div>
                    <label class="form-label-cmd">Secret Token (Se configurado no bridge)</label>
                    <input type="password" name="bridge_secret" class="form-input-cmd" placeholder="Opcional">
                </div>
                <div>
                    <label class="form-label-cmd">Prioridade no Failover (Menor = Principal)</label>
                    <input type="number" name="priority" value="0" class="form-input-cmd" placeholder="Ex: 0 para chip principal, 1 para secundário">
                </div>
                <button type="submit" class="btn-cmd" style="width: 100%; background: var(--primary); color: #fff; margin-top: 1rem;">
                    Salvar Instância
                </button>
            </form>
        </div>
    </div>

    <!-- Modal Editar Instância -->
    <div id="edit-modal" class="glass-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Editar WhatsApp Bridge</h3>
                <span class="modal-close" onclick="closeModal('edit-modal')">&times;</span>
            </div>
            <form id="edit-instance-form" onsubmit="saveInstance(event, 'edit')">
                <input type="hidden" name="instance_id" id="edit-id">
                <div>
                    <label class="form-label-cmd">Nome da Instância</label>
                    <input type="text" name="name" id="edit-name" required class="form-input-cmd">
                </div>
                <div>
                    <label class="form-label-cmd">URL do Bridge</label>
                    <input type="text" name="bridge_url" id="edit-url" required class="form-input-cmd">
                </div>
                <div>
                    <label class="form-label-cmd">Secret Token</label>
                    <input type="password" name="bridge_secret" id="edit-secret" class="form-input-cmd" placeholder="Opcional">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label class="form-label-cmd">Prioridade</label>
                        <input type="number" name="priority" id="edit-priority" class="form-input-cmd">
                    </div>
                    <div>
                        <label class="form-label-cmd">Status</label>
                        <div class="toggle-row-cmd" style="border:none; padding: 0.5rem 0 0;">
                            <span style="color:var(--text-dim); font-size:0.85rem; font-weight:bold;">Instância Ativa</span>
                            <label class="toggle-switch-cmd">
                                <input type="checkbox" name="is_active" id="edit-active" value="1">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn-cmd" style="width: 100%; background: var(--primary); color: #fff; margin-top: 1.5rem;">
                    Atualizar Instância
                </button>
            </form>
        </div>
    </div>

    <script src="../script.js?v=128.0"></script>
    <script>
    let activeInstanceId = null;
    let qrTimer = null;
    let syncInterval = null;
    
    // Lista de instâncias vindas do PHP
    const instancesData = <?php echo json_encode($instances); ?>;

    function openAddModal() {
        document.getElementById('add-instance-form').reset();
        
        let nextPort = 3001;
        let nextPriority = 0;
        
        if (instancesData && instancesData.length > 0) {
            let maxPort = 3000;
            let maxPriority = -1;
            
            instancesData.forEach(inst => {
                const match = inst.bridge_url.match(/:([0-9]+)/);
                if (match) {
                    const port = parseInt(match[1]);
                    if (port > maxPort) maxPort = port;
                }
                const prio = parseInt(inst.priority);
                if (prio > maxPriority) maxPriority = prio;
            });
            
            nextPort = maxPort + 1;
            nextPriority = maxPriority + 1;
        }
        
        const urlInput = document.querySelector('#add-instance-form input[name="bridge_url"]');
        if (urlInput) {
            urlInput.value = `http://127.0.0.1:${nextPort}`;
        }
        
        const priorityInput = document.querySelector('#add-instance-form input[name="priority"]');
        if (priorityInput) {
            priorityInput.value = nextPriority;
        }
        
        document.getElementById('add-modal').style.display = 'flex';
    }

    function openEditModal(inst) {
        document.getElementById('edit-id').value = inst.id;
        document.getElementById('edit-name').value = inst.name;
        document.getElementById('edit-url').value = inst.bridge_url;
        document.getElementById('edit-secret').value = inst.bridge_secret || '';
        document.getElementById('edit-priority').value = inst.priority;
        document.getElementById('edit-active').checked = inst.is_active == 1;
        document.getElementById('edit-modal').style.display = 'flex';
    }

    function closeModal(id) {
        document.getElementById(id).style.display = 'none';
    }

    // Fechar modais ao clicar fora
    window.onclick = function(event) {
        if (event.target.className === 'glass-modal') {
            event.target.style.display = 'none';
        }
    }

    function saveInstance(e, action) {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        
        fetch('whatsapp.php?ajax=' + action, {
            method: 'POST',
            body: fd
        })
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                alert(data.message);
                location.reload();
            } else {
                alert('Erro: ' + data.error);
            }
        })
        .catch(() => alert('Erro de rede ao salvar a instância.'));
    }

    function deleteInstance(id, name) {
        if (!confirm(`Tem certeza que deseja excluir a instância "${name}"? Todas as chaves Baileys e de autenticação desta instância serão mantidas mas ela deixará de ser monitorada.`)) return;

        fetch(`whatsapp.php?ajax=delete&instance_id=${id}`)
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                alert(data.message);
                location.reload();
            } else {
                alert('Erro: ' + data.error);
            }
        })
        .catch(() => alert('Erro ao excluir instância.'));
    }

    function selectInstance(id) {
        activeInstanceId = id;
        
        // Remove classe ativa de todas as linhas e adiciona na selecionada
        document.querySelectorAll('.instances-table tbody tr').forEach(tr => {
            tr.classList.remove('active-row');
        });
        const selectedRow = document.getElementById('inst-row-' + id);
        if (selectedRow) selectedRow.classList.add('active-row');

        // Carrega dados da instância
        const inst = instancesData.find(i => i.id == id);
        if (!inst) return;

        document.getElementById('no-instance-selected').style.display = 'none';
        document.getElementById('instance-selected-panel').style.display = 'block';
        
        document.getElementById('panel-inst-name').textContent = inst.name;
        document.getElementById('panel-inst-url').textContent = inst.bridge_url;
        
        document.getElementById('panel-console').innerHTML = '<div class="line-cmd info">> Conectando ao painel da instância...</div>';
        
        document.getElementById('test-result').style.display = 'none';
        document.getElementById('test-phone').value = '';

        clearSync();
        syncCurrentInstance(true);
        
        // Pool de status a cada 6 segundos para a instância ativa
        syncInterval = setInterval(() => syncCurrentInstance(false), 6000);
    }

    function clearSync() {
        if (syncInterval) { clearInterval(syncInterval); syncInterval = null; }
        if (qrTimer) { clearInterval(qrTimer); qrTimer = null; }
    }

    function addConsoleLine(msg, type = 'info') {
        const consoleEl = document.getElementById('panel-console');
        if (!consoleEl) return;
        const line = document.createElement('div');
        line.className = 'line-cmd ' + type;
        line.innerText = '> [' + new Date().toLocaleTimeString() + '] ' + msg;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    function syncCurrentInstance(forceLog = false) {
        if (!activeInstanceId) return;

        const syncIcon = document.getElementById('panel-sync-icon');
        if (syncIcon) syncIcon.classList.add('fa-spin');

        fetch(`whatsapp.php?ajax=status&instance_id=${activeInstanceId}`)
        .then(r => r.json())
        .then(data => {
            if (syncIcon) syncIcon.classList.remove('fa-spin');

            const pConnected = document.getElementById('panel-connected');
            const pQr = document.getElementById('panel-qr-pane');
            const pOffline = document.getElementById('panel-offline');

            // Esconde todos
            pConnected.style.display = 'none';
            pQr.style.display = 'none';
            pOffline.style.display = 'none';

            if (data.connected && data.ready) {
                pConnected.style.display = 'block';
                document.getElementById('panel-phone-info').textContent = 'Número Conectado: +' + data.phoneNumber;
                
                if (forceLog) {
                    addConsoleLine('WhatsApp conectado com sucesso no Daemon Core.', 'sys');
                    addConsoleLine('Porta de comunicação ativa com número: ' + data.phoneNumber, 'sys');
                }
                if (qrTimer) { clearInterval(qrTimer); qrTimer = null; }
            } else if (data.connected && !data.ready) {
                pQr.style.display = 'block'; // Mostra QR painel se não estiver pronto
                if (forceLog) {
                    addConsoleLine('Aguardando sincronização inicial das credenciais...', 'info');
                }
                if (data.hasQr && !qrTimer) loadQrCode();
            } else if (data.ok && !data.connected) {
                pQr.style.display = 'block';
                if (forceLog) {
                    addConsoleLine('Instância ativa. Aguardando leitura do QR code para pareamento...', 'warn');
                }
                if (data.hasQr && !qrTimer) loadQrCode();
            } else {
                pOffline.style.display = 'block';
                document.getElementById('panel-last-error').textContent = data.error || 'Bridge inacessível. O script node pode estar desligado.';
                if (forceLog) {
                    addConsoleLine('Erro no Daemon da instância: ' + (data.error || 'Inacessível'), 'err');
                }
                if (qrTimer) { clearInterval(qrTimer); qrTimer = null; }
            }
        })
        .catch((e) => {
            if (syncIcon) syncIcon.classList.remove('fa-spin');
            document.getElementById('panel-connected').style.display = 'none';
            document.getElementById('panel-qr-pane').style.display = 'none';
            document.getElementById('panel-offline').style.display = 'block';
            document.getElementById('panel-last-error').textContent = 'Erro de Rede: Não foi possível conectar ao bridge desta instância.';
            if (forceLog) {
                addConsoleLine('Falha grave de rede. Verifique a URL do bridge e portas de firewall.', 'err');
            }
            if (qrTimer) { clearInterval(qrTimer); qrTimer = null; }
        });
    }

    function loadQrCode() {
        const container = document.getElementById('panel-qr-container');
        if (!container || !activeInstanceId) return;

        fetch(`whatsapp.php?ajax=qr&instance_id=${activeInstanceId}`)
        .then(r => r.json())
        .then(data => {
            if (data.connected) {
                syncCurrentInstance(true); return;
            }
            if (data.qr) {
                container.innerHTML = `<img src="${data.qr}" alt="QR Code" style="width: 100%; border-radius: 10px; border: 1px solid rgba(0,0,0,0.05);">`;
                addConsoleLine('QR Code atualizado no painel lateral.', 'sys');
                
                if (qrTimer) clearInterval(qrTimer);
                // Atualizar a cada 45 segundos
                qrTimer = setInterval(loadQrCode, 45000);
            } else {
                container.innerHTML = `<div style="color:var(--danger); font-size:0.75rem; text-align:center;"><i class="fas fa-triangle-exclamation" style="font-size:1.5rem; margin-bottom:6px;"></i><br>${data.error || 'QR Indisponível.'}</div>`;
            }
        })
        .catch(e => {
            container.innerHTML = `<div style="color:var(--danger); font-size:0.75rem; text-align:center;"><i class="fas fa-triangle-exclamation" style="font-size:1.5rem; margin-bottom:6px;"></i><br>Erro de conexão ao buscar QR.</div>`;
        });
    }

    function toggleConnectMode(mode) {
        document.getElementById('connect-mode-qr').style.display = mode === 'qr' ? 'block' : 'none';
        document.getElementById('connect-mode-code').style.display = mode === 'code' ? 'block' : 'none';
        
        const btnQr = document.getElementById('btn-mode-qr');
        const btnCode = document.getElementById('btn-mode-code');
        
        if (mode === 'qr') {
            btnQr.style.background = 'rgba(255,255,255,0.1)'; btnQr.style.borderColor = 'rgba(255,255,255,0.3)';
            btnCode.style.background = 'transparent'; btnCode.style.borderColor = 'var(--border)';
        } else {
            btnCode.style.background = 'rgba(255,255,255,0.1)'; btnCode.style.borderColor = 'rgba(255,255,255,0.3)';
            btnQr.style.background = 'transparent'; btnQr.style.borderColor = 'var(--border)';
        }
    }

    function requestPairingCode() {
        const phone = document.getElementById('pairing-phone-input').value;
        if (!phone) return alert('Digite o telefone (com DDD).');
        if (!activeInstanceId) return;
        
        const btn = document.getElementById('btn-req-code');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        addConsoleLine('Solicitando Código de Pareamento para ' + phone + '...', 'info');
        
        const fd = new FormData();
        fd.append('phone', phone);
        
        fetch(`whatsapp.php?ajax=pairing-code&instance_id=${activeInstanceId}`, {
            method: 'POST',
            body: fd
        })
        .then(r => r.json())
        .then(data => {
            btn.disabled = false;
            btn.innerHTML = 'Gerar';
            if (data.ok && data.code) {
                document.getElementById('pairing-code-display').style.display = 'block';
                document.getElementById('the-pairing-code').innerText = data.code;
                addConsoleLine('Código gerado com sucesso: ' + data.code, 'sys');
            } else {
                addConsoleLine('Erro no pareamento: ' + data.error, 'err');
                alert(data.error || 'Erro desconhecido');
            }
        })
        .catch(e => {
            btn.disabled = false;
            btn.innerHTML = 'Gerar';
            addConsoleLine('Erro de rede ao pedir pareamento.', 'err');
        });
    }

    function triggerInstanceAction(action) {
        if (!activeInstanceId) return;
        
        let confirmMsg = action === 'disconnect' ? 'Desconectar a conta WhatsApp desta instância? Será necessário escanear um novo QR Code.' : 'Deseja reiniciar a memória do bridge desta instância?';
        if (!confirm(confirmMsg)) return;

        addConsoleLine(`Transmitindo comando ${action.toUpperCase()} para o bridge...`, 'info');
        fetch(`whatsapp.php?ajax=${action}&instance_id=${activeInstanceId}`)
        .then(r => r.json())
        .then(data => {
            if (data.ok) {
                addConsoleLine('Comando executado com sucesso no bridge.', 'sys');
                setTimeout(() => syncCurrentInstance(true), 3000);
            } else {
                addConsoleLine('Erro retornado pelo bridge: ' + data.error, 'err');
            }
        })
        .catch(() => {
            addConsoleLine('Falha crítica de comunicação com o bridge.', 'err');
        });
    }

    function sendQuickTest() {
        if (!activeInstanceId) return;
        const phone = document.getElementById('test-phone').value.trim();
        const result = document.getElementById('test-result');
        if (!phone) { alert('Informe o número.'); return; }

        result.style.display = 'none';
        addConsoleLine('Disparando mensagem de teste via instância para: +' + phone, 'info');

        const fd = new FormData();
        fd.append('phone', phone);

        fetch(`whatsapp.php?ajax=test&instance_id=${activeInstanceId}`, { 
            method: 'POST', 
            body: fd 
        })
        .then(r => r.json())
        .then(data => {
            result.style.display = 'block';
            if (data.ok) {
                result.style.cssText = 'display:block; padding:8px 12px; border-radius:8px; font-size:.72rem; background:rgba(34,197,94,.1); color:#4ade80; border:1px solid rgba(34,197,94,.2);';
                result.innerHTML = '<i class="fas fa-check-circle"></i> Mensagem enviada com sucesso!';
                addConsoleLine('Envio de teste confirmado para: +' + phone, 'sys');
            } else {
                result.style.cssText = 'display:block; padding:8px 12px; border-radius:8px; font-size:.72rem; background:rgba(239,68,68,.1); color:#f87171; border:1px solid rgba(239,68,68,.2);';
                result.innerHTML = '<i class="fas fa-circle-exclamation"></i> Falha: ' + (data.error || 'WhatsApp despareado?');
                addConsoleLine('Falha ao enviar teste por esta instância: ' + (data.error || 'Desconhecido'), 'err');
            }
        })
        .catch(() => {
            result.style.display = 'block';
            result.style.cssText = 'display:block; padding:8px 12px; border-radius:8px; font-size:.72rem; background:rgba(239,68,68,.1); color:#f87171; border:1px solid rgba(239,68,68,.2);';
            result.innerHTML = '<i class="fas fa-circle-exclamation"></i> Erro de rede.';
            addConsoleLine('Erro de rede durante o teste de disparo.', 'err');
        });
    }

    // Seleciona automaticamente a primeira se houver instâncias configuradas
    document.addEventListener('DOMContentLoaded', () => {
        if (instancesData && instancesData.length > 0) {
            selectInstance(instancesData[0].id);
        }
    });
    </script>
</body>
</html>
