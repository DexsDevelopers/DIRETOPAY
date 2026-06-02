import paramiko, bcrypt

ADMIN_EMAIL = 'admin@diretopay.site'
ADMIN_PASS  = 'Lucastav8012@'
ADMIN_NAME  = 'Admin DiretoPay'

hashed = bcrypt.hashpw(ADMIN_PASS.encode(), bcrypt.gensalt(12)).decode()

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@',
          look_for_keys=False, allow_agent=False, timeout=20)

DB   = 'u853242961_diretopay2'
USER = 'u853242961_diretopay_user'
PASS = 'Lucastav8012@'

query = (
    f"INSERT INTO users (email, password, full_name, status, is_admin) "
    f"VALUES ('{ADMIN_EMAIL}', '{hashed}', '{ADMIN_NAME}', 'approved', 1) "
    f"ON DUPLICATE KEY UPDATE is_admin=1, status='approved', password='{hashed}';"
)

_, o, e = c.exec_command(f'mysql -u {USER} -p{PASS} {DB} -e "{query}" 2>&1')
out = o.read().decode() + e.read().decode()
print('Result:', out or 'OK')

# Confirm
_, o, _ = c.exec_command(f'mysql -u {USER} -p{PASS} {DB} -e "SELECT id, email, full_name, is_admin, status FROM users WHERE is_admin=1;" 2>&1')
print('Admin users:', o.read().decode())

c.close()
