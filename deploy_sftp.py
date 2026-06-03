import os
import sys

import paramiko

HOST = "45.132.157.58"
PORT = 65002
USER = "u853242961"
PASS = "Lucastav8012@"
REMOTE_BASE = "/home/u853242961/domains/diretopay.site/public_html"

LOCAL_ASSETS = r"D:\diretopay\assets\dashboard-react"
REMOTE_ASSETS = REMOTE_BASE + "/assets/dashboard-react"
LOCAL_INDEX = r"D:\diretopay\index.php"
REMOTE_INDEX = REMOTE_BASE + "/index.php"

print(f"Conectando a {HOST}:{PORT}...")
transport = paramiko.Transport((HOST, PORT))
transport.connect(username=USER, password=PASS)
sftp = paramiko.SFTPClient.from_transport(transport)
print("Conectado!")

# Lista arquivos já existentes no servidor
try:
    remote_files = set(sftp.listdir(REMOTE_ASSETS))
    print(f"Arquivos existentes no servidor: {len(remote_files)}")
except FileNotFoundError:
    print(f"Diretório remoto não existe, criando: {REMOTE_ASSETS}")
    sftp.mkdir(REMOTE_ASSETS)
    remote_files = set()

# Upload apenas arquivos novos em assets/dashboard-react/
local_files = os.listdir(LOCAL_ASSETS)
new_files = [f for f in local_files if f not in remote_files]
print(f"\nArquivos locais: {len(local_files)} | Novos para upload: {len(new_files)}")

for fname in new_files:
    local_path = os.path.join(LOCAL_ASSETS, fname)
    remote_path = REMOTE_ASSETS + "/" + fname
    print(f"  [UPLOAD] {fname}")
    sftp.put(local_path, remote_path)

if not new_files:
    print("  Nenhum arquivo novo para enviar em assets/dashboard-react/")

# Sempre faz upload do index.php
print(f"\n[UPLOAD] index.php -> {REMOTE_INDEX}")
sftp.put(LOCAL_INDEX, REMOTE_INDEX)

sftp.close()
transport.close()
print("\nDeploy SFTP concluido com sucesso!")
