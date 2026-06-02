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
import { motion } from 'framer-motion';
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

    const PERIODS = [
        { key: '7d', label: '7 dias' }, { key: '30d', label: '30 dias' },
        { key: '90d', label: '90 dias' }, { key: 'anual', label: 'Ano' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, ease: [0.22,1,0.36,1] }}
            className="space-y-5 pb-10">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-[3px] h-4 rounded-full bg-emerald-500" />
                        <p className={`text-[10.5px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Analytics</p>
                    </div>
                    <h1 className={`text-[22px] font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Relatórios</h1>
                    <p className={`text-[12px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Análise de desempenho das suas vendas</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`flex items-center p-1 rounded-xl border gap-0.5 ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-gray-50 border-gray-200'}`}>
                        {PERIODS.map(({ key, label }) => (
                            <button key={key} onClick={() => setDateRange(key)}
                                className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all ${
                                    dateRange === key
                                        ? isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-800 shadow-sm'
                                        : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                }`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <button className={`p-2 rounded-xl border transition-all hover:scale-[1.03] active:scale-95 ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        <Download size={15} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <div className="w-10 h-10 border-[3px] border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className={`text-[12px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Carregando relatórios...</p>
                </div>
            ) : (
            <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {kpis.map(({ title, value, change, icon: Icon, color }, i) => {
                        const isUp = change >= 0;
                        const hasChange = change !== null && change !== undefined;
                        return (
                            <motion.div key={title}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.35 }}
                                className={`${card} flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-default`}>
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{title}</span>
                                    <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                                        <Icon size={12} style={{ color }} />
                                    </div>
                                </div>
                                <p className={`text-[21px] font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                                {hasChange && (
                                    <div className={`flex items-center gap-1 text-[10.5px] font-bold ${isUp ? 'text-emerald-500' : 'text-red-400'}`}>
                                        {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {isUp ? '+' : ''}{change}% vs. anterior
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Area Chart */}
                    <div className={`lg:col-span-2 ${card}`}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className={`text-[14px] font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Faturamento diário</h3>
                                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Vendas acumuladas por dia</p>
                            </div>
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)' }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10.5px] font-semibold text-emerald-500">R$ vendas</span>
                            </div>
                        </div>
                        <div className="h-[260px]">
                            {salesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData}>
                                        <defs>
                                            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.22} />
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
                                <div className="h-full flex flex-col items-center justify-center gap-3">
                                    <BarChart3 size={28} className="text-gray-300" />
                                    <p className={`text-[12px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Sem dados no período</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className={`${card} flex flex-col`}>
                        <div className="mb-5">
                            <h3 className={`text-[14px] font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Taxa de conversão</h3>
                            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Por dia</p>
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
                                        <Bar dataKey="conv" fill="#6366f1" radius={[5,5,0,0]} barSize={14} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className={`text-[12px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Sem dados</p>
                                </div>
                            )}
                        </div>
                        <div className={`mt-auto pt-4 grid grid-cols-2 gap-2.5 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                            {[
                                { label: 'Pedidos', value: m.total_orders || 0, color: '#6366f1' },
                                { label: 'Ticket médio', value: `R$ ${m.avg_ticket || '0,00'}`, color: '#10b981' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                                    <p className={`text-[9px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
                                    <p className="text-[15px] font-black" style={{ color }}>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Checkouts */}
                {checkoutData.length > 0 && (
                    <div className={`${card} grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                        <div>
                            <h3 className={`text-[14px] font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Top Checkouts</h3>
                            <div className="h-[220px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={checkoutData} cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={3} dataKey="value" stroke="none">
                                            {checkoutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={ttStyle} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Total</p>
                                        <p className={`text-[20px] font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalCheckoutValue}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center gap-3">
                            {checkoutData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                                        <span className={`text-[12.5px] truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className={`h-1.5 rounded-full w-16 overflow-hidden ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                            <div className="h-full rounded-full" style={{ width: `${totalCheckoutValue > 0 ? Math.round((item.value / totalCheckoutValue) * 100) : 0}%`, background: item.color }} />
                                        </div>
                                        <span className={`text-[12px] font-black w-8 text-right ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {totalCheckoutValue > 0 ? Math.round((item.value / totalCheckoutValue) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
            )}
        </motion.div>
    );
}
