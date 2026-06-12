#!/usr/bin/env python3
"""
deploy_dashboard.py
Copia o build do React para assets/dashboard-react/
e atualiza os hashes no index.php automaticamente.
"""

import os
import re
import shutil
import subprocess
import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(ROOT, "dashboard-new", "dist")
DEST_DIR = os.path.join(ROOT, "assets", "dashboard-react")
DIST_HTML = os.path.join(ROOT, "dashboard-new", "dist", "index.html")
INDEX_PHP = os.path.join(ROOT, "index.php")
DIST_PUB = os.path.join(ROOT, "dashboard-new", "dist")

# ── 1. Build ────────────────────────────────────────────────────────────────
print("▶ Building React...")
r = subprocess.run(
    ["npm", "run", "build"], cwd=os.path.join(ROOT, "dashboard-new"), shell=True
)
if r.returncode != 0:
    sys.exit("Build falhou!")
print("✓ Build OK")

# ── 2. Copy favicon.ico ─────────────────────────────────────────────────────
favicon_src = os.path.join(DIST_PUB, "favicon.ico")
favicon_dst_root = os.path.join(ROOT, "favicon.ico")
if os.path.exists(favicon_src):
    shutil.copy2(favicon_src, favicon_dst_root)
    print("✓ favicon.ico → raiz")

# ── 3. Copy assets to assets/dashboard-react/ ───────────────────────────────
print(f"▶ Copiando assets → {DEST_DIR}")
os.makedirs(DEST_DIR, exist_ok=True)
copied = 0
for fname in os.listdir(DIST_DIR):
    if fname in ["index.html", "favicon.ico"]:
        continue
    src = os.path.join(DIST_DIR, fname)
    dst = os.path.join(DEST_DIR, fname)
    if os.path.isfile(src):
        shutil.copy2(src, dst)
        copied += 1
print(f"✓ {copied} arquivos copiados")

# ── 4. Parse new hashes from dist/index.html ────────────────────────────────
print("▶ Lendo hashes do novo build...")
with open(DIST_HTML, encoding="utf-8") as f:
    html = f.read()


def extract(pattern):
    m = re.search(pattern, html)
    return m.group(1) if m else None


new_main_js = extract(r'src="[^"]*/(index-[^"]+\.js)"')
new_main_css = extract(r'href="[^"]*/(index-[^"]+\.css)"')
new_icons = extract(r'href="[^"]*/(vendor-icons-[^"]+\.js)"')
new_motion = extract(r'href="[^"]*/(vendor-motion-[^"]+\.js)"')
new_router = extract(r'href="[^"]*/(vendor-router-[^"]+\.js)"')
new_charts = extract(r'href="[^"]*/(vendor-charts-[^"]+\.js)"')
new_react = extract(r'href="[^"]*/(vendor-react-[^"]+\.js)"')
new_runtime = extract(r'href="[^"]*/(rolldown-runtime-[^"]+\.js)"')
new_utils = extract(r'href="[^"]*/(utils-[^"]+\.js)"')

# Extract checkout page chunk dynamically
checkout_file = None
for fname in os.listdir(DIST_DIR):
    if fname.startswith("CheckoutPage-") and fname.endswith(".js"):
        checkout_file = fname
        break

print(f"  JS:      {new_main_js}")
print(f"  CSS:     {new_main_css}")
print(f"  Icons:   {new_icons}")
print(f"  Motion:  {new_motion}")
print(f"  Router:  {new_router}")
print(f"  Charts:  {new_charts}")
print(f"  React:   {new_react}")
print(f"  Runtime: {new_runtime}")
print(f"  Utils:   {new_utils}")
print(f"  Checkout:{checkout_file}")

# ── 5. Bump version number in index.php ─────────────────────────────────────
with open(INDEX_PHP, encoding="utf-8") as f:
    php = f.read()

# Extract current version number
vm = re.search(r"\?v=(\d+)", php)
old_v = int(vm.group(1)) if vm else 18
new_v = old_v + 1

# Replace the React Build Assets block
old_block = re.search(
    r"<!-- React Build Assets -->(.*?)<!-- React Checkout Chunk Preload -->",
    php,
    re.DOTALL,
)
if not old_block:
    sys.exit("Não encontrei o bloco <!-- React Build Assets --> no index.php")

new_block = f"""<!-- React Build Assets -->
    <script type="module" crossorigin src="/assets/dashboard-react/{new_main_js}"></script>
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_runtime}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_charts}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_router}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_motion}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_icons}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_react}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_utils}">
    <link rel="stylesheet" crossorigin href="/assets/dashboard-react/{new_main_css}">

    <!-- React Checkout Chunk Preload -->"""

php_new = php[: old_block.start()] + new_block + php[old_block.end() :]

# Replace the React Checkout Chunk Preload block
checkout_block = re.search(
    r"<!-- React Checkout Chunk Preload -->(.*?)<!-- React Checkout Chunk Preload End -->",
    php_new,
    re.DOTALL,
)
if checkout_block and checkout_file:
    new_checkout_block = f"""<!-- React Checkout Chunk Preload -->
    <?php if ($requestPath && strpos($requestPath, '/p/') === 0): ?>
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{checkout_file}">
    <?php endif; ?>
    <!-- React Checkout Chunk Preload End -->"""
    php_new = php_new[: checkout_block.start()] + new_checkout_block + php_new[checkout_block.end() :]

# Also update favicon reference in index.php
php_new = re.sub(
    r'href="/assets/dashboard-react/favicon\.svg"', 'href="/favicon.ico"', php_new
)
php_new = re.sub(
    r'<link rel="icon" type="image/svg\+xml" href="/assets/dashboard-react/favicon\.svg"[^>]*/?>',
    '<link rel="icon" type="image/x-icon" href="/favicon.ico" />\n    <link rel="shortcut icon" href="/favicon.ico" />',
    php_new,
)
php_new = re.sub(
    r'<link rel="apple-touch-icon" href="/assets/dashboard-react/favicon\.svg"[^>]*/?>',
    '<link rel="apple-touch-icon" href="/favicon.ico" />',
    php_new,
)

with open(INDEX_PHP, "w", encoding="utf-8") as f:
    f.write(php_new)
print(f"✓ index.php atualizado (v{old_v} → v{new_v})")

# ── 6. Git add + commit + push ───────────────────────────────────────────────
print("▶ Git push...")
subprocess.run(["git", "add", "-A"], cwd=ROOT, shell=True)
subprocess.run(
    ["git", "commit", "-m", f"deploy: dashboard v{new_v} — React build sync"],
    cwd=ROOT,
    shell=True,
)
git_push_res = subprocess.run(["git", "push", "origin", "main"], cwd=ROOT, shell=True)
if git_push_res.returncode == 0:
    print("✓ Git push OK")
else:
    print("⚠️  Push falhou — verifique suas credenciais git")

# ── 7. SFTP upload to server ─────────────────────────────────────────────────
print("▶ Enviando para o servidor via SFTP...")
try:
    import paramiko

    SSH_HOST = "45.132.157.58"
    SSH_PORT = 65002
    SSH_USER = "u853242961"
    SSH_PASS = "Lucastav8012@"
    REMOTE_BASE = "/home/u853242961/domains/diretopay.site/public_html"

    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(
        SSH_HOST,
        port=SSH_PORT,
        username=SSH_USER,
        password=SSH_PASS,
        look_for_keys=False,
        allow_agent=False,
        timeout=30,
    )
    sftp = c.open_sftp()

    # Upload only NEW asset files (that don't yet exist on server)
    try:
        remote_files = set(sftp.listdir(f"{REMOTE_BASE}/assets/dashboard-react"))
    except Exception:
        remote_files = set()

    uploaded = 0
    for fname in os.listdir(DEST_DIR):
        if fname not in remote_files:
            local = os.path.join(DEST_DIR, fname)
            if os.path.isfile(local):
                sftp.put(local, f"{REMOTE_BASE}/assets/dashboard-react/{fname}")
                uploaded += 1

    # Always upload index.php and favicon.ico
    sftp.put(INDEX_PHP, f"{REMOTE_BASE}/index.php")
    # Verify index.php was actually updated on server
    stdin, stdout, stderr = c.exec_command(f'grep -m1 "src=" {REMOTE_BASE}/index.php')
    server_line = stdout.read().decode().strip()
    if f"v={new_v}" in server_line:
        print(f"  index.php → OK (v{new_v} verificado no servidor)")
    else:
        print(f"  ⚠️  index.php pode não ter sido atualizado! Servidor: {server_line}")
        # Force re-upload
        sftp.put(INDEX_PHP, f"{REMOTE_BASE}/index.php")
        print(f"  index.php → re-enviado")

    favicon_root = os.path.join(ROOT, "favicon.ico")
    if os.path.exists(favicon_root):
        sftp.put(favicon_root, f"{REMOTE_BASE}/favicon.ico")
        print(f"  favicon.ico → OK")

    # Force git pull on server to sync with GitHub
    remote_path = REMOTE_BASE
    stdin, stdout, stderr = c.exec_command(
        f"cd {remote_path} && git fetch origin main && git reset --hard origin/main 2>&1"
    )
    pull_result = stdout.read().decode().strip()
    print(
        f"  git pull servidor: {pull_result.splitlines()[-1] if pull_result else 'OK'}"
    )

    sftp.close()
    c.close()
    print(f"✓ {uploaded} novos assets + index.php enviados via SFTP")
    print(f"✅ Deploy v{new_v} concluído! Acesse https://diretopay.site")
except ImportError:
    print("⚠️  paramiko não instalado — pulando SFTP. Instale: pip install paramiko")
except Exception as e:
    import traceback

    print(f"⚠️  Erro SFTP: {e}")
    traceback.print_exc()

