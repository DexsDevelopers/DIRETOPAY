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

    # Reset hard para limpar todos os arquivos nao rastreados
    print("[*] Fazendo git reset --hard...")
    stdin, stdout, stderr = client.exec_command(f"cd {REMOTE_PATH} && git reset --hard")
    output = stdout.read().decode("utf-8", errors="ignore")
    print(output)

    # Fazer git pull
    print("[*] Executando git pull...")
    stdin, stdout, stderr = client.exec_command(
        f"cd {REMOTE_PATH} && git pull origin main"
    )

    output = stdout.read().decode("utf-8", errors="ignore")
    error = stderr.read().decode("utf-8", errors="ignore")

    print("\n--- GIT PULL OUTPUT ---")
    print(output)

    if "error" in error.lower() and "bashrc" not in error.lower():
        print("\n--- ERRORS ---")
        print(error)

    print("\n[+] Deploy via SSH concluido com sucesso!")
    print("[*] Atualizacoes:")
    print("    - enable_ezzybanking.php criado")
    print("    - admin_actions.php atualizado com get_ezzy_acquirers")
    print("    - BankAccountsPage.jsx com interface de adquirentes")
    print("    - index.php atualizado para v38")
    print("[*] Acesse https://diretopay.site para verificar")
    print("[*] Limpe o cache do navegador (Ctrl+Shift+Delete)")

    client.close()

except Exception as e:
    print(f"[!] ERRO: {e}")
    import traceback

    traceback.print_exc()
