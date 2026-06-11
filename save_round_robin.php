<?php
require_once 'includes/db.php';
header('Content-Type: application/json');

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Não autenticado']);
    exit;
}

$userId = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true) ?: [];
$action = $input['action'] ?? 'get';

if ($action === 'toggle') {
    $enabled = (bool)($input['enabled'] ?? false);
    $enabledVal = $enabled ? 1 : 0;

    $stmt = $pdo->prepare("UPDATE users SET round_robin_enabled = ? WHERE id = ?");
    $stmt->execute([$enabledVal, $userId]);

    echo json_encode(['success' => true, 'enabled' => $enabled]);
    exit;
}

// GET — Retorna estado atual do usuário
$stmt = $pdo->prepare("SELECT round_robin_enabled FROM users WHERE id = ?");
$stmt->execute([$userId]);
$rrEnabled = (bool)$stmt->fetchColumn();

$rrIndex = $pdo->query("SELECT `value` FROM settings WHERE `key`='round_robin_index'")->fetchColumn();

// Montar lista de nominais ativas de forma dinâmica
$nominaisAtivos = [];
$nominalMap = [
    'nominal1' => 'sigilopay',
    'nominal2' => 'brpix',
    'nominal3' => 'misticpay',
    'nominal4' => 'ezzybanking',
    'nominal5' => 'brpagg',
    'nominal6' => 'syncpayments'
];
foreach ($nominalMap as $nominal => $gateway) {
    $enabledKey = $gateway === 'sigilopay' ? 'sigilo_enabled' : "{$gateway}_enabled";
    $val = $pdo->query("SELECT `value` FROM settings WHERE `key`='$enabledKey'")->fetchColumn();
    if ($val === '1') {
        $nominaisAtivos[] = $nominal;
    }
}

$currentNominalIdx = (int)($rrIndex ?: 0);
$currentNominal = 'nominal1';
if (count($nominaisAtivos) > 0) {
    $currentNominal = $nominaisAtivos[$currentNominalIdx % count($nominaisAtivos)];
}

echo json_encode([
    'success'        => true,
    'enabled'        => $rrEnabled,
    'current_index'  => $currentNominalIdx,
    'current_nominal' => $currentNominal,
    'ativos'         => $nominaisAtivos,
]);
