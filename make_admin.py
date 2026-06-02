import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)

q = "SELECT id, full_name, email, is_admin FROM users ORDER BY id ASC LIMIT 5"
stdin, stdout, stderr = c.exec_command(f'mysql -u u853242961_diretopay -pLucastav8012@ u853242961_diretopay -e "{q}" 2>&1')
print(stdout.read().decode())
print(stderr.read().decode())

u = "UPDATE users SET is_admin = 1, status = 'approved' WHERE id = (SELECT id FROM (SELECT id FROM users ORDER BY id ASC LIMIT 1) t)"
stdin2, stdout2, stderr2 = c.exec_command(f'mysql -u u853242961_diretopay -pLucastav8012@ u853242961_diretopay -e "{u}" 2>&1')
print(stdout2.read().decode())
print(stderr2.read().decode())

q2 = "SELECT id, full_name, email, is_admin, status FROM users ORDER BY id ASC LIMIT 5"
stdin3, stdout3, stderr3 = c.exec_command(f'mysql -u u853242961_diretopay -pLucastav8012@ u853242961_diretopay -e "{q2}" 2>&1')
print("Resultado final:")
print(stdout3.read().decode())
c.close()
