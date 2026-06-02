import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)
sftp = c.open_sftp()

base = '/home/u853242961/domains/diretopay.site/public_html'

files = [
    ('telegram_admin_bot.php',          f'{base}/telegram_admin_bot.php'),
    ('includes/TelegramService.php',    f'{base}/includes/TelegramService.php'),
    ('webhook.php',                     f'{base}/webhook.php'),
    ('auth/register.php',               f'{base}/auth/register.php'),
]

for local, remote in files:
    sftp.put(local, remote)
    print(f'  {local} -> OK')

sftp.close()
c.close()
print('\n--- DEPLOY TELEGRAM COMPLETO! ---')
