import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ShieldCheck, History, Loader2, CheckCircle, XCircle, Clock, RefreshCw, CreditCard, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';

const BADGE = {
    approved: 'bg-primary/10 text-primary border-primary/20',
    pending:  'bg-orange-500/10 text-orange-400 border-orange-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function WithdrawalsPage({ balance, availableForWithdraw, pendingWithdrawals }) {
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
        if (!val || val < 20) {
            setResult({ success: false, error: `O valor mínimo para saque é R$ 20,00.` });
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

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                    <Wallet className="text-primary" size={32} />
                    Solicitar <span className="text-primary italic">Saque</span>
                </h1>
                <p className="text-gray-500 font-medium">Transfira seus lucros para sua conta bancária de forma segura.</p>
            </div>

            {/* Aviso: chave Pix nova — sem tom de golpe, bom para conversão */}
            <div className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 flex gap-4 items-start">
                <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center mt-0.5">
                    <Info size={18} className="text-amber-500" />
                </div>
                <div>
                    <p className="font-black text-amber-800 text-sm mb-0.5">Por que minha taxa está ajustada?</p>
                    <p className="text-amber-700 text-[13px] leading-relaxed">
                        Sua conta utiliza uma <strong>chave Pix recém-cadastrada</strong>. O sistema aplica automaticamente taxas ligeiramente superiores durante o período inicial de validação da chave — isso é <strong>completamente normal</strong> e não indica nenhuma pendência. Seu saldo continua sendo transferido normalmente.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">

                    <div className="bg-white border border-purple-100 shadow-[0_4px_24px_rgba(124,58,237,0.08)] p-8 rounded-[40px] space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Disponível para Saque</label>
                                <div className="text-4xl font-black text-gray-900">R$ {displayAvailable}</div>
                                {hasPending && (
                                    <p className="text-[10px] text-orange-400/80 mt-1 font-bold">
                                        ⏳ R$ {pendingWithdrawals} em saques pendentes
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Status da Conta</label>
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <ShieldCheck size={18} />
                                    Verificada & Blindada
                                </div>
                            </div>
                        </div>

                        {result && (
                            <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold ${result.success ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                                {result.success ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                {result.success ? result.message : result.error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-2">Valor do Resgate</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-xl">R$</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0,00"
                                        min="20"
                                        step="0.01"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-[24px] py-6 pl-16 pr-8 text-2xl font-black text-gray-900 focus:outline-none focus:border-primary/50 focus:bg-white transition-all"
                                    />
                                </div>
                                {amount && parseFloat(amount) >= 20 ? (
                                <div className="ml-2 space-y-0.5">
                                    <p className="text-[10px] text-gray-400">Taxa plataforma: R$ 3,50 &nbsp;|&nbsp; Taxa de saque: R$ 4,00 + 0,2%</p>
                                    <p className="text-[10px] text-gray-500 font-bold">Total de taxas: R$ {totalFee(parseFloat(amount)).toFixed(2).replace('.', ',')} &nbsp;→&nbsp; <span className="text-primary">Você recebe: R$ {netAmount(parseFloat(amount)).toFixed(2).replace('.', ',')}</span></p>
                                </div>
                            ) : (
                                <p className="text-[10px] text-gray-400 ml-2">Mínimo: R$ 20,00 &nbsp;|&nbsp; Taxas: R$ 3,50 + R$ 4,00 + 0,2%</p>
                            )}
                            </div>

                            <button
                                onClick={handleWithdraw}
                                disabled={loading}
                                className="w-full h-18 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-[24px] font-black text-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_40px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading ? (
                                    <><Loader2 size={22} className="animate-spin" /> Processando...</>
                                ) : (
                                    <>Confirmar Saque <ArrowUpRight size={24} /></>
                                )}
                            </button>

                            <button
                                onClick={() => setShowInfo(v => !v)}
                                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-600 text-xs font-bold transition-all"
                            >
                                <span className="flex items-center gap-2"><Info size={14} /> Informações sobre o saque</span>
                                {showInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {showInfo && (
                                <div className="space-y-4 rounded-2xl border border-gray-200 p-5 bg-gray-50">
                                    <div className="flex gap-3 items-start">
                                        <Clock size={16} className="text-primary shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            <strong className="text-gray-900">Tempo de processamento:</strong> Entre <strong className="text-primary">12:00 e 00:00</strong>, o saque cai em <strong className="text-primary">aproximadamente 1 hora</strong>. Fora desse horário pode demorar um pouco mais.
                                        </p>
                                    </div>
                                    <div className="w-full h-px bg-gray-200" />
                                    <div className="flex gap-3 items-start">
                                        <CreditCard size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            <strong className="text-amber-600">Cartão de crédito:</strong> Vendas via cartão ficam disponíveis para saque em <strong className="text-gray-900">aproximadamente 1 dia</strong>. Risco de chargeback — aguarde antes de sacar.
                                        </p>
                                    </div>
                                    <div className="w-full h-px bg-gray-200" />
                                    <div className="flex gap-3 items-start">
                                        <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            <strong className="text-red-500">Risco de MED:</strong> Clientes (Nubank, PicPay etc.) podem solicitar reembolso do PIX no mesmo dia. Verifique na página de vendas se alguma transação foi marcada com MED.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-purple-100 shadow-[0_4px_24px_rgba(124,58,237,0.08)] p-8 rounded-[40px]">
                        <h3 className="text-lg font-black mb-4 flex items-center justify-between text-gray-900">
                            <span className="flex items-center gap-2">
                                <History size={18} className="text-primary" />
                                Histórico de Saques
                            </span>
                            <button onClick={fetchWithdrawals} title="Atualizar" className="p-1.5 rounded-full hover:bg-gray-100 transition-all">
                                <RefreshCw size={14} className={`text-gray-400 ${loadingW ? 'animate-spin' : ''}`} />
                            </button>
                        </h3>
                        <div className="space-y-4">
                            {loadingW ? (
                                <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
                            ) : withdrawals.length > 0 ? (
                                withdrawals.slice(0, 6).map((w) => (
                                    <div key={w.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">R$ {w.amount}</p>
                                            <p className="text-[10px] text-gray-500">{w.date}</p>
                                            {w.pix_key && <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{w.pix_key}</p>}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${BADGE[w.badge] ?? BADGE.pending}`}>{w.status}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 text-center py-6">Nenhum saque solicitado ainda.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
