import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)

base = '/home/u853242961/domains/pixghost.site/public_html/logs'
for day in ['2026-05-02.log', '2026-05-01.log']:
    s, o, e = c.exec_command(f'cat {base}/{day} 2>/dev/null | tail -80')
    content = o.read().decode()
    if content.strip():
        print(f'=== {day} ===')
        print(content)

c.close()
