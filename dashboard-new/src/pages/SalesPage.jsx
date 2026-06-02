import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { History, Search, Download, CheckCircle, Clock, XCircle, AlertCircle, LayoutGrid, RefreshCw, ArrowLeft, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionsTable from '../components/TransactionsTable';
import { useTheme } from '../contexts/ThemeContext';

const FILTERS = [
    { key: 'all',      label: 'Todos',     dot: null },
    { key: 'approved', label: 'Pagos',     dot: '#10b981' },
    { key: 'pending',  label: 'Pendentes', dot: '#f59e0b' },
    { key: 'expired',  label: 'Expirados', dot: '#ef4444' },
    { key: 'rejected', label: 'Rejeitados',dot: '#6b7280' },
];

function statusLabel(badge) {
    return { approved: 'Pago', paid: 'Pago', pending: 'Pendente', expired: 'Expirado', rejected: 'Rejeitado' }[badge] || badge;
}

function statusStyle(badge) {
    if (badge === 'approved' || badge === 'paid') return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' };
    if (badge === 'pending') return { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' };
    return { bg: 'bg-gray-100 dark:bg-white/8', text: 'text-gray-500 dark:text-gray-400' };
}

function DetailView({ tx, onBack, isDark }) {
    const isPaid = tx.badge === 'approved' || tx.badge === 'paid';
    const { bg, text } = statusStyle(tx.badge);
    const card = `rounded-xl border p-5 ${isDark ? 'bg-[#111117] border-white/[0.07]' : 'bg-white border-gray-100'}`;
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className={`text-[17px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Transação #{tx.id}</h1>
                <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
                    <ArrowLeft size={14} /> Voltar
                </button>
            </div>

            <div className={`${card} grid grid-cols-2 md:grid-cols-4 gap-5`}>
                {[
                    { label: 'Status', value: <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-lg ${bg} ${text}`}>{statusLabel(tx.badge)}</span> },
                    { label: 'Valor',  value: <span className={`text-[18px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>R$ {tx.amount_brl}</span> },
                    { label: 'Data',   value: <span className={`text-[13px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{tx.date || '—'}</span> },
                    { label: 'Liberação', value: <span className={`text-[13px] ${isPaid ? 'text-emerald-500' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>{isPaid ? 'Disponível' : '—'}</span> },
                ].map(({ label, value }) => (
                    <div key={label}>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">{label}</p>
                        {value}
                    </div>
                ))}
            </div>

            <div className={`${card} flex items-center gap-3`}>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <QrCode size={15} className="text-emerald-500" />
                </div>
                <div>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Método</p>
                    <p className={`text-[13px] font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>PIX</p>
                </div>
            </div>

            {(tx.customer_name || tx.customer_email || tx.customer_document) && (
                <div className={`${card}`}>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">Comprador</p>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-[13px] font-bold text-emerald-500 shrink-0">
                            {(tx.customer_name || 'C')[0].toUpperCase()}
                        </div>
                        <div>
                            <p className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{tx.customer_name || '—'}</p>
                            {tx.customer_email && <p className="text-[12px] text-gray-400 mt-0.5">{tx.customer_email}</p>}
                            {tx.customer_document && <p className="text-[12px] text-gray-400">Doc: {tx.customer_document}</p>}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default function SalesPage({ onViewQr, onDelete }) {
    const { isDark } = useTheme();
    const [allTransactions, setAllTransactions] = useState([]);
    const [loadingTx, setLoadingTx] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTx, setSelectedTx] = useState(null);

    const fetchTransactions = useCallback(async () => {
        setLoadingTx(true);
        try {
            const res = await fetch('/get_transactions.php?limit=500');
            const data = await res.json();
            if (data.success) setAllTransactions(data.transactions);
        } catch (e) { console.error(e); }
        setLoadingTx(false);
    }, []);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    const filtered = useMemo(() => {
        let list = allTransactions;
        if (statusFilter !== 'all') list = list.filter(t => t.badge === statusFilter);
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(t =>
                (t.customer_name ?? '').toLowerCase().includes(q) ||
                String(t.id).includes(q) ||
                String(t.pix_id ?? '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [allTransactions, statusFilter, search]);

    const counts = useMemo(() => {
        const c = { all: 0, approved: 0, pending: 0, expired: 0, rejected: 0 };
        allTransactions.forEach(t => { c.all++; if (c[t.badge] !== undefined) c[t.badge]++; });
        return c;
    }, [allTransactions]);

    const handleDelete = async (id) => {
        if (onDelete) await onDelete(id);
        fetchTransactions();
    };

    const base = isDark ? 'border-white/[0.07] bg-[#111117]' : 'border-gray-100 bg-white';

    return (
        <div className="space-y-5 pb-10">
            <AnimatePresence mode="wait">
                {selectedTx && (
                    <DetailView key="detail" tx={selectedTx} onBack={() => setSelectedTx(null)} isDark={isDark} />
                )}
            </AnimatePresence>

            {!selectedTx && (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className={`text-[18px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Vendas</h1>
                            <p className="text-[12px] text-gray-400 mt-0.5">Todas as suas transações em tempo real</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={fetchTransactions}
                                className={`p-2 rounded-lg border transition-all ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                title="Atualizar">
                                <RefreshCw size={15} className={loadingTx ? 'animate-spin' : ''} />
                            </button>
                            <button className={`p-2 rounded-lg border transition-all ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                title="Exportar">
                                <Download size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className={`rounded-xl border p-3 flex flex-col sm:flex-row gap-3 ${base}`}>
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por ID ou nome..."
                                className={`w-full rounded-lg py-2 pl-9 pr-4 text-[13px] border outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-gray-200 placeholder:text-gray-600 focus:border-white/20' : 'bg-gray-50 border-gray-200 text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:bg-white'}`}
                            />
                        </div>
                        {/* Tabs */}
                        <div className="flex items-center gap-1 flex-wrap">
                            {FILTERS.map(f => (
                                <button key={f.key} onClick={() => setStatusFilter(f.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                                        statusFilter === f.key
                                            ? isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'
                                            : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                    }`}>
                                    {f.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.dot }} />}
                                    {f.label}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                                        statusFilter === f.key
                                            ? isDark ? 'bg-white/15 text-gray-300' : 'bg-gray-200 text-gray-600'
                                            : isDark ? 'bg-white/5 text-gray-600' : 'bg-gray-100 text-gray-400'
                                    }`}>{counts[f.key]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`rounded-xl border overflow-hidden ${base}`}>
                        <TransactionsTable
                            transactions={filtered}
                            loading={loadingTx}
                            onViewQr={onViewQr}
                            onDelete={handleDelete}
                            onViewDetail={setSelectedTx}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
