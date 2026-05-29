#!/bin/bash
NODE_BIN=/home/u853242961/.nvm/versions/node/v18.20.8/bin
export PATH=$NODE_BIN:$PATH

# Verifica se a porta 3001 está respondendo
curl -s http://127.0.0.1:3001/status > /dev/null
STATUS=$?

if [ $STATUS -ne 0 ]; then
    echo "WhatsApp Bridge está offline (Porta 3001 inativa). Reiniciando..."
    cd /home/u853242961/domains/pixghost.site/public_html/whatsapp-bridge
    bash ./start.sh
else
    echo "WhatsApp Bridge está online e operando normalmente."
fi
