import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Clock, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PixModal({ pixData, onClose, statusEndpoint }) {
    const getInitialTime = () => {
        if (pixData?.createdAt) {
            return Math.max(0, 20 * 60 - Math.floor((Date.now() - pixData.createdAt) / 1000));
        }
        return Math.max(0, 20 * 60 - (pixData?.secondsOld || 0));
    };
    const initialTime = getInitialTime();
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [copied, setCopied] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(initialTime <= 0 ? 'expired' : 'pending');

    // Timer logic
    useEffect(() => {
        if (paymentStatus !== 'pending') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setPaymentStatus('expired');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [paymentStatus]);

    // Polling logic
    useEffect(() => {
        if (paymentStatus !== 'pending' || !pixData?.id) return;

        const poll = async () => {
            try {
                const endpoint = statusEndpoint || '../check_status.php';
                const res = await fetch(`${endpoint}?pix_id=${pixData.id}`);
                const data = await res.json();
                if (data.status === 'paid') {
                    setPaymentStatus('paid');
                    // Abrir fogos de artifício ou algo assim? Por enquanto só recarrega após Delay
                    setTimeout(() => window.location.reload(), 3000);
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        };

        const interval = setInterval(poll, 4000);
        return () => clearInterval(interval);
    }, [paymentStatus, pixData?.id]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleCopy = () => {
        if (!pixData?.code) return;
        navigator.clipboard.writeText(pixData.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!pixData) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <div className="min-h-full flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-md rounded-[32px] overflow-hidden border border-gray-100 shadow-xl my-4"
                    onClick={e => e.stopPropagation()}
                >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <img src="https://logopng.com.br/logos/pix-106.png" className="w-8 h-8 object-contain" alt="Pix" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Pagamento Pix</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <div className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-medium">Valor a Pagar</div>
                        <div className="text-4xl font-black text-gray-900">R$ {parseFloat(pixData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>

                    {paymentStatus === 'paid' ? (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="py-12 flex flex-col items-center justify-center text-center"
                        >
                            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pago com Sucesso!</h2>
                            <p className="text-gray-500">Seu saldo será atualizado em instantes...</p>
                        </motion.div>
                    ) : paymentStatus === 'expired' ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-4">
                                <X size={40} strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Expirado</h2>
                            <p className="text-gray-500">Gere uma nova cobrança para continuar.</p>
                            <button
                                onClick={onClose}
                                className="mt-6 text-primary font-bold hover:underline"
                            >
                                Voltar ao Painel
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center gap-4 mb-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-500 text-xs font-bold">
                                    <Clock size={12} className="text-primary" />
                                    EXPIRA EM: <span className={timeLeft < 60 ? 'text-red-500' : 'text-gray-900'}>{formatTime(timeLeft)}</span>
                                </div>

                                <div className="w-full aspect-square max-w-[240px] bg-white rounded-2xl p-4 shadow-2xl flex items-center justify-center overflow-hidden">
                                    {pixData.image ? (
                                        <img src={pixData.image} alt="QR Code" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Código Copia e Cola</label>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            value={pixData.code}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm focus:outline-none focus:border-primary/30"
                                        />
                                        <button
                                            onClick={handleCopy}
                                            className="bg-primary/10 hover:bg-primary/20 text-primary p-3 rounded-xl border border-primary/20 transition-all flex items-center justify-center min-w-[50px]"
                                        >
                                            {copied ? <Check size={20} /> : <Copy size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                    <ShieldCheck size={14} className="text-primary/50" />
                                    Pagamento Seguro
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-400 justify-end">
                                    <Zap size={14} className="text-primary/50" />
                                    Saldo na Hora
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    </motion.div>
);
}
