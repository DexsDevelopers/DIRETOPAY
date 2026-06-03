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


def main():
    transport = paramiko.Transport((HOST, PORT))
    transport.connect(username=USER, password=PASS)
    sftp = paramiko.SFTPClient.from_transport(transport)

    # List remote files
    print("Listando arquivos remotos em", REMOTE_ASSETS)
    try:
        remote_files = set(sftp.listdir(REMOTE_ASSETS))
    except FileNotFoundError:
        remote_files = set()
        print("Diretório remoto não existe, será criado implicitamente")

    # List local files
    local_files = set(os.listdir(LOCAL_ASSETS))

    # New files = local files that don't exist remotely
    new_files = sorted(local_files - remote_files)

    print(f"\nArquivos novos a enviar ({len(new_files)}):")
    for f in new_files:
        print(f"  + {f}")

    uploaded = []

    # Upload new asset files
    for filename in new_files:
        local_path = os.path.join(LOCAL_ASSETS, filename)
        remote_path = REMOTE_ASSETS + "/" + filename
        print(f"Enviando: {filename} ...", end=" ", flush=True)
        sftp.put(local_path, remote_path)
        print("OK")
        uploaded.append(filename)

    # Always upload index.php
    print(f"\nEnviando index.php (sempre) ...", end=" ", flush=True)
    sftp.put(LOCAL_INDEX, REMOTE_INDEX)
    print("OK")
    uploaded.append("index.php")

    sftp.close()
    transport.close()

    print(f"\n=== Upload concluído ===")
    print(f"Total de arquivos enviados: {len(uploaded)}")
    for f in uploaded:
        print(f"  ✓ {f}")


if __name__ == "__main__":
    main()
