#!/usr/bin/env python3
"""
rebuild_dashboard.py
Faz rebuild do React e copia para assets/dashboard-react/
SEM fazer upload para servidor.
"""

import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(ROOT, "dashboard-new", "dist", "assets")
DEST_DIR = os.path.join(ROOT, "assets", "dashboard-react")
DIST_HTML = os.path.join(ROOT, "dashboard-new", "dist", "index.html")
INDEX_PHP = os.path.join(ROOT, "index.php")
DIST_PUB = os.path.join(ROOT, "dashboard-new", "dist")

# 1. Build
print("▶ Building React...")
result = subprocess.run(
    ["npm", "run", "build"], cwd=os.path.join(ROOT, "dashboard-new"), shell=True
)
if result.returncode != 0:
    sys.exit("Build falhou!")
print("✓ Build OK")

# 2. Copy favicon
favicon_src = os.path.join(DIST_PUB, "favicon.ico")
favicon_dst_root = os.path.join(ROOT, "favicon.ico")
if os.path.exists(favicon_src):
    shutil.copy2(favicon_src, favicon_dst_root)
    print("✓ favicon.ico copiado")

# 3. Copy assets
print(f"▶ Copiando assets para {DEST_DIR}")
os.makedirs(DEST_DIR, exist_ok=True)

# Limpar arquivos antigos
for fname in os.listdir(DEST_DIR):
    if (
        fname.startswith("index-")
        or fname.startswith("vendor-")
        or fname.startswith("rolldown-")
        or fname.startswith("utils-")
        or fname.endswith(".css")
    ):
        try:
            os.remove(os.path.join(DEST_DIR, fname))
        except:
            pass

copied = 0
for fname in os.listdir(DIST_DIR):
    src = os.path.join(DIST_DIR, fname)
    dst = os.path.join(DEST_DIR, fname)
    if os.path.isfile(src):
        shutil.copy2(src, dst)
        copied += 1

print(f"✓ {copied} arquivos copiados")

# 4. Parse hashes
print("▶ Lendo hashes do novo build...")
with open(DIST_HTML, encoding="utf-8") as f:
    html = f.read()


def extract(pattern):
    m = re.search(pattern, html)
    return m.group(1) if m else None


new_main_js = extract(r'src="/assets/(index-[^"]+\.js)"')
new_main_css = extract(r'href="/assets/(index-[^"]+\.css)"')
new_icons = extract(r'href="/assets/(vendor-icons-[^"]+\.js)"')
new_motion = extract(r'href="/assets/(vendor-motion-[^"]+\.js)"')
new_router = extract(r'href="/assets/(vendor-router-[^"]+\.js)"')
new_charts = extract(r'href="/assets/(vendor-charts-[^"]+\.js)"')
new_react = extract(r'href="/assets/(vendor-react-[^"]+\.js)"')
new_runtime = extract(r'href="/assets/(rolldown-runtime-[^"]+\.js)"')
new_utils = extract(r'href="/assets/(utils-[^"]+\.js)"')

print(f"  JS:      {new_main_js}")
print(f"  CSS:     {new_main_css}")

# 5. Update index.php
print("▶ Atualizando index.php...")
with open(INDEX_PHP, encoding="utf-8") as f:
    php = f.read()

vm = re.search(r"\?v=(\d+)", php)
old_v = int(vm.group(1)) if vm else 35
new_v = old_v + 1

old_block = re.search(
    r"<!-- React Build Assets -->(.*?)<!-- React Checkout Chunk Preload -->",
    php,
    re.DOTALL,
)
if not old_block:
    sys.exit("Bloco <!-- React Build Assets --> não encontrado!")

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

php_new = php[: old_block.start()] + new_block + php[old_block.end() :]

with open(INDEX_PHP, "w", encoding="utf-8") as f:
    f.write(php_new)

print(f"✓ index.php atualizado (v{old_v} → v{new_v})")
print(f"\n✅ Build concluído com sucesso!")
print(f"Agora você pode fazer upload manual dos arquivos de {DEST_DIR}")
print(f"Versão: {new_v}")
