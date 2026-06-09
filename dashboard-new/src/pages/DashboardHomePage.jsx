import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { SpotlightCard, BorderBeam, ScrollProgress, GlareCard, NumberTicker, ShinyText, RippleButton, BlurText, NeonCard } from '../components/AnimatedUI';
import {
  RefreshCw, TrendingUp, Banknote, ShoppingCart,
  Eye, EyeOff, ArrowUpRight, BarChart3, QrCode, Link2, Wallet, History,
  ArrowRight, Zap, Clock, Sparkles, Activity, CheckCircle2,
} from 'lucide-react';
import TransactionsTable from '../components/TransactionsTable';
import { useTheme } from '../contexts/ThemeContext';

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(formattedStr, duration = 950) {
  const num = parseFloat(String(formattedStr).replace(/\./g, '').replace(',', '.')) || 0;
  const [disp, setDisp] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (num === 0) { setDisp(0); return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisp(num * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisp(num);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [num]);
  return disp;
}

function fmtBR(n, decimals = 2) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  const gid = `sg${color.replace('#', '')}`;
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.28} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#${gid})`} dot={false} activeDot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Stagger preset ────────────────────────────────────────────────────────────
const fu = (d = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, delay: d, ease: [0.22, 1, 0.36, 1] },
});

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardHomePage({ userData, fetchDashboard, dashboardData, loading, setActivePix, handleDeleteTransaction }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [hideBalance, setHideBalance] = useState(false);
  const balance = dashboardData?.balance || '0,00';
  const stats   = dashboardData?.stats   || {};

  const balanceNum     = useCountUp(balance);
  const monthVolumeNum = useCountUp(stats.month_volume || '0');
  const todayVolumeNum = useCountUp(stats.today_volume || '0');
  const totalPaidNum   = useCountUp(stats.total_paid   || '0');

  const sparkUp   = [3,5,4,6,5,7,6,8,7,9].map(v => ({ v }));
  const sparkFlat = [5,4,6,5,7,5,6,4,5,6].map(v => ({ v }));
  const sparkDown = [9,8,7,8,6,7,5,6,4,5].map(v => ({ v }));

  const kpis = [
    { label: 'Volume Mensal', value: `R$ ${fmtBR(monthVolumeNum)}`, delta: `${stats.today_count ?? 0} hoje`,   up: true,  icon: TrendingUp,   color: '#6366f1', spark: sparkUp   },
    { label: 'Vendas Hoje',   value: `R$ ${fmtBR(todayVolumeNum)}`, delta: `${stats.today_count ?? 0} vendas`, up: true,  icon: ShoppingCart, color: '#10b981', spark: sparkUp   },
    { label: 'Receita Total', value: `R$ ${fmtBR(totalPaidNum)}`,   delta: 'acumulado',                         up: true,  icon: Banknote,     color: '#f59e0b', spark: sparkFlat },
    { label: 'Aguardando',    value: stats.pending_count || '0',     delta: 'pendentes',                         up: false, icon: Clock,        color: '#ef4444', spark: sparkDown },
  ];

  const actions = [
    { icon: QrCode,    label: 'Gerar PIX',  path: '/pix',        color: '#10b981', glow: '0 12px 28px rgba(16,185,129,0.38)' },
    { icon: Link2,     label: 'Checkouts',  path: '/checkouts',  color: '#6366f1', glow: '0 12px 28px rgba(99,102,241,0.38)' },
    { icon: Wallet,    label: 'Sacar',      path: '/saques',     color: '#f59e0b', glow: '0 12px 28px rgba(245,158,11,0.38)' },
    { icon: BarChart3, label: 'Relatórios', path: '/relatorios', color: '#0ea5e9', glow: '0 12px 28px rgba(14,165,233,0.38)' },
    { icon: History,   label: 'Transações', path: '/vendas',     color: '#ec4899', glow: '0 12px 28px rgba(236,72,153,0.38)' },
  ];

  const today    = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const nominal  = userData?.preferred_nominal ?? 'nominal1';

  const card = `rounded-2xl border ${isDark ? 'bg-[#111117] border-white/[0.07]' : 'bg-white border-gray-100'}`;

  const perfData = [2,5,3,6,4,8,6,9,7,11,8,10].map((v, i) => ({
    v, m: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i],
  }));

  return (
    <div className="space-y-5 pb-12 relative">
      <ScrollProgress color="#10b981" />

      {/* Background glow */}
      <div className="absolute top-0 left-0 right-0 h-[280px] pointer-events-none -z-10 overflow-hidden">
        <div className="w-full h-full" style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 200px at 50% -20px, rgba(16,185,129,0.08) 0%, transparent 100%)'
            : 'radial-gradient(ellipse 80% 200px at 50% -20px, rgba(16,185,129,0.05) 0%, transparent 100%)'
        }} />
      </div>

      {/* ── HEADER ── */}
      <motion.div {...fu(0)} className="flex items-start justify-between gap-4 pt-1">
        <div>
          <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1 capitalize">{today}</p>
          <h1 className={`text-[24px] font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {greeting},{' '}
            <ShinyText className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent" speed={4}>
              {userData?.name?.split(' ')[0] || 'Usuário'}
            </ShinyText>{' '}👋
          </h1>
          <p className={`text-[12px] mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Aqui está o resumo do seu negócio</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} onClick={fetchDashboard}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${
            isDark ? 'border-white/10 text-gray-400 hover:text-gray-100 hover:bg-white/5 hover:border-white/20'
                   : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
          }`}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Atualizar
        </motion.button>
      </motion.div>

      {/* ── LUNARPAY MIGRATION OFFER BANNER ── */}
      <motion.div
        {...fu(0.03)}
        className={`rounded-2xl border p-5 relative overflow-hidden ${
          (stats.total_paid_raw || 0) >= 1000
            ? isDark 
              ? 'bg-[#12101b] border-purple-500/20 shadow-[0_12px_40px_rgba(168,85,247,0.1)]' 
              : 'bg-gradient-to-br from-purple-50/50 to-indigo-50/50 border-purple-200 shadow-[0_12px_40px_rgba(168,85,247,0.05)]'
            : isDark
              ? 'bg-[#111117] border-white/[0.07] opacity-75'
              : 'bg-white border-gray-100 opacity-95'
        }`}
      >
        {/* Decorative Background Glows */}
        {(stats.total_paid_raw || 0) >= 1000 && (
          <>
            <BorderBeam colorFrom="#a855f7" colorTo="#6366f1" duration={10} />
            <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          </>
        )}
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {(stats.total_paid_raw || 0) >= 1000 ? (
                <>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${
                    isDark 
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                      : 'bg-purple-100 text-purple-700 border-purple-200'
                  }`}>
                    <Sparkles size={10} className="animate-pulse" /> Upgrade Disponível
                  </span>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Meta de R$ 1.000 alcançada! 🎉
                  </span>
                </>
              ) : (
                <>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${
                    isDark 
                      ? 'bg-purple-950/20 text-purple-300 border-purple-900/30' 
                      : 'bg-purple-50 text-purple-600 border-purple-100'
                  }`}>
                    <Clock size={10} /> Meta de Upgrade
                  </span>
                  <span className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Falta R$ {(1000 - (stats.total_paid_raw || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para o upgrade da LunarPay
                  </span>
                </>
              )}
            </div>
            
            <h3 className={`text-[18px] font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {(stats.total_paid_raw || 0) >= 1000 ? (
                <>
                  Você desbloqueou o direito de migrar para a{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent font-black">
                    LunarPay
                  </span>
                </>
              ) : (
                <>
                  Bata R$ 1.000,00 de faturamento e migre para a{' '}
                  <span className="text-purple-500 font-black">
                    LunarPay
                  </span>
                </>
              )}
            </h3>
            
            <p className={`text-[12.5px] max-w-3xl leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              A LunarPay é a nossa plataforma premium com <strong>taxas baixíssimas (quase nada)</strong>, atualizações mais rápidas, gerentes individuais, contas nominais e adquirentes blindadas sem aviso de golpe.
            </p>
            
            <div className={`text-[11px] p-2.5 rounded-xl border flex items-start gap-2 ${
              isDark 
                ? 'bg-amber-500/5 border-amber-500/10 text-amber-200/80' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <span className="shrink-0 text-amber-500 font-bold">⚠️ Atenção:</span>
              <span>
                A LunarPay <strong>não possui placas de premiação física</strong>. Se você fizer a migração, deixará de concorrer às placas do Hall da Fama da DiretoPay. A escolha é totalmente sua!
              </span>
            </div>
          </div>
          
          <div className="shrink-0 self-stretch md:self-auto flex items-center justify-end">
            {(stats.total_paid_raw || 0) >= 1000 ? (
              <a
                href="https://lunarpay.site"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[13px] font-black px-5 py-3 rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.3)] transition-all active:scale-95 whitespace-nowrap"
              >
                Conhecer a LunarPay <ArrowUpRight size={14} />
              </a>
            ) : (
              <div className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-[13px] font-bold ${
                isDark ? 'border-white/10 text-gray-500 bg-white/5' : 'border-gray-200 text-gray-400 bg-gray-50'
              }`}>
                Bloqueado 🔒
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── BALANCE + KPI CARDS ── */}
      <motion.div {...fu(0.06)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

        {/* Balance hero */}
        <div className="sm:col-span-2 rounded-2xl overflow-hidden relative"
          style={{ background: isDark
            ? 'linear-gradient(135deg, #0a1f14 0%, #061510 50%, #040e09 100%)'
            : 'linear-gradient(135deg, #064e3b 0%, #043d2e 50%, #02291e 100%)' }}>
          <BorderBeam colorFrom="#10b981" colorTo="#34d399" duration={10} />
          <div className="absolute right-[-50px] top-[-50px] w-[200px] h-[200px] rounded-full border border-emerald-500/10 pointer-events-none" />
          <div className="absolute right-[-25px] top-[-25px] w-[130px] h-[130px] rounded-full border border-emerald-500/15 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 80% 10%, rgba(16,185,129,0.28) 0%, transparent 55%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                  <Zap size={11} className="text-emerald-400" />
                </div>
                <span className="text-[9.5px] text-emerald-300/50 font-black uppercase tracking-[0.18em]">Saldo disponível</span>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setHideBalance(v => !v)}
                className="text-white/25 hover:text-white/70 transition-colors p-1.5 rounded-lg hover:bg-white/10">
                {hideBalance ? <EyeOff size={13} /> : <Eye size={13} />}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              <motion.p key={hideBalance ? 'h' : 'v'}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="text-[2.6rem] font-black text-white tracking-tight leading-none mb-1">
                {hideBalance ? 'R$ ••••••' : `R$ ${fmtBR(balanceNum)}`}
              </motion.p>
            </AnimatePresence>
            <p className="text-[10.5px] text-emerald-300/35 font-medium mb-5">Disponível para saque imediato</p>

            <div className="flex items-center gap-2">
              <RippleButton onClick={() => navigate('/saques')} color="rgba(16,185,129,0.5)"
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-[12px] font-bold px-4 py-2 rounded-xl transition-colors"
                style={{ boxShadow: '0 0 24px rgba(16,185,129,0.35)' }}>
                Sacar <ArrowUpRight size={13} />
              </RippleButton>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/pix')}
                className="flex items-center gap-1.5 bg-white/8 hover:bg-white/14 text-white/80 text-[12px] font-semibold px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <QrCode size={13} /> Gerar PIX
              </motion.button>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        {kpis.map(({ label, value, delta, up, icon: Icon, color, spark }, i) => (
          <motion.div key={label} {...fu(0.08 + i * 0.05)} whileHover={{ y: -4 }}>
            <GlareCard className="h-full">
            <SpotlightCard color={`${color}18`} className={`${card} p-4 flex flex-col gap-2.5 cursor-default group h-full`}>
            <div className="flex items-center justify-between relative">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                style={{ background: `${color}18` }}>
                <Icon size={12} style={{ color }} />
              </div>
            </div>
            <div className="relative">
              <p className={`text-[19px] font-black leading-none tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
              <p className={`text-[10px] mt-1.5 font-semibold ${up ? 'text-emerald-500' : 'text-gray-400'}`}>{delta}</p>
            </div>
            <div className="-mx-1 mt-auto">
              <Sparkline data={spark} color={color} />
            </div>
            </SpotlightCard>
            </GlareCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ── GATEWAY STATUS BAR ── */}
      <motion.div {...fu(0.22)}
        className={`rounded-2xl border px-5 py-3 flex items-center justify-between flex-wrap gap-3 ${isDark ? 'bg-[#111117] border-white/[0.07]' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className={`text-[11px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Gateway Ativo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={11} className="text-gray-400" />
            <span className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Rota: <span className="text-emerald-500 font-black">{nominal.toUpperCase()}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={11} className="text-emerald-400" />
            <span className={`text-[11px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>PIX em tempo real</span>
          </div>
        </div>
        <div className={`text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full border ${isDark ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}`}>
          ONLINE
        </div>
      </motion.div>

      {/* ── QUICK ACTIONS ── */}
      <motion.div {...fu(0.28)}>
        <div className="flex items-center gap-2 mb-3.5">
          <div className="w-[3px] h-4 rounded-full bg-emerald-500" />
          <span className={`text-[10.5px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ações rápidas</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {actions.map(({ icon: Icon, label, path, color, glow }, i) => (
            <motion.button key={label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.38, ease: [0.22,1,0.36,1] }}
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate(path)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = glow; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              className={`${card} flex flex-col items-center gap-2.5 py-4 px-2 group relative overflow-hidden`}
              style={{ transition: 'box-shadow 0.25s ease, transform 0.22s ease' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}0e, transparent 65%)` }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-200"
                style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <span className={`text-[11px] font-bold text-center leading-tight relative z-10 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── TRANSACTIONS + PERFORMANCE ── */}
      <motion.div {...fu(0.34)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Transactions */}
        <div className={`lg:col-span-2 ${card} overflow-hidden`}>
          <div className={`flex items-center justify-between px-5 py-3.5 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <History size={12} className="text-emerald-500" />
              </div>
              <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Últimas transações</span>
              {loading
                ? <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                : <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> ao vivo
                  </span>
              }
            </div>
            <motion.button whileHover={{ x: 3 }} onClick={() => navigate('/vendas')}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
              Ver todas <ArrowRight size={11} />
            </motion.button>
          </div>
          <TransactionsTable
            transactions={dashboardData?.transactions?.slice(0, 6)}
            loading={loading}
            onViewQr={setActivePix}
            onDelete={handleDeleteTransaction}
          />
        </div>

        {/* Performance widget */}
        <div className={`${card} p-5 flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Sparkles size={12} className="text-emerald-500" />
              </div>
              <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Desempenho</span>
            </div>
            <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider ${isDark ? 'bg-white/8 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
              Este mês
            </span>
          </div>

          <div className={`p-3 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
            <p className={`text-[9.5px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Faturamento</p>
            <p className={`text-[26px] font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              R$ {fmtBR(monthVolumeNum)}
            </p>
          </div>

          <div className="flex-1 min-h-[90px]">
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart data={perfData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: isDark ? '#111117' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`, borderRadius: 10, fontSize: 11 }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(v) => [`${(v * 10).toFixed(0)}x`, '']}
                  labelFormatter={(_, p) => p?.[0]?.payload?.m || ''}
                />
                <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#perfGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`grid grid-cols-2 gap-2.5 pt-4 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            {[
              { label: 'Total Pago', value: `R$ ${stats.total_paid || '0,00'}`, color: '#10b981' },
              { label: 'Pendentes', value: stats.pending_count || '0',           color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <motion.div key={label} whileHover={{ scale: 1.03 }}
                className={`p-3 rounded-xl cursor-default ${isDark ? 'bg-white/[0.03] hover:bg-white/[0.05]' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                <p className={`text-[9px] font-black uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
                <p className="font-black text-[15px] leading-none" style={{ color }}>{value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
