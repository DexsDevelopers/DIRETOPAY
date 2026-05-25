module.exports = {
  apps: [{
    name: 'wa-bridge',
    script: '/home/u853242961/domains/pixghost.site/public_html/whatsapp-bridge/index.js',
    interpreter: '/home/u853242961/.nvm/versions/node/v18.20.8/bin/node',
    restart_delay: 8000,
    max_restarts: 10,
    env: {
      WA_SECRET: '',
      WA_PORT:   '3001',
      WA_HOST:   '127.0.0.1',
    }
  }]
};
