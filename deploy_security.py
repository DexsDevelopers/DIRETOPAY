#!/usr/bin/env python3
import os, sys, paramiko

HOST        = "45.132.157.58"
PORT        = 65002
USER        = "u853242961"
PASS        = "Lucastav8012@"
REMOTE_BASE = "/home/u853242961/domains/diretopay.site/public_html"
LOCAL_BASE  = os.path.dirname(os.path.abspath(__file__))

SECURITY_FILES = [
    "brpix_webhook.php",
    "misticpay_webhook.php",
    "sigilopay_webhook.php",
    "afiliados.php",
    "announcements_api.php",
    "setup_telegram.php",
    "setup_user_bot_webhook.php",
    "withdraw.php",
    ".htaccess",
    "includes/Security.php",
    "includes/db.php",
]

def main():
    print("=== Deploy de Seguranca DiretoPay ===")
    print("Host: %s:%d  User: %s" % (HOST, PORT, USER))
    print("Arquivos: %d\n" % len(SECURITY_FILES))

    transport = paramiko.Transport((HOST, PORT))
    transport.connect(username=USER, password=PASS)
    sftp = paramiko.SFTPClient.from_transport(transport)
    print("Conectado ao servidor OK\n")

    ok = skipped = failed = 0

    for rel_path in SECURITY_FILES:
        local  = os.path.join(LOCAL_BASE, *rel_path.split("/"))
        remote = "%s/%s" % (REMOTE_BASE, rel_path)
        try:
            sftp.put(local, remote)
            print("  [OK]   %s" % rel_path)
            ok += 1
        except FileNotFoundError:
            print("  [SKIP] %s (nao encontrado localmente)" % rel_path)
            skipped += 1
        except Exception as e:
            print("  [FAIL] %s: %s" % (rel_path, e))
            failed += 1

    sftp.close()
    transport.close()

    print("\n" + "="*50)
    print("Enviados : %d" % ok)
    print("Skipped  : %d" % skipped)
    print("Falhou   : %d" % failed)
    print("="*50)

    if failed:
        print("Deploy com erros!")
        sys.exit(1)
    else:
        print("Deploy de seguranca concluido com sucesso!")

if __name__ == "__main__":
    main()
