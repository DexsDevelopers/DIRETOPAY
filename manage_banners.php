<?php
require_once __DIR__ . '/includes/db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ── Public: list active banners ─────────────────────────────────────
if ($action === 'list_public') {
    $stmt = $pdo->query("SELECT id, title, image_url, image_url_mobile, link_url, link_target FROM banners WHERE active = 1 ORDER BY sort_order ASC, id ASC");
    echo json_encode(['success' => true, 'banners' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ── Authenticated admin routes ──────────────────────────────────────
if (!isLoggedIn() || !isAdmin()) {
    echo json_encode(['success' => false, 'error' => 'Acesso negado']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

// ── List all ────────────────────────────────────────────────────────
if ($action === 'list') {
    $stmt = $pdo->query("SELECT * FROM banners ORDER BY sort_order ASC, id ASC");
    echo json_encode(['success' => true, 'banners' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ── Create ──────────────────────────────────────────────────────────
if ($action === 'create') {
    $title            = trim($input['title']            ?? '');
    $image_url        = trim($input['image_url']        ?? '');
    $image_url_mobile = trim($input['image_url_mobile'] ?? '');
    $link_url         = trim($input['link_url']         ?? '');
    $link_target      = in_array($input['link_target'] ?? '_blank', ['_self','_blank']) ? $input['link_target'] : '_blank';
    $sort_order       = (int)($input['sort_order'] ?? 0);

    if (!$image_url) { echo json_encode(['success' => false, 'error' => 'URL da imagem desktop é obrigatória']); exit; }

    $pdo->prepare("INSERT INTO banners (title, image_url, image_url_mobile, link_url, link_target, sort_order) VALUES (?, ?, ?, ?, ?, ?)")
        ->execute([$title, $image_url, $image_url_mobile ?: null, $link_url ?: null, $link_target, $sort_order]);

    echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

// ── Update ──────────────────────────────────────────────────────────
if ($action === 'update') {
    $id               = (int)($input['id'] ?? 0);
    $title            = trim($input['title']            ?? '');
    $image_url        = trim($input['image_url']        ?? '');
    $image_url_mobile = trim($input['image_url_mobile'] ?? '');
    $link_url         = trim($input['link_url']         ?? '');
    $link_target      = in_array($input['link_target'] ?? '_blank', ['_self','_blank']) ? $input['link_target'] : '_blank';
    $sort_order       = (int)($input['sort_order'] ?? 0);
    $active           = isset($input['active']) ? (int)(bool)$input['active'] : null;

    if (!$id) { echo json_encode(['success' => false, 'error' => 'ID inválido']); exit; }

    $sets = "title=?, image_url=?, image_url_mobile=?, link_url=?, link_target=?, sort_order=?";
    $params = [$title, $image_url, $image_url_mobile ?: null, $link_url ?: null, $link_target, $sort_order];

    if ($active !== null) { $sets .= ', active=?'; $params[] = $active; }
    $params[] = $id;

    $pdo->prepare("UPDATE banners SET {$sets} WHERE id = ?")->execute($params);
    echo json_encode(['success' => true]);
    exit;
}

// ── Toggle active ───────────────────────────────────────────────────
if ($action === 'toggle') {
    $id = (int)($input['id'] ?? 0);
    if (!$id) { echo json_encode(['success' => false, 'error' => 'ID inválido']); exit; }
    $pdo->prepare("UPDATE banners SET active = NOT active WHERE id = ?")->execute([$id]);
    $stmt = $pdo->prepare("SELECT active FROM banners WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'active' => (bool)$stmt->fetchColumn()]);
    exit;
}

// ── Delete ──────────────────────────────────────────────────────────
if ($action === 'delete') {
    $id = (int)($input['id'] ?? 0);
    if (!$id) { echo json_encode(['success' => false, 'error' => 'ID inválido']); exit; }
    $pdo->prepare("DELETE FROM banners WHERE id = ?")->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Ação inválida']);
