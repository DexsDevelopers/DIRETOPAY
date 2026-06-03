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

    # Verificar se enable_ezzybanking.php existe
    stdin, stdout, stderr = client.exec_command(
        f"ls -lah {REMOTE_PATH}/enable_ezzybanking.php"
    )
    output = stdout.read().decode("utf-8")

    if output.strip():
        print("[OK] Arquivo encontrado:")
        print(output)
    else:
        print("[!] Arquivo NAO encontrado no servidor")
        print("[*] Upload necessario")

    # Verificar conteudo do arquivo
    stdin, stdout, stderr = client.exec_command(
        f"head -5 {REMOTE_PATH}/enable_ezzybanking.php"
    )
    content = stdout.read().decode("utf-8")
    print("\nPrimeiras linhas:")
    print(content)

    client.close()

except Exception as e:
    print(f"ERRO: {e}")
