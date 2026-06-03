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
$withdraw_pref = $input['withdraw_preference'] ?? '';
$ezzyAcquirer  = trim((string)($input['ezzy_acquirer'] ?? ''));

$allowed = ['nominal1', 'nominal2', 'nominal3', 'nominal4'];
if (!in_array($nominal, $allowed)) {
    echo json_encode(['success' => false, 'error' => 'Nominal inválido']);
    exit;
}

// Se o nominal for nominal3, o saque é sempre automático/auto_direct
if ($nominal === 'nominal3') {
    $withdraw_pref = 'auto_direct';
} else {
    $allowed_prefs = ['accumulate', 'auto_direct'];
    if (!in_array($withdraw_pref, $allowed_prefs)) {
        $withdraw_pref = 'accumulate';
    }
}

if ($nominal !== 'nominal4') {
    $ezzyAcquirer = '';
}

if ($nominal === 'nominal4' && $ezzyAcquirer !== '') {
    try {
        require_once __DIR__ . '/includes/EzzyBankingService.php';
        $list = EzzyBankingService::listAcquirers();
        if (!empty($list['ok']) && !empty($list['data']) && is_array($list['data'])) {
            $allowedCodes = array_map(static fn($item) => (string)($item['code'] ?? ''), $list['data']);
            if (!in_array($ezzyAcquirer, $allowedCodes, true)) {
                echo json_encode(['success' => false, 'error' => 'Adquirente Ezzy inválida']);
                exit;
            }
        }
    } catch (Throwable $e) {}
}

$pdo->prepare("UPDATE users SET preferred_nominal = ?, withdraw_preference = ?, ezzy_acquirer = ? WHERE id = ?")
    ->execute([$nominal, $withdraw_pref, ($ezzyAcquirer !== '' ? $ezzyAcquirer : null), $userId]);

echo json_encode(['success' => true, 'nominal' => $nominal, 'withdraw_preference' => $withdraw_pref, 'ezzy_acquirer' => $ezzyAcquirer]);
