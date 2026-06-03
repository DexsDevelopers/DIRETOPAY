#!/usr/bin/env python3
"""
upload_to_server.py
Faz upload dos arquivos atualizados para o servidor via SFTP
"""

import os
from pathlib import Path

import paramiko

# Credenciais
SSH_HOST = "45.132.157.58"
SSH_PORT = 65002
SSH_USER = "u853242961"
SSH_PASS = "Lucastav8012@"
REMOTE_BASE = "/home/u853242961/domains/diretopay.site/public_html"

# Diretórios locais
ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(ROOT, "assets", "dashboard-react")
INDEX_PHP = os.path.join(ROOT, "index.php")

print("▶ Conectando ao servidor SSH...")
try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(
        SSH_HOST,
        port=SSH_PORT,
        username=SSH_USER,
        password=SSH_PASS,
        look_for_keys=False,
        allow_agent=False,
        timeout=30,
    )
    sftp = client.open_sftp()
    print("✓ Conectado com sucesso")
except Exception as e:
    print(f"❌ Erro ao conectar: {e}")
    exit(1)

# Upload dos arquivos de assets
print(f"▶ Enviando arquivos de assets...")
uploaded_count = 0

try:
    # Criar diretório remoto se não existir
    try:
        sftp.stat(f"{REMOTE_BASE}/assets/dashboard-react")
    except IOError:
        sftp.mkdir(f"{REMOTE_BASE}/assets")
        sftp.mkdir(f"{REMOTE_BASE}/assets/dashboard-react")

    # Upload cada arquivo
    for fname in os.listdir(ASSETS_DIR):
        local_path = os.path.join(ASSETS_DIR, fname)
        if os.path.isfile(local_path):
            remote_path = f"{REMOTE_BASE}/assets/dashboard-react/{fname}"
            try:
                sftp.put(local_path, remote_path)
                uploaded_count += 1
                print(f"  ✓ {fname}")
            except Exception as e:
                print(f"  ⚠️  Erro ao enviar {fname}: {e}")

    print(f"✓ {uploaded_count} arquivos de assets enviados")
except Exception as e:
    print(f"❌ Erro ao enviar assets: {e}")
    sftp.close()
    client.close()
    exit(1)

# Upload do index.php
print(f"▶ Enviando index.php...")
try:
    sftp.put(INDEX_PHP, f"{REMOTE_BASE}/index.php")
    print("✓ index.php enviado com sucesso")
except Exception as e:
    print(f"❌ Erro ao enviar index.php: {e}")
    sftp.close()
    client.close()
    exit(1)

# Fechar conexão
sftp.close()
client.close()

print(f"\n✅ Upload concluído com sucesso!")
print(f"Versão: 36 (Dashboard v36)")
print(f"Total de arquivos enviados: {uploaded_count + 1}")
print(f"\nAcesse https://diretopay.site para verificar")
print(f"Não esqueça de limpar o cache do navegador (Ctrl+Shift+Delete)")
