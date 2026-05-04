import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)

base = '/home/u853242961/domains/pixghost.site/public_html'

# Get DB credentials from config.php on server
s, o, e = c.exec_command(f'grep -E "DB_|define" {base}/config.php 2>/dev/null | head -10')
creds = o.read().decode()
print("=== config.php DB creds ===")
print(creds)

# Also check what checkout the user has - test the actual slug "test3e"
s2, o2, e2 = c.exec_command(f'curl -si -X GET "https://pixghost.site/get_checkout_data.php?slug=test3e" 2>/dev/null | head -c 500')
print("=== get_checkout_data slug=test3e ===")
print(o2.read().decode())

c.close()
