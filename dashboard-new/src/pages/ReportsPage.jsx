import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, Users, DollarSign,
    ShoppingBag, ArrowUpRight, ArrowDownRight,
    Download, BarChart3, Loader2
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-xl shadow-gray-200/80">
                <p className="text-gray-500 text-xs font-semibold mb-1">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="text-gray-900 font-bold text-sm">
                        {entry.name === 'sales' ? `R$ ${entry.value.toLocaleString('pt-BR')}` : `${entry.value}%`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState('7d');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReports = useCallback(async (period) => {
        setLoading(true);
        try {
            const res = await fetch(`/get_reports_data.php?p=${period}`);
            const json = await res.json();
            if (json.success) setData(json);
        } catch (err) {
            console.error('Erro ao carregar relatórios:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports(dateRange);
    }, [dateRange, fetchReports]);

    const m = data?.metrics || {};
    const salesData = data?.daily_sales || [];
    const convData = data?.daily_conv || [];
    const checkoutData = data?.top_checkouts || [];
    const totalCheckoutValue = checkoutData.reduce((sum, c) => sum + c.value, 0);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                        <BarChart3 className="text-primary" size={32} />
                        Relatórios <span className="text-primary italic">Analíticos</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Acompanhe o desempenho das suas vendas com precisão.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-gray-50 rounded-full border border-gray-200 p-1">
                        {['7d', '30d', '90d', 'anual'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all duration-200 ${
                                    dateRange === range
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {range === 'anual' ? 'Anual' : range}
                            </button>
                        ))}
                    </div>

                    <button className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full p-3 transition-all" title="Exportar">
                        <Download size={18} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-gray-400 font-medium">Carregando relatórios...</p>
                    </div>
                </div>
            ) : (
            <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <MetricCard
                    title="Volume Transacionado"
                    value={`R$ ${m.volume || '0,00'}`}
                    change={m.volume_change || 0}
                    icon={<DollarSign size={22} />}
                />
                <MetricCard
                    title="Custo de Taxas"
                    value={`R$ ${m.taxes || '0,00'}`}
                    change={m.taxes_change || 0}
                    icon={<TrendingUp size={22} />}
                />
                <MetricCard
                    title="Taxa de Conversão"
                    value={`${m.conversion || 0}%`}
                    change={m.conversion_change || 0}
                    icon={<Users size={22} />}
                />
                <MetricCard
                    title="Vendas Realizadas"
                    value={`${m.sales_count || 0}`}
                    change={m.sales_change || 0}
                    icon={<ShoppingBag size={22} />}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Area Chart */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-900">Histórico de Faturamento</h3>
                            <p className="text-gray-400 text-sm font-medium">Desempenho financeiro diário</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                            Vendas (R$)
                        </div>
                    </div>

                    <div className="h-[320px] w-full">
                        {salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                                    dx={-10}
                                    tickFormatter={(v) => `R$ ${v}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#a78bfa"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-300 font-medium">Sem dados no período selecionado</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Conversion Chart */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-gray-900">Efetividade de Vendas</h3>
                        <p className="text-gray-400 text-sm font-medium">Taxa de conversão por dia</p>
                    </div>

                    <div className="h-[220px] w-full">
                        {convData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={convData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="conv"
                                    fill="#818cf8"
                                    radius={[6, 6, 6, 6]}
                                    barSize={18}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-300 font-medium text-sm">Sem dados</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-5 border-t border-gray-100 grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-2xl text-center border border-gray-100">
                            <p className="text-[11px] font-bold text-gray-400 mb-0.5">Total Pedidos</p>
                            <p className="text-xl font-black text-gray-900">{m.total_orders || 0}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-2xl text-center border border-gray-100">
                            <p className="text-[11px] font-bold text-gray-400 mb-0.5">Ticket Médio</p>
                            <p className="text-xl font-black text-gray-900">R$ {m.avg_ticket || '0,00'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Top Checkouts */}
            {checkoutData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-4">Top Checkouts</h3>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={checkoutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={6}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {checkoutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '16px',
                                    }}
                                    itemStyle={{ color: '#111827' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendas</p>
                                <p className="text-lg font-black text-gray-900">{totalCheckoutValue}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2.5 mt-3">
                        {checkoutData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-semibold text-gray-500">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">{totalCheckoutValue > 0 ? Math.round((item.value / totalCheckoutValue) * 100) : 0}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            )}
            </>
            )}
        </div>
    );
}

function MetricCard({ title, value, change, icon }) {
    const hasComparison = change !== null && change !== undefined;
    const isUp = hasComparison && change >= 0;
    const changeStr = !hasComparison ? null : change === 0 ? '0%' : `${isUp ? '+' : ''}${change}%`;
    return (
        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                {changeStr !== null ? (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}>
                        {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {changeStr}
                    </div>
                ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-gray-400 bg-gray-50">
                        — sem comparação
                    </div>
                )}
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h4 className="text-2xl font-black text-gray-900 mt-1">{value}</h4>
        </div>
    );
}
