<?php
/**
 * Endpoint temporário de diagnóstico UTMify.
 * Acesse: /test_utmify.php
 * Remove depois de testar.
 */
require_once 'includes/db.php';
require_once 'includes/UtmifyService.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

$userId = $_SESSION['user_id'];

// Busca token UTMify do usuário
$stmt = $pdo->prepare("SELECT utmify_api_token FROM users WHERE id = ? LIMIT 1");
$stmt->execute([$userId]);
$utmToken = (string)($stmt->fetchColumn() ?: '');

if (empty($utmToken)) {
    echo json_encode(['error' => 'Token UTMify não configurado para este usuário']);
    exit;
}

// Busca última transação paga do usuário
$txStmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? AND status = 'paid' ORDER BY id DESC LIMIT 1");
$txStmt->execute([$userId]);
$tx = $txStmt->fetch();

if (!$tx) {
    echo json_encode(['error' => 'Nenhuma transação paga encontrada para testar']);
    exit;
}

// Envia para UTMify
$result = UtmifyService::notifySale($utmToken, $tx, [], [], true); // isTest = true

echo json_encode([
    'token_preview'  => substr($utmToken, 0, 10) . '...',
    'transaction_id' => $tx['id'],
    'pix_id'         => $tx['pix_id'],
    'amount'         => $tx['amount_brl'],
    'utmify_result'  => [
        'success'   => $result['success'],
        'http_code' => $result['http_code'],
        'response'  => $result['response'],
        'error'     => $result['error'],
    ],
]);
