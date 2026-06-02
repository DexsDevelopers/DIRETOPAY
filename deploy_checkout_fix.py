import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)
sftp = c.open_sftp()

base = '/home/u853242961/domains/diretopay.site/public_html'
sftp.put('process_checkout.php', f'{base}/process_checkout.php')
print('process_checkout.php uploaded: OK')

sftp.close()
c.close()
print('Deploy completo!')
