import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ShieldCheck, History, Loader2, CheckCircle, XCircle, Clock, RefreshCw, CreditCard, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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

    const card = `rounded-xl border p-5 ${isDark ? 'bg-[#111117] border-white/[0.07]' : 'bg-white border-gray-100'}`;

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div>
                <h1 className={`text-[18px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Saques</h1>
                <p className="text-[12px] text-gray-400 mt-0.5">Transfira seu saldo para sua conta PIX</p>
            </div>

            {/* Info banner */}
            <div className={`rounded-xl border p-4 flex gap-3 items-start ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className={`text-[12.5px] leading-relaxed ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                    Sua conta usa uma <strong>chave PIX recente</strong>. Taxas iniciais são automáticas e não indicam pendência — completamente normal.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Form */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Balance */}
                    <div className={`${card} grid grid-cols-2 gap-5`}>
                        <div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Disponível para saque</p>
                            <p className={`text-[26px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>R$ {displayAvailable}</p>
                            {hasPending && <p className="text-[11px] text-amber-500 mt-1">R$ {pendingWithdrawals} pendentes</p>}
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-emerald-500">
                                <ShieldCheck size={16} />
                                <span className="text-[13px] font-medium">Conta verificada</span>
                            </div>
                        </div>
                    </div>

                    {/* Input form */}
                    <div className={`${card} space-y-4`}>
                        {result && (
                            <div className={`flex items-center gap-3 p-3.5 rounded-xl text-[13px] font-medium ${result.success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'}`}>
                                {result.success ? <CheckCircle size={15} /> : <XCircle size={15} />}
                                {result.success ? result.message : result.error}
                            </div>
                        )}

                        <div>
                            <label className={`text-[11px] font-medium block mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Valor do saque</label>
                            <div className="relative">
                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>R$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0,00"
                                    min={minWithdraw}
                                    step="0.01"
                                    className={`w-full rounded-xl py-3.5 pl-12 pr-4 text-[18px] font-bold border outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/40' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-400 focus:bg-white'}`}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-[11px] text-gray-400">Mín. R$ {minWithdraw.toFixed(2).replace('.', ',')} · Taxa: R$ 3,50 + R$ 4,00 + 0,2%</p>
                                {amount && parseFloat(amount) >= minWithdraw && (
                                    <p className="text-[11px] text-emerald-500 font-medium">Você recebe: R$ {netAmount(parseFloat(amount)).toFixed(2).replace('.', ',')}</p>
                                )}
                            </div>
                        </div>

                        <button onClick={handleWithdraw} disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-3 font-semibold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Processando...</> : <>Confirmar saque <ArrowUpRight size={16} /></>}
                        </button>

                        <button onClick={() => setShowInfo(v => !v)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-[12px] font-medium transition-all ${isDark ? 'border-white/8 text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                            <span className="flex items-center gap-2"><Info size={13} /> Informações sobre o saque</span>
                            {showInfo ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>

                        {showInfo && (
                            <div className={`rounded-xl border p-4 space-y-3 ${isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                                {[
                                    { icon: Clock,         color: 'text-emerald-500', title: 'Processamento', text: 'Entre 12h e 00h, cai em ~1 hora. Fora desse horário pode demorar mais.' },
                                    { icon: CreditCard,    color: 'text-amber-500',   title: 'Vendas no cartão', text: 'Disponível para saque em ~1 dia. Aguarde para evitar chargeback.' },
                                    { icon: AlertTriangle, color: 'text-red-400',     title: 'MED / Reembolso', text: 'Clientes podem solicitar reembolso no mesmo dia via Nubank, PicPay etc.' },
                                ].map(({ icon: Icon, color, title, text }) => (
                                    <div key={title} className="flex gap-3 items-start">
                                        <Icon size={14} className={`${color} shrink-0 mt-0.5`} />
                                        <p className={`text-[12px] leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <strong className={isDark ? 'text-gray-200' : 'text-gray-800'}>{title}: </strong>{text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* History */}
                <div className={`${card} flex flex-col gap-4`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History size={14} className="text-emerald-500" />
                            <span className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Histórico</span>
                        </div>
                        <button onClick={fetchWithdrawals}
                            className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                            <RefreshCw size={13} className={loadingW ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {loadingW ? (
                        <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
                    ) : withdrawals.length > 0 ? (
                        <div className="space-y-3">
                            {withdrawals.slice(0, 8).map((w) => (
                                <div key={w.id} className={`flex items-center justify-between pb-3 border-b last:border-0 last:pb-0 ${isDark ? 'border-white/[0.05]' : 'border-gray-100'}`}>
                                    <div>
                                        <p className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>R$ {w.amount}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{w.date}</p>
                                    </div>
                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${BADGE[w.badge] ?? BADGE.pending}`}>{w.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[12px] text-gray-400 text-center py-8">Nenhum saque solicitado ainda.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
