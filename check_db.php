<?php
require_once 'includes/db.php';
if (!isAdmin()) { http_response_code(403); exit('Unauthorized'); }
try {
    $stmt = $pdo->query("DESCRIBE transactions");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Colunas na tabela transactions: " . implode(', ', $columns);
} catch (PDOException $e) {
    echo "Erro: " . $e->getMessage();
}
?>
