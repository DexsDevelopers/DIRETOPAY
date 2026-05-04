import paramiko, json
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)

# 1. Read .htaccess
s, o, e = c.exec_command('cat /home/u853242961/domains/pixghost.site/public_html/.htaccess 2>/dev/null')
print("=== .htaccess ===")
print(o.read().decode())

# 2. Check PHP error log
s2, o2, e2 = c.exec_command('tail -30 /home/u853242961/logs/pixghost.site-error_log 2>/dev/null || tail -30 /var/log/apache2/error.log 2>/dev/null || echo NO_PHP_LOG')
print("=== PHP Error Log ===")
print(o2.read().decode())

# 3. Test process_checkout directly
s3, o3, e3 = c.exec_command('curl -s -X POST https://pixghost.site/process_checkout.php -H "Content-Type: application/json" -d \'{"checkout_id":1,"customer_name":"Test"}\' 2>/dev/null | head -c 500')
print("=== Direct curl to process_checkout.php ===")
print(o3.read().decode())

c.close()
