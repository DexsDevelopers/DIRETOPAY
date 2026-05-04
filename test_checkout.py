import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)

# Find real checkout IDs with items
s, o, e = c.exec_command('mysql -u u853242961_ghost -pLucastav8012@ u853242961_ghost -se "SELECT c.id, c.title, c.slug, SUM(ci.price) as total FROM checkouts c LEFT JOIN checkout_items ci ON ci.checkout_id=c.id WHERE c.active=1 GROUP BY c.id ORDER BY c.id DESC LIMIT 5;" 2>/dev/null')
checkouts = o.read().decode()
print("=== Active checkouts with totals ===")
print(checkouts if checkouts.strip() else "(empty or access denied)")

# Try slug-based lookup
s2, o2, e2 = c.exec_command('mysql -u u853242961_ghost -pLucastav8012@ u853242961_ghost -se "SELECT id,slug FROM checkouts WHERE slug LIKE \'%test%\' OR slug LIKE \'%3e%\' LIMIT 5;" 2>/dev/null')
print("=== Slug search ===")
print(o2.read().decode())

# Test with a checkout that has items — get its ID and test
s3, o3, e3 = c.exec_command('mysql -u u853242961_ghost -pLucastav8012@ u853242961_ghost -se "SELECT checkout_id, SUM(price) FROM checkout_items GROUP BY checkout_id HAVING SUM(price)>=10 LIMIT 3;" 2>/dev/null')
valid_ids = o3.read().decode().strip()
print("=== Checkout IDs with >= R$10 items ===")
print(valid_ids if valid_ids else "(empty)")

# Get first valid checkout_id
if valid_ids:
    cid = valid_ids.split('\n')[0].split('\t')[0].strip()
    print(f"\n=== Testing checkout_id={cid} (verbose response) ===")
    s4, o4, e4 = c.exec_command(f'curl -si -X POST https://pixghost.site/process_checkout.php -H "Content-Type: application/json" -d \'{{"checkout_id":{cid},"customer_name":"Test User"}}\' 2>/dev/null | head -c 2000')
    print(o4.read().decode())

c.close()
