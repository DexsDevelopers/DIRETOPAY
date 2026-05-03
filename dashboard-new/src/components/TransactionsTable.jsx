import React, { useState, useEffect } from 'react';
import { History, QrCode, Trash2, Copy, Check, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

function CountdownTimer({ secondsOld }) {
    const [timeLeft, setTimeLeft] = useState(1200 - secondsOld);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    if (timeLeft <= 0) return <span className="text-red-500 font-bold">EXPIRADO</span>;

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return (
        <span className={cn(
            "font-mono font-bold",
            timeLeft < 300 ? "text-red-500 animate-pulse" : "text-orange-500"
        )}>
            {mins}:{secs < 10 ? '0' : ''}{secs}
        </span>
    );
}

export default function TransactionsTable({ transactions = [], loading = false, onViewQr, onDelete, showSeller = false }) {
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (code, id) => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-3xl p-8 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-gray-400 font-medium font-['Outfit']">Sincronizando banco de dados...</p>
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="text-gray-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sem movimentação</h3>
                <p className="text-gray-500 max-w-sm mx-auto">{showSeller ? 'Nenhuma venda na plataforma ainda.' : 'Suas vendas aparecerão aqui em tempo real.'}</p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-2">
                {transactions.map((tx) => (
                    <div key={tx.id} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <span className="text-gray-900 font-bold text-sm block truncate">{tx.customer_name || 'Sem nome'}</span>
                                <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">#{tx.id} • {tx.date}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase shrink-0",
                                    tx.badge === 'approved' || tx.badge === 'paid' ? 'bg-primary/10 text-primary border border-primary/20' :
                                        tx.badge === 'expired' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                            'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                )}>
                                    {tx.status}
                                </span>
                                {!!tx.med && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse">
                                        <AlertTriangle size={9} /> MED
                                    </span>
                                )}
                            </div>
                        </div>
                        {showSeller && tx.seller_name && (
                            <span className="text-gray-600 font-semibold text-xs bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">{tx.seller_name}</span>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-900 font-black text-base">R$ {tx.amount_brl}</span>
                                {tx.badge === 'pending' && (
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                                        <Clock size={10} className="text-orange-500/50" />
                                        <CountdownTimer secondsOld={tx.seconds_old} />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {tx.badge === 'pending' && (
                                    <button
                                        onClick={() => onViewQr && onViewQr({
                                            id: tx.pix_id || tx.id,
                                            amount: tx.amount_brl ? tx.amount_brl.replace(/\./g, '').replace(',', '.') : 0,
                                            code: tx.pix_code || '',
                                            image: tx.qr_image || '',
                                            secondsOld: tx.seconds_old || 0,
                                            createdAt: Date.now() - ((tx.seconds_old || 0) * 1000)
                                        })}
                                        className="p-2 rounded-full bg-primary/10 text-primary border border-primary/20"
                                        title="Ver QR Code"
                                    >
                                        <QrCode size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleCopy(tx.pix_code, tx.id)}
                                    className="p-2 rounded-full bg-gray-50 text-gray-400 border border-gray-100"
                                    title="Copiar Código"
                                >
                                    {copiedId === tx.id ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
                                </button>
                                <button
                                    onClick={() => onDelete && onDelete(tx.id)}
                                    className="p-2 rounded-full bg-red-50 text-red-400 border border-red-100"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-gray-500 text-[10px] uppercase tracking-[0.15em] font-black">
                            <th className="px-6 py-2">Cliente / ID</th>
                            {showSeller && <th className="px-6 py-2">Vendedor</th>}
                            <th className="px-6 py-2">Valor Total</th>
                            <th className="px-6 py-2 text-center">Status / Expiração</th>
                            <th className="px-6 py-2 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="group transition-all duration-500">
                                <td className="px-6 py-5 bg-white group-hover:bg-gray-50/70 rounded-l-[24px] border-y border-l border-gray-100">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-900 font-bold text-sm tracking-tight">{tx.customer_name || 'Sem nome'}</span>
                                        <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">#{tx.id} • {tx.date}</span>
                                    </div>
                                </td>
                                {showSeller && (
                                    <td className="px-6 py-5 bg-white group-hover:bg-gray-50/70 border-y border-gray-100">
                                        <span className="text-gray-600 font-semibold text-xs bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">{tx.seller_name || '—'}</span>
                                    </td>
                                )}
                                <td className="px-6 py-5 bg-white group-hover:bg-gray-50/70 border-y border-gray-100">
                                    <span className="text-gray-900 font-black text-base">R$ {tx.amount_brl}</span>
                                </td>
                                <td className="px-6 py-5 bg-white group-hover:bg-gray-50/70 border-y border-gray-100 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em]",
                                            tx.badge === 'approved' || tx.badge === 'paid' ? 'bg-primary/10 text-primary border border-primary/20' :
                                                tx.badge === 'expired' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                    'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                        )}>
                                            {tx.status}
                                        </span>
                                        {!!tx.med && (
                                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse">
                                                <AlertTriangle size={10} /> MED — Reembolso
                                            </span>
                                        )}
                                        {tx.badge === 'pending' && (
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                                                <Clock size={10} className="text-orange-500/50" />
                                                <CountdownTimer secondsOld={tx.seconds_old} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5 bg-white group-hover:bg-gray-50/70 border-y border-r border-gray-100 rounded-r-[24px] text-right">
                                    <div className="flex items-center justify-end gap-2.5">
                                        {tx.badge === 'pending' && (
                                            <button
                                                onClick={() => onViewQr && onViewQr({
                                                    id: tx.pix_id || tx.id,
                                                    amount: tx.amount_brl ? tx.amount_brl.replace(/\./g, '').replace(',', '.') : 0,
                                                    code: tx.pix_code || '',
                                                    image: tx.qr_image || '',
                                                    secondsOld: tx.seconds_old || 0,
                                                    createdAt: Date.now() - ((tx.seconds_old || 0) * 1000)
                                                })}
                                                className="p-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 border border-primary/20 hover:border-primary active:scale-95"
                                                title="Ver QR Code"
                                            >
                                                <QrCode size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleCopy(tx.pix_code, tx.id)}
                                            className="p-2.5 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 border border-gray-200 active:scale-95"
                                            title="Copiar Código"
                                        >
                                            {copiedId === tx.id ? <Check size={18} className="text-primary" /> : <Copy size={18} />}
                                        </button>
                                        <button
                                            onClick={() => onDelete && onDelete(tx.id)}
                                            className="p-2.5 rounded-full bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white transition-all duration-300 border border-white/5 hover:border-red-500 active:scale-95"
                                            title="Excluir Transação"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
