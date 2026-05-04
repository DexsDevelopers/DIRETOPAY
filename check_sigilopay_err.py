import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)

base = '/home/u853242961/domains/pixghost.site/public_html'

# Get last 10 lines of today's log
s, o, e = c.exec_command(f'tail -10 {base}/logs/2026-05-02.log 2>/dev/null')
print("=== LATEST LOGS ===")
print(o.read().decode())

# Test buy_product directly with the vitrine product
s2, o2, e2 = c.exec_command('mysql -u u853242961_johanpix -pLucastav8012@ u853242961_pixgo -se "SELECT id, name, price, status, vitrine FROM products WHERE name LIKE \'%Netflix%\' OR name LIKE \'%netflix%\' LIMIT 5;" 2>/dev/null')
print("=== Netflix products ===")
print(o2.read().decode())

c.close()
