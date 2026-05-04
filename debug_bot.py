import paramiko, time

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=20)

base = '/home/u853242961/domains/pixghost.site/public_html'

# 1. Últimas linhas do bot_errors.log
stdin, stdout, _ = c.exec_command(f'tail -30 {base}/bot_errors.log 2>&1')
print('=== bot_errors.log ===')
print(stdout.read().decode())

# 2. Testar se pixgo.org API responde (timeout 5s)
stdin2, stdout2, _ = c.exec_command(
    'curl -s --max-time 5 -o /dev/null -w "%{http_code} %{time_total}s" '
    '-X POST https://pixgo.org/api/v1/payment/create '
    '-H "X-API-Key: INVALID_TEST" -H "Content-Type: application/json" '
    '-d \'{"amount":10}\' 2>&1'
)
print('\n=== Teste pixgo.org API ===')
print(stdout2.read().decode())

# 3. Verificar se pixgo_enabled está ativo no banco
stdin3, stdout3, _ = c.exec_command(
    'mysql -u u853242961_johan71 -pLucastav8012@ u853242961_pixanonimo -e '
    '"SELECT stat_key, stat_value FROM settings WHERE stat_key IN (\'pixgo_enabled\', \'sigilopay_enabled\');" 2>/dev/null || '
    'mysql -u u853242961_johan71 -pLucastav8012@ u853242961_pixanonimo -e '
    '"SELECT * FROM settings WHERE stat_key LIKE \'%enabled%\';" 2>&1'
)
print('\n=== Gateway settings ===')
print(stdout3.read().decode())

c.close()
