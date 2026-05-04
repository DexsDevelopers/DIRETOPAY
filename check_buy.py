import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)

base = '/home/u853242961/domains/pixghost.site/public_html'

# Check if buy_product.php and subscribe.php exist
s, o, e = c.exec_command(f'ls -la {base}/buy_product.php {base}/subscribe.php 2>&1')
print("=== buy_product.php / subscribe.php ===")
print(o.read().decode())

# Check what URL /p/cursonf returns (just headers)
s2, o2, e2 = c.exec_command('curl -si -X POST https://pixghost.site/buy_product.php -H "Content-Type: application/json" -d \'{"product_id":1}\' 2>/dev/null | head -c 500')
print("=== Response from /buy_product.php ===")
print(o2.read().decode())

c.close()
