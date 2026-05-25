<?php
if (($_GET['k'] ?? '') !== 'lunar2026') { http_response_code(404); exit; }
@shell_exec('pkill -9 -f chromium 2>/dev/null');
@shell_exec('pkill -9 -f chrome 2>/dev/null');
@shell_exec('pkill -9 -f node 2>/dev/null');
@shell_exec('pkill -9 -f npm 2>/dev/null');
@shell_exec('pkill -9 -f puppeteer 2>/dev/null');
sleep(1);
$dir = __DIR__ . '/whatsapp-bridge/node_modules';
if (is_dir($dir)) @shell_exec('rm -rf ' . escapeshellarg($dir));
echo json_encode([
    'ok'  => true,
    'msg' => 'Processos mortos. node_modules removido.',
    'pid' => @shell_exec('pgrep -a node 2>/dev/null'),
    'mem' => @shell_exec('free -m 2>/dev/null | head -2'),
]);
