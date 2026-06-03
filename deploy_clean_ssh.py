#!/usr/bin/env python3
# -*- coding: utf-8 -*-
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

    # Limpar assets/dashboard-react/ para evitar conflitos
    print("[*] Limpando assets/dashboard-react/ no servidor...")
    stdin, stdout, stderr = client.exec_command(
        f"cd {REMOTE_PATH} && rm -rf assets/dashboard-react/*.js assets/dashboard-react/*.css"
    )
    stdout.read()
    stderr.read()
    print("[+] Arquivos antigos removidos")

    # Fazer git pull
    print("[*] Executando git pull...")
    stdin, stdout, stderr = client.exec_command(
        f"cd {REMOTE_PATH} && git pull origin main"
    )

    output = stdout.read().decode("utf-8", errors="ignore")
    error = stderr.read().decode("utf-8", errors="ignore")

    print("\n--- GIT PULL OUTPUT ---")
    print(output)
    if error and "error" in error.lower():
        print("\n--- WARNINGS/ERRORS ---")
        print(error)

    print("\n[+] Deploy via SSH concluido com sucesso!")
    print("[*] Acesse https://diretopay.site para verificar")
    print("[*] Nao esqueca de limpar o cache do navegador (Ctrl+Shift+Delete)")

    client.close()

except Exception as e:
    print(f"[!] ERRO: {e}")
    import traceback

    traceback.print_exc()
