#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import time

import paramiko

SSH_HOST = "45.132.157.58"
SSH_PORT = 65002
SSH_USER = "u853242961"
SSH_PASS = "Lucastav8012@"
REMOTE_PATH = "/home/u853242961/domains/diretopay.site/public_html"

try:
    print("[*] Conectando ao servidor SSH...")
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

    print("[+] Conectado com sucesso!")

    # Executar git pull
    print("[*] Executando git pull...")
    stdin, stdout, stderr = client.exec_command(
        f"cd {REMOTE_PATH} && git pull origin main"
    )

    output = stdout.read().decode("utf-8", errors="ignore")
    error = stderr.read().decode("utf-8", errors="ignore")

    print("\n--- GIT PULL OUTPUT ---")
    print(output)
    if error:
        print("\n--- ERRORS ---")
        print(error)

    # Verificar se há mudanças que precisam de build
    if "dashboard-new" in output or "index.php" in output:
        print(
            "\n[*] Detectadas mudancas no React. Nao e necessario fazer build no servidor."
        )
        print("[*] Os arquivos compilados ja estao em assets/dashboard-react/")

    print("\n[+] Deploy concluido com sucesso!")
    print("[*] Acesse https://diretopay.site para verificar")

    client.close()

except Exception as e:
    print(f"[!] ERRO: {e}")
    import traceback

    traceback.print_exc()
