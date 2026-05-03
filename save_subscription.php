<?php
require_once 'includes/db.php';

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'error' => 'Acesso negado']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (isset($data['endpoint'])) {
    $userId = $_SESSION['user_id'];
    $endpoint = $data['endpoint'];
    $p256dh = $data['keys']['p256dh'] ?? '';
    $auth = $data['keys']['auth'] ?? '';

    // Verificar se endpoint já existe para este user
    $stmt = $pdo->prepare("SELECT id FROM push_subscriptions WHERE endpoint = ? AND user_id = ?");
    $stmt->execute([$endpoint, $userId]);
    $existing = $stmt->fetch();

    if ($existing) {
        // Atualizar chaves (podem ter mudado após reinstalação da PWA)
        $upd = $pdo->prepare("UPDATE push_subscriptions SET p256dh = ?, auth = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $upd->execute([$p256dh, $auth, $existing['id']]);
    } else {
        // Inserir nova subscription (novo device ou novo browser)
        $ins = $pdo->prepare("INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)");
        $ins->execute([$userId, $endpoint, $p256dh, $auth]);
    }
    
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Assinatura inválida']);
}
?>
