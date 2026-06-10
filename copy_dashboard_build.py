#!/usr/bin/env python3
"""
copy_dashboard_build.py
Copia o build do React para assets/dashboard-react/
e atualiza index.php
"""

import os
import re
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(ROOT, "dashboard-new", "dist", "assets")
DEST_DIR = os.path.join(ROOT, "assets", "dashboard-react")
DIST_HTML = os.path.join(ROOT, "dashboard-new", "dist", "index.html")
INDEX_PHP = os.path.join(ROOT, "index.php")
DASHBOARD_PHP = os.path.join(ROOT, "dashboard.php")

# 1. Verificar se dist existe
if not os.path.exists(DIST_DIR):
    print(f"❌ Erro: {DIST_DIR} não encontrado!")
    exit(1)

print("▶ Copiando arquivos de build...")

# 2. Limpar arquivos antigos
print("  Limpando arquivos antigos...")
for fname in os.listdir(DEST_DIR):
    fpath = os.path.join(DEST_DIR, fname)
    if os.path.isfile(fpath):
        if (
            fname.startswith("index-")
            or fname.startswith("vendor-")
            or fname.startswith("rolldown-")
            or fname.startswith("utils-")
            or fname.endswith(".css")
            or fname.startswith("Admin")
            or fname.startswith("Bank")
            or fname.startswith("Check")
            or fname.endswith(".jsx")
        ):
            try:
                os.remove(fpath)
            except Exception as e:
                print(f"  ⚠️  Não foi possível remover {fname}: {e}")

# 3. Copiar arquivos novos
print("  Copiando arquivos novos...")
copied = 0
for fname in os.listdir(DIST_DIR):
    src = os.path.join(DIST_DIR, fname)
    dst = os.path.join(DEST_DIR, fname)
    if os.path.isfile(src):
        shutil.copy2(src, dst)
        copied += 1

print(f"✓ {copied} arquivos copiados")

# 4. Parse hashes do novo build
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

if not new_main_js:
    print("❌ Não consegui encontrar os hashes no dist/index.html")
    exit(1)

print(f"  JS:      {new_main_js}")
print(f"  CSS:     {new_main_css}")

# 5. Atualizar index.php
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
    print("❌ Bloco <!-- React Build Assets --> não encontrado!")
    exit(1)

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

# 6. Atualizar dashboard.php também (evita tela preta por assets desatualizados)
print("▶ Atualizando dashboard.php...")
with open(DASHBOARD_PHP, encoding="utf-8") as f:
    db_php = f.read()

# Substitui o bloco de assets no dashboard.php
old_db_block = re.search(
    r"<!-- React Build Assets -->(.*?)<!-- Preload fonts",
    db_php,
    re.DOTALL,
)
if old_db_block:
    new_db_block = f"""<!-- React Build Assets -->
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_runtime}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_charts}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_react}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_motion}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_router}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_icons}?v={new_v}">
    <link rel="modulepreload" crossorigin href="/assets/dashboard-react/{new_utils}?v={new_v}">
    <script type="module" crossorigin src="/assets/dashboard-react/{new_main_js}?v={new_v}"></script>
    <link rel="stylesheet" crossorigin href="/assets/dashboard-react/{new_main_css}?v={new_v}">
    
    <!-- Preload fonts"""

    db_php_new = db_php[: old_db_block.start()] + new_db_block + db_php[old_db_block.end():]
    with open(DASHBOARD_PHP, "w", encoding="utf-8") as f:
        f.write(db_php_new)
    print(f"✓ dashboard.php atualizado (v{new_v})")
else:
    print("⚠️  Bloco <!-- React Build Assets --> não encontrado em dashboard.php — atualize manualmente")

print(f"\n✅ Deploy local concluído com sucesso!")
print(f"Versão: {new_v}")
print(f"\nPróximas etapas:")
print(f"1. Faça upload dos arquivos de {DEST_DIR} para seu servidor")
print(f"2. Faça upload do index.php para seu servidor")
print(f"3. Limpe o cache do navegador (Ctrl+Shift+Delete)")
print(f"4. Acesse https://diretopay.site para verificar")
