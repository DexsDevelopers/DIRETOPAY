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

    # Atualizar credenciais
    php_code = """<?php
require_once 'includes/db.php';

$ci = 'lunarpay_1780436969173';
$cs = '252ccd82b9eadd09f5afe286d919080ca12ad017b1cb212fefa43022ce993679e87c3675408546fe8cf0fa74f89b942c';

$pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('ezzybanking_api_key',?) ON DUPLICATE KEY UPDATE `value`=?")
    ->execute([$ci, $ci]);

$pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('ezzybanking_api_secret',?) ON DUPLICATE KEY UPDATE `value`=?")
    ->execute([$cs, $cs]);

$pdo->prepare("INSERT INTO settings (`key`,`value`) VALUES ('ezzybanking_enabled',?) ON DUPLICATE KEY UPDATE `value`=?")
    ->execute(['1', '1']);

echo "[+] Credenciais Ezzy Banking atualizadas com sucesso!\\n";
?>"""

    print("[*] Atualizando credenciais no banco de dados...")
    cmd = f'cd {REMOTE_PATH} && php -r "{php_code.replace(chr(34), chr(92) + chr(34))}"'

    stdin, stdout, stderr = client.exec_command(cmd)
    output = stdout.read().decode("utf-8", errors="ignore")
    error = stderr.read().decode("utf-8", errors="ignore")

    print(output)
    if error and "bashrc" not in error:
        print("STDERR:", error)

    print("\n[+] Credenciais atualizadas!")
    print("[*] Testando conexão com Ezzy Banking...")

    # Testar conexão
    test_code = """<?php
require_once 'includes/db.php';
require_once 'includes/EzzyBankingService.php';

echo "[*] Testando getBalance()...\\n";
$res = EzzyBankingService::getBalance();

if ($res['ok']) {
    echo "[+] Sucesso! Saldo disponível: R$ " . number_format($res['data']['available_balance'], 2, ',', '.') . "\\n";
    echo "[+] Saldo bloqueado: R$ " . number_format($res['data']['blocked_balance'], 2, ',', '.') . "\\n";
} else {
    echo "[-] Erro: " . ($res['error'] ?? 'desconhecido') . "\\n";
}
?>"""

    stdin, stdout, stderr = client.exec_command(
        f'cd {REMOTE_PATH} && php -r "{test_code.replace(chr(34), chr(92) + chr(34))}"'
    )
    output = stdout.read().decode("utf-8", errors="ignore")
    error = stderr.read().decode("utf-8", errors="ignore")

    print(output)
    if error and "bashrc" not in error:
        print("STDERR:", error)

    print("\n[+] Atualização concluída!")
    print("[*] Recarregue a página no navegador e teste o Ezzy Banking Wallet")
    client.close()

except Exception as e:
    print(f"[!] ERRO: {e}")
    import traceback

    traceback.print_exc()
