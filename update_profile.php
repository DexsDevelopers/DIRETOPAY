<?php
require_once 'includes/db.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

$userId = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

// Validação CSRF
$headers = getallheaders();
$csrfToken = $headers['X-CSRF-Token'] ?? ($headers['x-csrf-token'] ?? '');
check_csrf($csrfToken);

// Sanitização de Entradas
$fullName = strip_tags(trim($input['full_name'] ?? ''));
$pixKey = strip_tags(trim($input['pix_key'] ?? ''));
$withdrawMethod = strip_tags(trim($input['withdraw_method'] ?? 'pix'));
$cryptoAddress = strip_tags(trim($input['crypto_address'] ?? ''));
$cryptoNetwork = strip_tags(trim($input['crypto_network'] ?? ''));
$currentPassword = $input['current_password'] ?? '';
$newPassword     = $input['new_password'] ?? '';
$sevenKId        = isset($input['seven_k_id']) && $input['seven_k_id'] !== '' ? (int)$input['seven_k_id'] : null;
$utmifyToken     = isset($input['utmify_api_token']) ? strip_tags(trim($input['utmify_api_token'])) : null;
if ($utmifyToken === '') $utmifyToken = null;

// WhatsApp: somente dígitos, sem o 55 para armazenar limpo (formatPhone adiciona)
$whatsapp = preg_replace('/[^0-9]/', '', $input['whatsapp'] ?? '');
if ($whatsapp === '') $whatsapp = null;

// Validar método
if (!in_array($withdrawMethod, ['pix', 'btc', 'usdt'])) {
    $withdrawMethod = 'pix';
}

if (empty($fullName)) {
    echo json_encode(['error' => 'Nome é obrigatório.']);
    exit;
}

// Validar campos conforme método
if ($withdrawMethod === 'pix' && empty($pixKey)) {
    echo json_encode(['error' => 'Chave PIX é obrigatória para recebimento via PIX.']);
    exit;
}
if (($withdrawMethod === 'btc' || $withdrawMethod === 'usdt') && empty($cryptoAddress)) {
    echo json_encode(['error' => 'Endereço de criptomoeda é obrigatório.']);
    exit;
}
if (($withdrawMethod === 'btc' || $withdrawMethod === 'usdt') && empty($cryptoNetwork)) {
    echo json_encode(['error' => 'Selecione a rede (network) da criptomoeda.']);
    exit;
}

// Auto-criar colunas se não existirem
try {
    $pdo->exec("ALTER TABLE users ADD COLUMN seven_k_id INT NULL DEFAULT NULL");
} catch (PDOException $e) {}
try {
    $pdo->exec("ALTER TABLE users ADD COLUMN withdraw_method VARCHAR(10) DEFAULT 'pix'");
} catch (PDOException $e) {}
try {
    $pdo->exec("ALTER TABLE users ADD COLUMN crypto_address VARCHAR(255) DEFAULT ''");
} catch (PDOException $e) {}
try {
    $pdo->exec("ALTER TABLE users ADD COLUMN crypto_network VARCHAR(20) DEFAULT ''");
} catch (PDOException $e) {}
try {
    $pdo->exec("ALTER TABLE users ADD COLUMN whatsapp VARCHAR(20) NULL DEFAULT NULL");
} catch (PDOException $e) {}

// Buscar dados atuais do usuário
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(['error' => 'Usuário não encontrado.']);
    exit;
}

// Se o usuário quer mudar a senha, a senha atual é obrigatória
if (!empty($newPassword)) {
    if (empty($currentPassword)) {
        echo json_encode(['error' => 'Para mudar a senha, você deve informar a senha atual.']);
        exit;
    }
    if (!password_verify($currentPassword, $user['password'])) {
        echo json_encode(['error' => 'Senha atual incorreta.']);
        exit;
    }
}

try {
    $oldWhatsapp = $user['whatsapp'] ?? '';
    
    // Atualizar dados básicos + método de saque + ID 7K + token UTMify + WhatsApp
    $updateStmt = $pdo->prepare("UPDATE users SET full_name = ?, pix_key = ?, withdraw_method = ?, crypto_address = ?, crypto_network = ?, seven_k_id = ?, utmify_api_token = ?, whatsapp = ? WHERE id = ?");
    $updateStmt->execute([$fullName, $pixKey, $withdrawMethod, $cryptoAddress, $cryptoNetwork, $sevenKId, $utmifyToken, $whatsapp, $userId]);

    // Envia mensagem de boas-vindas caso seja um novo número cadastrado
    if (!empty($whatsapp) && $whatsapp !== $oldWhatsapp) {
        require_once 'includes/WhatsAppService.php';
        WhatsAppService::sendWelcomeMessage($whatsapp, $fullName);
    }

    // Atualizar senha se fornecida
    if (!empty($newPassword)) {
        if (strlen($newPassword) < 6) {
            echo json_encode(['error' => 'A nova senha deve ter pelo menos 6 caracteres.']);
            exit;
        }
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $passStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $passStmt->execute([$hash, $userId]);
    }
        
    // Atualizar sessão
    $_SESSION['full_name'] = $fullName;
    error_log("Profile Update Success for User $userId: Name=$fullName");

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log("Profile Update Error (User ID: $userId): " . $e->getMessage());
    echo json_encode(['error' => 'Erro ao salvar no banco: ' . $e->getMessage()]);
}
?>
