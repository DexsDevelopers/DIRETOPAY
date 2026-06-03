#!/usr/bin/env python3
"""Deploy script: uploads new assets + index.php via SFTP using paramiko."""

import os
import sys

import paramiko

HOST = "45.132.157.58"
PORT = 65002
USER = "u853242961"
PASS = "Lucastav8012@"
REMOTE_BASE = "/home/u853242961/domains/diretopay.site/public_html"

LOCAL_BASE = os.path.dirname(os.path.abspath(__file__))

NEW_ASSETS = [
    "BankAccountsPage-C2IprMA9.js",
    "BeneficiosPage-DMHGoRvB.js",
    "CheckoutPage-I6dqYXOI.js",
    "DashboardHomePage-DBO9c-5Z.js",
    "FaqPage-D9BxM54H.js",
    "index-CoM21xwM.js",
    "LandingPage-By9pUhs1.js",
    "ParceirosPage-Nw5Acwyq.js",
    "PixPage-C7r7C2TL.js",
    "PremiacoesPublicPage-7Ec5aOR0.js",
    "PublicLayout-CZjkce8e.js",
    "ReportsPage-CLx4vKyw.js",
    "SalesPage-DndGuz_Z.js",
    "SettingsPage-CG45hhNq.js",
    "WithdrawalsPage-Bnux7HzN.js",
]


def main():
    print(f"Connecting to {HOST}:{PORT} as {USER}...")
    transport = paramiko.Transport((HOST, PORT))
    transport.connect(username=USER, password=PASS)
    sftp = paramiko.SFTPClient.from_transport(transport)
    print("Connected OK.")

    uploaded = []
    failed = []

    # Upload new assets
    remote_assets = f"{REMOTE_BASE}/assets/dashboard-react"
    for fname in NEW_ASSETS:
        local_path = os.path.join(LOCAL_BASE, "assets", "dashboard-react", fname)
        remote_path = f"{remote_assets}/{fname}"
        try:
            sftp.put(local_path, remote_path)
            print(f"  [OK] assets/dashboard-react/{fname}")
            uploaded.append(fname)
        except Exception as e:
            print(f"  [FAIL] {fname}: {e}")
            failed.append(fname)

    # Always upload index.php
    local_index = os.path.join(LOCAL_BASE, "index.php")
    remote_index = f"{REMOTE_BASE}/index.php"
    try:
        sftp.put(local_index, remote_index)
        print(f"  [OK] index.php")
        uploaded.append("index.php")
    except Exception as e:
        print(f"  [FAIL] index.php: {e}")
        failed.append("index.php")

    sftp.close()
    transport.close()

    print(f"\n=== SFTP DONE ===")
    print(f"Uploaded ({len(uploaded)}): {uploaded}")
    if failed:
        print(f"Failed  ({len(failed)}): {failed}")
        sys.exit(1)
    else:
        print("All files uploaded successfully.")


if __name__ == "__main__":
    main()
