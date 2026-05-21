import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    Receipt,
    Filter,
    ArrowUpDown,
    AlertTriangle,
    Loader2,
    Globe,
    User
} from 'lucide-react';
import { cn } from '../lib/utils';

const STATUS_TABS = [
    { key: 'all', label: 'Todas', icon: <Receipt size={16} /> },
    { key: 'paid', label: 'Pagas', icon: <CheckCircle size={16} /> },
    { key: 'pending', label: 'Pendentes', icon: <Clock size={16} /> },
    { key: 'expired', label: 'Expiradas', icon: <XCircle size={16} /> },
    { key: 'failed', label: 'Falhas', icon: <XCircle size={16} /> },
];

const badgeStyles = {
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    expired: 'bg-gray-100 text-gray-400 border-gray-200',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminTransactionsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [searchDebounced, setSearchDebounced] = useState('');
    const [page, setPage] = useState(1);
    const [view, setView] = useState('platform'); // 'platform' | 'mine'

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setSearchDebounced(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                status: statusFilter,
                search: searchDebounced,
                page: page.toString(),
                view
            });
            const res = await fetch(`/get_admin_transactions.php?${params}`);
            const json = await res.json();
            if (json.success) setData(json);
        } catch (err) {
            console.error('Erro ao carregar transações:', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchDebounced, page, view]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-refresh every 30s
    useEffect(() => {
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [statusFilter, searchDebounced, view]);

    const [medLoading, setMedLoading] = useState(null);

    const toggleMed = async (txId) => {
        setMedLoading(txId);
        try {
            const fd = new FormData();
            fd.append('action', 'toggle_med');
            fd.append('transaction_id', txId);
            const res = await fetch('/admin_actions.php', { method: 'POST', body: fd });
            const json = await res.json();
            if (json.success) {
                // Update locally
                setData(prev => ({
                    ...prev,
                    transactions: prev.transactions.map(t =>
                        t.id === txId ? { ...t, med: json.med } : t
                    )
                }));
            } else {
                alert(json.error || 'Erro');
            }
        } catch { alert('Erro de conexão'); }
        finally { setMedLoading(null); }
    };

    const stats = data?.stats;
    const pagination = data?.pagination;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Receipt className="text-primary" size={32} />
                        {view === 'platform' ? <><span>Todas as</span> <span className="text-primary">Vendas</span></> : <><span>Minhas</span> <span className="text-primary">Vendas</span></>}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {view === 'platform' ? 'Visão global de todas as transações da plataforma.' : 'Apenas as suas próprias vendas como vendedor.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Toggle Plataforma / Minhas Vendas */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 gap-1">
                        <button
                            onClick={() => setView('platform')}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                                view === 'platform'
                                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <Globe size={15} /> Plataforma
                        </button>
                        <button
                            onClick={() => setView('mine')}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all',
                                view === 'mine'
                                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <User size={15} /> Minhas Vendas
                        </button>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm font-bold hover:bg-gray-100 text-gray-700 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <TrendingUp size={18} className="text-primary" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume Hoje</p>
                    </div>
                    <p className="text-2xl font-black text-gray-900">R$ {stats?.today_volume || '0,00'}</p>
                    <p className="text-xs text-gray-400 mt-1">{stats?.today_count || 0} vendas</p>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <CheckCircle size={18} className="text-emerald-400" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Pagas</p>
                    </div>
                    <p className="text-2xl font-black text-emerald-400">R$ {stats?.total_paid_volume || '0,00'}</p>
                    <p className="text-xs text-gray-400 mt-1">{stats?.paid_count || 0} transações</p>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                            <Clock size={18} className="text-amber-400" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pendentes</p>
                    </div>
                    <p className="text-2xl font-black text-amber-400">{stats?.pending_count || 0}</p>
                    <p className="text-xs text-gray-400 mt-1">aguardando pagamento</p>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                            <DollarSign size={18} className="text-gray-400" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Líquido Total</p>
                    </div>
                    <p className="text-2xl font-black text-gray-900">R$ {stats?.total_net_volume || '0,00'}</p>
                    <p className="text-xs text-gray-400 mt-1">creditado aos lojistas</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-4 flex flex-col lg:flex-row items-center gap-4">
                {/* Status Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                                statusFilter === tab.key
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.key === 'paid' && stats && (
                                <span className="ml-1 bg-black/20 px-1.5 py-0.5 rounded-md text-[10px]">{stats.paid_count}</span>
                            )}
                            {tab.key === 'pending' && stats && (
                                <span className="ml-1 bg-black/20 px-1.5 py-0.5 rounded-md text-[10px]">{stats.pending_count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 w-full lg:max-w-xs ml-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar nome, email, pix ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/30 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-[32px] overflow-hidden">
                {/* Mobile Cards */}
                <div className="md:hidden">
                    {loading && !data ? (
                        <div className="p-12 text-center">
                            <RefreshCw className="animate-spin text-primary mx-auto mb-3" size={28} />
                            <p className="text-gray-400 text-sm font-medium">Carregando transações...</p>
                        </div>
                    ) : data?.transactions?.length === 0 ? (
                        <div className="p-12 text-center">
                            <Receipt className="text-gray-200 mx-auto mb-3" size={40} />
                            <p className="text-gray-400 text-sm font-medium">Nenhuma transação encontrada.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 p-3">
                            {data?.transactions?.map(tx => (
                                <div key={tx.id} className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-3">
                                    {/* Row 1: Seller + Status */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[15px] font-bold text-gray-900 truncate">{tx.user_name}</h4>
                                            <p className="text-[11px] text-gray-400 font-medium truncate">{tx.user_email}</p>
                                        </div>
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase shrink-0 tracking-wide",
                                            badgeStyles[tx.badge] || badgeStyles.pending
                                        )}>{tx.status}</span>
                                    </div>

                                    {!!tx.med && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <AlertTriangle size={13} className="text-red-400 shrink-0" />
                                            <span className="text-[10px] font-black text-red-400 uppercase">MED — Reembolso PIX</span>
                                        </div>
                                    )}

                                    {/* Row 2: Values */}
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white rounded-xl px-3 py-2 flex-1 text-center border border-gray-100">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Bruto</span>
                                            <span className="text-sm font-black text-gray-900">R$ {tx.amount_brl}</span>
                                        </div>
                                        <div className="bg-white rounded-xl px-3 py-2 flex-1 text-center border border-gray-100">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">Líquido</span>
                                            <span className="text-sm font-black text-gray-500">R$ {tx.amount_net_brl}</span>
                                        </div>
                                    </div>

                                    {/* Row 3: Meta info + MED button */}
                                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                                        <span>#{tx.id} • {tx.date}</span>
                                        <div className="flex items-center gap-2">
                                            {tx.customer_name && <span className="text-gray-500 font-medium truncate">{tx.customer_name}</span>}
                                            <button
                                                onClick={() => toggleMed(tx.id)}
                                                disabled={medLoading === tx.id}
                                                className={cn(
                                                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all border",
                                                    tx.med
                                                        ? 'bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
                                                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                                                )}
                                            >
                                                {medLoading === tx.id ? <Loader2 size={10} className="animate-spin" /> : <AlertTriangle size={10} />}
                                                {tx.med ? 'Remover MED' : 'Marcar MED'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-100">
                                <th className="p-5 pl-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lojista</th>
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pagador</th>
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor Bruto</th>
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Líquido</th>
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">MED</th>
                                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ação</th>
                                <th className="p-5 pr-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && !data ? (
                                <tr>
                                    <td colSpan={9} className="p-20 text-center">
                                        <RefreshCw className="animate-spin text-primary mx-auto mb-3" size={28} />
                                        <p className="text-gray-400 text-sm font-medium">Carregando transações...</p>
                                    </td>
                                </tr>
                            ) : data?.transactions?.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-20 text-center">
                                        <Receipt className="text-gray-200 mx-auto mb-3" size={40} />
                                        <p className="text-gray-400 text-sm font-medium">Nenhuma transação encontrada.</p>
                                    </td>
                                </tr>
                            ) : data?.transactions?.map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-5 pl-8">
                                        <span className="text-xs font-mono text-gray-400">#{tx.id}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900 truncate max-w-[160px]">{tx.user_name}</span>
                                            <span className="text-[11px] text-gray-400 truncate max-w-[160px]">{tx.user_email}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-sm text-gray-500 font-medium truncate max-w-[140px] block">{tx.customer_name}</span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <span className="text-sm font-black text-gray-900">R$ {tx.amount_brl}</span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <span className="text-sm font-bold text-gray-500">R$ {tx.amount_net_brl}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                badgeStyles[tx.badge] || badgeStyles.pending
                                            )}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        {!!tx.med && (
                                            <span className="flex items-center justify-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse w-fit mx-auto">
                                                <AlertTriangle size={10} /> MED
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <button
                                            onClick={() => toggleMed(tx.id)}
                                            disabled={medLoading === tx.id}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border",
                                                tx.med
                                                    ? 'bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
                                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                                                )}
                                            >
                                                {medLoading === tx.id ? <Loader2 size={11} className="animate-spin" /> : <AlertTriangle size={11} />}
                                            {tx.med ? 'Remover MED' : 'Marcar MED'}
                                        </button>
                                    </td>
                                    <td className="p-5 pr-8 text-right">
                                        <span className="text-xs text-gray-500 font-medium">{tx.date}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="border-t border-gray-100 p-5 flex items-center justify-between">
                        <p className="text-xs text-gray-400 font-medium">
                            {pagination.total} transações • Página {pagination.page} de {pagination.pages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="p-2 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all disabled:opacity-30"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page >= pagination.pages}
                                className="p-2 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all disabled:opacity-30"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
