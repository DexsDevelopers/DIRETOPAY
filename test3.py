import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)

# Find real checkout ID for slug test3e
s, o, e = c.exec_command('mysql -u u853242961_johanpix -pLucastav8012@ u853242961_pixgo -se "SELECT c.id, c.slug, c.user_id, SUM(COALESCE(ci.price,0)) as total FROM checkouts c LEFT JOIN checkout_items ci ON ci.checkout_id=c.id WHERE c.slug=\'test3e\' GROUP BY c.id;" 2>/dev/null')
print("=== Checkout test3e ===")
out = o.read().decode()
print(out if out.strip() else "(not found)")

# Also find ANY checkout with items >= 10
s2, o2, e2 = c.exec_command('mysql -u u853242961_johanpix -pLucastav8012@ u853242961_pixgo -se "SELECT c.id, c.slug, SUM(ci.price) as total FROM checkouts c JOIN checkout_items ci ON ci.checkout_id=c.id WHERE c.active=1 GROUP BY c.id HAVING total>=10 LIMIT 3;" 2>/dev/null')
print("=== Valid checkouts (active, total>=10) ===")
ids_out = o2.read().decode()
print(ids_out if ids_out.strip() else "(none)")

# Test process_checkout with first valid checkout
if ids_out.strip():
    cid = ids_out.strip().split('\n')[0].split('\t')[0]
    print(f"\n=== Full curl test for checkout_id={cid} ===")
    s3, o3, e3 = c.exec_command(f'curl -si -X POST https://pixghost.site/process_checkout.php -H "Content-Type: application/json" -d \'{{"checkout_id":{cid},"customer_name":"Test"}}\' 2>/dev/null | head -c 3000')
    print(o3.read().decode())

c.close()
