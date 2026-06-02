<?php
require_once __DIR__ . '/includes/db.php';

// Buscar usuário com "admin" no nome
$stmt = $pdo->query("SELECT id, full_name, email, is_admin FROM users WHERE LOWER(full_name) LIKE '%admin%' ORDER BY id ASC");
$users = $stmt->fetchAll();

if (!$users) {
    echo "Nenhum usuário com 'admin' no nome encontrado.\n";
    exit;
}

echo "Usuários encontrados:\n";
foreach ($users as $u) {
    echo "  ID: {$u['id']} | Nome: {$u['full_name']} | Email: {$u['email']} | is_admin: {$u['is_admin']}\n";
}

// Pegar o primeiro (ou o único)
$target = $users[0];
$pdo->prepare("UPDATE users SET is_admin = 1, status = 'approved' WHERE id = ?")->execute([$target['id']]);

echo "\n✅ Usuário ID {$target['id']} ({$target['full_name']}) definido como ADMIN com sucesso.\n";
