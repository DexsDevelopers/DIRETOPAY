import paramiko, os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)
sftp = c.open_sftp()

base = '/home/u853242961/domains/diretopay.site/public_html'
dist = 'dashboard-new/dist/assets'

# Assets React
count = 0
for f in os.listdir(dist):
    local = os.path.join(dist, f)
    if os.path.isfile(local):
        sftp.put(local, f'{base}/assets/dashboard-react/{f}')
        count += 1
print(f"{count} assets enviados.")

# PHP files
for local, remote in [
    ('index.php',       f'{base}/index.php'),
    ('sobre.php',       f'{base}/sobre.php'),
    ('index_legacy.php', f'{base}/index_legacy.php'),
]:
    sftp.put(local, remote)
    print(f'{local} -> OK')

sftp.close()
c.close()
print('\n--- DEPLOY v19 COMPLETO! ---')
