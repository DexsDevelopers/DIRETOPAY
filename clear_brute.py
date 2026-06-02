import paramiko

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

# Find brute force / login attempts table
print('Tables:', sql('SHOW TABLES;'))

# Clear any login_attempts
for table in ['login_attempts', 'brute_force', 'failed_logins']:
    result = sql(f'DELETE FROM {table} WHERE 1;')
    print(f'Cleared {table}:', result or 'OK')

c.close()
print('Done!')
