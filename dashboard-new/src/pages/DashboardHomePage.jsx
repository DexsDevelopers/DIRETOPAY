import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import {
  RefreshCw, TrendingUp, TrendingDown, Banknote, ShoppingCart,
  Eye, EyeOff, ChevronRight, BarChart3, QrCode, Link2, Wallet, History
} from 'lucide-react';
import TransactionsTable from '../components/TransactionsTable';

export default function DashboardHomePage({ userData, fetchDashboard, dashboardData, loading, setActivePix, handleDeleteTransaction }) {
  const navigate = useNavigate();
  const [hideBalance, setHideBalance] = useState(false);
  const balance = dashboardData?.balance || '0,00';
  const stats   = dashboardData?.stats   || {};

  const spark = {
    up:   [3,5,4,6,5,7,6,8,7,9].map(v => ({ v })),
    flat: [5,4,6,5,7,5,6,4,5,6].map(v => ({ v })),
    down: [9,8,7,8,6,7,5,6,4,5].map(v => ({ v })),
  };

  function Spark({ data, color }) {
    return (
      <ResponsiveContainer width="100%" height={40}>
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
            fill={`url(#sg-${color.replace('#','')})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  const P  = '#1ea465';
  const P2 = '#126b41';

  const statCards = [
    { label: 'Saldo Total',   value: `R$ ${stats.total_paid   || '0,00'}`, sub: 'acumulado',           icon: Banknote,    color: P,        spark: spark.up   },
    { label: 'Volume Mensal', value: `R$ ${stats.month_volume || '0,00'}`, sub: 'este mês',             icon: TrendingUp,  color: '#0ea5e9', spark: spark.flat },
    { label: 'Vendas Hoje',   value: `R$ ${stats.today_volume || '0,00'}`, sub: `${stats.today_count ?? 0} venda${(stats.today_count ?? 0) !== 1 ? 's' : ''} realizada${(stats.today_count ?? 0) !== 1 ? 's' : ''}`, icon: ShoppingCart, color: '#10b981', spark: spark.up },
    { label: 'Pendentes',     value: stats.pending_count || '0',           sub: 'aguardando pagamento', icon: TrendingDown, color: '#f59e0b', spark: spark.down },
  ];

  const actions = [
    { icon: QrCode,       label: 'Gerar PIX',          sub: 'Cobrança rápida',  path: '/pix',        color: P },
    { icon: Link2,        label: 'Links de Pagamento', sub: 'Criar checkout',   path: '/checkouts',  color: P2 },
    { icon: Wallet,       label: 'Solicitar Saque',    sub: 'Transferir saldo', path: '/saques',     color: '#10b981' },
    { icon: ShoppingCart, label: 'Minhas Vendas',      sub: 'Ver relatórios',   path: '/vendas',     color: '#f59e0b' },
    { icon: BarChart3,    label: 'Relatórios',         sub: 'Desempenho geral', path: '/relatorios', color: '#0ea5e9' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-12">

      {/* GREETING */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }}>
        <h1 className="text-[22px] font-black text-gray-900 dark:text-white tracking-tight">
          Olá, {userData?.name?.split(' ')[0] || 'Usuário'}! 👋
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Aqui está o resumo da sua conta hoje.</p>
      </motion.div>

      {/* STATS ROW */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

        {/* Balance card */}
        <div className="sm:col-span-2 relative rounded-2xl overflow-hidden p-6 flex flex-col justify-between min-h-[170px]"
          style={{ background: 'linear-gradient(135deg, #3d0020 0%, #1a000e 50%, #0a0006 100%)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(ellipse at 85% 15%, rgba(30,164,101,.45), transparent 60%), radial-gradient(ellipse at 15% 85%, rgba(139,0,69,.30), transparent 55%)' }} />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-[.22em]">Saldo disponível</span>
                <button onClick={() => setHideBalance(v => !v)} className="text-white/30 hover:text-white/60 transition-colors">
                  {hideBalance ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
              <div className="text-[2.2rem] font-black text-white tracking-tight leading-none">
                {hideBalance ? 'R$ ••••••' : `R$ ${balance}`}
              </div>
              <p className="text-white/25 text-[11px] font-medium mt-1.5">Conta principal</p>
            </div>
            <button onClick={fetchDashboard}
              className="w-8 h-8 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all active:scale-90 shrink-0">
              <RefreshCw size={13} className="text-white/40" />
            </button>
          </div>
          <div className="relative z-10 flex items-end justify-between mt-4">
            <button onClick={() => navigate('/saques')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/18 border border-white/15 text-white text-xs font-black px-4 py-2 rounded-xl transition-all active:scale-95">
              Sacar agora <ChevronRight size={13} />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">ativo</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg, #1ea465, #ff4da6, #126b41, #ff80c0, #1ea465)' }} />
        </div>

        {/* 4 stat mini cards */}
        {statCards.map(({ label, value, sub, icon: Icon, color, spark: sparkData }, i) => (
          <motion.div key={label} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:.35, delay: .08 + i*.06 }}
            className="rounded-2xl border bg-white dark:bg-[#13131a] border-gray-100 dark:border-[#1e1e2e] p-4 flex flex-col justify-between hover:shadow-lg dark:hover:border-[#2e2e42] hover:-translate-y-0.5 transition-all duration-200 cursor-default">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[.14em]">{label}</span>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '22' }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{sub}</p>
            </div>
            <div className="mt-2 -mx-1">
              <Spark data={sparkData} color={color} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* QUICK ACTIONS */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.18 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map(({ icon: Icon, label, sub, path, color }) => (
          <motion.button key={label} onClick={() => navigate(path)}
            whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: .97 }}
            className="relative flex items-center gap-3 rounded-2xl border bg-white dark:bg-[#13131a] border-gray-100 dark:border-[#1e1e2e] px-4 py-3.5 text-left overflow-hidden group hover:shadow-md dark:hover:border-[#2e2e42] transition-all">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `radial-gradient(ellipse at 0% 50%, ${color}14, transparent 70%)` }} />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative z-10 transition-transform group-hover:scale-110"
              style={{ background: color + '1a' }}>
              <Icon size={17} style={{ color }} />
            </div>
            <div className="relative z-10 flex-1 min-w-0">
              <p className="font-black text-gray-900 dark:text-white text-sm leading-tight truncate">{label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight truncate">{sub}</p>
            </div>
            <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 relative z-10 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        ))}
      </motion.div>

      {/* BOTTOM: transactions + performance */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.24 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Transactions — 2/3 */}
        <div className="lg:col-span-2 rounded-2xl border bg-white dark:bg-[#13131a] border-gray-100 dark:border-[#1e1e2e] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-[#1e1e2e]">
            <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#1ea46522' }}>
                <History size={13} style={{ color: '#1ea465' }} />
              </span>
              Últimas transações
            </h2>
            <button onClick={() => navigate('/vendas')}
              className="text-[11px] font-black flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: '#1ea465' }}>
              Ver todas <ChevronRight size={12} />
            </button>
          </div>
          <TransactionsTable transactions={dashboardData?.transactions?.slice(0, 6)} loading={loading} onViewQr={setActivePix} onDelete={handleDeleteTransaction} />
        </div>

        {/* Performance — 1/3 */}
        <div className="rounded-2xl border bg-white dark:bg-[#13131a] border-gray-100 dark:border-[#1e1e2e] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#1ea46522' }}>
                <BarChart3 size={13} style={{ color: '#1ea465' }} />
              </span>
              Desempenho
            </h2>
            <span className="text-[10px] text-gray-400 font-bold">Este mês</span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Faturamento líquido</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">R$ {stats.month_volume || '0,00'}</p>
          </div>
          <div className="flex-1 min-h-[100px]">
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={[2,5,3,6,4,8,6,9,7,11,8,10].map(v => ({ v }))} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1ea465" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1ea465" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 11 }}
                  itemStyle={{ color: '#ff4da6' }}
                  formatter={(v) => [`R$ ${v * 100},00`, '']}
                  labelFormatter={() => ''}
                />
                <Area type="monotone" dataKey="v" stroke="#1ea465" strokeWidth={2} fill="url(#perfGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 dark:border-[#1e1e2e]">
            {[
              { label: 'Saldo Total', value: `R$ ${stats.total_paid || '0,00'}`, color: '#1ea465' },
              { label: 'Pendentes',   value: stats.pending_count || '0',          color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{label}</p>
                <p className="font-black text-gray-900 dark:text-white text-sm mt-0.5" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
