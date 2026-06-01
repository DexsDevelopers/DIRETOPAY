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
const PORT    = process.env.WA_PORT    || 3001;
const HOST    = process.env.WA_HOST    || '127.0.0.1';
const SECRET  = process.env.WA_SECRET  || ''; // token opcional
const AUTH_DIR = process.env.WA_AUTH_DIR || path.join(__dirname, `.baileys_auth_${PORT}`);

// ── Estado global ─────────────────────────────────────────────────────────────
let sock                      = null;
let qrBase64                  = null;
let isConnected               = false;
let isReady                   = false;
let server                    = null;
let lastError                 = null;
let phoneNumber               = null;
let makeWASocket              = null;
let useMultiFileAuthState     = null;
let DisconnectReason          = null;
let Browsers                  = null;
let retryCount                = 0;
let isInitializing            = false; // Trava para evitar múltiplas inicializações simultâneas

// ── Proteção contra crash (Anti-Crash) ────────────────────────────────────────
process.on('uncaughtException', (err) => {
    console.error('[WA Bridge] UNCAUGHT EXCEPTION:', err.message);
});
process.on('unhandledRejection', (reason) => {
    const msg = reason?.message || String(reason);
    console.error('[WA Bridge] UNHANDLED REJECTION:', msg);
});

// Fechamento limpo para evitar corrupção da sessão e liberar a porta TCP
function gracefulShutdown() {
    console.log('\n[WA Bridge] Recebido sinal de desligamento. Fechando sessão suavemente...');
    if (sock) {
        try { sock.ws.close(); } catch(e){}
    }
    if (server) {
        server.close(() => {
            console.log('[WA Bridge] Servidor HTTP fechado.');
            process.exit(0);
        });
        setTimeout(() => { process.exit(0); }, 3000); // Força saída em 3s caso demore
    } else {
        process.exit(0);
    }
}
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Logger silencioso para o Baileys
const logger = pino({ level: 'silent' });

// Cache de JIDs para evitar abuso do método onWhatsApp (anti-ban)
const jidCache = new Map();
const MAX_CACHE_SIZE = 5000;
function addToJidCache(num, jid) {
    if (jidCache.size >= MAX_CACHE_SIZE) {
        const keysToRemove = Array.from(jidCache.keys()).slice(0, 1000);
        for (const k of keysToRemove) jidCache.delete(k);
    }
    jidCache.set(num, jid);
}

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
    // TRAVA: impede que dois initClient rodem ao mesmo tempo
    if (isInitializing) {
        console.log('[WA Bridge] Já está inicializando, ignorando chamada duplicada.');
        return;
    }
    isInitializing = true;

    console.log('[WA Bridge] Iniciando Baileys...');

    // Importação dinâmica do Baileys (ESM em CommonJS)
    if (!makeWASocket) {
        try {
            const baileys = await import('@whiskeysockets/baileys');
            makeWASocket           = baileys.default;
            useMultiFileAuthState  = baileys.useMultiFileAuthState;
            DisconnectReason       = baileys.DisconnectReason;
            Browsers               = baileys.Browsers;
        } catch (err) {
            console.error('[WA Bridge] Erro ao carregar biblioteca Baileys:', err.message);
            isInitializing = false;
            setTimeout(initClient, 10000);
            return;
        }
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

        // Tenta obter a versão mais recente do WhatsApp Web, com fallback seguro para evitar crash/silence
        let version = [2, 3000, 1040529081];
        try {
            const baileys = await import('@whiskeysockets/baileys');
            if (baileys.fetchLatestWaWebVersion) {
                const { version: latestVer } = await baileys.fetchLatestWaWebVersion();
                if (latestVer) version = latestVer;
            }
        } catch (e) {
            console.warn('[WA Bridge] Erro ao buscar versão dinâmica, usando fallback:', e.message);
        }
        console.log(`[WA Bridge] Versão do WhatsApp configurada: ${version.join('.')}`);

        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger,
            syncFullHistory: false,
            shouldSyncHistoryMessage: (msg) => {
                // Permite sincronização de dados fundamentais de contatos e LID, mas evita histórico pesado
                if (!msg) return false;
                return msg.syncType !== 'FULL';
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: false,
            // Retorna vazio para pedidos de re-decrypt de mensagens antigas (sem memoria extra)
            getMessage: async () => ({ conversation: '' }),
            // Identifica como Chrome no Ubuntu — menos detecção de bot
            browser: Browsers ? Browsers.ubuntu('Chrome') : ['Ubuntu', 'Chrome', '20.0.04'],
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                isConnected = false;
                isReady     = false;
                lastError   = null;
                retryCount  = 0;
                try {
                    qrBase64 = await qrcode.toDataURL(qr, { width: 300, margin: 2 });
                    console.log('[WA Bridge] Novo QR Code gerado.');
                } catch (err) {
                    console.error('[WA Bridge] Erro ao gerar QR:', err.message);
                }
            }

            if (connection === 'close') {
                isConnected = false;
                isReady     = false;
                phoneNumber = null;

                const statusCode = lastDisconnect?.error?.output?.statusCode;
                lastError = `Conexão fechada (status: ${statusCode || 'desconhecido'})`;

                console.log(`[WA Bridge] Conexão fechada. Status: ${statusCode}`);

                if (statusCode === DisconnectReason.loggedOut) {
                    // WhatsApp expulsou a sessão — limpa e aguarda bastante antes de reconectar
                    console.log('[WA Bridge] Desconectado pelo WhatsApp (Logged Out). Aguardando 30s antes de reconectar...');
                    clearAuth();
                    retryCount = 0;
                    isInitializing = false;
                    setTimeout(initClient, 30000); // Aguarda 30s para não ser detectado como bot
                } else if (statusCode === 440) {
                    // Sessão aberta em outro dispositivo
                    console.log('[WA Bridge] Sessão substituída por outro dispositivo. Reconectando em 20s...');
                    retryCount++;
                    isInitializing = false;
                    setTimeout(initClient, 20000);
                } else if (statusCode === 515) {
                    // Servidor pediu restart
                    console.log('[WA Bridge] Restart necessário (515). Reiniciando em 3s...');
                    isInitializing = false;
                    setTimeout(initClient, 3000);
                } else if (statusCode === 403) {
                    // Banido/bloqueado temporariamente
                    console.log('[WA Bridge] Acesso negado (403). Aguardando 60s...');
                    retryCount++;
                    isInitializing = false;
                    setTimeout(initClient, 60000);
                } else {
                    // Outros erros — Backoff exponencial
                    retryCount++;
                    const delay = Math.min(5000 * Math.pow(1.5, retryCount), 120000); // max 2 min
                    console.log(`[WA Bridge] Reconectando em ${Math.round(delay/1000)}s (Tentativa ${retryCount}).`);
                    isInitializing = false;
                    setTimeout(initClient, delay);
                }

            } else if (connection === 'open') {
                isConnected = true;
                isReady     = true;
                qrBase64    = null;
                lastError   = null;
                retryCount  = 0;
                isInitializing = false; // Libera trava após conexão bem-sucedida

                const user = sock.user;
                phoneNumber = user?.id?.split(':')[0] || null;
                console.log('[WA Bridge] Baileys conectado com sucesso! Número:', phoneNumber);
            }
        });

        sock.ev.on('messages.upsert', async (m) => {
            try {
                const msg = m.messages[0];
                if (!msg?.message || msg.key.fromMe) return;

                const senderJid = msg.key.remoteJid;

                // Ignora grupos (economiza memória e evita spam)
                if (senderJid && senderJid.endsWith('@g.us')) return;

                const text = msg.message.conversation
                    || msg.message.extendedTextMessage?.text
                    || '[Mídia/Outro]';

                console.log('\n=======================================');
                console.log('📩 MENSAGEM RECEBIDA NO BRIDGE');
                console.log('De:', senderJid);
                console.log('Texto:', text);
                console.log('=======================================\n');
            } catch (e) {
                console.error('Erro ao ler mensagem recebida:', e.message);
            }
        });

    } catch (err) {
        console.error('[WA Bridge] Erro ao inicializar socket Baileys:', err.message);
        isInitializing = false;
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
        ok:              true,
        connected:       isConnected,
        ready:           isReady,
        hasQr:           !!qrBase64,
        phoneNumber:     phoneNumber,
        error:           lastError,
        uptimeFormatted: formatUptime(process.uptime()),
        memoryMB:        Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10,
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

app.post('/pairing-code', async (req, res) => {
    try {
        if (isReady) {
            return res.json({ ok: true, connected: true, message: 'Já conectado — pareamento desnecessário.' });
        }

        const rawPhone = req.body.phone;
        if (!rawPhone) {
            return res.status(400).json({ ok: false, error: 'Número de telefone é obrigatório.' });
        }

        const phone = rawPhone.replace(/\D/g, '');

        if (!sock) {
            return res.status(503).json({ ok: false, error: 'Socket do WhatsApp não está inicializado.' });
        }

        if (sock.authState.creds.registered) {
            return res.status(400).json({ ok: false, error: 'Sessão já registrada. Limpe a sessão antes de parear um novo número.' });
        }

        console.log(`[WA Bridge] Solicitando Pairing Code para: ${phone}`);
        const code = await sock.requestPairingCode(phone);

        console.log(`[WA Bridge] Pairing Code gerado: ${code}`);
        res.json({ ok: true, code });

    } catch (err) {
        console.error('[WA Bridge] Erro ao gerar pairing code:', err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
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
        // ── Resolução robusta de JID para números brasileiros ─────────────────
        async function resolveJid(number) {
            let jidWith9 = null;
            let jidWithout9 = null;

            if (number.startsWith('55') && number.length === 13 && number[4] === '9') {
                jidWith9    = number + '@s.whatsapp.net';
                jidWithout9 = (number.substring(0, 4) + number.substring(5)) + '@s.whatsapp.net';
            } else if (number.startsWith('55') && number.length === 12) {
                jidWithout9 = number + '@s.whatsapp.net';
                jidWith9    = (number.substring(0, 4) + '9' + number.substring(4)) + '@s.whatsapp.net';
            } else {
                return number + '@s.whatsapp.net';
            }

            try {
                const [resA, resB] = await Promise.allSettled([
                    sock.onWhatsApp(jidWith9),
                    sock.onWhatsApp(jidWithout9),
                ]);

                const foundWith9    = resA.status === 'fulfilled' && resA.value?.length > 0 && resA.value[0].exists;
                const foundWithout9 = resB.status === 'fulfilled' && resB.value?.length > 0 && resB.value[0].exists;

                if (foundWith9)    { console.log('[WA Bridge] JID com 9 validado:', jidWith9);    return resA.value[0].jid; }
                if (foundWithout9) { console.log('[WA Bridge] JID sem 9 validado:', jidWithout9); return resB.value[0].jid; }

                console.log('[WA Bridge] Nenhum JID validado. Usando com 9 como fallback:', jidWith9);
                return jidWith9;

            } catch (e) {
                console.warn('[WA Bridge] Erro ao consultar onWhatsApp:', e.message, '— usando fallback com 9');
                return jidWith9;
            }
        }

        if (!jidCache.has(num)) {
            const resolved = await resolveJid(num);
            addToJidCache(num, resolved);
            console.log('[WA Bridge] JID resolvido:', resolved);
        } else {
            console.log('[WA Bridge] JID do cache:', jidCache.get(num));
        }

        targetJid = jidCache.get(num);

        // ── Simula comportamento humano ────────────────────────────────────────
        const typingTime = Math.min(Math.max(message.length * 25, 1200), 3500);
        console.log(`[WA Bridge] Simulando "composing" por ${typingTime}ms para ${num}`);
        await sock.sendPresenceUpdate('composing', targetJid);
        await new Promise(resolve => setTimeout(resolve, typingTime));
        await sock.sendPresenceUpdate('paused', targetJid);

        // ── Jitter invisível anti-spam ─────────────────────────────────────────
        const invisibleChars = ['\u200B', '\u200C', '\u200D'];
        const randomChar = invisibleChars[Math.floor(Math.random() * invisibleChars.length)];

        // ── Envio principal ────────────────────────────────────────────────────
        await sock.sendMessage(targetJid, { text: message + randomChar });
        console.log('[WA Bridge] Mensagem enviada com sucesso para JID:', targetJid);
        res.json({ ok: true, phone: num, senderPhone: phoneNumber, jid: targetJid });

    } catch (err) {
        console.error('[WA Bridge] Erro ao enviar para', num, ':', err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Endpoint de envio direto ao JID (sem lookup) — para diagnóstico
app.post('/send_raw', async (req, res) => {
    const { jid, message } = req.body || {};
    if (!jid || !message) return res.status(400).json({ ok: false, error: 'jid e message são obrigatórios' });
    if (!isReady || !sock) return res.status(503).json({ ok: false, error: 'Bridge não conectada' });
    try {
        console.log('[WA Bridge] send_raw para JID:', jid);
        await sock.sendMessage(jid, { text: message });
        console.log('[WA Bridge] send_raw enviado com sucesso para:', jid);
        res.json({ ok: true, jid });
    } catch (err) {
        console.error('[WA Bridge] send_raw erro:', err.message);
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
        isConnected    = false;
        isReady        = false;
        qrBase64       = null;
        phoneNumber    = null;
        isInitializing = false;
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
        isConnected    = false;
        isReady        = false;
        isInitializing = false;
        setTimeout(initClient, 2000);
        res.json({ ok: true, message: 'Reiniciando...' });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ── Start ─────────────────────────────────────────────────────────────────────
server = app.listen(PORT, HOST, () => {
    console.log(`[WA Bridge] Rodando em http://${HOST}:${PORT}`);
    console.log(`[WA Bridge] Secret: ${SECRET ? '✅ Configurado' : '⚠️  Não configurado (defina WA_SECRET)'}`);
    initClient().catch(err => {
        console.error('[WA Bridge] Erro na inicialização inicial:', err);
    });
});
