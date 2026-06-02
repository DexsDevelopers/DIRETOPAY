import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import {
  RefreshCw, TrendingUp, Banknote, ShoppingCart,
  Eye, EyeOff, ArrowUpRight, BarChart3, QrCode, Link2, Wallet, History,
  ArrowRight, Zap, Clock,
} from 'lucide-react';
import TransactionsTable from '../components/TransactionsTable';
import { useTheme } from '../contexts/ThemeContext';

function Sparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`s${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#s${color.replace('#','')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const card = 'rounded-xl border bg-white dark:bg-[#111117] border-gray-100 dark:border-white/[0.07]';

export default function DashboardHomePage({ userData, fetchDashboard, dashboardData, loading, setActivePix, handleDeleteTransaction }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [hideBalance, setHideBalance] = useState(false);
  const balance = dashboardData?.balance || '0,00';
  const stats   = dashboardData?.stats   || {};

  const sparkUp   = [3,5,4,6,5,7,6,8,7,9].map(v => ({ v }));
  const sparkFlat = [5,4,6,5,7,5,6,4,5,6].map(v => ({ v }));
  const sparkDown = [9,8,7,8,6,7,5,6,4,5].map(v => ({ v }));

  const kpis = [
    { label: 'Volume Mensal', value: `R$ ${stats.month_volume || '0,00'}`, delta: '+12%', up: true, icon: TrendingUp,   color: '#6366f1', spark: sparkUp },
    { label: 'Vendas Hoje',   value: `R$ ${stats.today_volume || '0,00'}`, delta: `${stats.today_count ?? 0} vendas`, up: true, icon: ShoppingCart, color: '#10b981', spark: sparkUp },
    { label: 'Receita Total', value: `R$ ${stats.total_paid   || '0,00'}`, delta: 'acumulado', up: true, icon: Banknote, color: '#f59e0b', spark: sparkFlat },
    { label: 'Aguardando',    value: stats.pending_count || '0',            delta: 'pendentes', up: false, icon: Clock,   color: '#ef4444', spark: sparkDown },
  ];

  const actions = [
    { icon: QrCode,    label: 'Gerar PIX',     path: '/pix',        color: '#10b981', bg: 'bg-emerald-500/10' },
    { icon: Link2,     label: 'Checkouts',     path: '/checkouts',  color: '#6366f1', bg: 'bg-indigo-500/10' },
    { icon: Wallet,    label: 'Sacar',         path: '/saques',     color: '#f59e0b', bg: 'bg-amber-500/10' },
    { icon: BarChart3, label: 'Relatórios',    path: '/relatorios', color: '#0ea5e9', bg: 'bg-sky-500/10' },
    { icon: History,   label: 'Transações',    path: '/vendas',     color: '#ec4899', bg: 'bg-pink-500/10' },
  ];

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-5 pb-12">
      {/* TOP BAR */}
      <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} transition={{ duration:.35 }}
        className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Bom dia, {userData?.name?.split(' ')[0] || 'Usuário'} 👋
          </h1>
          <p className="text-[12px] text-gray-400 mt-0.5 capitalize">{today}</p>
        </div>
        <button onClick={fetchDashboard}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${isDark ? 'border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
          <RefreshCw size={13} /> Atualizar
        </button>
      </motion.div>

      {/* BALANCE + KPI ROW */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:.35, delay:.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

        {/* Balance hero card */}
        <div className="sm:col-span-2 rounded-xl overflow-hidden relative"
          style={{ background: isDark ? 'linear-gradient(135deg, #0d2218 0%, #091810 100%)' : 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(16,185,129,.2) 0%, transparent 55%)' }} />
          <div className="relative z-10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Zap size={12} className="text-emerald-400" />
                </div>
                <span className="text-[11px] text-emerald-300/60 font-medium uppercase tracking-widest">Saldo disponível</span>
              </div>
              <button onClick={() => setHideBalance(v => !v)} className="text-white/30 hover:text-white/60 transition-colors p-1">
                {hideBalance ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <p className="text-[2rem] font-black text-white tracking-tight leading-none mb-4">
              {hideBalance ? 'R$ ••••••' : `R$ ${balance}`}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/saques')}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-all">
                Sacar <ArrowUpRight size={13} />
              </button>
              <button onClick={() => navigate('/pix')}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white/80 text-[12px] font-semibold px-3.5 py-1.5 rounded-lg border border-white/10 transition-all">
                <QrCode size={13} /> Gerar PIX
              </button>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        {kpis.map(({ label, value, delta, up, icon: Icon, color, spark }, i) => (
          <div key={label} className={`${card} p-4 flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            <div>
              <p className={`text-[18px] font-bold leading-none tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
              <p className={`text-[10px] mt-1 font-medium ${up ? 'text-emerald-500' : 'text-gray-400'}`}>{delta}</p>
            </div>
            <div className="-mx-1 mt-auto">
              <Sparkline data={spark} color={color} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* QUICK ACTIONS */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:.35, delay:.1 }}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[12px] font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ações rápidas</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {actions.map(({ icon: Icon, label, path, color, bg }) => (
            <button key={label} onClick={() => navigate(path)}
              className={`${card} flex flex-col items-center gap-2 py-3.5 px-2 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95`}>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={16} style={{ color }} />
              </div>
              <span className={`text-[11px] font-semibold text-center leading-tight ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* TRANSACTIONS + CHART */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:.35, delay:.15 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Transactions */}
        <div className={`lg:col-span-2 ${card} overflow-hidden`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2">
              <History size={14} className="text-emerald-500" />
              <span className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Últimas transações</span>
            </div>
            <button onClick={() => navigate('/vendas')}
              className="flex items-center gap-1 text-[11px] font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
              Ver todas <ArrowRight size={11} />
            </button>
          </div>
          <TransactionsTable transactions={dashboardData?.transactions?.slice(0, 6)} loading={loading} onViewQr={setActivePix} onDelete={handleDeleteTransaction} />
        </div>

        {/* Performance */}
        <div className={`${card} p-4 flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-emerald-500" />
              <span className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Desempenho</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${isDark ? 'bg-white/8 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>Este mês</span>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Faturamento</p>
            <p className={`text-[22px] font-bold tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              R$ {stats.month_volume || '0,00'}
            </p>
          </div>

          <div className="flex-1 min-h-[90px]">
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart data={[2,5,3,6,4,8,6,9,7,11,8,10].map((v, i) => ({ v, i }))} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: isDark ? '#111117' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`, borderRadius: 8, fontSize: 11, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(v) => [`R$ ${v * 100},00`, '']}
                  labelFormatter={() => ''}
                />
                <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#perfGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            {[
              { label: 'Total Pago',  value: `R$ ${stats.total_paid || '0,00'}`, color: '#10b981' },
              { label: 'Pendentes',  value: stats.pending_count || '0',           color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                <p className="font-bold text-[13px] mt-0.5" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
