if (!global.crypto) {
    try {
        global.crypto = require('crypto').webcrypto;
    } catch (e) {
        console.error('[WA Bridge] Falha ao definir global.crypto:', e.message);
    }
}

const express = require('express');
const qrcode = require('qrcode');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const PORT   = process.env.WA_PORT   || 3001;
const HOST   = process.env.WA_HOST   || '127.0.0.1';
const SECRET = process.env.WA_SECRET || ''; // token opcional
const AUTH_DIR = path.join(__dirname, '.baileys_auth');

// ── Estado global ─────────────────────────────────────────────────────────────
let sock                      = null;
let qrBase64                  = null;   // QR Code em base64 PNG
let isConnected               = false;
let isReady                   = false;
let lastError                 = null;
let phoneNumber               = null;
let makeWASocket              = null;
let useMultiFileAuthState     = null;
let DisconnectReason          = null;
let fetchLatestBaileysVersion = null;

// Logger silencioso para o Baileys
const logger = pino({ level: 'silent' });

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

/** Middleware de autenticação por token */
app.use((req, res, next) => {
    if (!SECRET) return next();
    const token = req.headers['x-bridge-secret'] || req.query.secret || '';
    if (token !== SECRET) {
        return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    next();
});

// ── Inicializa cliente WhatsApp (Baileys) ──────────────────────────────────────
async function initClient() {
    console.log('[WA Bridge] Iniciando Baileys...');
    
    // Importação dinâmica do Baileys para suportar módulo ESM no CommonJS
    if (!makeWASocket) {
        try {
            const baileys = await import('@whiskeysockets/baileys');
            makeWASocket = baileys.default;
            useMultiFileAuthState = baileys.useMultiFileAuthState;
            DisconnectReason = baileys.DisconnectReason;
            fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
        } catch (err) {
            console.error('[WA Bridge] Erro ao carregar biblioteca Baileys:', err.message);
            setTimeout(initClient, 10000);
            return;
        }
    }
    
    try {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        
        // Obtém a versão mais recente do WhatsApp para evitar rejeição (erro 405)
        let version = [2, 3000, 1017588390]; // Versão fallback estável
        try {
            const latest = await fetchLatestBaileysVersion();
            if (latest && latest.version) {
                version = latest.version;
                console.log(`[WA Bridge] Versão do WhatsApp obtida: ${version.join('.')}`);
            }
        } catch (e) {
            console.warn('[WA Bridge] Falha ao buscar versão mais recente do WhatsApp, usando fallback:', e.message);
        }
        
        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: logger,
            syncFullHistory: false,
            // Identifica-se como macOS Chrome para evitar bloqueios de API (erro 405)
            browser: ['macOS', 'Chrome', '120.0.0.0']
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                isConnected = false;
                isReady = false;
                lastError = null;
                try {
                    qrBase64 = await qrcode.toDataURL(qr, { width: 300, margin: 2 });
                    console.log('[WA Bridge] Novo QR Code gerado.');
                } catch (err) {
                    console.error('[WA Bridge] Erro ao gerar QR:', err.message);
                }
            }
            
            if (connection === 'close') {
                isConnected = false;
                isReady = false;
                phoneNumber = null;
                
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                
                lastError = `Conexão fechada: ${lastDisconnect?.error?.message || 'Motivo desconhecido'} (status: ${statusCode})`;
                console.log(`[WA Bridge] Conexão fechada. Reconectando: ${shouldReconnect}. Status: ${statusCode}`);
                
                if (shouldReconnect) {
                    // Espera 10 segundos antes de tentar novamente para evitar rate limit (reconexão rápida gera 405)
                    setTimeout(initClient, 10000);
                } else {
                    console.log('[WA Bridge] Desconectado permanentemente (Logged Out). Limpando sessão...');
                    clearAuth();
                    setTimeout(initClient, 5000);
                }
            } else if (connection === 'open') {
                isConnected = true;
                isReady = true;
                qrBase64 = null;
                lastError = null;
                
                const user = sock.user;
                phoneNumber = user?.id?.split(':')[0] || null;
                console.log('[WA Bridge] Baileys conectado com sucesso! Número:', phoneNumber);
            }
        });
    } catch (err) {
        console.error('[WA Bridge] Erro ao inicializar socket Baileys:', err.message);
        setTimeout(initClient, 10000);
    }
}

function clearAuth() {
    try {
        if (fs.existsSync(AUTH_DIR)) {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            console.log('[WA Bridge] Pasta auth excluída.');
        }
    } catch (err) {
        console.error('[WA Bridge] Erro ao deletar pasta auth:', err.message);
    }
}

// ── Rotas ─────────────────────────────────────────────────────────────────────

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

app.get('/status', (req, res) => {
    res.json({
        ok:          true,
        connected:   isConnected,
        ready:       isReady,
        hasQr:       !!qrBase64,
        phoneNumber: phoneNumber,
        error:       lastError,
        uptimeFormatted: formatUptime(process.uptime()),
        memoryMB:    Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10,
    });
});

app.get('/qr', (req, res) => {
    if (isReady) {
        return res.json({ ok: true, connected: true, message: 'Já conectado — sem QR necessário.' });
    }
    if (!qrBase64) {
        return res.status(404).json({ ok: false, error: 'QR Code ainda não disponível. Aguarde alguns segundos.' });
    }
    res.json({ ok: true, qr: qrBase64 });
});

app.post('/send', async (req, res) => {
    if (!isReady || !sock) {
        return res.status(503).json({ ok: false, error: 'WhatsApp não está pronto. Escaneie o QR Code primeiro.' });
    }

    const { phone, message } = req.body;
    if (!phone || !message) {
        return res.status(400).json({ ok: false, error: 'Campos obrigatórios: phone, message' });
    }

    let num = String(phone).replace(/[^0-9]/g, '');
    if (!num.startsWith('55')) num = '55' + num;
    if (num.length < 12 || num.length > 13) {
        return res.status(400).json({ ok: false, error: 'Número inválido: ' + num });
    }

    let targetJid = num + '@s.whatsapp.net';

    try {
        // Tenta resolver o JID válido via WhatsApp
        try {
            console.log('[WA Bridge] Verificando número no WhatsApp:', num);
            const onWa = await sock.onWhatsApp(targetJid);
            
            if (onWa && onWa.length > 0 && onWa[0].exists) {
                targetJid = onWa[0].jid;
                console.log('[WA Bridge] JID original validado:', targetJid);
            } else if (num.startsWith('55')) {
                // Tenta variação do 9º dígito
                let altNum = null;
                if (num.length === 13 && num[4] === '9') {
                    // Remove o 9 (ex: 5511988888888 -> 551188888888)
                    altNum = num.substring(0, 4) + num.substring(5);
                } else if (num.length === 12) {
                    // Adiciona o 9 (ex: 551188888888 -> 5511988888888)
                    altNum = num.substring(0, 4) + '9' + num.substring(4);
                }

                if (altNum) {
                    console.log('[WA Bridge] JID original não encontrado. Tentando variação BR:', altNum);
                    const onWaAlt = await sock.onWhatsApp(altNum + '@s.whatsapp.net');
                    if (onWaAlt && onWaAlt.length > 0 && onWaAlt[0].exists) {
                        targetJid = onWaAlt[0].jid;
                        console.log('[WA Bridge] Variação validada encontrada:', targetJid);
                    }
                }
            }
        } catch (e) {
            console.warn('[WA Bridge] Erro ao resolver JID via onWhatsApp:', e.message);
        }

        await sock.sendMessage(targetJid, { text: message });
        console.log('[WA Bridge] Mensagem enviada com sucesso para JID:', targetJid);
        res.json({ ok: true, phone: num, jid: targetJid });
    } catch (err) {
        console.error('[WA Bridge] Erro ao enviar para', num, ':', err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.get('/disconnect', async (req, res) => {
    try {
        if (sock) {
            await sock.logout().catch(() => {});
            sock.end();
            sock = null;
        }
        isConnected = false;
        isReady     = false;
        qrBase64    = null;
        phoneNumber = null;
        clearAuth();
        console.log('[WA Bridge] Desconectado pelo usuário. Reiniciando...');
        setTimeout(initClient, 3000);
        res.json({ ok: true, message: 'Desconectado. Sessão limpa.' });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.get('/restart', async (req, res) => {
    try {
        if (sock) {
            sock.end();
            sock = null;
        }
        isConnected = false;
        isReady     = false;
        setTimeout(initClient, 2000);
        res.json({ ok: true, message: 'Reiniciando...' });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, HOST, () => {
    console.log(`[WA Bridge] Rodando em http://${HOST}:${PORT}`);
    console.log(`[WA Bridge] Secret: ${SECRET ? '✅ Configurado' : '⚠️  Não configurado (defina WA_SECRET)'}`);
    initClient().catch(err => {
        console.error('[WA Bridge] Erro na inicialização inicial:', err);
    });
});
