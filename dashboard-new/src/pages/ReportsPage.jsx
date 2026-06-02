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
import { useTheme } from '../contexts/ThemeContext';

export default function ReportsPage() {
    const { isDark } = useTheme();
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

    useEffect(() => { fetchReports(dateRange); }, [dateRange, fetchReports]);

    const m = data?.metrics || {};
    const salesData = data?.daily_sales || [];
    const convData = data?.daily_conv || [];
    const checkoutData = data?.top_checkouts || [];
    const totalCheckoutValue = checkoutData.reduce((sum, c) => sum + c.value, 0);

    const card = `rounded-xl border p-5 ${isDark ? 'bg-[#111117] border-white/[0.07]' : 'bg-white border-gray-100'}`;
    const ttStyle = {
        background: isDark ? '#111117' : '#fff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
        borderRadius: 10, fontSize: 12,
    };
    const tickFill = isDark ? '#4b5563' : '#9ca3af';
    const gridStroke = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';

    const kpis = [
        { title: 'Volume',      value: `R$ ${m.volume || '0,00'}`,   change: m.volume_change,     icon: DollarSign, color: '#10b981' },
        { title: 'Taxas',       value: `R$ ${m.taxes || '0,00'}`,    change: m.taxes_change,      icon: TrendingUp, color: '#f59e0b' },
        { title: 'Conversão',   value: `${m.conversion || 0}%`,      change: m.conversion_change, icon: Users,      color: '#6366f1' },
        { title: 'Vendas',      value: `${m.sales_count || 0}`,      change: m.sales_change,      icon: ShoppingBag,color: '#0ea5e9' },
    ];

    return (
        <div className="space-y-5 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className={`text-[18px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Relatórios</h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">Análise de desempenho das suas vendas</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`flex items-center p-1 rounded-lg border gap-0.5 ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-gray-50 border-gray-200'}`}>
                        {['7d', '30d', '90d', 'anual'].map((r) => (
                            <button key={r} onClick={() => setDateRange(r)}
                                className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                                    dateRange === r
                                        ? isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-800 shadow-sm'
                                        : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                }`}>
                                {r === 'anual' ? 'Ano' : r}
                            </button>
                        ))}
                    </div>
                    <button className={`p-2 rounded-lg border transition-all ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        <Download size={15} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32 gap-3">
                    <Loader2 size={20} className="text-emerald-500 animate-spin" />
                    <p className="text-[13px] text-gray-400">Carregando relatórios...</p>
                </div>
            ) : (
            <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {kpis.map(({ title, value, change, icon: Icon, color }) => {
                        const isUp = change >= 0;
                        const hasChange = change !== null && change !== undefined;
                        return (
                            <div key={title} className={`${card} flex flex-col gap-3`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-medium text-gray-400">{title}</span>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                                        <Icon size={13} style={{ color }} />
                                    </div>
                                </div>
                                <p className={`text-[20px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                                {hasChange && (
                                    <div className={`flex items-center gap-1 text-[11px] font-medium ${isUp ? 'text-emerald-500' : 'text-red-400'}`}>
                                        {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {isUp ? '+' : ''}{change}% vs. anterior
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Area Chart */}
                    <div className={`lg:col-span-2 ${card}`}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className={`text-[14px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Faturamento diário</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">Vendas acumuladas por dia</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[11px] text-gray-400">R$ vendas</span>
                            </div>
                        </div>
                        <div className="h-[260px]">
                            {salesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData}>
                                        <defs>
                                            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={gridStroke} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickFill, fontSize: 11 }} dy={8} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: tickFill, fontSize: 11 }} dx={-6} tickFormatter={v => `R$${v}`} />
                                        <Tooltip contentStyle={ttStyle} itemStyle={{ color: '#10b981' }}
                                            formatter={v => [`R$ ${v.toLocaleString('pt-BR')}`, 'Vendas']} />
                                        <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fill="url(#salesGrad)" dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-[13px] text-gray-400">Sem dados no período</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className={`${card} flex flex-col`}>
                        <div className="mb-5">
                            <h3 className={`text-[14px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Taxa de conversão</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">Por dia</p>
                        </div>
                        <div className="h-[160px]">
                            {convData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={convData}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={gridStroke} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickFill, fontSize: 10 }} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={ttStyle} itemStyle={{ color: '#6366f1' }}
                                            formatter={v => [`${v}%`, 'Conversão']} />
                                        <Bar dataKey="conv" fill="#6366f1" radius={[4,4,4,4]} barSize={14} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-[12px] text-gray-400">Sem dados</p>
                                </div>
                            )}
                        </div>
                        <div className={`mt-auto pt-4 grid grid-cols-2 gap-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                            {[
                                { label: 'Pedidos', value: m.total_orders || 0 },
                                { label: 'Ticket médio', value: `R$ ${m.avg_ticket || '0,00'}` },
                            ].map(({ label, value }) => (
                                <div key={label} className={`p-2.5 rounded-lg text-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                                    <p className={`text-[15px] font-bold mt-0.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Checkouts */}
                {checkoutData.length > 0 && (
                    <div className={`${card} grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                        <div>
                            <h3 className={`text-[14px] font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Top Checkouts</h3>
                            <div className="h-[220px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={checkoutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                                            {checkoutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={ttStyle} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">Total</p>
                                        <p className={`text-[18px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalCheckoutValue}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center gap-2.5">
                            {checkoutData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                                        <span className={`text-[13px] truncate max-w-[150px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
                                    </div>
                                    <span className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        {totalCheckoutValue > 0 ? Math.round((item.value / totalCheckoutValue) * 100) : 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
            )}
        </div>
    );
}
