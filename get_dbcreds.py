import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=20)

stdin, stdout, stderr = c.exec_command('cat /home/u853242961/domains/pixghost.site/public_html/config.php')
print(stdout.read().decode())
c.close()
