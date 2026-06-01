const { Client } = require('ssh2');

const conn = new Client();
const phpCode = `
try {
  require_once "/home/u853242961/domains/pixghost.site/public_html/includes/db.php";
  
  echo "=== SETTINGS WA ===\n";
  $settings = $pdo->query("SELECT * FROM settings WHERE \`key\` LIKE 'wa%' OR \`key\` LIKE 'whatsapp%'")->fetchAll(PDO::FETCH_ASSOC);
  print_r($settings);
  
  echo "\n=== ÚLTIMO USUÁRIO E SEU WHATSAPP ===\n";
  $user = $pdo->query("SELECT id, email, whatsapp, preferred_nominal FROM users ORDER BY id DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
  print_r($user);
  
  echo "\n=== ÚLTIMOS LOGS DE ERRO DO WHATSAPP ===\n";
  $logPath = "/home/u853242961/domains/pixghost.site/public_html/logs/system.log";
  if (file_exists($logPath)) {
      $lines = file($logPath);
      $lastLines = array_slice($lines, -40);
      foreach ($lastLines as $l) {
          if (stripos($l, 'whatsapp') !== false || stripos($l, 'error') !== false) {
              echo $l;
          }
      }
  } else {
      echo "Arquivo de log não encontrado em $logPath\n";
  }

} catch (Exception $e) {
  echo "Error: " . $e->getMessage() . "\n";
}
`;

const cmd = `php -r '${phpCode.replace(/'/g, "'\\''")}'`;

console.log('Connecting to Hostinger via SSH to verify WhatsApp configuration and logs...');
conn.on('ready', () => {
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '45.132.157.58',
  port: 65002,
  username: 'u853242961',
  password: 'Lucastav8012@',
  readyTimeout: 30000
});
