import React, { useState, useEffect } from 'react';
import {
    Users,
    Wallet,
    Settings,
    Search,
    Filter,
    Save,
    UserPlus,
    CheckCircle,
    XCircle,
    AlertTriangle,
    CreditCard,
    DollarSign,
    TrendingUp,
    ShieldCheck,
    Zap,
    Trash2,
    RefreshCw,
    KeyRound,
    Eye,
    EyeOff,
    UserCheck,
    UserX,
    Clock,
    Package,
    ArrowDownToLine,
    Activity,
    CalendarDays,
    CalendarRange,
    BarChart3,
    Plug,
    Link2,
    ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../lib/utils';

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtN = (v) => Number(v || 0).toLocaleString('pt-BR');

function StatCard({ icon, label, value, sub, color = 'text-white', border = 'border-white/5', badge }) {
    return (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color === 'text-primary' ? 'bg-primary/10' : color === 'text-green-400' ? 'bg-green-500/10' : color === 'text-yellow-400' ? 'bg-yellow-500/10' : color === 'text-red-400' ? 'bg-red-500/10' : color === 'text-blue-400' ? 'bg-blue-500/10' : color === 'text-purple-400' ? 'bg-purple-500/10' : 'bg-gray-100'}`}>
                    <span className={color === 'text-white' ? 'text-gray-700' : color}>{icon}</span>
                </div>
                {badge !== undefined && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badge > 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>{badge}</span>
                )}
            </div>
            <div>
                <p className={`text-2xl font-black ${color === 'text-white' ? 'text-gray-900' : color}`}>{value}</p>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">{label}</p>
                {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function AdminPage() {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const [globalSettings, setGlobalSettings] = useState({
        affiliate_rate: 0,
        default_tax: 8
    });

    const medusaFees = {
        base: { percent: 8.99, fixed: 5.99 },
        installments: { 2: 20, 3: 23, 4: 28, 5: 33, 6: 38, 7: 44, 8: 47, 9: 52, 10: 55, 11: 57, 12: 61 }
    };
    const [cardExtraFee, setCardExtraFee] = useState(0);
    const [cardFeesSaving, setCardFeesSaving] = useState(false);

    const [pixgoEnabled, setPixgoEnabled] = useState(true);
    const [pixgoToggling, setPixgoToggling] = useState(false);

    const [sigiloForm, setSigiloForm] = useState({ public_key: '', secret_key: '' });
    const [sigiloEnabled, setSigiloEnabled] = useState(false);
    const [sigiloSaving, setSigiloSaving] = useState(false);
    const [sigiloStatus, setSigiloStatus] = useState(null);
    const [showSigiloSecret, setShowSigiloSecret] = useState(false);

    const [caktoForm, setCaktoForm] = useState({ client_id: '', client_secret: '' });
    const [caktoStatus, setCaktoStatus] = useState(null);
    const [caktoLoading, setCaktoLoading] = useState(false);
    const [showCaktoSecret, setShowCaktoSecret] = useState(false);

    const [showDemoModal, setShowDemoModal]     = useState(false);
    const [showNormalModal, setShowNormalModal] = useState(false);

    const fetchAdminData = async () => {
        try {
            const res = await fetch(`../get_admin_data.php`);
            const data = await res.json();
            if (data.success) {
                setAdminData(data);
                setGlobalSettings({
                    affiliate_rate: data.stats.affiliate_rate,
                    default_tax: data.stats.default_tax
                });
                if (data.card_extra_fee !== undefined) setCardExtraFee(data.card_extra_fee);
                if (data.pixgo_enabled !== undefined) setPixgoEnabled(data.pixgo_enabled === 1);
                if (data.sigilopay) {
                    setSigiloEnabled(data.sigilopay.enabled);
                    setSigiloForm(f => ({ ...f, public_key: data.sigilopay.public_key || '' }));
                    if (data.sigilopay.enabled) setSigiloStatus({ ok: true });
                }
                if (data.cakto) {
                    setCaktoForm(f => ({ ...f, client_id: data.cakto.client_id || '' }));
                    if (data.cakto.webhook_id) {
                        setCaktoStatus({ ok: true, webhook_id: data.cakto.webhook_id, token_expiry: data.cakto.token_expiry });
                    }
                }
            } else {
                setError(data.error || 'Erro ao carregar dados admin');
            }
        } catch (err) {
            setError('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleAction = async (action, payload) => {
        const actionId = `${action}-${payload?.user_id || payload?.withdraw_id || 'global'}`;
        setActionLoading(actionId);
        try {
            const formData = new FormData();
            formData.append('action', action);
            if (payload) {
                Object.keys(payload).forEach(key => formData.append(key, payload[key]));
            }

            const res = await fetch('../admin_actions.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                fetchAdminData();
                if (action === 'create_demo_user') setShowDemoModal(false);
                if (action === 'create_user')      setShowNormalModal(false);
            } else {
                alert(data.error || 'Erro ao realizar ação');
            }
        } catch (err) {
            alert('Erro de conexão');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading && !adminData) {
        return (
            <div className="flex items-center justify-center h-full">
                <RefreshCw className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-10 p-6 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header com Stats */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-4">
                        <ShieldCheck className="text-primary" size={36} />
                        Painel <span className="text-primary">Administrativo</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Taxas globais, dashboard da plataforma e criação de contas.</p>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    {/* Lucro Plataforma */}
                    <div className="bg-white border border-primary/20 shadow-sm p-5 rounded-3xl min-w-[200px] flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lucro Total</p>
                            <p className="text-xl font-black">R$ {adminData?.stats.platform_profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    {/* Config Global Taxas */}
                    <div className="bg-white border border-gray-100 shadow-sm p-5 rounded-3xl flex flex-col gap-4 min-w-[320px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuração de Taxas</p>

                        {/* Breakdown de custos */}
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 space-y-1.5 text-[11px]">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Custos da plataforma</p>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-semibold">Gateway PIX (recebimento)</span>
                                <span className="text-yellow-400 font-black">8,00% + R$0,99</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-semibold">Taxa de saque</span>
                                <span className="text-blue-400 font-black">R$4,00 + 0,2% / saque</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-semibold">Taxa plataforma (saque)</span>
                                <span className="text-orange-400 font-black">R$ 3,50 / saque</span>
                            </div>
                            <div className="border-t border-gray-100 pt-1.5 flex justify-between items-center">
                                <span className="text-gray-600 font-bold">Seu lucro (taxa padrão)</span>
                                <span className="text-primary font-black">{globalSettings.default_tax}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-semibold">Total cobrado do vendedor</span>
                                <span className="text-gray-900 font-black">{Number(globalSettings.default_tax).toFixed(2)}% + R$0,99</span>
                            </div>
                        </div>

                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Afiliados</p>
                                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                                    <input
                                        type="number"
                                        value={globalSettings.affiliate_rate}
                                        onChange={e => setGlobalSettings({ ...globalSettings, affiliate_rate: e.target.value })}
                                        className="bg-transparent border-none text-gray-900 font-bold text-base w-12 focus:outline-none"
                                    />
                                    <span className="text-gray-400 text-sm">%</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Meu Lucro (padrão)</p>
                                <div className="flex items-center gap-1 bg-primary/10 border border-primary/30 rounded-xl px-3 py-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={globalSettings.default_tax}
                                        onChange={e => setGlobalSettings({ ...globalSettings, default_tax: e.target.value })}
                                        className="bg-transparent border-none text-primary font-bold text-base w-12 focus:outline-none"
                                    />
                                    <span className="text-primary/60 text-sm">%</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleAction('update_global_settings', globalSettings)}
                                disabled={actionLoading === 'update_global_settings-global'}
                                className="bg-primary text-white px-4 py-2 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                            >
                                <Save size={14} /> Salvar
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setShowDemoModal(true)}
                            className="bg-gray-100 border border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
                        >
                            <UserPlus size={18} /> CONTA DEMO
                        </button>
                        <button
                            onClick={() => setShowNormalModal(true)}
                            className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95"
                        >
                            <UserPlus size={18} /> CRIAR USUÁRIO
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Gateway shortcut card ── */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Gateways de Pagamento</p>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Zap size={18} className="text-primary" />
                        </div>
                        <div>
                            <p className="font-black text-sm text-gray-900">Gerencie todos os gateways</p>
                            <p className="text-[11px] text-gray-400">SigiloPay · PixGo · Cakto</p>
                        </div>
                    </div>
                    <a href="/admin/gateways" className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 px-5 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-all active:scale-95">
                        <Zap size={14}/> Abrir Gateways
                    </a>
                </div>
            </div>

            {/* ── Taxas Cartão de Crédito ── */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                            <CreditCard size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="font-black text-base">Taxas Cartão de Crédito</h2>
                            <p className="text-[11px] text-gray-400 font-medium">MedusaPay (fixas) + Taxa extra da plataforma</p>
                        </div>
                    </div>
                </div>

                {/* Taxa extra da plataforma - EDITÁVEL */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-5">
                    <div className="flex flex-wrap items-center gap-4">
                        <div>
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1.5">Taxa Extra da Plataforma</label>
                            <p className="text-[11px] text-gray-400">Cobrada acima das taxas MedusaPay em cada venda por cartão</p>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <div className="flex items-center gap-1 bg-gray-50 border border-primary/30 rounded-xl px-4 py-2.5">
                                <input type="number" step="0.1" value={cardExtraFee}
                                    onChange={e => setCardExtraFee(parseFloat(e.target.value) || 0)}
                                    className="bg-transparent border-none text-primary font-black text-xl w-16 focus:outline-none" />
                                <span className="text-primary/60 text-sm font-bold">%</span>
                            </div>
                            <button
                                onClick={async () => {
                                    setCardFeesSaving(true);
                                    try {
                                        const fd = new FormData();
                                        fd.append('action', 'update_card_extra_fee');
                                        fd.append('card_extra_fee', cardExtraFee);
                                        const r = await fetch('../admin_actions.php', { method: 'POST', body: fd });
                                        const d = await r.json();
                                        if (!d.success) alert(d.error || 'Erro');
                                    } catch { alert('Erro de conexão'); }
                                    finally { setCardFeesSaving(false); }
                                }}
                                disabled={cardFeesSaving}
                                className="bg-primary text-white px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Save size={16} /> {cardFeesSaving ? '...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Taxas MedusaPay - SOMENTE LEITURA */}
                <div className="opacity-60">
                    <div className="flex items-center gap-2 mb-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Taxas MedusaPay (fixas)</label>
                        <span className="text-[9px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold">somente leitura</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2">
                            <span className="text-[10px] text-gray-400 font-bold block">À vista</span>
                            <span className="text-gray-600 font-bold text-sm">{medusaFees.base.percent}% + R$ {medusaFees.base.fixed.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
                        {Object.entries(medusaFees.installments).map(([n, rate]) => (
                            <div key={n} className="bg-gray-50 border border-gray-100 rounded-xl p-2 text-center">
                                <p className="text-[9px] font-black text-gray-400">{n}x</p>
                                <p className="text-gray-600 font-black text-sm">{rate}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Dashboard de Métricas ── */}
            {adminData && (() => {
                const s = adminData.stats;
                return (
                    <div className="space-y-4">
                        {/* Section label */}
                        <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-primary" />
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Visão Geral da Plataforma</h2>
                        </div>

                        {/* Row 1: Users */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                            <StatCard icon={<Users size={16} />}         label="Total de Usuários"       value={fmtN(s.total_users)}         color="text-white" />
                            <StatCard icon={<CalendarDays size={16} />}  label="Cadastros Hoje"          value={fmtN(s.users_today)}         color="text-primary"   sub="novos hoje" />
                            <StatCard icon={<CalendarRange size={16} />} label="Cadastros 7 dias"        value={fmtN(s.users_this_week)}     color="text-blue-400"  sub="últimos 7 dias" />
                            <StatCard icon={<UserCheck size={16} />}     label="Contas Aprovadas"        value={fmtN(s.approved_users)}      color="text-green-400" />
                            <StatCard icon={<Clock size={16} />}         label="Aguardando Aprovação"    value={fmtN(s.pending_users)}       color="text-yellow-400" badge={s.pending_users} />
                            <StatCard icon={<UserX size={16} />}         label="Bloqueados"              value={fmtN(s.blocked_users)}       color="text-red-400" />
                        </div>

                        {/* Row 2: Revenue */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            <StatCard icon={<Activity size={16} />}          label="Faturamento Hoje"        value={`R$ ${fmt(s.revenue_today)}`}        color="text-primary"   border="border-primary/10" />
                            <StatCard icon={<TrendingUp size={16} />}         label="Faturamento 7 dias"      value={`R$ ${fmt(s.revenue_this_week)}`}    color="text-green-400" />
                            <StatCard icon={<DollarSign size={16} />}         label="Faturamento 30 dias"     value={`R$ ${fmt(s.revenue_this_month)}`}   color="text-blue-400" />
                            <StatCard icon={<Wallet size={16} />}             label="Volume Total Plataforma" value={`R$ ${fmt(s.revenue_total)}`}        color="text-white"     sub="todas as transações pagas" />
                        </div>

                        {/* Row 3: Misc */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            <StatCard icon={<CreditCard size={16} />}         label="Vendas Hoje"             value={fmtN(s.tx_today)}            color="text-primary" />
                            <StatCard icon={<Clock size={16} />}              label="Transações Pendentes"    value={fmtN(s.pending_tx)}          color="text-yellow-400" badge={s.pending_tx} />
                            <StatCard icon={<Package size={16} />}            label="Produtos Ativos"         value={fmtN(s.active_products)}     color="text-green-400" sub={`${fmtN(s.pending_products)} aguardando aprovação`} badge={s.pending_products} />
                            <StatCard icon={<ArrowDownToLine size={16} />}    label="Saques Pendentes"        value={fmtN(s.pending_withdrawals)} color="text-orange-400" badge={s.pending_withdrawals} />
                            <StatCard icon={<Zap size={16} />}                label="Contas Demo"             value={fmtN(s.demo_users)}          color="text-purple-400" />
                        </div>

                        {/* Mini bar chart: new registrations last 7 days */}
                        {s.registration_chart && s.registration_chart.length > 0 && (
                            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CalendarDays size={13} className="text-primary" /> Novos Cadastros — Últimos 7 dias
                                </p>
                                <ResponsiveContainer width="100%" height={100}>
                                    <BarChart data={s.registration_chart} barSize={28}>
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 700 }} axisLine={false} tickLine={false} />
                                        <YAxis hide allowDecimals={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                            contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12 }}
                                            labelStyle={{ color: '#6b7280', fontWeight: 700 }}
                                            formatter={(v) => [`${v} cadastros`, '']}
                                        />
                                        <Bar dataKey="count" radius={[6,6,0,0]}>
                                            {s.registration_chart.map((entry, i) => (
                                                <Cell key={i} fill={entry.count > 0 ? '#a855f7' : '#e5e7eb'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* ── Vendas Recentes da Plataforma ── */}
            {adminData?.all_transactions?.length > 0 && (
                <div className="bg-white border border-gray-100 shadow-sm rounded-[40px] overflow-hidden">
                    <div className="p-5 md:p-8 border-b border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary shrink-0">
                                <Activity size={18} className="md:hidden" />
                                <Activity size={22} className="hidden md:block" />
                            </div>
                            <div>
                                <h3 className="text-base md:text-xl font-bold text-gray-900">Vendas Recentes</h3>
                                <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-0.5">Últimas 40 transações</p>
                            </div>
                        </div>
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">{adminData.all_transactions.length} reg.</span>
                    </div>
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-2 p-3">
                        {adminData.all_transactions.map(tx => (
                            <div key={tx.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                {/* Row 1: Customer + Status */}
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[14px] font-bold text-gray-900 truncate">{tx.customer_name}</h4>
                                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{tx.seller_name}</p>
                                    </div>
                                    <span className={cn(
                                        'px-2.5 py-1 rounded-lg text-[9px] font-black uppercase shrink-0 tracking-wide',
                                        tx.badge === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                                        tx.badge === 'expired'  ? 'bg-red-500/15 text-red-400' :
                                        tx.badge === 'rejected' ? 'bg-red-500/15 text-red-400' :
                                        'bg-orange-500/15 text-orange-400'
                                    )}>{tx.status}</span>
                                </div>
                                {/* Row 2: Amount + Meta */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-gray-400">#{tx.id} • {tx.date}</span>
                                    <span className="text-sm font-black text-gray-900">R$ {tx.amount_brl}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-100">
                                    <th className="p-5 pl-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID / Data</th>
                                    <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                                    <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendedor</th>
                                    <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor</th>
                                    <th className="p-5 pr-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {adminData.all_transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-5 pl-8">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400">#{tx.id}</span>
                                                <span className="text-xs text-gray-500 font-medium">{tx.date}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-sm font-semibold text-gray-700">{tx.customer_name}</span>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">{tx.seller_name}</span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="text-sm font-black text-gray-900">R$ {tx.amount_brl}</span>
                                        </td>
                                        <td className="p-5 pr-8 text-center">
                                            <span className={cn(
                                                'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                                                tx.badge === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                tx.badge === 'expired'  ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                tx.badge === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                            )}>{tx.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Nenhum conteúdo de usuários aqui – ver /admin/usuarios ── */}

            {/* Modals */}
            <AnimatePresence>
                {showDemoModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 lg:p-0">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowDemoModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white border border-gray-100 shadow-xl p-10 rounded-[48px]"
                        >
                            <h2 className="text-3xl font-black mb-2 tracking-tight text-gray-900">Gerar <span className="text-primary">Conta Demo</span></h2>
                            <p className="text-gray-500 text-sm mb-8">Essa conta terá saldo fictício para demonstração/influencers.</p>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.target);
                                handleAction('create_demo_user', Object.fromEntries(fd));
                            }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nome Completo</label>
                                    <input name="full_name" required className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 px-8 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">E-mail</label>
                                    <input name="email" type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 px-8 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Saldo Inicial</label>
                                        <input name="initial_balance" type="number" defaultValue="5000" className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 px-8 font-bold focus:outline-none focus:border-primary/50 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Senha</label>
                                        <input name="password" defaultValue="123456" className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 px-8 font-bold text-gray-900 focus:outline-none focus:border-primary/50" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full h-18 bg-primary text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg mt-4">
                                    CRIAR AGORA <Zap className="inline ml-2" />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showNormalModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 lg:p-0">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowNormalModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white border border-gray-100 shadow-xl p-10 rounded-[48px]"
                        >
                            <h2 className="text-3xl font-black mb-2 tracking-tight text-gray-900">Criar <span className="text-primary">Novo Usuário</span></h2>
                            <p className="text-gray-500 text-sm mb-8">Conta normal com status pendente. Admin poderá aprovar depois.</p>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.target);
                                handleAction('create_user', Object.fromEntries(fd));
                            }} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nome Completo</label>
                                    <input name="full_name" required className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 px-8 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">E-mail</label>
                                    <input name="email" type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 px-8 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Chave PIX</label>
                                    <input name="pix_key" className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 px-8 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50" placeholder="CPF, e-mail, telefone ou aleatória" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Senha</label>
                                        <input name="password" defaultValue="123456" className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 px-8 font-bold text-gray-900 focus:outline-none focus:border-primary/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Status Inicial</label>
                                        <select name="status" className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 px-8 font-bold text-gray-900 focus:outline-none focus:border-primary/50">
                                            <option value="pending">Pendente</option>
                                            <option value="approved">Aprovado</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full h-16 bg-primary text-white rounded-full font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg mt-2">
                                    CRIAR USUÁRIO <UserPlus className="inline ml-2" />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

