#!/bin/bash
# keep_alive.sh — Monitora as instâncias e as reinicia de forma limpa se necessário

export NVM_DIR="/home/u853242961/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Pega as portas cadastradas no banco de dados (da coluna bridge_url)
PORTS=$(php -r '
  try {
    ob_start();
    require_once "/home/u853242961/domains/pixghost.site/public_html/includes/db.php";
    ob_clean();
    
    $insts = $pdo->query("SELECT bridge_url FROM whatsapp_instances WHERE is_active = 1")->fetchAll(PDO::FETCH_COLUMN);
    $out = [];
    foreach ($insts as $url) {
      if (preg_match("/:([0-9]+)/", $url, $m)) {
        $out[] = $m[1];
      }
    }
    echo implode(" ", $out);
  } catch (Exception $e) {}
')

# Se não pegou nenhuma porta, usa a porta padrão 3001
if [ -z "$PORTS" ]; then
  PORTS="3001"
fi

echo "Verificando as seguintes portas do WhatsApp Bridge: $PORTS"

for PORT in $PORTS; do
  if [ -z "$PORT" ]; then
    continue
  fi

  # Cria um diretório de lock específico para esta porta para evitar execuções concorrentes
  LOCKDIR="/home/u853242961/domains/pixghost.site/public_html/whatsapp-bridge/keep_alive_${PORT}.lock"
  if ! mkdir "$LOCKDIR" 2>/dev/null; then
      echo "Instância do keep_alive.sh para a porta $PORT já está em execução. Pulando..."
      continue
  fi
  trap 'rm -rf "$LOCKDIR"' EXIT

  # Tenta até 3 vezes verificar se o serviço está respondendo, com timeout de 8 segundos por tentativa
  ONLINE=0
  for ATTEMPT in {1..3}; do
      curl -s --max-time 8 --connect-timeout 4 "http://127.0.0.1:$PORT/status" > /dev/null
      STATUS=$?
      if [ $STATUS -eq 0 ]; then
          ONLINE=1
          break
      fi
      echo "Tentativa $ATTEMPT falhou (curl status: $STATUS) na porta $PORT. Aguardando 2s..."
      sleep 2
  done

  if [ $ONLINE -eq 0 ]; then
      echo "Instância do WhatsApp Bridge na porta $PORT está offline após 3 tentativas. Verificando no PM2..."
      
      if pm2 list | grep -q "wa-bridge-$PORT"; then
          echo "Processo existe no PM2. Reiniciando de forma limpa (stop -> sleep -> start)..."
          pm2 stop "wa-bridge-$PORT"
          sleep 3
          pm2 start "wa-bridge-$PORT"
      else
          echo "Processo NÃO existe no PM2. Registrando e iniciando..."
          if [ "$PORT" = "3002" ]; then
              cd /home/u853242961/domains/pixghost.site/public_html/whatsapp-bridge-3002
          else
              cd /home/u853242961/domains/pixghost.site/public_html/whatsapp-bridge
          fi
          pm2 start start.sh --name "wa-bridge-$PORT"
          pm2 save
      fi
  else
      echo "Instância do WhatsApp Bridge na porta $PORT está online e saudável."
  fi

  # Remove o lock da porta atual
  rm -rf "$LOCKDIR"
done

