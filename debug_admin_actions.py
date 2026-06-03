#!/usr/bin/env python3
import paramiko

SSH_HOST = "45.132.157.58"
SSH_PORT = 65002
SSH_USER = "u853242961"
SSH_PASS = "Lucastav8012@"
REMOTE_PATH = "/home/u853242961/domains/diretopay.site/public_html"

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

    # Verificar erro de PHP
    print("[*] Verificando ultimos erros de PHP...")
    stdin, stdout, stderr = client.exec_command(
        "tail -50 /home/u853242961/logs/error_log"
    )
    error_log = stdout.read().decode("utf-8", errors="ignore")

    if error_log.strip():
        print("\n--- ULTIMOS ERROS ---")
        print(error_log)
    else:
        print("Nenhum erro encontrado no log")

    # Verificar se admin_actions.php existe e tem permissao
    print("\n[*] Verificando permissoes do arquivo...")
    stdin, stdout, stderr = client.exec_command(
        f"ls -lah {REMOTE_PATH}/admin_actions.php"
    )
    print(stdout.read().decode("utf-8"))

    client.close()

except Exception as e:
    print(f"[!] ERRO: {e}")
