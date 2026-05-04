import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)

base = '/home/u853242961/domains/pixghost.site/public_html/logs'
s, o, e = c.exec_command(f'tail -100 {base}/2026-05-02.log 2>/dev/null')
print(o.read().decode())

c.close()
