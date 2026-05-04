import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)

base = '/home/u853242961/domains/pixghost.site/public_html'

# Latest app log
s, o, e = c.exec_command(f'tail -30 {base}/logs/2026-05-02.log')
print("=== APP LOG (tail 30) ===")
print(o.read().decode())

# Test with a real checkout ID - find one
s2, o2, e2 = c.exec_command('mysql -u u853242961 -pLucastav8012@ u853242961_ghost -e "SELECT id,title,active FROM checkouts ORDER BY id DESC LIMIT 5;" 2>/dev/null')
print("=== CHECKOUTS ===")
print(o2.read().decode())

# Test checkout_id=2 (or whichever exists)
s3, o3, e3 = c.exec_command(f'curl -s -X POST https://pixghost.site/process_checkout.php -H "Content-Type: application/json" -d \'{{"checkout_id":2,"customer_name":"Test"}}\' 2>/dev/null | head -c 1000')
print("=== curl checkout_id=2 ===")
print(o3.read().decode())

c.close()
