import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)

base = '/home/u853242961/domains/pixghost.site/public_html'

# Latest 20 log entries
s, o, e = c.exec_command(f'tail -20 {base}/logs/2026-05-02.log 2>/dev/null')
print("=== LATEST LOGS ===")
print(o.read().decode())

# Test buy_product directly with a real product from cursonf
s2, o2, e2 = c.exec_command('mysql -u u853242961_johanpix -pLucastav8012@ u853242961_pixgo -se "SELECT p.id, p.name, p.slug, p.status, p.vitrine, p.price FROM products p WHERE p.slug=\'cursonf\' LIMIT 1;" 2>/dev/null')
print("=== Product: cursonf ===")
print(o2.read().decode())

# Also check produto.php to see how it queries the product (different from buy_product.php)
s3, o3, e3 = c.exec_command(f'grep -n "vitrine\|status.*active\|WHERE p.id\|WHERE p.slug" {base}/produto.php 2>/dev/null | head -10')
print("=== produto.php product query ===")
print(o3.read().decode())

c.close()
