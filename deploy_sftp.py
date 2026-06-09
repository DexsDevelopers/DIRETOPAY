#!/usr/bin/env python3
"""Script de deploy SFTP para DiretoPay."""

import os

import paramiko

HOST = "45.132.157.58"
PORT = 65002
USER = "u853242961"
PASS = "Lucastav8012@"
REMOTE_BASE = "/home/u853242961/domains/diretopay.site/public_html"

LOCAL_BASE = os.path.dirname(os.path.abspath(__file__))

# Detecta automaticamente todos os arquivos do build atual
_assets_dir = os.path.join(LOCAL_BASE, "assets", "dashboard-react")
NEW_ASSETS = (
    [f"assets/dashboard-react/{f}" for f in os.listdir(_assets_dir) if os.path.isfile(os.path.join(_assets_dir, f))]
    + ["index.php"]
)


def main():
    print(f"Conectando a {HOST}:{PORT}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    sftp = ssh.open_sftp()
    print("Conectado!")

    for rel_path in NEW_ASSETS:
        local_path = os.path.join(LOCAL_BASE, rel_path.replace("/", os.sep))
        remote_path = f"{REMOTE_BASE}/{rel_path}"
        print(f"  Enviando {rel_path}...")
        # Garante que o diretório remoto existe
        remote_dir = remote_path.rsplit("/", 1)[0]
        try:
            sftp.stat(remote_dir)
        except FileNotFoundError:
            sftp.mkdir(remote_dir)
        sftp.put(local_path, remote_path)
        print(f"    OK -> {remote_path}")

    print("\nTodos os arquivos enviados!")

    # Executa git fetch + reset no servidor
    print("\nExecutando git fetch + reset no servidor...")
    cmd = f"cd {REMOTE_BASE} && git fetch origin main && git reset --hard origin/main"
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=60)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out:
        print("STDOUT:", out)
    if err:
        print("STDERR:", err)
    print("Deploy servidor concluído!")

    sftp.close()
    ssh.close()


if __name__ == "__main__":
    main()
