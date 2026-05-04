import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=20)

db = 'u853242961_pixgo'
user = 'u853242961_johanpix'
pw = 'Lucastav8012@'

def sql(q):
    stdin, stdout, _ = c.exec_command(f'mysql -u {user} -p{pw} {db} -e "{q}" 2>&1')
    return stdout.read().decode()

print('=== DESCRIBE pixgo_apis ===')
print(sql('DESCRIBE pixgo_apis;'))

print('=== Dados em pixgo_apis ===')
print(sql('SELECT * FROM pixgo_apis LIMIT 5;'))

c.close()
