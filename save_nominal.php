<?php
require_once 'includes/db.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'error' => 'Não autenticado']);
    exit;
}

$userId  = $_SESSION['user_id'];
$input   = json_decode(file_get_contents('php://input'), true);
$nominal = $input['nominal'] ?? '';

$allowed = ['nominal1', 'nominal2'];
if (!in_array($nominal, $allowed)) {
    echo json_encode(['success' => false, 'error' => 'Nominal inválido']);
    exit;
}

// Nominal 2 é restrito: só libera se o admin habilitou para este usuário
if ($nominal === 'nominal2') {
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN nominal2_enabled TINYINT(1) NOT NULL DEFAULT 0");
    } catch (PDOException $e) {}

    $stmt = $pdo->prepare("SELECT nominal2_enabled FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (empty($row['nominal2_enabled'])) {
        echo json_encode([
            'success' => false,
            'error'   => 'Nominal 2 não está liberado para sua conta. Entre em contato com o suporte.'
        ]);
        exit;
    }
}

$pdo->prepare("UPDATE users SET preferred_nominal = ? WHERE id = ?")
    ->execute([$nominal, $userId]);

echo json_encode(['success' => true, 'nominal' => $nominal]);
