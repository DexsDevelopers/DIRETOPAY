#!/usr/bin/env python3
import os

import paramiko

SSH_HOST = "45.132.157.58"
SSH_PORT = 65002
SSH_USER = "u853242961"
SSH_PASS = "Lucastav8012@"
REMOTE_BASE = "/home/u853242961/domains/diretopay.site/public_html"

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

    # Upload enable_ezzybanking.php
    local_file = r"D:\diretopay\enable_ezzybanking.php"
    remote_file = f"{REMOTE_BASE}/enable_ezzybanking.php"

    print(f"[*] Upload de {local_file}...")
    sftp.put(local_file, remote_file)
    print(f"[+] Arquivo enviado para {remote_file}")

    # Verificar
    file_stat = sftp.stat(remote_file)
    print(f"[+] Tamanho no servidor: {file_stat.st_size} bytes")

    sftp.close()
    client.close()

    print("\n[+] Upload concluido com sucesso!")
    print("[*] Acesse: https://diretopay.site/enable_ezzybanking.php")

except Exception as e:
    print(f"[!] ERRO: {e}")
    import traceback

    traceback.print_exc()
