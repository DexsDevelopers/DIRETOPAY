#!/usr/bin/env python3
"""
deploy_dashboard.py
Copia o build do React para assets/dashboard-react/
e atualiza os hashes no index.php automaticamente.
"""
import os, re, shutil, subprocess, sys

ROOT      = os.path.dirname(os.path.abspath(__file__))
DIST_DIR  = os.path.join(ROOT, 'dashboard-new', 'dist', 'assets')
DEST_DIR  = os.path.join(ROOT, 'assets', 'dashboard-react')
DIST_HTML = os.path.join(ROOT, 'dashboard-new', 'dist', 'index.html')
INDEX_PHP = os.path.join(ROOT, 'index.php')
DIST_PUB  = os.path.join(ROOT, 'dashboard-new', 'dist')

# ── 1. Build ────────────────────────────────────────────────────────────────
print('▶ Building React...')
r = subprocess.run(['npm', 'run', 'build'], cwd=os.path.join(ROOT, 'dashboard-new'), shell=True)
if r.returncode != 0:
    sys.exit('Build falhou!')
print('✓ Build OK')

# ── 2. Copy favicon.ico ─────────────────────────────────────────────────────
favicon_src = os.path.join(DIST_PUB, 'favicon.ico')
favicon_dst_root = os.path.join(ROOT, 'favicon.ico')
if os.path.exists(favicon_src):
    shutil.copy2(favicon_src, favicon_dst_root)
    print('✓ favicon.ico → raiz')

# ── 3. Copy assets to assets/dashboard-react/ ───────────────────────────────
print(f'▶ Copiando assets → {DEST_DIR}')
os.makedirs(DEST_DIR, exist_ok=True)
copied = 0
for fname in os.listdir(DIST_DIR):
    src = os.path.join(DIST_DIR, fname)
    dst = os.path.join(DEST_DIR, fname)
    if os.path.isfile(src):
        shutil.copy2(src, dst)
        copied += 1
print(f'✓ {copied} arquivos copiados')

# ── 4. Parse new hashes from dist/index.html ────────────────────────────────
print('▶ Lendo hashes do novo build...')
with open(DIST_HTML, encoding='utf-8') as f:
    html = f.read()

def extract(pattern):
    m = re.search(pattern, html)
    return m.group(1) if m else None

new_main_js  = extract(r'src="/assets/(index-[^"]+\.js)"')
new_main_css = extract(r'href="/assets/(index-[^"]+\.css)"')
new_icons    = extract(r'href="/assets/(vendor-icons-[^"]+\.js)"')
new_motion   = extract(r'href="/assets/(vendor-motion-[^"]+\.js)"')
new_router   = extract(r'href="/assets/(vendor-router-[^"]+\.js)"')
new_charts   = extract(r'href="/assets/(vendor-charts-[^"]+\.js)"')
new_react    = extract(r'href="/assets/(vendor-react-[^"]+\.js)"')
new_runtime  = extract(r'href="/assets/(rolldown-runtime-[^"]+\.js)"')
new_utils    = extract(r'href="/assets/(utils-[^"]+\.js)"')

print(f'  JS:      {new_main_js}')
print(f'  CSS:     {new_main_css}')
print(f'  Icons:   {new_icons}')
print(f'  Motion:  {new_motion}')
print(f'  Router:  {new_router}')
print(f'  Charts:  {new_charts}')
print(f'  React:   {new_react}')
print(f'  Runtime: {new_runtime}')
print(f'  Utils:   {new_utils}')

# ── 5. Bump version number in index.php ─────────────────────────────────────
with open(INDEX_PHP, encoding='utf-8') as f:
    php = f.read()

# Extract current version number
vm = re.search(r'\?v=(\d+)', php)
old_v = int(vm.group(1)) if vm else 18
new_v = old_v + 1

# Replace the React Build Assets block
old_block = re.search(
    r'<!-- React Build Assets -->(.*?)<!-- React Checkout Chunk Preload -->',
    php, re.DOTALL
)
if not old_block:
    sys.exit('Não encontrei o bloco <!-- React Build Assets --> no index.php')

new_block = f"""<!-- React Build Assets -->
    <script type="module" crossorigin src="/assets/dashboard-react/{new_main_js}?v={new_v}"></script>
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_runtime}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_charts}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_router}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_motion}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_icons}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_react}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_utils}?v={new_v}">
    <link rel="stylesheet" crossorigin href="/assets/dashboard-react/{new_main_css}?v={new_v}">
    
    <!-- React Checkout Chunk Preload -->"""

php_new = php[:old_block.start()] + new_block + php[old_block.end():]

# Also update favicon reference in index.php
php_new = re.sub(
    r'href="/assets/dashboard-react/favicon\.svg"',
    'href="/favicon.ico"',
    php_new
)
php_new = re.sub(
    r'<link rel="icon" type="image/svg\+xml" href="/assets/dashboard-react/favicon\.svg"[^>]*/?>',
    '<link rel="icon" type="image/x-icon" href="/favicon.ico" />\n    <link rel="shortcut icon" href="/favicon.ico" />',
    php_new
)
php_new = re.sub(
    r'<link rel="apple-touch-icon" href="/assets/dashboard-react/favicon\.svg"[^>]*/?>',
    '<link rel="apple-touch-icon" href="/favicon.ico" />',
    php_new
)

with open(INDEX_PHP, 'w', encoding='utf-8') as f:
    f.write(php_new)
print(f'✓ index.php atualizado (v{old_v} → v{new_v})')

# ── 6. Git add + commit + push ───────────────────────────────────────────────
print('▶ Git push...')
subprocess.run(['git', 'add', '-A'], cwd=ROOT, shell=True)
subprocess.run(['git', 'commit', '-m', f'deploy: dashboard v{new_v} — React build sync'], cwd=ROOT, shell=True)
r = subprocess.run(['git', 'push', 'origin', 'main'], cwd=ROOT, shell=True)
if r.returncode == 0:
    print(f'✅ Deploy v{new_v} concluído! Acesse https://diretopay.com.br')
else:
    print('⚠️  Push falhou — verifique suas credenciais git')
