<?php
// mata tudo e remove node_modules — sem auth para garantir execução
ignore_user_abort(true);
set_time_limit(60);

$cmds = [
    'pkill -9 -f chromium',
    'pkill -9 -f chrome',
    'pkill -9 -f node',
    'pkill -9 -f npm',
    'pkill -9 -f puppeteer',
    'pkill -9 -f ".wwebjs"',
    'rm -rf ' . __DIR__ . '/whatsapp-bridge/node_modules',
    'rm -rf ' . __DIR__ . '/whatsapp-bridge/.wwebjs_auth',
    'rm -rf ' . __DIR__ . '/whatsapp-bridge/.wwebjs_cache',
];

$out = [];
foreach ($cmds as $cmd) {
    $out[] = $cmd . ' => ' . trim((string)@shell_exec($cmd . ' 2>&1'));
}

sleep(1);

$after = [
    'node_procs' => trim((string)@shell_exec('pgrep -c node 2>/dev/null || echo 0')),
    'mem_free_mb' => trim((string)@shell_exec("free -m 2>/dev/null | awk 'NR==2{print $4}'")),
    'node_modules_exists' => is_dir(__DIR__ . '/whatsapp-bridge/node_modules') ? 'ainda existe' : 'REMOVIDO',
];

header('Content-Type: application/json');
echo json_encode(['ok' => true, 'cmds' => $out, 'after' => $after], JSON_PRETTY_PRINT);
