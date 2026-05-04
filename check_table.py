import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=20)

base = '/home/u853242961/domains/pixghost.site/public_html'

# Pegar credenciais do banco do config.php
stdin, stdout, _ = c.exec_command(f'grep -E "DB_|define.*DB" {base}/config.php 2>/dev/null | head -20')
print('=== config.php DB ===')
print(stdout.read().decode())

# Pegar DB via includes/db.php
stdin2, stdout2, _ = c.exec_command(f'grep -E "dbname|host|user|pass|DB_NAME|DB_USER|DB_PASS|DB_HOST" {base}/includes/db.php 2>/dev/null | head -20')
print('=== db.php creds ===')
print(stdout2.read().decode())

c.close()
