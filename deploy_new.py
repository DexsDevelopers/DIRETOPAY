import paramiko
import os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)
sftp = c.open_sftp()

base = '/home/u853242961/domains/pixghost.site/public_html'
dist = 'dashboard-new/dist/assets'

# 1. Assets do React
assets_dir = 'dashboard-new/dist/assets'
for f in os.listdir(assets_dir):
    sftp.put(os.path.join(assets_dir, f), f'{base}/assets/dashboard-react/assets/{f}')
    print(f'Uploaded Asset: {f} -> OK')

# 2. Arquivos PHP Raiz
php_files = [
    'index.php',
    'dashboard.php',
    'get_admin_withdrawals.php',
    'admin_actions.php',
    'dashboard_legacy.php',
    'get_admin_data.php',
    'withdraw.php',
    'telegram_user_bot.php'
]

for f in php_files:
    sftp.put(f, f'{base}/{f}')
    print(f'Uploaded PHP: {f} -> OK')

# 3. Arquivos em includes
includes_files = [
    'TelegramService.php',
    'db.php'
]

for f in includes_files:
    sftp.put(f'includes/{f}', f'{base}/includes/{f}')
    print(f'Uploaded Include: {f} -> OK')

sftp.close()
c.close()
print('\n--- DEPLOY COMPLETO E SUCESSO! ---')
