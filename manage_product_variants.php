<?php
require_once 'includes/db.php';
header('Content-Type: application/json');

if (!isLoggedIn()) { echo json_encode(['success' => false, 'error' => 'Não autorizado']); exit; }

$headers = getallheaders();
$csrfToken = $headers['X-CSRF-Token'] ?? ($headers['x-csrf-token'] ?? '');
check_csrf($csrfToken);

$userId = $_SESSION['user_id'];
$input  = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

try {

    // Helper: verify product belongs to user
    $checkOwner = function(int $productId) use ($pdo, $userId): bool {
        $s = $pdo->prepare("SELECT id FROM products WHERE id = ? AND user_id = ?");
        $s->execute([$productId, $userId]);
        return (bool) $s->fetch();
    };

    switch ($action) {

        // ── List variants for a product ──────────────────────────────────────
        case 'list':
            $pid = (int)($input['product_id'] ?? 0);
            if (!$pid || !$checkOwner($pid)) {
                echo json_encode(['success' => false, 'error' => 'Produto não encontrado.']); exit;
            }
            $stmt = $pdo->prepare("SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC, id ASC");
            $stmt->execute([$pid]);
            echo json_encode(['success' => true, 'variants' => $stmt->fetchAll()]);
            break;

        // ── Create variant ───────────────────────────────────────────────────
        case 'create':
            $pid   = (int)($input['product_id'] ?? 0);
            $name  = trim($input['name'] ?? '');
            $price = (float)($input['price'] ?? 0);

            if (!$pid || !$checkOwner($pid))  { echo json_encode(['success' => false, 'error' => 'Produto não encontrado.']); exit; }
            if (!$name)                        { echo json_encode(['success' => false, 'error' => 'Nome da variante é obrigatório.']); exit; }
            if ($price <= 0)                   { echo json_encode(['success' => false, 'error' => 'Preço deve ser maior que zero.']); exit; }

            $pdo->prepare("INSERT INTO product_variants (product_id, name, description, price, stock, sort_order) VALUES (?,?,?,?,?,?)")
                ->execute([$pid, $name, trim($input['description'] ?? ''), $price, (int)($input['stock'] ?? -1), (int)($input['sort_order'] ?? 0)]);

            // Mark product as having variants
            $pdo->prepare("UPDATE products SET has_variants = 1 WHERE id = ?")->execute([$pid]);

            echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
            break;

        // ── Update variant ───────────────────────────────────────────────────
        case 'update':
            $id    = (int)($input['id'] ?? 0);
            $name  = trim($input['name'] ?? '');
            $price = (float)($input['price'] ?? 0);

            // Verify ownership via product
            $own = $pdo->prepare("SELECT pv.id FROM product_variants pv JOIN products p ON p.id = pv.product_id WHERE pv.id = ? AND p.user_id = ?");
            $own->execute([$id, $userId]);
            if (!$own->fetch()) { echo json_encode(['success' => false, 'error' => 'Variante não encontrada.']); exit; }

            if (!$name)  { echo json_encode(['success' => false, 'error' => 'Nome é obrigatório.']); exit; }
            if ($price <= 0) { echo json_encode(['success' => false, 'error' => 'Preço inválido.']); exit; }

            $pdo->prepare("UPDATE product_variants SET name=?, description=?, price=?, stock=?, sort_order=?, active=? WHERE id=?")
                ->execute([$name, trim($input['description'] ?? ''), $price, (int)($input['stock'] ?? -1), (int)($input['sort_order'] ?? 0), ($input['active'] ?? 1) ? 1 : 0, $id]);

            echo json_encode(['success' => true]);
            break;

        // ── Delete variant ───────────────────────────────────────────────────
        case 'delete':
            $id = (int)($input['id'] ?? 0);
            $own = $pdo->prepare("SELECT pv.product_id FROM product_variants pv JOIN products p ON p.id = pv.product_id WHERE pv.id = ? AND p.user_id = ?");
            $own->execute([$id, $userId]);
            $row = $own->fetch();
            if (!$row) { echo json_encode(['success' => false, 'error' => 'Variante não encontrada.']); exit; }

            $pdo->prepare("DELETE FROM product_variants WHERE id = ?")->execute([$id]);

            // If no variants left, remove flag
            $cnt = $pdo->prepare("SELECT COUNT(*) FROM product_variants WHERE product_id = ?");
            $cnt->execute([$row['product_id']]);
            if ($cnt->fetchColumn() == 0) {
                $pdo->prepare("UPDATE products SET has_variants = 0 WHERE id = ?")->execute([$row['product_id']]);
            }

            echo json_encode(['success' => true]);
            break;

        default:
            echo json_encode(['success' => false, 'error' => 'Ação inválida.']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
