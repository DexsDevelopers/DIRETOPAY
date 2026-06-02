import paramiko
import os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)
sftp = c.open_sftp()

base = '/home/u853242961/domains/diretopay.site/public_html'
dist = 'dashboard-new/dist/assets'

print("Enviando todos os assets do React (build v18)...")
count = 0
for f in os.listdir(dist):
    local = os.path.join(dist, f)
    if os.path.isfile(local):
        sftp.put(local, f'{base}/assets/dashboard-react/{f}')
        count += 1
        print(f'  {f} -> OK')
print(f"{count} assets enviados.")

sftp.put('index.php', f'{base}/index.php')
print('index.php -> OK')

sftp.close()
c.close()
print('\n--- BUILD v18 DEPLOY COMPLETO! ---')
