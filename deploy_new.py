import paramiko
import os
import re

# 1. Atualizar localmente o index.php com os assets corretos do build
def update_index_php():
    dist_html_path = os.path.join("dashboard-new", "dist", "index.html")
    index_php_path = "index.php"
    
    if not os.path.exists(dist_html_path):
        print(f"Erro: {dist_html_path} não encontrado. Execute o build do Vite primeiro.")
        return False
        
    with open(dist_html_path, 'r', encoding='utf-8') as f:
        dist_html = f.read()
        
    # Extrair os tags do Vite dist/index.html
    pattern = r'<(?:link|script)[^>]+(?:href|src)="/assets/[^"]+"[^>]*>(?:</script>)?'
    tags = re.findall(pattern, dist_html)
    
    if not tags:
        print("Erro: Nenhum asset encontrado no dist/index.html.")
        return False
        
    rewritten_tags = []
    for t in tags:
        rewritten_tags.append(t.replace('/assets/', '/assets/dashboard-react/assets/'))
        
    asset_block = "\n    ".join(rewritten_tags)
    
    with open(index_php_path, 'r', encoding='utf-8') as f:
        php_content = f.read()
        
    # Encontrar os delimitadores em index.php
    start_marker = "<!-- React Build Assets -->"
    end_marker = "<!-- React Checkout Chunk Preload -->"
    
    if start_marker not in php_content or end_marker not in php_content:
        print("Erro: Marcadores de assets não encontrados em index.php.")
        return False
        
    pattern_replace = re.compile(
        re.escape(start_marker) + r".*?" + re.escape(end_marker),
        re.DOTALL
    )
    
    replacement = f"{start_marker}\n    {asset_block}\n    \n    {end_marker}"
    updated_content = pattern_replace.sub(replacement, php_content)
    
    # Encontrar o chunk do CheckoutPage localmente
    local_assets_dir = os.path.join("dashboard-new", "dist", "assets")
    checkout_chunk_file = ""
    if os.path.exists(local_assets_dir):
        for file in os.listdir(local_assets_dir):
            if file.startswith("CheckoutPage-") and file.endswith(".js"):
                checkout_chunk_file = f"/assets/dashboard-react/assets/{file}"
                break
                
    if not checkout_chunk_file:
        print("Erro: Chunk do CheckoutPage não encontrado localmente.")
        return False
        
    # Encontrar e substituir o preload do CheckoutPage
    preload_start = "<!-- React Checkout Chunk Preload -->"
    preload_end = "<!-- React Checkout Chunk Preload End -->"
    
    if preload_start not in updated_content or preload_end not in updated_content:
        print("Erro: Marcadores de preload do CheckoutPage não encontrados em index.php.")
        return False
        
    pattern_preload = re.compile(
        re.escape(preload_start) + r".*?" + re.escape(preload_end),
        re.DOTALL
    )
    
    preload_replacement = f"{preload_start}\n    <?php if ($requestPath && strpos($requestPath, '/p/') === 0): ?>\n    <link rel=\"modulepreload\" crossorigin href=\"{checkout_chunk_file}\">\n    <?php endif; ?>\n    {preload_end}"
    updated_content = pattern_preload.sub(preload_replacement, updated_content)
    
    with open(index_php_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)
        
    print("index.php atualizado com sucesso com os novos assets do build!")
    return True

if not update_index_php():
    print("Erro ao atualizar index.php. Abortando deploy.")
    exit(1)

# 2. Conectar via SSH/SFTP e fazer o upload
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Conectando ao servidor...")
c.connect('45.132.157.58', port=65002, username='u853242961', password='Lucastav8012@', look_for_keys=False, allow_agent=False, timeout=30)
sftp = c.open_sftp()

base = '/home/u853242961/domains/pixghost.site/public_html'
dist = 'dashboard-new/dist/assets'

# 2.1 Assets do React
assets_dir = 'dashboard-new/dist/assets'
print("Enviando assets do React...")
uploaded_assets = 0
for f in os.listdir(assets_dir):
    sftp.put(os.path.join(assets_dir, f), f'{base}/assets/dashboard-react/assets/{f}')
    uploaded_assets += 1
print(f"{uploaded_assets} assets do React enviados com sucesso!")

# 2.2 Arquivos PHP/Config Raiz
php_files = [
    'index.php',
    'dashboard.php',
    'get_admin_withdrawals.php',
    'admin_actions.php',
    'dashboard_legacy.php',
    'get_admin_data.php',
    'withdraw.php',
    'telegram_user_bot.php',
    '.htaccess',
    'api.php',
    'get_dashboard_data.php'
]

print("Enviando arquivos raiz (PHP e Config)...")
for f in php_files:
    sftp.put(f, f'{base}/{f}')
    print(f'Uploaded Root File: {f} -> OK')

# 2.3 Arquivos de Autenticação
auth_files = [
    'register.php'
]

print("Enviando arquivos de autenticação...")
for f in auth_files:
    sftp.put(f'auth/{f}', f'{base}/auth/{f}')
    print(f'Uploaded Auth File: {f} -> OK')

# 2.4 Arquivos em includes
includes_files = [
    'TelegramService.php',
    'db.php'
]

print("Enviando arquivos de inclusão...")
for f in includes_files:
    sftp.put(f'includes/{f}', f'{base}/includes/{f}')
    print(f'Uploaded Include: {f} -> OK')

sftp.close()
c.close()
print('\n--- DEPLOY COMPLETO E COM SUCESSO! ---')
