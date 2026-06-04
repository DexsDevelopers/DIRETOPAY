<?php
require_once 'includes/db.php';

// Segurança: Apenas administradores
if (!isLoggedIn() || !isAdmin()) {
    if (isset($_GET['ajax']) || strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        exit;
    }
    redirect('auth/login.php');
}

$adminId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// Ações via AJAX
if (isset($_GET['ajax']) || strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
    header('Content-Type: application/json');

    // CSRF Check para POST
    if ($method === 'POST') {
        $headers = getallheaders();
        $csrfToken = $headers['X-CSRF-Token'] ?? ($headers['x-csrf-token'] ?? ($_POST['csrf_token'] ?? ''));
        try {
            check_csrf($csrfToken);
        } catch (Exception $e) {
            http_response_code(403);
            echo json_encode(['error' => 'Token CSRF inválido']);
            exit;
        }
    }

    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $action = $_GET['action'] ?? ($input['action'] ?? 'list');

    switch ($action) {
        case 'list':
            try {
                $statusFilter = $_GET['status'] ?? 'all';
                $priorityFilter = $_GET['priority'] ?? 'all';
                
                $sql = "SELECT st.*, u.full_name, u.email,
                               (SELECT message FROM support_ticket_messages WHERE ticket_id = st.id ORDER BY created_at DESC LIMIT 1) as last_message,
                               (SELECT created_at FROM support_ticket_messages WHERE ticket_id = st.id ORDER BY created_at DESC LIMIT 1) as last_message_at
                        FROM support_tickets st
                        JOIN users u ON st.user_id = u.id
                        WHERE 1=1";
                
                $params = [];
                if ($statusFilter !== 'all') {
                    $sql .= " AND st.status = ?";
                    $params[] = $statusFilter;
                }
                if ($priorityFilter !== 'all') {
                    $sql .= " AND st.priority = ?";
                    $params[] = $priorityFilter;
                }
                
                $sql .= " ORDER BY st.updated_at DESC";
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $tickets = $stmt->fetchAll();
                
                // Buscar contadores rápidos
                $stats = [
                    'total' => (int)$pdo->query("SELECT COUNT(*) FROM support_tickets")->fetchColumn(),
                    'open' => (int)$pdo->query("SELECT COUNT(*) FROM support_tickets WHERE status = 'open'")->fetchColumn(),
                    'replied' => (int)$pdo->query("SELECT COUNT(*) FROM support_tickets WHERE status = 'replied'")->fetchColumn(),
                    'closed' => (int)$pdo->query("SELECT COUNT(*) FROM support_tickets WHERE status = 'closed'")->fetchColumn()
                ];
                
                echo json_encode(['success' => true, 'tickets' => $tickets, 'stats' => $stats]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
            exit;

        case 'get_messages':
            $ticketId = (int)($_GET['ticket_id'] ?? 0);
            if (!$ticketId) {
                echo json_encode(['success' => false, 'error' => 'ID do ticket inválido.']);
                exit;
            }

            try {
                // Obter dados do ticket e do cliente
                $stmt = $pdo->prepare("
                    SELECT st.*, u.full_name, u.email, u.balance, u.status as user_status, u.created_at as user_created_at
                    FROM support_tickets st
                    JOIN users u ON st.user_id = u.id
                    WHERE st.id = ?
                ");
                $stmt->execute([$ticketId]);
                $ticket = $stmt->fetch();
                
                if (!$ticket) {
                    echo json_encode(['success' => false, 'error' => 'Ticket não encontrado.']);
                    exit;
                }

                // Obter histórico de mensagens
                $stmt = $pdo->prepare("SELECT * FROM support_ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC");
                $stmt->execute([$ticketId]);
                $messages = $stmt->fetchAll();

                echo json_encode(['success' => true, 'ticket' => $ticket, 'messages' => $messages]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
            exit;

        case 'reply':
            $ticketId = (int)($input['ticket_id'] ?? 0);
            $message = trim($input['message'] ?? '');
            $closeTicket = (bool)($input['close_ticket'] ?? false);
            $attachment = $input['attachment'] ?? ''; // base64

            if (!$ticketId || empty($message)) {
                echo json_encode(['success' => false, 'error' => 'Dados inválidos.']);
                exit;
            }

            // Verificar se o ticket existe
            $stmt = $pdo->prepare("SELECT user_id, subject FROM support_tickets WHERE id = ?");
            $stmt->execute([$ticketId]);
            $ticket = $stmt->fetch();
            if (!$ticket) {
                echo json_encode(['success' => false, 'error' => 'Ticket não encontrado.']);
                exit;
            }

            // Tratamento de anexo
            $attachmentUrl = null;
            if (!empty($attachment)) {
                if (preg_match('/^data:image\/(\w+);base64,/', $attachment, $typeMatches)) {
                    $imgType = strtolower($typeMatches[1]);
                    if (in_array($imgType, ['png', 'jpg', 'jpeg', 'gif', 'webp'])) {
                        $base64Data = substr($attachment, strpos($attachment, ',') + 1);
                        $decodedData = base64_decode($base64Data);
                        if ($decodedData !== false) {
                            $uploadDir = __DIR__ . '/assets/uploads/tickets/';
                            if (!is_dir($uploadDir)) {
                                mkdir($uploadDir, 0755, true);
                            }
                            $filename = 'ticket_admin_' . $adminId . '_' . uniqid() . '.' . $imgType;
                            $destFile = $uploadDir . $filename;
                            if (file_put_contents($destFile, $decodedData)) {
                                $attachmentUrl = '/assets/uploads/tickets/' . $filename;
                            }
                        }
                    }
                }
            }

            try {
                $pdo->beginTransaction();

                // Gravar a resposta do admin
                $stmt = $pdo->prepare("INSERT INTO support_ticket_messages (ticket_id, sender_id, sender_type, message, attachment_url) VALUES (?, ?, 'admin', ?, ?)");
                $stmt->execute([$ticketId, $adminId, $message, $attachmentUrl]);

                // Atualizar o status do ticket
                $newStatus = $closeTicket ? 'closed' : 'replied';
                $stmt = $pdo->prepare("UPDATE support_tickets SET status = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$newStatus, $ticketId]);

                // Criar notificação para o usuário do chamado
                $stmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)");
                $notifTitle = $closeTicket ? "Ticket Encerrado" : "Ticket Respondido";
                $notifMsg = $closeTicket 
                    ? "Seu ticket de suporte sobre '" . $ticket['subject'] . "' foi resolvido e encerrado."
                    : "Você tem uma nova resposta no ticket '" . $ticket['subject'] . "'.";
                $stmt->execute([$ticket['user_id'], $notifTitle, $notifMsg, $closeTicket ? 'success' : 'info']);

                $pdo->commit();
                echo json_encode(['success' => true, 'message' => 'Resposta enviada com sucesso!']);
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
            exit;

        case 'close':
            $ticketId = (int)($input['ticket_id'] ?? 0);
            if (!$ticketId) {
                echo json_encode(['success' => false, 'error' => 'ID do ticket inválido.']);
                exit;
            }

            try {
                $pdo->beginTransaction();
                
                $stmt = $pdo->prepare("UPDATE support_tickets SET status = 'closed', updated_at = NOW() WHERE id = ?");
                $stmt->execute([$ticketId]);

                // Obter id do usuário do ticket
                $stmt = $pdo->prepare("SELECT user_id, subject FROM support_tickets WHERE id = ?");
                $stmt->execute([$ticketId]);
                $ticket = $stmt->fetch();

                if ($ticket) {
                    $stmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Ticket Encerrado', ?, 'success')");
                    $stmt->execute([$ticket['user_id'], "Seu ticket '" . $ticket['subject'] . "' foi encerrado pelo suporte."]);
                }

                $pdo->commit();
                echo json_encode(['success' => true, 'message' => 'Ticket encerrado com sucesso!']);
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
            exit;

        default:
            echo json_encode(['error' => 'Ação inválida']);
            exit;
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Painel de Atendimento de Tickets - DiretoPay</title>
    <link rel="icon" type="image/png" href="logo_diretopay.png">
    <link rel="stylesheet" href="style.css?v=128.0">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <meta name="csrf-token" content="<?php echo csrf_token(); ?>">
    <style>
        /* Estilos Split-Screen Premium */
        .ticket-layout {
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 1.5rem;
            height: calc(100vh - 210px);
            margin-top: 1rem;
        }
        @media (max-width: 1200px) {
            .ticket-layout {
                grid-template-columns: 300px 1fr;
            }
        }
        @media (max-width: 992px) {
            .ticket-layout {
                grid-template-columns: 1fr;
                height: auto;
            }
        }

        .stats-summary-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        @media (max-width: 768px) {
            .stats-summary-row {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        .stat-badge-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--r-sm);
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            backdrop-filter: var(--glass-blur);
        }
        .stat-badge-card h4 {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-3);
            margin-bottom: 0.25rem;
        }
        .stat-badge-card .value {
            font-size: 1.6rem;
            font-weight: 800;
            color: white;
        }
        .stat-badge-card .icon {
            font-size: 1.5rem;
            opacity: 0.3;
        }

        .ticket-list-panel {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--r-md);
            padding: 1.2rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            height: 100%;
            overflow-y: auto;
            backdrop-filter: var(--glass-blur);
        }

        /* Split layout interior do atendimento */
        .ticket-detail-panel {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--r-md);
            display: grid;
            grid-template-columns: 1fr 280px;
            overflow: hidden;
            height: 100%;
            backdrop-filter: var(--glass-blur);
        }
        @media (max-width: 1200px) {
            .ticket-detail-panel {
                grid-template-columns: 1fr;
            }
            .chat-client-info-sidebar {
                display: none !important;
            }
        }

        .chat-main-area {
            display: flex;
            flex-direction: column;
            height: 100%;
            border-right: 1px solid var(--border);
        }

        .chat-client-info-sidebar {
            padding: 1.5rem;
            background: rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            overflow-y: auto;
        }

        .ticket-item {
            border: 1px solid var(--border);
            background: rgba(255, 255, 255, 0.01);
            border-radius: var(--r-sm);
            padding: 1rem;
            cursor: pointer;
            transition: all 0.3s var(--ease);
            position: relative;
        }
        .ticket-item:hover {
            border-color: var(--border-h);
            background: rgba(255, 255, 255, 0.03);
            transform: translateY(-2px);
        }
        .ticket-item.active {
            border-color: var(--primary);
            background: linear-gradient(135deg, rgba(30, 164, 101, 0.08), transparent);
        }
        .ticket-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 40px;
            background: var(--primary);
            border-radius: 0 4px 4px 0;
        }

        /* Nível de prioridade indicativo na lateral do ticket list */
        .priority-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
        }
        .priority-high { background: var(--red); box-shadow: 0 0 8px var(--red); }
        .priority-medium { background: var(--amber); }
        .priority-low { background: var(--blue); }

        .badge-status {
            font-size: 0.7rem;
            padding: 0.25rem 0.6rem;
            border-radius: 100px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .badge-open {
            background: rgba(245, 158, 11, 0.15);
            color: var(--amber);
            border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .badge-replied {
            background: rgba(59, 130, 246, 0.15);
            color: var(--blue);
            border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .badge-closed {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-3);
            border: 1px solid var(--border);
        }

        /* Detalhe do Chat */
        .chat-header {
            padding: 1.2rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.01);
        }
        .chat-messages {
            flex: 1;
            padding: 1.5rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            background: rgba(0, 0, 0, 0.15);
        }
        .chat-bubble {
            max-width: 70%;
            padding: 1rem;
            border-radius: var(--r-sm);
            line-height: 1.5;
            position: relative;
            animation: fadeInUp 0.3s var(--ease);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .chat-bubble.admin {
            align-self: flex-end;
            background: linear-gradient(135deg, var(--primary), #126b41);
            color: #ffffff;
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 15px rgba(30, 164, 101, 0.2);
        }
        .chat-bubble.user {
            align-self: flex-start;
            background: rgba(255, 255, 255, 0.03);
            color: var(--text);
            border: 1px solid var(--border);
            border-bottom-left-radius: 4px;
        }
        .chat-time {
            font-size: 0.65rem;
            opacity: 0.6;
            align-self: flex-end;
        }
        .chat-bubble.user .chat-time {
            color: var(--text-3);
        }

        .chat-input-area {
            padding: 1rem 1.2rem;
            border-top: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            background: rgba(255, 255, 255, 0.01);
        }
        .chat-input-row {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            width: 100%;
        }
        .chat-input-row input[type="text"] {
            flex: 1;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            color: white;
            transition: all 0.3s var(--ease);
        }
        .chat-input-row input[type="text"]:focus {
            border-color: var(--primary);
            background: rgba(255, 255, 255, 0.05);
            outline: none;
        }
        
        .chat-btn-send {
            background: var(--primary);
            border: none;
            color: white;
            padding: 0.75rem 1.2rem;
            border-radius: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s var(--ease);
        }
        .chat-btn-send:hover {
            background: var(--primary-h);
            box-shadow: 0 0 15px var(--primary-glow);
        }

        .chat-image {
            max-width: 100%;
            max-height: 250px;
            border-radius: 8px;
            margin-top: 5px;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Filter Area styling */
        .filter-panel {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--r-sm);
            padding: 0.8rem 1.2rem;
            display: flex;
            gap: 1rem;
            align-items: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            backdrop-filter: var(--glass-blur);
        }
        .filter-select {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 0.4rem 0.8rem;
            color: white;
            font-size: 0.85rem;
        }
        .filter-select:focus {
            border-color: var(--primary);
            outline: none;
        }

        /* Zoom modal */
        .zoom-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s ease;
        }
        .zoom-modal.active {
            opacity: 1;
            pointer-events: all;
        }
        .zoom-modal img {
            max-width: 90vw;
            max-height: 90vh;
            border-radius: 8px;
            box-shadow: var(--shadow-xl);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Attachment Preview */
        .attachment-preview-container {
            display: none;
            position: relative;
            margin-top: 5px;
            padding: 5px;
            border: 1px dashed var(--border-h);
            border-radius: 8px;
            width: fit-content;
        }
        .attachment-preview-container img {
            max-height: 80px;
            border-radius: 6px;
        }
        .attachment-remove-btn {
            position: absolute;
            top: -5px;
            right: -5px;
            background: var(--red);
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.6rem;
            cursor: pointer;
            border: none;
        }
        .attachment-icon-btn {
            background: none;
            border: none;
            color: var(--text-2);
            font-size: 1.2rem;
            cursor: pointer;
            transition: color 0.3s;
        }
        .attachment-icon-btn:hover {
            color: white;
        }

        /* Respostas Rápidas */
        .canned-responses-trigger {
            font-size: 0.8rem;
            color: var(--primary);
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            font-weight: 600;
        }
        .canned-responses-trigger:hover {
            text-decoration: underline;
        }
        .canned-dropdown {
            position: absolute;
            bottom: 60px;
            left: 20px;
            background: #0f0f12;
            border: 1px solid var(--border-h);
            border-radius: 12px;
            width: 320px;
            max-height: 250px;
            overflow-y: auto;
            z-index: 100;
            display: none;
            box-shadow: var(--shadow-xl);
            padding: 8px;
        }
        .canned-item {
            padding: 10px;
            border-radius: 8px;
            cursor: pointer;
            color: var(--text-2);
            font-size: 0.82rem;
            line-height: 1.4;
            transition: background 0.2s, color 0.2s;
        }
        .canned-item:hover {
            background: rgba(30,164,101,0.1);
            color: white;
        }
    </style>
</head>
<body>
    <?php include 'includes/sidebar.php'; ?>

    <main class="main-content">
        <header class="top-header" style="margin-bottom: 1.5rem;">
            <div>
                <h1>Gestão de Chamados (Suporte)</h1>
                <p>Responda dúvidas de usuários e solucione incidentes técnicos/financeiros</p>
            </div>
        </header>

        <!-- Cards Rápidos de Status -->
        <div class="stats-summary-row">
            <div class="stat-badge-card">
                <div>
                    <h4>Total Recebidos</h4>
                    <span class="value" id="stats-total">0</span>
                </div>
                <div class="icon" style="color:var(--text-3);"><i class="fas fa-ticket-alt"></i></div>
            </div>
            <div class="stat-badge-card" style="border-bottom: 2px solid var(--amber);">
                <div>
                    <h4>Aguardando Suporte</h4>
                    <span class="value" id="stats-open" style="color:var(--amber);">0</span>
                </div>
                <div class="icon" style="color:var(--amber);"><i class="fas fa-clock"></i></div>
            </div>
            <div class="stat-badge-card" style="border-bottom: 2px solid var(--blue);">
                <div>
                    <h4>Respondidos</h4>
                    <span class="value" id="stats-replied" style="color:var(--blue);">0</span>
                </div>
                <div class="icon" style="color:var(--blue);"><i class="fas fa-reply"></i></div>
            </div>
            <div class="stat-badge-card" style="border-bottom: 2px solid var(--green);">
                <div>
                    <h4>Encerrados</h4>
                    <span class="value" id="stats-closed" style="color:var(--green);">0</span>
                </div>
                <div class="icon" style="color:var(--green);"><i class="fas fa-check-circle"></i></div>
            </div>
        </div>

        <!-- Filtros Rápidos -->
        <div class="filter-panel">
            <div style="display:flex; align-items:center; gap:0.5rem;">
                <label style="font-size:0.85rem; color:var(--text-3); font-weight:600;">Status:</label>
                <select id="filter-status" class="filter-select" onchange="loadAdminTickets()">
                    <option value="all">Todos os Status</option>
                    <option value="open" selected>Aberto (Pendente)</option>
                    <option value="replied">Respondido</option>
                    <option value="closed">Encerrados</option>
                </select>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
                <label style="font-size:0.85rem; color:var(--text-3); font-weight:600;">Prioridade:</label>
                <select id="filter-priority" class="filter-select" onchange="loadAdminTickets()">
                    <option value="all">Todas as Prioridades</option>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                </select>
            </div>
            <button class="filter-select" style="margin-left:auto; background:rgba(255,255,255,0.05); cursor:pointer;" onclick="loadAdminTickets()">
                <i class="fas fa-sync-alt"></i> Atualizar Painel
            </button>
        </div>

        <div class="ticket-layout">
            <!-- Coluna Esquerda: Listagem Geral de Tickets -->
            <div class="ticket-list-panel" id="admin-ticket-list">
                <div style="text-align: center; padding: 2rem; color: var(--text-3);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>Buscando chamados...</p>
                </div>
            </div>

            <!-- Central/Direita: Atendimento Split-Screen -->
            <div class="ticket-detail-panel" id="admin-ticket-detail-container" style="display: none;">
                <!-- Área do Chat -->
                <div class="chat-main-area">
                    <div class="chat-header">
                        <div>
                            <h3 id="chat-subject" style="margin-bottom: 0.2rem; font-weight: 700;">Assunto do Chamado</h3>
                            <p style="font-size: 0.8rem; color: var(--text-3);">
                                Categoria: <strong id="chat-category" style="color:var(--text-2);">Dúvidas</strong> | 
                                ID do Ticket: <strong id="chat-ticket-id" style="color:var(--text-2);">0</strong>
                            </p>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <span id="chat-status" class="badge-status badge-open">Aberto</span>
                            <button class="badge-status" id="close-ticket-btn" onclick="closeTicket()" style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.2); color:var(--red); font-weight:600; cursor:pointer;">Encerrar Chamado</button>
                        </div>
                    </div>

                    <div class="chat-messages" id="chat-messages-container">
                        <!-- Mensagens inseridas via Javascript -->
                    </div>

                    <!-- Caixa de Envio de Resposta -->
                    <div class="chat-input-area" id="chat-input-area-panel" style="position: relative;">
                        <!-- Dropdown de Respostas Rápidas -->
                        <div class="canned-dropdown" id="canned-dropdown-menu">
                            <div class="canned-item" onclick="applyCanned('Olá! Tudo bem? Verifiquei que seu saque já foi processado e enviado para sua chave Pix. O comprovante bancário deve estar disponível em instantes.')">💰 Saque processado e enviado</div>
                            <div class="canned-item" onclick="applyCanned('Olá! Identificamos que a chave Pix cadastrada em seu perfil está incorreta ou inativa. Por favor, acesse Configurações -> Dados Financeiros, atualize a chave e nos avise aqui para refazermos o pagamento.')">❌ Chave Pix inválida/erro</div>
                            <div class="canned-item" onclick="applyCanned('Olá! Para analisarmos esse caso de transação pendente, por favor, envie o print do comprovante de pagamento Pix emitido pelo banco do cliente.')">📸 Solicitar comprovante Pix</div>
                            <div class="canned-item" onclick="applyCanned('Olá! Seu chamado técnico foi encaminhado para nossa equipe de engenharia para análise de logs. Assim que resolvido, entraremos em contato. Obrigado pela paciência!')">🔧 Encaminhar para engenharia</div>
                            <div class="canned-item" onclick="applyCanned('Olá! Conforme solicitado, realizamos os devidos ajustes e correções em sua conta. Teste novamente e nos confirme se deu certo.')">✅ Problema resolvido/Ajustado</div>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom: 5px;">
                            <button class="canned-responses-trigger" onclick="toggleCannedDropdown()">
                                <i class="far fa-comment-dots"></i> Respostas Rápidas (Canned)
                            </button>
                            <label style="font-size:0.75rem; color:var(--text-3); display:flex; align-items:center; gap:5px; cursor:pointer;">
                                <input type="checkbox" id="reply-and-close-check"> Responder e fechar chamado
                            </label>
                        </div>

                        <!-- Preview de Anexo -->
                        <div class="attachment-preview-container" id="chat-attachment-preview">
                            <img id="chat-attachment-img" src="" alt="preview">
                            <button class="attachment-remove-btn" onclick="removeAttachment()"><i class="fas fa-times"></i></button>
                        </div>

                        <div class="chat-input-row">
                            <input type="file" id="attachment-file" style="display: none;" accept="image/*" onchange="previewAttachment(event)">
                            <button class="attachment-icon-btn" onclick="document.getElementById('attachment-file').click()" title="Anexar Comprovante / Print">
                                <i class="far fa-image"></i>
                            </button>
                            <input type="text" id="chat-reply-input" placeholder="Escreva a resposta para o cliente..." onkeydown="handleReplySubmit(event)">
                            <button class="chat-btn-send" onclick="sendReply()">
                                Enviar Resposta <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Barra Lateral Direita: Informações do Cliente -->
                <div class="chat-client-info-sidebar">
                    <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-3); border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">Ficha do Comprador</h4>
                    
                    <div style="display:flex; flex-direction:column; gap:0.25rem;">
                        <span style="font-size:0.75rem; color:var(--text-3);">Nome do Cliente:</span>
                        <strong style="color:white; font-size:0.92rem;" id="client-name">-</strong>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0.25rem;">
                        <span style="font-size:0.75rem; color:var(--text-3);">E-mail do Cliente:</span>
                        <strong style="color:white; font-size:0.85rem; word-break:break-all;" id="client-email">-</strong>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0.25rem;">
                        <span style="font-size:0.75rem; color:var(--text-3);">Saldo Virtual:</span>
                        <strong style="color:var(--green); font-size:1.1rem;" id="client-balance">R$ 0,00</strong>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0.25rem;">
                        <span style="font-size:0.75rem; color:var(--text-3);">Status do Cadastro:</span>
                        <span id="client-status" class="badge-status badge-closed" style="width:fit-content; text-align:center;">Pendente</span>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:0.25rem;">
                        <span style="font-size:0.75rem; color:var(--text-3);">Cliente desde:</span>
                        <span style="font-size:0.8rem; color:var(--text-2);" id="client-date">-</span>
                    </div>
                </div>
            </div>

            <!-- Placeholder quando nenhum ticket está selecionado -->
            <div class="ticket-detail-panel" id="admin-ticket-detail-placeholder" style="display: flex; align-items: center; justify-content: center; text-align: center; padding: 4rem; color: var(--text-3); grid-template-columns: 1fr;">
                <div>
                    <i class="fas fa-headset" style="font-size: 4rem; color: rgba(255,255,255,0.05); margin-bottom: 1.5rem;"></i>
                    <h3 style="color: var(--text-2); margin-bottom: 0.5rem;">Fila de Atendimento</h3>
                    <p style="max-width: 320px; font-size: 0.9rem; margin: 0 auto;">Escolha um chamado pendente na fila ao lado para iniciar a conversa com o cliente.</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal Zoom Imagem -->
    <div class="zoom-modal" id="image-zoom-modal" onclick="closeImageZoom()">
        <img id="zoomed-image" src="" alt="zoom">
    </div>

    </div> <!-- Fecha app-container do sidebar.php -->

    <script src="script.js?v=124.0"></script>
    <script>
        const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        let activeTicketId = null;
        let attachmentBase64 = null;

        document.addEventListener('DOMContentLoaded', () => {
            loadAdminTickets();
            
            // Fechar dropdown de canned response quando clica fora
            document.addEventListener('click', (e) => {
                const dropdown = document.getElementById('canned-dropdown-menu');
                const trigger = document.querySelector('.canned-responses-trigger');
                if (dropdown && dropdown.style.display === 'block' && !dropdown.contains(e.target) && !trigger.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });
        });

        // Carregar lista de tickets
        function loadAdminTickets() {
            const status = document.getElementById('filter-status').value;
            const priority = document.getElementById('filter-priority').value;

            fetch(`admin_tickets.php?ajax=1&action=list&status=${status}&priority=${priority}`)
                .then(res => res.json())
                .then(data => {
                    const listContainer = document.getElementById('admin-ticket-list');
                    listContainer.innerHTML = '';

                    if (!data.success) {
                        listContainer.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-3);">Erro ao carregar fila.</div>`;
                        return;
                    }

                    // Atualizar contadores
                    document.getElementById('stats-total').textContent = data.stats.total;
                    document.getElementById('stats-open').textContent = data.stats.open;
                    document.getElementById('stats-replied').textContent = data.stats.replied;
                    document.getElementById('stats-closed').textContent = data.stats.closed;

                    if (data.tickets.length === 0) {
                        listContainer.innerHTML = `
                            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-3);">
                                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.15;"></i>
                                <h3>Fila limpa!</h3>
                                <p style="font-size: 0.8rem; margin-top: 5px;">Nenhum chamado de suporte atende a estes critérios.</p>
                            </div>
                        `;
                        return;
                    }

                    data.tickets.forEach(ticket => {
                        const dateObj = new Date(ticket.created_at);
                        const dateFormatted = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                        
                        let badgeClass = 'badge-open';
                        let statusText = 'Aberto';
                        if (ticket.status === 'replied') {
                            badgeClass = 'badge-replied';
                            statusText = 'Respondido';
                        } else if (ticket.status === 'closed') {
                            badgeClass = 'badge-closed';
                            statusText = 'Fechado';
                        }

                        let priorityClass = 'priority-medium';
                        if (ticket.priority === 'high') priorityClass = 'priority-high';
                        if (ticket.priority === 'low') priorityClass = 'priority-low';

                        const itemHtml = `
                            <div class="ticket-item ${activeTicketId == ticket.id ? 'active' : ''}" onclick="selectTicket(${ticket.id})">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                                    <span class="badge-status ${badgeClass}">${statusText}</span>
                                    <span style="font-size:0.7rem; color:var(--text-3);">${dateFormatted}</span>
                                </div>
                                <h4 style="font-size:0.95rem; font-weight:600; color:white; margin-bottom:0.25rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(ticket.subject)}">
                                    <span class="priority-indicator ${priorityClass}"></span>
                                    ${escapeHtml(ticket.subject)}
                                </h4>
                                <p style="font-size:0.8rem; color:var(--text-2); font-weight: 500; margin-bottom: 2px;">
                                    Cliente: ${escapeHtml(ticket.full_name)}
                                </p>
                                <p style="font-size:0.78rem; color:var(--text-3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                    ${escapeHtml(ticket.last_message || 'Nenhuma mensagem')}
                                </p>
                            </div>
                        `;
                        listContainer.insertAdjacentHTML('beforeend', itemHtml);
                    });
                })
                .catch(err => {
                    console.error(err);
                    document.getElementById('admin-ticket-list').innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-3);">Erro de rede.</div>`;
                });
        }

        // Abre ticket para resposta do Admin
        function selectTicket(id) {
            activeTicketId = id;
            
            document.querySelectorAll('.ticket-item').forEach(el => el.classList.remove('active'));
            document.getElementById('admin-ticket-detail-placeholder').style.display = 'none';
            document.getElementById('admin-ticket-detail-container').style.display = 'grid';

            fetch(`admin_tickets.php?ajax=1&action=get_messages&ticket_id=${id}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.success) {
                        alert(data.error);
                        return;
                    }

                    // Preencher informações gerais do ticket
                    document.getElementById('chat-subject').textContent = data.ticket.subject;
                    document.getElementById('chat-category').textContent = data.ticket.category;
                    document.getElementById('chat-ticket-id').textContent = data.ticket.id;
                    
                    const statusEl = document.getElementById('chat-status');
                    statusEl.className = 'badge-status';
                    if (data.ticket.status === 'open') {
                        statusEl.classList.add('badge-open');
                        statusEl.textContent = 'Pendente';
                        document.getElementById('close-ticket-btn').style.display = 'inline-block';
                        document.getElementById('chat-input-area-panel').style.display = 'block';
                    } else if (data.ticket.status === 'replied') {
                        statusEl.classList.add('badge-replied');
                        statusEl.textContent = 'Respondido';
                        document.getElementById('close-ticket-btn').style.display = 'inline-block';
                        document.getElementById('chat-input-area-panel').style.display = 'block';
                    } else {
                        statusEl.classList.add('badge-closed');
                        statusEl.textContent = 'Fechado';
                        document.getElementById('close-ticket-btn').style.display = 'none';
                        document.getElementById('chat-input-area-panel').style.display = 'none';
                    }

                    // Preencher dados do cliente
                    document.getElementById('client-name').textContent = data.ticket.full_name;
                    document.getElementById('client-email').textContent = data.ticket.email;
                    document.getElementById('client-balance').textContent = 'R$ ' + parseFloat(data.ticket.balance).toLocaleString('pt-BR', {minimumFractionDigits: 2});
                    
                    const statusClientEl = document.getElementById('client-status');
                    statusClientEl.className = 'badge-status';
                    if (data.ticket.user_status === 'approved') {
                        statusClientEl.classList.add('badge-open');
                        statusClientEl.style.background = 'rgba(34, 197, 94, 0.15)';
                        statusClientEl.style.color = 'var(--green)';
                        statusClientEl.textContent = 'Aprovado';
                    } else if (data.ticket.user_status === 'blocked') {
                        statusClientEl.classList.add('badge-closed');
                        statusClientEl.style.background = 'rgba(239, 68, 68, 0.15)';
                        statusClientEl.style.color = 'var(--red)';
                        statusClientEl.textContent = 'Bloqueado';
                    } else {
                        statusClientEl.classList.add('badge-open');
                        statusClientEl.textContent = 'Pendente';
                    }

                    const regDate = new Date(data.ticket.user_created_at);
                    document.getElementById('client-date').textContent = regDate.toLocaleDateString('pt-BR');

                    // Mensagens
                    const messagesContainer = document.getElementById('chat-messages-container');
                    messagesContainer.innerHTML = '';

                    data.messages.forEach(msg => {
                        const date = new Date(msg.created_at);
                        const timeStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                        
                        let attachmentHtml = '';
                        if (msg.attachment_url) {
                            attachmentHtml = `<img src="${msg.attachment_url}" class="chat-image" onclick="zoomImage('${msg.attachment_url}')" alt="anexo">`;
                        }

                        const senderLabel = msg.sender_type === 'admin' ? '<strong style="font-size:0.75rem; color:#1ea465; margin-bottom:2px;">Você (Atendente)</strong>' : '<strong style="font-size:0.75rem; color:#a1a1aa; margin-bottom:2px;">Cliente</strong>';

                        const bubbleHtml = `
                            <div class="chat-bubble ${msg.sender_type}">
                                ${senderLabel}
                                <span style="word-break: break-word;">${escapeHtml(msg.message)}</span>
                                ${attachmentHtml}
                                <span class="chat-time">${timeStr}</span>
                            </div>
                        `;
                        messagesContainer.insertAdjacentHTML('beforeend', bubbleHtml);
                    });

                    setTimeout(() => {
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }, 50);

                    // Re-renderizar seleção ativa na listagem lateral
                    loadAdminTickets();
                });
        }

        // Resposta do Administrador
        function sendReply() {
            const inputEl = document.getElementById('chat-reply-input');
            const message = inputEl.value.trim();
            const closeChecked = document.getElementById('reply-and-close-check').checked;

            if (!message && !attachmentBase64) return;

            const payload = {
                action: 'reply',
                ticket_id: activeTicketId,
                message: message,
                close_ticket: closeChecked,
                attachment: attachmentBase64,
                csrf_token: CSRF_TOKEN
            };

            fetch('admin_tickets.php?ajax=1&action=reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': CSRF_TOKEN
                },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    alert(data.error);
                    return;
                }

                inputEl.value = '';
                document.getElementById('reply-and-close-check').checked = false;
                removeAttachment();
                selectTicket(activeTicketId);
            });
        }

        function handleReplySubmit(e) {
            if (e.key === 'Enter') {
                sendReply();
            }
        }

        function closeTicket() {
            if (!confirm('Deseja realmente encerrar este chamado?')) return;

            fetch('admin_tickets.php?ajax=1&action=close', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': CSRF_TOKEN
                },
                body: JSON.stringify({ ticket_id: activeTicketId, csrf_token: CSRF_TOKEN })
            })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    alert(data.error);
                    return;
                }
                selectTicket(activeTicketId);
            });
        }

        // Canned responses (Respostas Rápidas)
        function toggleCannedDropdown() {
            const menu = document.getElementById('canned-dropdown-menu');
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }

        function applyCanned(text) {
            document.getElementById('chat-reply-input').value = text;
            document.getElementById('canned-dropdown-menu').style.display = 'none';
            document.getElementById('chat-reply-input').focus();
        }

        // Anexos
        function previewAttachment(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function() {
                attachmentBase64 = reader.result;
                const previewContainer = document.getElementById('chat-attachment-preview');
                const imgEl = document.getElementById('chat-attachment-img');
                imgEl.src = reader.result;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }

        function removeAttachment() {
            attachmentBase64 = null;
            document.getElementById('attachment-file').value = '';
            document.getElementById('chat-attachment-preview').style.display = 'none';
        }

        // Zoom imagem
        function zoomImage(url) {
            document.getElementById('zoomed-image').src = url;
            document.getElementById('image-zoom-modal').classList.add('active');
        }
        
        function closeImageZoom() {
            document.getElementById('image-zoom-modal').classList.remove('active');
        }

        function escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, function(m) { return map[m]; });
        }
    </script>
</body>
</html>
