import { useEffect, useState } from 'react';
import { Bell, X, Loader2, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function createAndSaveSubscription(sendTest = false) {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
        const res = await fetch('/get_vapid_key.php');
        const vapidData = await res.json();
        if (!vapidData.success || !vapidData.publicKey) {
            throw new Error('Chave VAPID não disponível no servidor');
        }
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey)
        });
    }

    const subJson = subscription.toJSON();
    const saveRes = await fetch('/save_subscription.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: { p256dh: subJson.keys.p256dh, auth: subJson.keys.auth }
        })
    });
    const saveData = await saveRes.json();
    console.log('[Push] Subscription salva:', saveData);

    if (sendTest) {
        const testRes = await fetch('/send_test_push.php', { method: 'POST' });
        const testData = await testRes.json();
        console.log('[Push] Teste enviado:', testData);
        if (!testData.success) throw new Error(testData.error || 'Falha ao enviar push de teste');
    }

    return true;
}

async function registerAndSubscribe() {
    console.log('[Push] Iniciando registro...');

    if (isIOS() && !isInStandaloneMode()) {
        throw new Error('IOS_NOT_STANDALONE');
    }

    const permission = await Notification.requestPermission();
    console.log('[Push] Permissão:', permission);
    if (permission !== 'granted') {
        throw new Error('Permissão negada pelo usuário');
    }

    return createAndSaveSubscription(true);
}

async function silentResubscribe() {
    try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
        if (Notification.permission !== 'granted') return;
        await createAndSaveSubscription(false);
        console.log('[Push] Silent resubscribe OK');
    } catch (e) {
        console.warn('[Push] Silent resubscribe falhou:', e.message);
    }
}

export default function PushManager() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [iosGuide, setIosGuide] = useState(false);
    const [hidden, setHidden] = useState(() => {
        return localStorage.getItem('push_subscribed') === '1' ||
               localStorage.getItem('push_prompt_dismissed') === '1';
    });

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;
        if (!('PushManager' in window) && !('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            silentResubscribe();
            if (!hidden) {
                localStorage.setItem('push_prompt_dismissed', '1');
                setHidden(true);
            }
            return;
        }

        if (hidden) return;

        if (Notification.permission === 'denied') {
            setHidden(true);
            return;
        }

        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
    }, [hidden]);

    const handleActivate = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            await registerAndSubscribe();
            setSuccess(true);
            localStorage.setItem('push_subscribed', '1');
            localStorage.setItem('push_prompt_dismissed', '1');
            setTimeout(() => { setShowPrompt(false); setHidden(true); }, 3000);
        } catch (err) {
            console.error('[Push] Erro:', err);
            if (err.message === 'IOS_NOT_STANDALONE') {
                setIosGuide(true);
            } else {
                setErrorMsg(err.message || 'Erro desconhecido');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = () => {
        localStorage.removeItem('push_subscribed');
        localStorage.removeItem('push_prompt_dismissed');
        setHidden(false);
        setSuccess(false);
        setErrorMsg('');
        setIosGuide(false);
        setShowPrompt(true);
    };

    const dismissPrompt = () => {
        localStorage.setItem('push_prompt_dismissed', '1');
        setShowPrompt(false);
        setHidden(true);
    };

    if (hidden || !showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="fixed bottom-6 right-6 z-[9999] w-[340px] bg-[#111113] border border-white/10 rounded-[24px] shadow-2xl shadow-black/60 overflow-hidden"
            >
                <div className="p-6 space-y-4">
                    {success ? (
                        <div className="flex flex-col items-center text-center gap-3 py-2">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                <CheckCircle size={22} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white mb-1">Notificações Ativadas!</h3>
                                <p className="text-[11px] text-white/40">Uma notificação de teste foi enviada para seu dispositivo.</p>
                            </div>
                        </div>
                    ) : iosGuide ? (
                        <>
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
                                    <Smartphone size={22} className="text-orange-400" />
                                </div>
                                <button onClick={dismissPrompt} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                                    <X size={16} className="text-white/40" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white mb-2">iPhone: Adicione à Tela Inicial</h3>
                                <p className="text-[11px] text-white/40 leading-relaxed mb-3">
                                    No iOS, notificações só funcionam quando o app está na sua Tela Inicial. Siga os passos:
                                </p>
                                <ol className="space-y-1.5">
                                    {['Toque no ícone de compartilhar (□↑) no Safari', 'Selecione "Adicionar à Tela Inicial"', 'Abra o app pela Tela Inicial', 'Clique em Ativar Notificações novamente'].map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[10px] text-white/60">
                                            <span className="shrink-0 w-4 h-4 bg-primary/20 text-primary rounded-full flex items-center justify-center font-black text-[8px]">{i + 1}</span>
                                            {s}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <button onClick={dismissPrompt}
                                className="w-full h-9 bg-white/5 border border-white/10 rounded-xl font-black text-xs text-white/60 hover:bg-white/10 transition-all">
                                Entendi
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                    <Bell size={22} className="text-primary" />
                                </div>
                                <button onClick={dismissPrompt} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                                    <X size={16} className="text-white/40" />
                                </button>
                            </div>

                            <div>
                                <h3 className="text-sm font-black text-white mb-1">Ativar Notificações</h3>
                                <p className="text-[11px] text-white/40 leading-relaxed">
                                    Receba alertas de vendas confirmadas e pagamentos em tempo real no seu dispositivo.
                                </p>
                            </div>

                            {errorMsg && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                    <p className="text-[10px] text-red-400 font-medium leading-relaxed">{errorMsg}</p>
                                    <button onClick={handleReactivate} className="mt-2 text-[10px] text-primary font-black underline">
                                        Tentar novamente
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleActivate}
                                    disabled={loading}
                                    className="flex-1 h-10 bg-primary text-black rounded-xl font-black text-xs flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(74,222,128,0.2)] disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                                    {loading ? 'Ativando...' : 'Ativar'}
                                </button>
                                <button
                                    onClick={dismissPrompt}
                                    className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl font-black text-xs text-white/60 hover:bg-white/10 transition-all"
                                >
                                    Agora não
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
