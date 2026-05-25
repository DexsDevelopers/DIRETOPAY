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

$pdo->prepare("UPDATE users SET preferred_nominal = ? WHERE id = ?")
    ->execute([$nominal, $userId]);

echo json_encode(['success' => true, 'nominal' => $nominal]);
