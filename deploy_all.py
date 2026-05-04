import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)
sftp = c.open_sftp()

base = '/home/u853242961/domains/pixghost.site/public_html'
dist = 'dashboard-new/dist/assets'

# New JS main file + PHP fixes
files_js = [
    'index-DFYlghTH.js',
    'index-DrOYxgbL.css',
    'rolldown-runtime-WehaI0Q3.js',
    'vendor-react-CIFpnPib.js',
    'vendor-lucide-owoi_Ylx.js',
    'vendor-motion-BKEh_tME.js',
    'vendor-charts-He-U0hDw.js',
]
for f in files_js:
    sftp.put(f'{dist}/{f}', f'{base}/assets/dashboard-react/{f}')
    print(f'{f} uploaded: OK')

sftp.put('index.php', f'{base}/index.php')
print('index.php uploaded: OK')

sftp.put('process_checkout.php', f'{base}/process_checkout.php')
print('process_checkout.php uploaded: OK')

sftp.close()
c.close()
print('Deploy completo!')
