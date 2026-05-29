#!/bin/bash
NODE_BIN=/home/u853242961/.nvm/versions/node/v18.20.8/bin
export PATH=$NODE_BIN:$PATH
export WA_SECRET=""
export WA_PORT=3001
export WA_HOST=127.0.0.1

# Para processo anterior se existir
pm2 delete wa-bridge 2>/dev/null || true

# Inicia bridge
pm2 start /home/u853242961/domains/pixghost.site/public_html/whatsapp-bridge/index.js \
  --name wa-bridge \
  --interpreter node \
  --env WA_SECRET="" \
  --env WA_PORT=3001 \
  --env WA_HOST=127.0.0.1

pm2 save
pm2 list

