import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=20)
sftp = c.open_sftp()
sftp.put('api.php', '/home/u853242961/domains/diretopay.site/public_html/api.php')
print('DiretoPay api.php: OK')
sftp.close()
c.close()
