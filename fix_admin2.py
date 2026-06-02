import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@',
          look_for_keys=False, allow_agent=False, timeout=20)

sftp = c.open_sftp()

# Write a PHP script on the server to fix the password
php_script = r"""<?php
require_once __DIR__ . '/config.php';
$pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
$pass = 'Lucastav8012@';
$hash = password_hash($pass, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("UPDATE users SET password=? WHERE email='admin@diretopay.site'");
$stmt->execute([$hash]);
echo "Rows updated: " . $stmt->rowCount() . "\n";
echo "Hash: " . $hash . "\n";
echo "Verify: " . (password_verify($pass, $hash) ? 'OK' : 'FAIL') . "\n";
?>"""

remote_script = '/home/u853242961/domains/diretopay.site/public_html/fix_pw.php'
with sftp.open(remote_script, 'w') as f:
    f.write(php_script)

sftp.close()

# Run it via CLI
_, o, e = c.exec_command(f'php {remote_script} 2>&1')
out = o.read().decode() + e.read().decode()
print(out)

# Delete the script after running
c.exec_command(f'rm {remote_script}')
print('Script removido do servidor.')
c.close()
