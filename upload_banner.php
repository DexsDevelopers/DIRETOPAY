<?php
require_once __DIR__ . '/includes/db.php';
header('Content-Type: application/json');

if (!isLoggedIn() || !isAdmin()) {
    echo json_encode(['success' => false, 'error' => 'Acesso negado']);
    exit;
}

$field = $_POST['field'] ?? 'file'; // 'file' or 'file_mobile'

if (empty($_FILES[$field])) {
    echo json_encode(['success' => false, 'error' => 'Nenhum arquivo enviado']);
    exit;
}

$file     = $_FILES[$field];
$allowed  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$maxBytes = 5 * 1024 * 1024; // 5 MB

if ($file['error'] !== UPLOAD_ERR_OK) {
    $msgs = [
        UPLOAD_ERR_INI_SIZE   => 'Arquivo muito grande (limite do servidor)',
        UPLOAD_ERR_FORM_SIZE  => 'Arquivo muito grande',
        UPLOAD_ERR_PARTIAL    => 'Upload incompleto',
        UPLOAD_ERR_NO_FILE    => 'Nenhum arquivo enviado',
    ];
    echo json_encode(['success' => false, 'error' => $msgs[$file['error']] ?? 'Erro no upload']);
    exit;
}

if ($file['size'] > $maxBytes) {
    echo json_encode(['success' => false, 'error' => 'Arquivo maior que 5 MB']);
    exit;
}

// Validate MIME type from actual content
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeReal = $finfo->file($file['tmp_name']);
if (!in_array($mimeReal, $allowed)) {
    echo json_encode(['success' => false, 'error' => 'Formato inválido. Use JPG, PNG, WEBP ou GIF']);
    exit;
}

$ext     = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'][$mimeReal];
$dir     = __DIR__ . '/assets/banners/';
$urlBase = '/assets/banners/';

if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

$filename = 'banner_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$dest     = $dir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    echo json_encode(['success' => false, 'error' => 'Falha ao salvar arquivo']);
    exit;
}

echo json_encode(['success' => true, 'url' => $urlBase . $filename]);
