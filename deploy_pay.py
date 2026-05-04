import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)
sftp = c.open_sftp()
base = '/home/u853242961/domains/pixghost.site/public_html'
sftp.put('pay.php', f'{base}/pay.php')
print('pay.php uploaded: OK')
sftp.close()
c.close()
print('Deploy completo!')
