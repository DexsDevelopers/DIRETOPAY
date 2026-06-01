@echo off
set PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files\Git\cmd;%APPDATA%\npm
set PM2_HOME=C:\Users\barbo\.pm2
cd /d "d:\TESTE API PIX GO\whatsapp-bridge"
pm2 start ecosystem.config.js
pm2 save
echo.
echo ✅ WhatsApp Bridge iniciado!
echo Acesse: http://127.0.0.1:3001/status
pause
