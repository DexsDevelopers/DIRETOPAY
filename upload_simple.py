#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

import paramiko

SSH_HOST = "45.132.157.58"
SSH_PORT = 65002
SSH_USER = "u853242961"
SSH_PASS = "Lucastav8012@"
REMOTE_BASE = "/home/u853242961/domains/diretopay.site/public_html"

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(ROOT, "assets", "dashboard-react")
INDEX_PHP = os.path.join(ROOT, "index.php")

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

    print("Uploading assets...")
    uploaded = 0
    for fname in os.listdir(ASSETS_DIR):
        local_path = os.path.join(ASSETS_DIR, fname)
        if os.path.isfile(local_path):
            remote_path = f"{REMOTE_BASE}/assets/dashboard-react/{fname}"
            sftp.put(local_path, remote_path)
            uploaded += 1

    print(f"OK: {uploaded} arquivos enviados")

    print("Uploading index.php...")
    sftp.put(INDEX_PHP, f"{REMOTE_BASE}/index.php")
    print("OK: index.php enviado")

    sftp.close()
    client.close()
    print("SUCCESS: Upload completo!")

except Exception as e:
    print(f"ERROR: {e}")
