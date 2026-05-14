<?php
require_once 'includes/db.php';
try { require_once 'includes/UtmifyService.php'; } catch (Throwable $e) {}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isLoggedIn()) {
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

$pixId = $_GET['pix_id'] ?? '';

if (empty($pixId)) {
    echo json_encode(['error' => 'ID do Pix não informado']);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM transactions WHERE pix_id = ? AND user_id = ?");
$stmt->execute([$pixId, $_SESSION['user_id']]);
$transaction = $stmt->fetch();

if (!$transaction) {
    echo json_encode(['status' => 'not_found']);
    exit;
}

// Se pago, tenta notificar UTMify como fallback (caso webhook não tenha notificado)
if ($transaction['status'] === 'paid') {
    try {
        $utmStmt = $pdo->prepare("SELECT utmify_api_token FROM users WHERE id = ? LIMIT 1");
        $utmStmt->execute([$transaction['user_id']]);
        $utmToken = (string)($utmStmt->fetchColumn() ?: '');
        if (!empty($utmToken) && class_exists('UtmifyService')) {
            UtmifyService::notifySale($utmToken, $transaction);
            write_log('info', 'UTMify fallback check_status', ['pix_id' => $pixId]);
        } else {
            write_log('info', 'UTMify fallback: token vazio para user=' . $transaction['user_id']);
        }
    } catch (Throwable $e) {
        write_log('warning', 'UTMify fallback erro: ' . $e->getMessage());
    }
}

echo json_encode(['status' => $transaction['status']]);

