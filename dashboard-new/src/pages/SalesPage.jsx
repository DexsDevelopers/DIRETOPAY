import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { History, Search, Download, CheckCircle, Clock, XCircle, AlertCircle, LayoutGrid, RefreshCw, ArrowLeft, QrCode, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionsTable from '../components/TransactionsTable';

const STATUS_FILTERS = [
    { key: 'all',      label: 'Todos',    icon: LayoutGrid,    active: 'bg-gray-100 text-gray-900 border-gray-300',       inactive: 'text-gray-400' },
    { key: 'approved', label: 'Pagos',    icon: CheckCircle,   active: 'bg-primary/10 text-primary border-primary/20', inactive: 'text-gray-400' },
    { key: 'pending',  label: 'Pendentes',icon: Clock,         active: 'bg-orange-500/10 text-orange-500 border-orange-500/20', inactive: 'text-gray-400' },
    { key: 'expired',  label: 'Expirados',icon: XCircle,       active: 'bg-red-500/10 text-red-500 border-red-500/20', inactive: 'text-gray-400' },
    { key: 'rejected', label: 'Rejeitados',icon: AlertCircle,  active: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', inactive: 'text-gray-400' },
];

function statusLabel(badge) {
    return { approved: 'Concluído', paid: 'Pago', pending: 'Pendente', expired: 'Expirado', rejected: 'Rejeitado' }[badge] || badge;
}

function DetailView({ tx, onBack }) {
    const isPaid = tx.badge === 'approved' || tx.badge === 'paid';
    const statusColor = isPaid ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        : tx.badge === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
        : 'bg-red-500/10 text-red-500 border-red-500/20';
    return (
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-gray-900 truncate max-w-[320px] md:max-w-[600px]">Venda #{tx.id}</h1>
                </div>
                <button onClick={onBack} className="flex items-center gap-1.5 font-black text-sm text-gray-500 hover:text-primary transition-colors">
                    <ArrowLeft size={16} /> Voltar
                </button>
            </div>

            {/* Status | Valor | Datas */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Status</p>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-black border ${statusColor}`}>{statusLabel(tx.badge)}</span>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Valor</p>
                    <p className="font-black text-gray-900 text-xl">R$ {tx.amount_brl}</p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Data da venda</p>
                    <p className="font-bold text-gray-700 text-sm">{tx.date || '—'}</p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Data de liberação</p>
                    <p className="font-bold text-gray-700 text-sm">{tx.date || '—'}</p>
                    {isPaid && <p className="text-[11px] text-emerald-500 font-black mt-0.5">(Disponível)</p>}
                </div>
            </div>

            {/* Método */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Método de pagamento</p>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1ea465,#126b41)' }}>
                        <QrCode size={16} className="text-white" />
                    </div>
                    <span className="font-black text-gray-900">Pix</span>
                </div>
            </div>

            {/* Comprador */}
            {(tx.customer_name || tx.customer_email || tx.customer_document) && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4">Informações do comprador</p>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: 'linear-gradient(135deg,#1ea465,#126b41)' }}>
                            {(tx.customer_name || 'C')[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="font-black text-gray-900">{tx.customer_name || '—'}</p>
                            {tx.customer_email && <p className="text-sm text-gray-400">{tx.customer_email}</p>}
                            {tx.customer_document && <p className="text-sm text-gray-400">Doc: {tx.customer_document}</p>}
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default function SalesPage({ onViewQr, onDelete }) {
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
        if (statusFilter !== 'all') {
            list = list.filter(t => t.badge === statusFilter);
        }
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
        allTransactions.forEach(t => {
            c.all++;
            if (c[t.badge] !== undefined) c[t.badge]++;
        });
        return c;
    }, [allTransactions]);

    const handleDelete = async (id) => {
        if (onDelete) await onDelete(id);
        fetchTransactions();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <AnimatePresence mode="wait">
            {selectedTx && <DetailView key="detail" tx={selectedTx} onBack={() => setSelectedTx(null)} />}
            </AnimatePresence>
            {selectedTx ? null : <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                        <History className="text-primary" size={32} />
                        Relatório de <span className="text-primary italic">Vendas</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Acompanhe e gerencie todas as suas transações em tempo real.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchTransactions} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full p-3 transition-all" title="Atualizar">
                        <RefreshCw size={18} className={`text-gray-500 ${loadingTx ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full p-3 transition-all" title="Exportar CSV">
                        <Download size={20} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm">
                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por ID ou Nome do Cliente..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-3.5 pl-12 pr-6 text-sm font-medium text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-primary/30 focus:bg-white transition-all"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors text-xs font-bold">✕</button>
                    )}
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map(f => {
                        const Icon = f.icon;
                        const isActive = statusFilter === f.key;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                    isActive
                                        ? `${f.active} border-current`
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-400'
                                }`}
                            >
                                <Icon size={13} />
                                {f.label}
                                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-black/10' : 'bg-gray-200'}`}>
                                    {counts[f.key]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-6">
                <TransactionsTable
                    transactions={filtered}
                    loading={loadingTx}
                    onViewQr={onViewQr}
                    onDelete={handleDelete}
                    onViewDetail={setSelectedTx}
                />
            </div>
            </>}
        </div>
    );
}
