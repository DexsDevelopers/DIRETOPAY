import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ShieldCheck, History, Loader2, CheckCircle, XCircle, Clock, RefreshCw, CreditCard, AlertTriangle, Info, ChevronDown, ChevronUp, Banknote, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { BorderBeam, ScrollProgress, RippleButton, ShinyText, NeonCard } from '../components/AnimatedUI';

const BADGE = {
    approved: 'bg-emerald-500/10 text-emerald-500',
    pending:  'bg-amber-500/10 text-amber-500',
    rejected: 'bg-red-500/10 text-red-400',
};

export default function WithdrawalsPage({ balance, availableForWithdraw, pendingWithdrawals, userData }) {
    const { isDark } = useTheme();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loadingW, setLoadingW] = useState(true);
    const [showInfo, setShowInfo] = useState(false);
    const platformFee = 3.50;
    const sigiloFee = (val) => Math.round((val * 0.002 + 4.00) * 100) / 100;
    const totalFee = (val) => platformFee + sigiloFee(val);
    const netAmount = (val) => Math.max(0, val - totalFee(val));

    const userNominal = userData?.preferred_nominal ?? 'nominal1';
    let minWithdraw = 20;
    if (userNominal === 'nominal1') minWithdraw = 25;
    else if (userNominal === 'nominal2') minWithdraw = 5;
    else if (userNominal === 'nominal3') minWithdraw = 10;

    const displayAvailable = availableForWithdraw ?? balance;
    const hasPending = pendingWithdrawals && parseFloat(String(pendingWithdrawals).replace(/\./g, '').replace(',', '.')) > 0;

    const fetchWithdrawals = async () => {
        setLoadingW(true);
        try {
            const res = await fetch('/get_withdrawals.php');
            const data = await res.json();
            if (data.success) setWithdrawals(data.withdrawals);
        } catch (e) { console.error(e); }
        setLoadingW(false);
    };

    useEffect(() => { fetchWithdrawals(); }, []);

    const handleWithdraw = async () => {
        const val = parseFloat(amount);
        if (!val || val < minWithdraw) {
            setResult({ success: false, error: `O valor mínimo para saque na rota ${userNominal.toUpperCase()} é R$ ${minWithdraw.toFixed(2).replace('.', ',')}.` });
            return;
        }
        if (netAmount(val) <= 0) {
            setResult({ success: false, error: 'Valor insuficiente para cobrir as taxas.' });
            return;
        }

        const availableNum = parseFloat(String(displayAvailable).replace(/\./g, '').replace(',', '.'));
        if (val > availableNum) {
            setResult({ success: false, error: `Saldo disponível para saque: R$ ${displayAvailable}.` });
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/withdraw.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ amount: val })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setResult({ success: true, message: `Saque solicitado! Você receberá R$ ${netAmount(val).toFixed(2).replace('.', ',')}. Entre 12h e 00h cai em ~1 hora.` });
                setAmount('');
                fetchWithdrawals();
            } else {
                setResult({ success: false, error: data.error || 'Erro ao processar saque.' });
            }
        } catch {
            setResult({ success: false, error: 'Erro de conexão. Tente novamente.' });
        } finally {
            setLoading(false);
        }
    };

    const card = `rounded-2xl border p-5 ${isDark ? 'bg-[#111117] border-white/[0.07]' : 'bg-white border-gray-100'}`;

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, ease: [0.22,1,0.36,1] }}
            className="space-y-5 pb-10">
            <ScrollProgress color="#10b981" />

            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-[3px] h-4 rounded-full bg-emerald-500" />
                    <p className={`text-[10.5px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Financeiro</p>
                </div>
                <h1 className={`text-[22px] font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Saques</h1>
                <p className={`text-[12px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Transfira seu saldo para sua conta PIX</p>
            </div>

            {/* Info banner */}
            <div className={`rounded-2xl border p-4 flex gap-3 items-start ${isDark ? 'bg-amber-500/5 border-amber-500/15' : 'bg-amber-50 border-amber-200'}`}>
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Info size={13} className="text-amber-500" />
                </div>
                <p className={`text-[12.5px] leading-relaxed ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>
                    Sua conta usa uma <strong>chave PIX recente</strong>. Taxas iniciais são automáticas e não indicam pendência — completamente normal.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Form column */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Balance hero */}
                    <div className="rounded-2xl overflow-hidden relative"
                        style={{ background: isDark
                            ? 'linear-gradient(135deg, #0a1f14 0%, #061510 100%)'
                            : 'linear-gradient(135deg, #064e3b 0%, #02291e 100%)' }}>
                        <BorderBeam colorFrom="#10b981" colorTo="#34d399" duration={10} />
                        <div className="absolute inset-0 pointer-events-none"
                            style={{ background: 'radial-gradient(circle at 90% 20%, rgba(16,185,129,0.25) 0%, transparent 55%)' }} />
                        <div className="absolute right-[-30px] top-[-30px] w-[160px] h-[160px] rounded-full border border-emerald-500/10 pointer-events-none" />
                        <div className="relative z-10 p-5 flex items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                                        <Banknote size={10} className="text-emerald-400" />
                                    </div>
                                    <span className="text-[9.5px] text-emerald-300/50 font-black uppercase tracking-[0.18em]">Disponível para saque</span>
                                </div>
                                <p className="text-[2.2rem] font-black text-white tracking-tight leading-none">R$ {displayAvailable}</p>
                                {hasPending && (
                                    <p className="text-[11px] text-amber-400/70 font-medium mt-1.5">R$ {pendingWithdrawals} em saques pendentes</p>
                                )}
                            </div>
                            <div className="shrink-0 flex flex-col items-center gap-1.5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                                    <ShieldCheck size={18} className="text-emerald-400" />
                                </div>
                                <span className="text-[9px] text-emerald-300/50 font-bold uppercase tracking-wide text-center">Verificada</span>
                            </div>
                        </div>
                    </div>

                    {/* Input form */}
                    <div className={`${card} space-y-4 relative overflow-hidden`}>
                        <BorderBeam colorFrom="#10b981" colorTo="#6366f1" duration={14} />
                        {result && (
                            <div className={`flex items-start gap-3 p-4 rounded-xl text-[13px] font-medium border ${result.success ? 'bg-emerald-500/8 text-emerald-500 border-emerald-500/20' : 'bg-red-500/8 text-red-400 border-red-500/20'}`}>
                                {result.success ? <CheckCircle size={15} className="shrink-0 mt-0.5" /> : <XCircle size={15} className="shrink-0 mt-0.5" />}
                                {result.success ? result.message : result.error}
                            </div>
                        )}

                        <div>
                            <label className={`text-[10.5px] font-black uppercase tracking-wider block mb-2.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Valor do saque</label>
                            <div className="relative">
                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>R$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0,00"
                                    min={minWithdraw}
                                    step="0.01"
                                    className={`w-full rounded-xl py-4 pl-12 pr-4 text-[20px] font-black border outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-700 focus:border-emerald-500/40 focus:bg-white/8' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-400 focus:bg-white'}`}
                                />
                            </div>

                            {/* Quick amount buttons */}
                            <div className="flex gap-2 mt-3">
                                {[25, 50, 75, 100].map(pct => {
                                    const avail = parseFloat(String(displayAvailable).replace(/\./g, '').replace(',', '.')) || 0;
                                    const val = (avail * pct / 100).toFixed(2);
                                    return (
                                        <button key={pct} onClick={() => setAmount(val)}
                                            className={`flex-1 py-1.5 text-[11px] font-black rounded-lg border transition-all hover:scale-105 active:scale-95 ${
                                                isDark ? 'border-white/10 text-gray-500 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/8' : 'border-gray-200 text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                                            }`}>
                                            {pct === 100 ? 'MAX' : `${pct}%`}
                                        </button>
                                    );
                                })}
                            </div>

                            <p className={`text-[11px] mt-2.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                Mín. R$ {minWithdraw.toFixed(2).replace('.', ',')} · Taxa: R$ 3,50 + R$ 4,00 + 0,2%
                            </p>

                            {/* Live fee breakdown */}
                            {amount && parseFloat(amount) >= minWithdraw && (
                                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                    className={`mt-3 rounded-xl border p-3 space-y-2 ${isDark ? 'border-white/[0.06] bg-white/[0.025]' : 'border-gray-100 bg-gray-50'}`}>
                                    <p className={`text-[9.5px] font-black uppercase tracking-wider mb-2.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Detalhamento</p>
                                    {[
                                        { label: 'Taxa plataforma', value: `R$ ${platformFee.toFixed(2).replace('.', ',')}`, red: false },
                                        { label: 'Taxa gateway',    value: `R$ ${sigiloFee(parseFloat(amount)).toFixed(2).replace('.', ',')}`, red: false },
                                        { label: 'Total de taxas',  value: `- R$ ${totalFee(parseFloat(amount)).toFixed(2).replace('.', ',')}`, red: true },
                                    ].map(({ label, value, red }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <span className={`text-[11px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
                                            <span className={`text-[11px] font-bold ${red ? 'text-red-400' : isDark ? 'text-gray-300' : 'text-gray-600'}`}>{value}</span>
                                        </div>
                                    ))}
                                    <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                                        <span className={`text-[12px] font-black ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>→ Você recebe</span>
                                        <span className="text-[14px] font-black text-emerald-500">R$ {netAmount(parseFloat(amount)).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <RippleButton onClick={handleWithdraw} disabled={loading} color="rgba(16,185,129,0.45)"
                            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white rounded-xl py-3.5 font-bold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}>
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Processando...</> : <><Zap size={15} /> <ShinyText speed={3}>Confirmar saque</ShinyText> <ArrowUpRight size={15} /></>}
                        </RippleButton>

                        <button onClick={() => setShowInfo(v => !v)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-[12px] font-semibold transition-all ${isDark ? 'border-white/8 text-gray-500 hover:text-gray-200 hover:bg-white/5' : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                            <span className="flex items-center gap-2"><Info size={13} /> Informações sobre o saque</span>
                            {showInfo ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>

                        {showInfo && (
                            <div className={`rounded-xl border p-4 space-y-3.5 ${isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                                {[
                                    { icon: Clock,         color: '#10b981', title: 'Processamento', text: 'Entre 12h e 00h, cai em ~1 hora. Fora desse horário pode demorar mais.' },
                                    { icon: CreditCard,    color: '#f59e0b', title: 'Vendas no cartão', text: 'Disponível para saque em ~1 dia. Aguarde para evitar chargeback.' },
                                    { icon: AlertTriangle, color: '#ef4444', title: 'MED / Reembolso', text: 'Clientes podem solicitar reembolso no mesmo dia via Nubank, PicPay etc.' },
                                ].map(({ icon: Icon, color, title, text }) => (
                                    <div key={title} className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                                            <Icon size={12} style={{ color }} />
                                        </div>
                                        <p className={`text-[12px] leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <strong className={isDark ? 'text-gray-200' : 'text-gray-800'}>{title}: </strong>{text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* History column */}
                <div className={`${card} flex flex-col gap-4`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <History size={12} className="text-emerald-500" />
                            </div>
                            <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Histórico</span>
                        </div>
                        <button onClick={fetchWithdrawals}
                            className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-gray-500 hover:text-gray-200 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                            <RefreshCw size={13} className={loadingW ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {loadingW ? (
                        <div className="flex justify-center py-8">
                            <div className="w-7 h-7 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                    ) : withdrawals.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                            {withdrawals.slice(0, 8).map((w, i) => (
                                <motion.div key={w.id}
                                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05, duration: 0.3 }}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}>
                                    <div className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${
                                        w.badge === 'approved' ? 'bg-emerald-500' : w.badge === 'rejected' ? 'bg-red-400' : 'bg-amber-400'
                                    }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[13px] font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>R$ {w.amount}</p>
                                        <p className={`text-[10.5px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{w.date}</p>
                                    </div>
                                    <span className={`text-[9.5px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide shrink-0 ${BADGE[w.badge] ?? BADGE.pending}`}>{w.status}</span>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <Wallet size={18} className="text-gray-400" />
                            </div>
                            <p className={`text-[12px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Nenhum saque ainda.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
