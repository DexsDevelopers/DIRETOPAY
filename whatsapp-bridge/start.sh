#!/bin/bash
# start.sh — Inicia o bridge com limite de memória para evitar crash WASM

export NVM_DIR="/home/u853242961/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Limita o heap do Node.js a 256MB e desativa trap handler do WASM para evitar crash na Hostinger
exec node --disable-wasm-trap-handler --max-old-space-size=256 index.js
