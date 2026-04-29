import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=20)

sftp = c.open_sftp()
sftp.put('sigilopay_webhook.php', '/home/u853242961/domains/pixghost.site/public_html/sigilopay_webhook.php')
print('SFTP OK - webhook corrigido')
sftp.close()

sql = """mysql -u u853242961_johanpix -pLucastav8012@ u853242961_pixgo -e "UPDATE transactions SET status='paid' WHERE id=671 AND status='pending'; SELECT id,status,amount_brl,amount_net_brl FROM transactions WHERE id=671;" 2>&1"""
stdin, stdout, stderr = c.exec_command(sql)
out = stdout.read().decode()
err = stderr.read().decode()
print('SQL OUT:', out)
print('SQL ERR:', err)

# Credit balance if update worked
sql2 = """mysql -u u853242961_johanpix -pLucastav8012@ u853242961_pixgo -e "UPDATE users u JOIN transactions t ON t.user_id=u.id SET u.balance=u.balance+t.amount_net_brl WHERE t.id=671 AND t.status='paid'; SELECT u.id, u.balance FROM users u JOIN transactions t ON t.user_id=u.id WHERE t.id=671;" 2>&1"""
stdin2, stdout2, stderr2 = c.exec_command(sql2)
print('BAL:', stdout2.read().decode())

c.close()
