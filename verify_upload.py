#!/usr/bin/env python3
# -*- coding: utf-8 -*-
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

    # Verificar se arquivos foram enviados
    remote_dir = f"{REMOTE_BASE}/assets/dashboard-react"
    files = sftp.listdir(remote_dir)

    print(f"[OK] Total de arquivos no servidor: {len(files)}")

    # Verificar arquivos importantes
    important = [
        "index-Bp76Fpwl.js",
        "BankAccountsPage-BcqfTwcy.js",
        "index-B0WaXstz.css",
    ]
    for fname in important:
        if fname in files:
            print(f"[OK] {fname}")
        else:
            print(f"[FALTANDO] {fname}")

    # Verificar index.php
    index_stat = sftp.stat(f"{REMOTE_BASE}/index.php")
    print(f"[OK] index.php existe (tamanho: {index_stat.st_size} bytes)")

    sftp.close()
    client.close()
    print("\n[SUCESSO] Upload foi bem-sucedido!")

except Exception as e:
    print(f"[ERRO] {e}")
