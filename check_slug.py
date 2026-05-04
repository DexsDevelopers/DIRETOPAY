import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=20)

sql = "mysql -u u853242961_johanpix -pLucastav8012@ u853242961_pixgo -e \"SHOW TABLES;\" 2>&1"
stdin, stdout, stderr = c.exec_command(sql)
print('TABLES:', stdout.read().decode())

sql2 = "mysql -u u853242961_johanpix -pLucastav8012@ u853242961_pixgo -e \"DESCRIBE checkouts;\" 2>&1"
stdin2, stdout2, stderr2 = c.exec_command(sql2)
print('CHECKOUTS:', stdout2.read().decode())

sql3 = "mysql -u u853242961_johanpix -pLucastav8012@ u853242961_pixgo -e \"SELECT id, title, slug, active FROM checkouts WHERE slug LIKE '%cursonf%' LIMIT 5;\" 2>&1"
stdin3, stdout3, stderr3 = c.exec_command(sql3)
print('CHECKOUT ROW:', stdout3.read().decode())

c.close()
