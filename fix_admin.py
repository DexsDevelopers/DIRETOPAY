import paramiko, bcrypt

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@',
          look_for_keys=False, allow_agent=False, timeout=20)

DB = 'u853242961_diretopay2'
U  = 'u853242961_diretopay_user'
P  = 'Lucastav8012@'

def sql(q):
    _, o, _ = c.exec_command(f'mysql -u {U} -p{P} {DB} -e "{q}" 2>&1')
    return o.read().decode()

# Show current admin password hash
print('Current hash:')
print(sql('SELECT id, email, password FROM users WHERE email="admin@diretopay.site";'))

# Generate fresh bcrypt hash via PHP directly on server (guarantees compatibility)
passwd = 'Lucastav8012@'
_, o, _ = c.exec_command(f'php -r "echo password_hash(\\"{passwd}\\", PASSWORD_DEFAULT);"')
php_hash = o.read().decode().strip()
print('PHP hash:', php_hash)

# Update with the PHP-generated hash
update = f'UPDATE users SET password="{php_hash}" WHERE email="admin@diretopay.site";'
result = sql(update)
print('Update result:', result or 'OK')

# Verify
print('Verify hash works:')
_, o, _ = c.exec_command(f'php -r "echo password_verify(\\"{passwd}\\", \\"{php_hash}\\") ? \'OK\' : \'FAIL\';"')
print(o.read().decode())

c.close()
