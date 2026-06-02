import React, { useState, useEffect } from 'react';
import { History, QrCode, Trash2, Copy, Check, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
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

export default function TransactionsTable({ transactions = [], loading = false, onViewQr, onDelete, onViewDetail, showSeller = false }) {
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (code, id) => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const isDark = document.documentElement.classList.contains('dark');

    const badge = (b) => {
        if (b === 'approved' || b === 'paid')  return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        if (b === 'expired')                   return 'bg-red-500/10 text-red-500 border-red-500/20';
        if (b === 'rejected')                  return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    };

    if (loading) {
        return (
            <div className={`p-10 min-h-[240px] flex flex-col items-center justify-center gap-4 ${isDark ? 'bg-[#111117]' : 'bg-white'}`}>
                <div className="w-10 h-10 border-[3px] border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className={`text-[12px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Carregando transações...</p>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className={`p-12 text-center ${isDark ? 'bg-[#111117]' : 'bg-white'}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <History className="text-gray-400" size={22} />
                </div>
                <h3 className={`text-[14px] font-bold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Sem movimentação</h3>
                <p className={`text-[12px] max-w-xs mx-auto ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {showSeller ? 'Nenhuma venda na plataforma ainda.' : 'Suas vendas aparecerão aqui em tempo real.'}
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Cards */}
            <div className={`md:hidden divide-y ${isDark ? 'divide-white/[0.05]' : 'divide-gray-100'}`}>
                {transactions.map((tx, i) => (
                    <motion.div key={tx.id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.045, duration: 0.3, ease: [0.22,1,0.36,1] }}
                        onClick={() => onViewDetail && onViewDetail(tx)}
                        className={`p-4 space-y-3 transition-colors relative ${onViewDetail ? 'cursor-pointer' : ''} ${isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-gray-50/60'}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <span className={`text-[13px] font-bold block truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                    {tx.customer_name || 'Sem nome'}
                                </span>
                                <span className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                    #{tx.id} · {tx.date}
                                </span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border', badge(tx.badge))}>
                                    {tx.status}
                                </span>
                                {!!tx.med && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse">
                                        <AlertTriangle size={8} /> MED
                                    </span>
                                )}
                            </div>
                        </div>
                        {showSeller && tx.seller_name && (
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border inline-block ${isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                {tx.seller_name}
                            </span>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className={`text-[15px] font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>R$ {tx.amount_brl}</span>
                                {tx.badge === 'pending' && (
                                    <div className={`flex items-center gap-1 text-[11px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <Clock size={10} className="text-orange-400/60" />
                                        <CountdownTimer secondsOld={tx.seconds_old} />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                {tx.badge === 'pending' && (
                                    <button onClick={(e) => { e.stopPropagation(); onViewQr && onViewQr({ id: tx.pix_id || tx.id, amount: tx.amount_brl ? tx.amount_brl.replace(/\./g, '').replace(',', '.') : 0, code: tx.pix_code || '', image: tx.qr_image || '', secondsOld: tx.seconds_old || 0, createdAt: Date.now() - ((tx.seconds_old || 0) * 1000) }); }}
                                        className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 active:scale-90" title="Ver QR Code">
                                        <QrCode size={15} />
                                    </button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); handleCopy(tx.pix_code, tx.id); }}
                                    className={`p-2 rounded-xl border active:scale-90 ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`} title="Copiar Código">
                                    {copiedId === tx.id ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(tx.id); }}
                                    className="p-2 rounded-xl bg-red-500/8 text-red-400/60 border border-red-500/15 active:scale-90" title="Excluir">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                    <thead>
                        <tr className={`border-b ${isDark ? 'border-white/[0.05]' : 'border-gray-100'}`}>
                            <th className={`px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Cliente / ID</th>
                            {showSeller && <th className={`px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Vendedor</th>}
                            <th className={`px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Valor</th>
                            <th className={`px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Status</th>
                            <th className={`px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-right ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, i) => (
                            <motion.tr key={tx.id}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.045, duration: 0.3, ease: [0.22,1,0.36,1] }}
                                onClick={() => onViewDetail && onViewDetail(tx)}
                                className={`group border-b transition-colors ${onViewDetail ? 'cursor-pointer' : ''} ${isDark ? 'border-white/[0.04] hover:bg-white/[0.025]' : 'border-gray-50 hover:bg-gray-50/70'}`}>
                                <td className="px-5 py-4">
                                    <p className={`text-[13px] font-bold leading-tight ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{tx.customer_name || 'Sem nome'}</p>
                                    <p className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>#{tx.id} · {tx.date}</p>
                                </td>
                                {showSeller && (
                                    <td className="px-5 py-4">
                                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                            {tx.seller_name || '—'}
                                        </span>
                                    </td>
                                )}
                                <td className="px-5 py-4">
                                    <span className={`text-[15px] font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>R$ {tx.amount_brl}</span>
                                </td>
                                <td className="px-5 py-4 text-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <span className={cn('px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.08em] border', badge(tx.badge))}>
                                            {tx.status}
                                        </span>
                                        {!!tx.med && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse">
                                                <AlertTriangle size={9} /> MED
                                            </span>
                                        )}
                                        {tx.badge === 'pending' && (
                                            <div className={`flex items-center gap-1 text-[10px] font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                                <Clock size={9} className="text-orange-400/60" />
                                                <CountdownTimer secondsOld={tx.seconds_old} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {tx.badge === 'pending' && (
                                            <button onClick={(e) => { e.stopPropagation(); onViewQr && onViewQr({ id: tx.pix_id || tx.id, amount: tx.amount_brl ? tx.amount_brl.replace(/\./g, '').replace(',', '.') : 0, code: tx.pix_code || '', image: tx.qr_image || '', secondsOld: tx.seconds_old || 0, createdAt: Date.now() - ((tx.seconds_old || 0) * 1000) }); }}
                                                className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 hover:border-emerald-500 active:scale-90"
                                                title="Ver QR Code">
                                                <QrCode size={16} />
                                            </button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); handleCopy(tx.pix_code, tx.id); }}
                                            className={`p-2 rounded-xl transition-all border active:scale-90 ${isDark ? 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                                            title="Copiar Código">
                                            {copiedId === tx.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(tx.id); }}
                                            className="p-2 rounded-xl bg-red-500/8 text-red-400/60 hover:bg-red-500 hover:text-white transition-all border border-red-500/15 hover:border-red-500 active:scale-90"
                                            title="Excluir">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
