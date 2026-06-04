<?php
require_once 'includes/db.php';

// CORS & Segurança
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isLoggedIn()) {
    if (isset($_GET['ajax']) || strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
        http_response_code(401);
        echo json_encode(['error' => 'Não autorizado']);
        exit;
    }
    redirect('auth/login.php');
}

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// Verificar ações via AJAX (POST ou GET com flag ajax)
if (isset($_GET['ajax']) || strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
    header('Content-Type: application/json');
    
    // CSRF Check para POST/DELETE
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
                $stmt = $pdo->prepare("
                    SELECT st.*, 
                           (SELECT message FROM support_ticket_messages WHERE ticket_id = st.id ORDER BY created_at DESC LIMIT 1) as last_message,
                           (SELECT created_at FROM support_ticket_messages WHERE ticket_id = st.id ORDER BY created_at DESC LIMIT 1) as last_message_at
                    FROM support_tickets st
                    WHERE st.user_id = ?
                    ORDER BY st.updated_at DESC
                ");
                $stmt->execute([$userId]);
                $tickets = $stmt->fetchAll();
                echo json_encode(['success' => true, 'tickets' => $tickets]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
            exit;

        case 'create':
            $subject = trim($input['subject'] ?? '');
            $category = trim($input['category'] ?? 'Dúvidas');
            $priority = trim($input['priority'] ?? 'medium');
            $message = trim($input['message'] ?? '');
            $attachment = $input['attachment'] ?? ''; // base64

            if (empty($subject) || empty($message)) {
                echo json_encode(['success' => false, 'error' => 'Assunto e Mensagem são obrigatórios.']);
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
                            $filename = 'ticket_' . $userId . '_' . uniqid() . '.' . $imgType;
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

                // Criar o ticket
                $stmt = $pdo->prepare("INSERT INTO support_tickets (user_id, subject, category, priority, status) VALUES (?, ?, ?, ?, 'open')");
                $stmt->execute([$userId, $subject, $category, $priority]);
                $ticketId = $pdo->lastInsertId();

                // Criar a primeira mensagem
                $stmt = $pdo->prepare("INSERT INTO support_ticket_messages (ticket_id, sender_id, sender_type, message, attachment_url) VALUES (?, ?, 'user', ?, ?)");
                $stmt->execute([$ticketId, $userId, $message, $attachmentUrl]);

                // Adicionar notificação interna para administrador
                $stmt = $pdo->prepare("INSERT INTO notifications (user_id, title, message, type) SELECT id, 'Novo Ticket de Suporte', ?, 'info' FROM users WHERE is_admin = 1");
                $stmt->execute(["O usuário " . $_SESSION['full_name'] . " abriu um novo ticket: " . $subject]);

                $pdo->commit();
                echo json_encode(['success' => true, 'ticket_id' => $ticketId, 'message' => 'Ticket de suporte aberto com sucesso!']);
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
            exit;

        case 'send_message':
            $ticketId = (int)($input['ticket_id'] ?? 0);
            $message = trim($input['message'] ?? '');
            $attachment = $input['attachment'] ?? ''; // base64

            if (!$ticketId || empty($message)) {
                echo json_encode(['success' => false, 'error' => 'Dados inválidos.']);
                exit;
            }

            // Validar propriedade do ticket
            $stmt = $pdo->prepare("SELECT id, status FROM support_tickets WHERE id = ? AND user_id = ?");
            $stmt->execute([$ticketId, $userId]);
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
                            $filename = 'ticket_' . $userId . '_' . uniqid() . '.' . $imgType;
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

                // Gravar a mensagem
                $stmt = $pdo->prepare("INSERT INTO support_ticket_messages (ticket_id, sender_id, sender_type, message, attachment_url) VALUES (?, ?, 'user', ?, ?)");
                $stmt->execute([$ticketId, $userId, $message, $attachmentUrl]);

                // Se o ticket estava fechado, ele é reaberto como 'open'. Senão mantém 'open'.
                $newStatus = 'open';
                $stmt = $pdo->prepare("UPDATE support_tickets SET status = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$newStatus, $ticketId]);

                $pdo->commit();
                echo json_encode([
                    'success' => true, 
                    'message' => 'Mensagem enviada com sucesso!', 
                    'data' => [
                        'sender_type' => 'user',
                        'message' => htmlspecialchars($message),
                        'attachment_url' => $attachmentUrl,
                        'created_at' => date('Y-m-d H:i:s')
                    ]
                ]);
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
                $stmt = $pdo->prepare("UPDATE support_tickets SET status = 'closed', updated_at = NOW() WHERE id = ? AND user_id = ?");
                $stmt->execute([$ticketId, $userId]);
                echo json_encode(['success' => true, 'message' => 'Ticket encerrado com sucesso!']);
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

            // Validar propriedade do ticket
            $stmt = $pdo->prepare("SELECT * FROM support_tickets WHERE id = ? AND user_id = ?");
            $stmt->execute([$ticketId, $userId]);
            $ticket = $stmt->fetch();
            if (!$ticket) {
                echo json_encode(['success' => false, 'error' => 'Ticket não encontrado ou não pertence a você.']);
                exit;
            }

            try {
                $stmt = $pdo->prepare("SELECT * FROM support_ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC");
                $stmt->execute([$ticketId]);
                $messages = $stmt->fetchAll();
                echo json_encode(['success' => true, 'ticket' => $ticket, 'messages' => $messages]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
            exit;

        default:
            echo json_encode(['error' => 'Ação inválida']);
            exit;
    }
}

// Renderização HTML da Página de Tickets
$userStmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$userStmt->execute([$userId]);
$user = $userStmt->fetch();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Tickets de Suporte - DiretoPay</title>
    <link rel="icon" type="image/png" href="logo_diretopay.png">
    <link rel="stylesheet" href="style.css?v=128.0">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <meta name="csrf-token" content="<?php echo csrf_token(); ?>">
    <style>
        /* Estilos Modernos Adicionais para Tickets (Luxury Minimalist Theme) */
        .ticket-layout {
            display: grid;
            grid-template-columns: 340px 1fr;
            gap: 1.5rem;
            height: calc(100vh - 160px);
            margin-top: 1rem;
        }
        @media (max-width: 992px) {
            .ticket-layout {
                grid-template-columns: 1fr;
                height: auto;
            }
        }
        
        .ticket-list-panel {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--r-md);
            padding: 1.2rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            max-height: 100%;
            overflow-y: auto;
            backdrop-filter: var(--glass-blur);
        }

        .ticket-detail-panel {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--r-md);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            height: 100%;
            backdrop-filter: var(--glass-blur);
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
        .chat-bubble.user {
            align-self: flex-end;
            background: linear-gradient(135deg, var(--primary), #126b41);
            color: #ffffff;
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 15px rgba(30, 164, 101, 0.2);
        }
        .chat-bubble.admin {
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
        .chat-bubble.admin .chat-time {
            color: var(--text-3);
        }

        .chat-input-area {
            padding: 1rem 1.2rem;
            border-top: 1px solid var(--border);
            display: flex;
            gap: 0.75rem;
            align-items: center;
            background: rgba(255, 255, 255, 0.01);
        }
        .chat-input-area input[type="text"] {
            flex: 1;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            color: white;
            transition: all 0.3s var(--ease);
        }
        .chat-input-area input[type="text"]:focus {
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
            transform: translateY(-1px);
        }

        /* Modal styling */
        .modal {
            position: fixed;
            inset: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s var(--ease);
            padding: 1rem;
        }
        .modal.active {
            opacity: 1;
            pointer-events: all;
        }
        .modal-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(8px);
        }
        .modal-container {
            background: #0f0f12;
            border: 1px solid var(--border-h);
            border-radius: var(--r-md);
            width: 100%;
            max-width: 550px;
            position: relative;
            z-index: 10;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
            animation: scaleUp 0.3s var(--spring);
        }
        @keyframes scaleUp {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .modal-header {
            padding: 1.2rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-body {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .modal-footer {
            padding: 1.2rem;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }
        .form-group label {
            font-size: 0.85rem;
            color: var(--text-2);
            font-weight: 500;
        }
        .form-control {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 0.75rem;
            color: white;
        }
        .form-control:focus {
            border-color: var(--primary);
            outline: none;
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
        .chat-image {
            max-width: 100%;
            max-height: 250px;
            border-radius: 8px;
            margin-top: 5px;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body>
    <?php include 'includes/sidebar.php'; ?>

    <main class="main-content">
        <header class="top-header">
            <div>
                <h1>Meus Tickets de Suporte</h1>
                <p>Abra chamados para suporte técnico, financeiro ou dúvidas gerais</p>
            </div>
            <button class="btn btn-primary" onclick="openNewTicketModal()" style="display:flex; align-items:center; gap:0.5rem; border-radius:12px; background:var(--primary); padding:0.6rem 1.2rem; border:none; color:white; font-weight:600;">
                <i class="fas fa-plus"></i> Novo Ticket
            </button>
        </header>

        <div class="ticket-layout">
            <!-- Lateral Esquerda: Lista de Tickets -->
            <div class="ticket-list-panel" id="ticket-list">
                <div style="text-align: center; padding: 2rem; color: var(--text-3);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <p>Carregando chamados...</p>
                </div>
            </div>

            <!-- Central/Direita: Painel de Atendimento (Chat) -->
            <div class="ticket-detail-panel" id="ticket-detail-container" style="display: none;">
                <div class="chat-header">
                    <div>
                        <h3 id="chat-subject" style="margin-bottom: 0.2rem; font-weight: 700;">Assunto do Ticket</h3>
                        <p style="font-size: 0.8rem; color: var(--text-3);">
                            Categoria: <strong id="chat-category" style="color:var(--text-2);">Técnico</strong> | 
                            Prioridade: <strong id="chat-priority" style="color:var(--text-2);">Média</strong>
                        </p>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span id="chat-status" class="badge-status badge-open">Aberto</span>
                        <button class="badge-status" id="close-ticket-btn" onclick="closeCurrentTicket()" style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.2); color:var(--red); font-weight:600; cursor:pointer;">Encerrar Ticket</button>
                    </div>
                </div>
                
                <div class="chat-messages" id="chat-messages-container">
                    <!-- Mensagens inseridas dinamicamente -->
                </div>

                <div class="chat-input-area" id="chat-input-form">
                    <!-- Preview do Anexo -->
                    <div style="display:flex; flex-direction:column; width:100%; gap:5px;">
                        <div class="attachment-preview-container" id="chat-attachment-preview">
                            <img id="chat-attachment-img" src="" alt="preview">
                            <button class="attachment-remove-btn" onclick="removeAttachment()"><i class="fas fa-times"></i></button>
                        </div>
                        <div style="display:flex; width:100%; gap:0.75rem; align-items:center;">
                            <input type="file" id="attachment-file" style="display: none;" accept="image/*" onchange="previewAttachment(event)">
                            <button class="attachment-icon-btn" onclick="document.getElementById('attachment-file').click()" title="Anexar Imagem">
                                <i class="far fa-image"></i>
                            </button>
                            <input type="text" id="chat-message-input" placeholder="Escreva sua mensagem aqui..." onkeydown="handleChatSubmit(event)">
                            <button class="chat-btn-send" onclick="sendTicketMessage()">
                                Enviar <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Placeholder vazio quando nenhum ticket tá aberto -->
            <div class="ticket-detail-panel" id="ticket-detail-placeholder" style="display: flex; align-items: center; justify-content: center; text-align: center; padding: 3rem; color: var(--text-3);">
                <div>
                    <i class="far fa-comments" style="font-size: 4rem; color: rgba(255,255,255,0.05); margin-bottom: 1.5rem;"></i>
                    <h3 style="color: var(--text-2); margin-bottom: 0.5rem;">Selecione um chamado</h3>
                    <p style="max-width: 320px; font-size: 0.9rem;">Escolha um ticket na lista ao lado para ver a conversa ou crie um novo chamado.</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal Novo Chamado -->
    <div class="modal" id="new-ticket-modal">
        <div class="modal-overlay" onclick="closeNewTicketModal()"></div>
        <div class="modal-container">
            <div class="modal-header">
                <h3 style="font-weight: 700;">Abrir Chamado de Suporte</h3>
                <button onclick="closeNewTicketModal()" style="background:none; border:none; color:var(--text-3); font-size:1.2rem; cursor:pointer;"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="ticket-subject">Assunto *</label>
                    <input type="text" id="ticket-subject" class="form-control" placeholder="Resumo curto do seu problema">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label for="ticket-category">Categoria</label>
                        <select id="ticket-category" class="form-control">
                            <option value="Dúvidas">Dúvidas Gerais</option>
                            <option value="Financeiro">Financeiro / Saques</option>
                            <option value="Técnico">Problema Técnico / API</option>
                            <option value="Comercial">Sugestão / Negociações</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="ticket-priority">Prioridade</label>
                        <select id="ticket-priority" class="form-control">
                            <option value="low">Baixa</option>
                            <option value="medium" selected>Média</option>
                            <option value="high">Alta (Urgente)</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="ticket-message">Descrição do Problema *</label>
                    <textarea id="ticket-message" class="form-control" rows="5" placeholder="Forneça o máximo de detalhes possível para agilizarmos a resposta..." style="resize:none; font-family:inherit;"></textarea>
                </div>
                
                <div class="form-group">
                    <label>Anexar Imagem</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" id="modal-attachment-file" style="display: none;" accept="image/*" onchange="previewModalAttachment(event)">
                        <button class="form-control" onclick="document.getElementById('modal-attachment-file').click()" style="display:flex; align-items:center; gap:5px; background:rgba(255,255,255,0.03); border-color:var(--border);">
                            <i class="far fa-image"></i> Escolher Imagem
                        </button>
                        <div class="attachment-preview-container" id="modal-attachment-preview">
                            <img id="modal-attachment-img" src="" alt="preview">
                            <button class="attachment-remove-btn" onclick="removeModalAttachment()"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="form-control" onclick="closeNewTicketModal()" style="border:none; background:rgba(255,255,255,0.05); color:white; font-weight:600; cursor:pointer;">Cancelar</button>
                <button class="btn btn-primary" onclick="submitNewTicket()" style="background:var(--primary); color:white; border:none; padding:0.75rem 1.5rem; border-radius:12px; font-weight:600; cursor:pointer;">Criar Chamado</button>
            </div>
        </div>
    </div>

    <!-- Modal para visualização ampliada de imagem -->
    <div class="modal" id="image-zoom-modal">
        <div class="modal-overlay" onclick="closeImageZoom()"></div>
        <div style="position:relative; z-index:1001; max-width:90vw; max-height:90vh;">
            <img id="zoomed-image" src="" alt="zoom" style="max-width:100%; max-height:90vh; border-radius:8px; border:2px solid rgba(255,255,255,0.2);">
            <button onclick="closeImageZoom()" style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.8); border:none; color:white; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1.2rem;"><i class="fas fa-times"></i></button>
        </div>
    </div>

    </div> <!-- Fecha app-container do sidebar.php -->

    <script src="script.js?v=124.0"></script>
    <script>
        const CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        let currentOpenTicketId = null;
        let attachmentBase64 = null;
        let modalAttachmentBase64 = null;

        document.addEventListener('DOMContentLoaded', () => {
            loadTickets();
        });

        // Carrega a lista de tickets do usuário
        function loadTickets() {
            fetch('suporte_tickets.php?ajax=1&action=list')
                .then(res => res.json())
                .then(data => {
                    const listContainer = document.getElementById('ticket-list');
                    listContainer.innerHTML = '';

                    if (!data.success || data.webhooks) { // Correção de fallback se o JSON responder mal
                        listContainer.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-3);">Ocorreu um erro ao carregar os chamados.</div>`;
                        return;
                    }

                    if (data.tickets.length === 0) {
                        listContainer.innerHTML = `
                            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-3);">
                                <i class="far fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.15;"></i>
                                <h3>Nenhum chamado</h3>
                                <p style="font-size: 0.8rem; margin-top: 5px;">Você não abriu nenhum chamado de suporte ainda.</p>
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
                            statusText = 'Encerrado';
                        }

                        const itemHtml = `
                            <div class="ticket-item ${currentOpenTicketId == ticket.id ? 'active' : ''}" onclick="openTicket(${ticket.id})">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                                    <span class="badge-status ${badgeClass}">${statusText}</span>
                                    <span style="font-size:0.7rem; color:var(--text-3);">${dateFormatted}</span>
                                </div>
                                <h4 style="font-size:0.95rem; font-weight:600; color:white; margin-bottom:0.25rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(ticket.subject)}">${escapeHtml(ticket.subject)}</h4>
                                <p style="font-size:0.8rem; color:var(--text-3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                    ${escapeHtml(ticket.last_message || 'Nenhuma mensagem')}
                                </p>
                            </div>
                        `;
                        listContainer.insertAdjacentHTML('beforeend', itemHtml);
                    });
                })
                .catch(err => {
                    console.error(err);
                    document.getElementById('ticket-list').innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-3);">Erro de conexão.</div>`;
                });
        }

        // Abre um ticket selecionado para ver o chat
        function openTicket(id) {
            currentOpenTicketId = id;
            
            // Ativa o estilo na barra
            document.querySelectorAll('.ticket-item').forEach(el => el.classList.remove('active'));
            // Atualiza visualização dos painéis
            document.getElementById('ticket-detail-placeholder').style.display = 'none';
            document.getElementById('ticket-detail-container').style.display = 'flex';

            fetch(`suporte_tickets.php?ajax=1&action=get_messages&ticket_id=${id}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.success) {
                        alert(data.error);
                        return;
                    }

                    // Preencher cabeçalho do chat
                    document.getElementById('chat-subject').textContent = data.ticket.subject;
                    document.getElementById('chat-category').textContent = data.ticket.category;
                    document.getElementById('chat-priority').textContent = data.ticket.priority === 'low' ? 'Baixa' : (data.ticket.priority === 'high' ? 'Alta (Urgente)' : 'Média');
                    
                    const statusEl = document.getElementById('chat-status');
                    statusEl.className = 'badge-status';
                    if (data.ticket.status === 'open') {
                        statusEl.classList.add('badge-open');
                        statusEl.textContent = 'Aberto';
                        document.getElementById('close-ticket-btn').style.display = 'inline-block';
                        document.getElementById('chat-input-form').style.display = 'flex';
                    } else if (data.ticket.status === 'replied') {
                        statusEl.classList.add('badge-replied');
                        statusEl.textContent = 'Respondido';
                        document.getElementById('close-ticket-btn').style.display = 'inline-block';
                        document.getElementById('chat-input-form').style.display = 'flex';
                    } else {
                        statusEl.classList.add('badge-closed');
                        statusEl.textContent = 'Encerrado';
                        document.getElementById('close-ticket-btn').style.display = 'none';
                        document.getElementById('chat-input-form').style.display = 'none'; // Desabilita input se fechado
                    }

                    // Preencher mensagens
                    const messagesContainer = document.getElementById('chat-messages-container');
                    messagesContainer.innerHTML = '';

                    data.messages.forEach(msg => {
                        const date = new Date(msg.created_at);
                        const timeStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                        
                        let attachmentHtml = '';
                        if (msg.attachment_url) {
                            attachmentHtml = `<img src="${msg.attachment_url}" class="chat-image" onclick="zoomImage('${msg.attachment_url}')" alt="anexo">`;
                        }

                        const senderLabel = msg.sender_type === 'admin' ? '<strong style="font-size:0.75rem; color:#1ea465; margin-bottom:2px;">Atendente DiretoPay</strong>' : '';

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

                    // Scroll para o fim do chat
                    setTimeout(() => {
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }, 50);

                    // Re-renderizar classe ativa na lista de tickets
                    loadTickets();
                });
        }

        // Submete mensagem no ticket
        function sendTicketMessage() {
            const inputEl = document.getElementById('chat-message-input');
            const message = inputEl.value.trim();
            if (!message && !attachmentBase64) return;

            const payload = {
                action: 'send_message',
                ticket_id: currentOpenTicketId,
                message: message,
                attachment: attachmentBase64,
                csrf_token: CSRF_TOKEN
            };

            fetch('suporte_tickets.php?ajax=1&action=send_message', {
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
                
                // Limpar inputs e anexo
                inputEl.value = '';
                removeAttachment();

                // Recarregar chat
                openTicket(currentOpenTicketId);
            });
        }

        function handleChatSubmit(e) {
            if (e.key === 'Enter') {
                sendTicketMessage();
            }
        }

        // Encerra ticket atual
        function closeCurrentTicket() {
            if (!confirm('Deseja realmente encerrar este chamado?')) return;
            
            fetch('suporte_tickets.php?ajax=1&action=close', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': CSRF_TOKEN
                },
                body: JSON.stringify({ ticket_id: currentOpenTicketId, csrf_token: CSRF_TOKEN })
            })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    alert(data.error);
                    return;
                }
                openTicket(currentOpenTicketId);
            });
        }

        // Criação de novo ticket
        function submitNewTicket() {
            const subject = document.getElementById('ticket-subject').value.trim();
            const category = document.getElementById('ticket-category').value;
            const priority = document.getElementById('ticket-priority').value;
            const message = document.getElementById('ticket-message').value.trim();

            if (!subject || !message) {
                alert('Preencha os campos obrigatórios (*).');
                return;
            }

            const payload = {
                action: 'create',
                subject: subject,
                category: category,
                priority: priority,
                message: message,
                attachment: modalAttachmentBase64,
                csrf_token: CSRF_TOKEN
            };

            fetch('suporte_tickets.php?ajax=1&action=create', {
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

                closeNewTicketModal();
                loadTickets();
                
                // Abre o ticket recém criado
                if (data.ticket_id) {
                    setTimeout(() => {
                        openTicket(data.ticket_id);
                    }, 500);
                }
            });
        }

        // Modais
        function openNewTicketModal() {
            document.getElementById('ticket-subject').value = '';
            document.getElementById('ticket-message').value = '';
            removeModalAttachment();
            document.getElementById('new-ticket-modal').classList.add('active');
        }
        function closeNewTicketModal() {
            document.getElementById('new-ticket-modal').classList.remove('active');
        }

        // Helpers de Anexos
        function previewAttachment(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                alert('Arquivo muito grande. Limite 5MB.');
                return;
            }

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

        function previewModalAttachment(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function() {
                modalAttachmentBase64 = reader.result;
                const previewContainer = document.getElementById('modal-attachment-preview');
                const imgEl = document.getElementById('modal-attachment-img');
                imgEl.src = reader.result;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }

        function removeModalAttachment() {
            modalAttachmentBase64 = null;
            document.getElementById('modal-attachment-file').value = '';
            document.getElementById('modal-attachment-preview').style.display = 'none';
        }

        // Ampliar Imagem
        function zoomImage(url) {
            document.getElementById('zoomed-image').src = url;
            document.getElementById('image-zoom-modal').classList.add('active');
        }
        function closeImageZoom() {
            document.getElementById('image-zoom-modal').classList.remove('active');
        }

        // Helper escape HTML
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
