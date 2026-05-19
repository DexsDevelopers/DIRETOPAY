import React, { useState, useEffect, useCallback } from 'react';
import {
    Wallet, Search, RefreshCw, CheckCircle, XCircle, Clock,
    Copy, ChevronDown, ArrowUpRight, AlertTriangle, Loader2,
    BadgeDollarSign, TrendingUp, Ban, CalendarClock, Calendar, QrCode
} from 'lucide-react';
import { cn } from '../lib/utils';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_CONFIG = {
    pending:   { label: 'Pendente',  icon: <Clock size={11} />,       cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    completed: { label: 'Pago',      icon: <CheckCircle size={11} />, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    rejected:  { label: 'Negado',    icon: <XCircle size={11} />,     cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border', cfg.cls)}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

export default function AdminSaquesPage() {
    const [data, setData]               = useState(null);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null);
    const [txInputs, setTxInputs]       = useState({});
    const [copied, setCopied]           = useState(null);
    const [dateFilter, setDateFilter]   = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status: statusFilter, search });
            if (dateFilter) params.append('date', dateFilter);
            const res  = await fetch(`/get_admin_withdrawals.php?${params}`);
            const json = await res.json();
            if (json.success) setData(json);
        } catch (e) { console.error('AdminSaques fetch error:', e); }
        finally { setLoading(false); }
    }, [statusFilter, search, dateFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const copyPix = (key) => {
        navigator.clipboard.writeText(key);
        setCopied(key);
        setTimeout(() => setCopied(null), 1500);
    };

    const handleAction = async (action, payload) => {
        const id = `${action}-${payload.withdraw_id}`;
        setActionLoading(id);
        try {
            const fd = new FormData();
            fd.append('action', action);
            Object.keys(payload).forEach(k => fd.append(k, payload[k]));
            const res  = await fetch('/admin_actions.php', { method: 'POST', body: fd });
            const json = await res.json();
            if (json.success) {
                fetchData();
            } else {
                alert(json.error || 'Erro ao realizar ação');
            }
        } catch { alert('Erro de conexão'); }
        finally { setActionLoading(null); }
    };

    const stats = data?.stats;
    const withdrawals = data?.withdrawals ?? [];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* ── Title ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Wallet className="text-amber-400" size={32} />
                        Saques <span className="text-amber-400 italic">Pendentes</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Gerencie as solicitações de saque dos vendedores.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Atualizar
                </button>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center">
                            <Clock size={16} className="text-amber-400" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pendentes</span>
                    </div>
                    <p className="text-2xl font-black text-amber-400">{stats?.pending_count ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-1">R$ {fmt(stats?.pending_amount)}</p>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <CalendarClock size={16} className="text-blue-400" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hoje</span>
                    </div>
                    <p className="text-2xl font-black text-blue-400">{stats?.today_pending ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-1">novos pedidos hoje</p>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                            <TrendingUp size={16} className="text-emerald-400" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pagos</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-400">{stats?.paid_count ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-1">R$ {fmt(stats?.paid_amount)}</p>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center">
                            <BadgeDollarSign size={16} className="text-primary" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Meu Lucro</span>
                    </div>
                    <p className="text-2xl font-black text-primary">R$ {fmt(stats?.total_profit)}</p>
                    <p className="text-xs text-gray-400 mt-1">lucro total em saques</p>
                </div>

                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center">
                            <Ban size={16} className="text-red-400" />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Negados</span>
                    </div>
                    <p className="text-2xl font-black text-red-400">{stats?.rejected_count ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-1">solicitações rejeitadas</p>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nome, email ou chave PIX..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/40 transition-colors"
                    />
                </div>
                <div className="relative">
                    <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 text-sm text-gray-700 focus:outline-none focus:border-primary/40 transition-colors appearance-none"
                    />
                    {dateFilter && (
                        <button
                            onClick={() => setDateFilter('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 text-xs font-bold"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    {[['pending','Pendentes'],['completed','Pagos'],['rejected','Negados'],['all','Todos']].map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setStatusFilter(val)}
                            className={cn(
                                'px-4 py-2.5 rounded-xl text-sm font-bold border transition-all',
                                statusFilter === val
                                    ? 'bg-primary/15 text-primary border-primary/20'
                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-900 hover:bg-gray-100'
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── List ── */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                ) : withdrawals.length === 0 ? (
                    <div className="text-center py-16">
                        <Wallet size={40} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-bold">Nenhum saque encontrado</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {withdrawals.map(w => (
                                <div key={w.id} className={`p-4 space-y-3 ${w.type === 'pix_transfer' ? 'bg-violet-50/40' : ''}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-sm truncate text-gray-900">{w.full_name}</p>
                                                {w.type === 'pix_transfer' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-violet-100 text-violet-600 border border-violet-200 uppercase">
                                                        <QrCode size={9} /> PIX Personalizado
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-400 truncate">{w.email}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(w.created_at).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                                            {w.type === 'pix_transfer' && w.description && (
                                                <p className="text-[10px] text-violet-500 font-medium mt-0.5">Descrição: {w.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-lg font-black text-emerald-400">R$ {fmt(w.amount)}</p>
                                            <div className="flex flex-col items-end gap-1">
                                                {w.fee_platform > 0 && <span className="text-[9px] font-bold text-primary/70">Lucro: R$ {fmt(w.fee_platform)}</span>}
                                                <StatusBadge status={w.status} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-mono text-primary truncate">{w.pix_key}</code>
                                        <button onClick={() => copyPix(w.pix_key)} className="p-2 bg-gray-50 rounded-lg text-gray-400 shrink-0">
                                            {copied === w.pix_key ? <CheckCircle size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                        </button>
                                    </div>

                                    {w.status === 'pending' && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                id={`tx-m-${w.id}`}
                                                value={txInputs[w.id] || ''}
                                                onChange={e => setTxInputs(p => ({ ...p, [w.id]: e.target.value }))}
                                                placeholder="Hash da transação (opcional)"
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-emerald-500/30 font-mono"
                                            />
                                            <button
                                                onClick={() => handleAction('complete_withdraw', { withdraw_id: w.id, tx_hash: txInputs[w.id] || '' })}
                                                disabled={!!actionLoading}
                                                className="bg-emerald-500 text-white px-3 py-2 rounded-lg font-black text-xs shrink-0 disabled:opacity-50"
                                            >
                                                {actionLoading === `complete_withdraw-${w.id}` ? <Loader2 size={12} className="animate-spin" /> : 'PAGO'}
                                            </button>
                                            <button
                                                onClick={() => handleAction('reject_withdraw', { withdraw_id: w.id })}
                                                disabled={!!actionLoading}
                                                className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg font-black text-xs shrink-0 disabled:opacity-50"
                                            >
                                                {actionLoading === `reject_withdraw-${w.id}` ? <Loader2 size={12} className="animate-spin" /> : 'NEGAR'}
                                            </button>
                                        </div>
                                    )}
                                    {w.tx_hash && (
                                        <p className="text-[10px] text-gray-400 font-mono truncate">Hash: {w.tx_hash}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                        <th className="p-5 pl-6 text-left">Vendedor</th>
                                        <th className="p-5 text-center">Valor</th>
                                        <th className="p-5 text-left">Chave PIX</th>
                                        <th className="p-5 text-center">Status</th>
                                        <th className="p-5 text-left">Data</th>
                                        <th className="p-5 pr-6 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {withdrawals.map(w => (
                                        <tr key={w.id} className={cn('transition-colors', w.type === 'pix_transfer' ? 'bg-violet-50/30 hover:bg-violet-50/60' : w.status === 'pending' ? 'hover:bg-amber-50' : 'hover:bg-gray-50')}>
                                            <td className="p-5 pl-6">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-sm text-gray-900">{w.full_name}</p>
                                                    {w.type === 'pix_transfer' && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-violet-100 text-violet-600 border border-violet-200 uppercase shrink-0">
                                                            <QrCode size={9} /> PIX Personalizado
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-400">{w.email}</p>
                                                {w.type === 'pix_transfer' && w.description && (
                                                    <p className="text-[10px] text-violet-500 font-medium mt-0.5">Desc: {w.description}</p>
                                                )}
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-black text-emerald-400">R$ {fmt(w.amount)}</span>
                                                    {w.fee_platform > 0 && (
                                                        <span className="text-[10px] font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-md mt-0.5">
                                                            Lucro: R$ {fmt(w.fee_platform)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <code className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg text-xs font-mono text-primary max-w-[180px] truncate">{w.pix_key}</code>
                                                    <button onClick={() => copyPix(w.pix_key)} className="p-1.5 bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors shrink-0">
                                                        {copied === w.pix_key ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <StatusBadge status={w.status} />
                                                {w.tx_hash && <p className="text-[9px] text-gray-400 font-mono mt-1 truncate max-w-[100px]">{w.tx_hash}</p>}
                                            </td>
                                            <td className="p-5">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(w.created_at).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                                                </span>
                                            </td>
                                            <td className="p-5 pr-6">
                                                {w.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <input
                                                            value={txInputs[w.id] || ''}
                                                            onChange={e => setTxInputs(p => ({ ...p, [w.id]: e.target.value }))}
                                                            placeholder="Hash (opcional)"
                                                            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-emerald-500/30 font-mono w-36"
                                                        />
                                                        <button
                                                            onClick={() => handleAction('complete_withdraw', { withdraw_id: w.id, tx_hash: txInputs[w.id] || '' })}
                                                            disabled={!!actionLoading}
                                                            className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            {actionLoading === `complete_withdraw-${w.id}` ? <Loader2 size={12} className="animate-spin" /> : <><CheckCircle size={12} /> PAGO</>}
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction('reject_withdraw', { withdraw_id: w.id })}
                                                            disabled={!!actionLoading}
                                                            className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl font-black text-xs hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            {actionLoading === `reject_withdraw-${w.id}` ? <Loader2 size={12} className="animate-spin" /> : <><XCircle size={12} /> NEGAR</>}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 text-right block">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
