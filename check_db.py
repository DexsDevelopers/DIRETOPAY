import paramiko, hashlib, os

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@',
          look_for_keys=False, allow_agent=False, timeout=20)

DB = 'u853242961_diretopay2'
USER = 'u853242961_diretopay_user'
PASS = 'Lucastav8012@'

def sql(query):
    _, o, e = c.exec_command(f'mysql -u {USER} -p{PASS} {DB} -e "{query}" 2>&1')
    return o.read().decode() + e.read().decode()

print('=== USERS TABLE ===')
print(sql('DESCRIBE users;'))

c.close()
