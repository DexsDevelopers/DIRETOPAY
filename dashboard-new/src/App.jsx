// LunarPay SPA v2.1 - Build for Auth & Checkout
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, History, Wallet, Settings, Menu, Loader2, Sun, Moon, QrCode, Link2, ArrowUpRight, Plus, RefreshCw, TrendingUp, TrendingDown, ArrowRight, Banknote, ShoppingCart, Eye, EyeOff, ChevronRight, BarChart3, Zap, Package } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AnnouncementBar from './components/AnnouncementBar';
import StatCard from './components/StatCard';
import TransactionsTable from './components/TransactionsTable';
import GeneratePixCard from './components/GeneratePixCard';
import PixModal from './components/PixModal';
import PushManager from './components/PushManager';
import WhatsAppPopup from './components/WhatsAppPopup';

// Pages
import LandingPage from './pages/LandingPage';
import SalesPage from './pages/SalesPage';
import WithdrawalsPage from './pages/WithdrawalsPage';
import SettingsPage from './pages/SettingsPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import AdminApisPage from './pages/AdminApisPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import CheckoutsPage from './pages/CheckoutsPage';
import CheckoutBuilderPage from './pages/CheckoutBuilderPage';
import ApiDocsPage from './pages/ApiDocsPage';
import ReportsPage from './pages/ReportsPage';
import AffiliatePage from './pages/AffiliatePage';
import DemoPage from './pages/DemoPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProdutosPage from './pages/ProdutosPage';
import AssinaturasPage from './pages/AssinaturasPage';
import CuponsPage from './pages/CuponsPage';
import CriarProdutoPage from './pages/CriarProdutoPage';
import LojaPage from './pages/LojaPage';
import VitrinePage from './pages/VitrinePage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminProdutosPage from './pages/AdminProdutosPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAnunciosPage from './pages/AdminAnunciosPage';
import AdminBannersPage from './pages/AdminBannersPage';
import EntregaPage from './pages/EntregaPage';
import ChatPage from './pages/ChatPage';
import AdminChatsPage from './pages/AdminChatsPage';
import AdminSaquesPage from './pages/AdminSaquesPage';
import PixPage from './pages/PixPage';
import AdminGatewaysPage from './pages/AdminGatewaysPage';
import BuyerChatPage from './pages/BuyerChatPage';
import ParceirosPage from './pages/ParceirosPage';
import PremiacoesPage from './pages/PremiacoesPage';
import AnnouncementModal from './components/AnnouncementModal';

// Proteção de Rota Admin
function AdminRoute({ children, userData }) {
  if (!userData?.is_admin) return <Navigate to="/dashboard" />;
  return children;
}

// Layout do Dashboard (Privado)
function DashboardLayout({ children, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, userData, balance, notifications, onMarkRead, onMarkAllRead }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-['Outfit'] overflow-hidden">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        userData={userData}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        onClose={() => setIsSidebarOpen(false)}
      />

      <AnnouncementModal />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AnnouncementBar />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <Header
          userData={userData}
          notifications={notifications}
          onMenuClick={() => setIsSidebarOpen(true)}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative">
          {children}
        </main>
      </div>
      <PushManager />
    </div>
  );
}

function PrivateRoute({ children }) {
  const isAuthenticated = window.__AUTH__ === true;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePix, setActivePix] = useState(null);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const prevUnreadRef = useRef(null);

  useEffect(() => {
    console.log("APP MOUNTED. Current path:", location.pathname);
    fetchDashboard();

    // Polling de notificações a cada 30s
    const notifInterval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(notifInterval);
  }, []);

  const playSaleSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/get_dashboard_data.php');
      const data = await res.json();
      if (data.success) {
        const newUnread = (data.notifications || []).filter(n => !n.is_read).length;
        if (prevUnreadRef.current !== null && newUnread > prevUnreadRef.current) {
          playSaleSound();
        }
        prevUnreadRef.current = newUnread;
        setDashboardData(prev => prev ? { ...prev, notifications: data.notifications } : data);
      }
    } catch (err) {}
  };

  const handleMarkRead = async (id) => {
    try {
      await fetch('/mark_read.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setDashboardData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
      }));
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    try {
      await Promise.all(unread.map(n =>
        fetch('/mark_read.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: n.id })
        })
      ));
      setDashboardData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, is_read: true }))
      }));
    } catch (err) {}
  };

  console.log("RENDERING APP. Path:", location.pathname, "dashboardData:", !!dashboardData);

  const fetchDashboard = async () => {
    console.log("LunarPay SPA v2.2 - Iniciando carga de dados...");
    try {
      const res = await fetch('/get_dashboard_data.php');
      const data = await res.json();
      console.log("Dashboard data user:", JSON.stringify(data?.user));
      if (data.success) {
        setDashboardData(data);
        if (!data.user?.whatsapp) setShowWhatsAppPopup(true);
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // GeneratePixCard já chama o `/api.php` e retorna { id, amount, code, image }.
  // Aqui a gente só precisa abrir o modal e atualizar o dashboard.
  const handleManualPix = async (pixData) => {
    try {
      if (!pixData?.id) return;
      setActivePix({ ...pixData, createdAt: Date.now() });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Deseja excluir esta transação?')) return;
    try {
      const res = await fetch(`/delete_transaction.php?id=${id}`);
      const data = await res.json();
      if (data.success) fetchDashboard();
    } catch (err) { console.error(err); }
  };

  const commonProps = {
    isSidebarOpen,
    setIsSidebarOpen,
    setActiveTab,
    userData: dashboardData?.user || { name: 'Usuário', email: '' },
    balance: dashboardData?.balance || '0,00',
    notifications: dashboardData?.notifications || [],
    onMarkRead: handleMarkRead,
    onMarkAllRead: handleMarkAllRead
  };

  const { userData, balance, notifications } = commonProps;

  function DashboardHome({ userData, fetchDashboard, dashboardData, loading, activePix, setActivePix, handleManualPix, handleDeleteTransaction }) {
    const navigate = useNavigate();
    const [hideBalance, setHideBalance] = useState(false);
    const balance   = dashboardData?.balance || '0,00';
    const stats     = dashboardData?.stats   || {};

    /* ── mini sparkline datasets ── */
    const spark = {
      up:   [3,5,4,6,5,7,6,8,7,9].map((v,i) => ({ v })),
      flat: [5,4,6,5,7,5,6,4,5,6].map((v,i) => ({ v })),
      down: [9,8,7,8,6,7,5,6,4,5].map((v,i) => ({ v })),
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

    const P = '#C0006A';   // LunarPay primary
    const P2= '#8B0045';   // LunarPay secondary

    const statCards = [
      { label: 'Saldo Total',   value: `R$ ${stats.total_paid   || '0,00'}`, sub: 'acumulado',           icon: Banknote,    color: P,       spark: spark.up,   trend: '+' },
      { label: 'Volume Mensal', value: `R$ ${stats.month_volume || '0,00'}`, sub: 'este mês',             icon: TrendingUp,  color: '#0ea5e9', spark: spark.flat, trend: '+' },
      { label: 'Vendas Hoje',   value: `R$ ${stats.today_volume || '0,00'}`, sub: '0 vendas realizadas',  icon: ShoppingCart,color: '#10b981', spark: spark.up,   trend: null },
      { label: 'Pendentes',     value: stats.pending_count || '0',           sub: 'aguardando pagamento', icon: TrendingDown, color: '#f59e0b', spark: spark.down, trend: null },
    ];

    const actions = [
      { icon: QrCode,       label: 'Gerar PIX',           sub: 'Cobrança rápida',    path: '/pix',       color: P },
      { icon: Link2,        label: 'Links de Pagamento',  sub: 'Criar checkout',     path: '/checkouts', color: P2 },
      { icon: Wallet,       label: 'Solicitar Saque',     sub: 'Transferir saldo',   path: '/saques',    color: '#10b981' },
      { icon: ShoppingCart, label: 'Minhas Vendas',       sub: 'Ver relatórios',     path: '/vendas',    color: '#f59e0b' },
      { icon: BarChart3,    label: 'Relatórios',          sub: 'Desempenho geral',   path: '/relatorios',color: '#0ea5e9' },
    ];

    const cardBase = 'rounded-2xl border transition-all duration-200';
    const darkCard = `${cardBase} bg-[#13131a] border-[#1e1e2e]`;
    const lightCard= `${cardBase} bg-white border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.05)]`;

    return (
      <div className="space-y-5 animate-in fade-in duration-500 pb-12">

        {/* ── GREETING ── */}
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }}>
          <h1 className="text-[22px] font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Olá, {userData?.name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Aqui está o resumo da sua conta hoje.</p>
        </motion.div>

        {/* ── STATS ROW ── */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          {/* Balance card — col-span-2 */}
          <div className="sm:col-span-2 relative rounded-2xl overflow-hidden p-6 flex flex-col justify-between min-h-[170px]"
            style={{ background: 'linear-gradient(135deg, #3d0020 0%, #1a000e 50%, #0a0006 100%)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(ellipse at 85% 15%, rgba(192,0,106,.45), transparent 60%), radial-gradient(ellipse at 15% 85%, rgba(139,0,69,.30), transparent 55%)' }} />

            {/* top row */}
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

            {/* bottom row */}
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

            {/* rainbow line */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px]"
              style={{ background: 'linear-gradient(90deg, #C0006A, #ff4da6, #8B0045, #ff80c0, #C0006A)' }} />
          </div>

          {/* 4 stat mini cards */}
          {statCards.map(({ label, value, sub, icon: Icon, color, spark: sparkData }, i) => (
            <motion.div key={label} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:.35, delay: .08 + i*.06 }}
              className="rounded-2xl border bg-white dark:bg-[#13131a] border-gray-100 dark:border-[#1e1e2e] p-4 flex flex-col justify-between hover:shadow-lg dark:hover:border-[#2e2e42] hover:-translate-y-0.5 transition-all duration-200 cursor-default">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[.14em]">{label}</span>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: color + '22' }}>
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

        {/* ── QUICK ACTIONS ── */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.18 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {actions.map(({ icon: Icon, label, sub, path, color }, i) => (
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

        {/* ── BOTTOM: transactions + performance ── */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4, delay:.24 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Transactions — 2/3 */}
          <div className="lg:col-span-2 rounded-2xl border bg-white dark:bg-[#13131a] border-gray-100 dark:border-[#1e1e2e] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-[#1e1e2e]">
              <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#C0006A22' }}>
                  <History size={13} style={{ color: '#C0006A' }} />
                </span>
                Últimas transações
              </h2>
              <button onClick={() => navigate('/vendas')}
                className="text-[11px] font-black flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: '#C0006A' }}>
                Ver todas <ChevronRight size={12} />
              </button>
            </div>
            <TransactionsTable transactions={dashboardData?.transactions?.slice(0, 6)} loading={loading} onViewQr={setActivePix} onDelete={handleDeleteTransaction} />
          </div>

          {/* Performance — 1/3 */}
          <div className="rounded-2xl border bg-white dark:bg-[#13131a] border-gray-100 dark:border-[#1e1e2e] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#C0006A22' }}>
                  <BarChart3 size={13} style={{ color: '#C0006A' }} />
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
                      <stop offset="5%"  stopColor="#C0006A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C0006A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 11 }}
                    itemStyle={{ color: '#ff4da6' }}
                    formatter={(v) => [`R$ ${v * 100},00`, '']}
                    labelFormatter={() => ''}
                  />
                  <Area type="monotone" dataKey="v" stroke="#C0006A" strokeWidth={2} fill="url(#perfGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 dark:border-[#1e1e2e]">
              {[
                { label: 'Saldo Total', value: `R$ ${stats.total_paid || '0,00'}`, color: '#C0006A' },
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

  return (
    <ThemeProvider>
    <>
      {showWhatsAppPopup && <WhatsAppPopup onClose={() => setShowWhatsAppPopup(false)} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/docs" element={<ApiDocsPage />} />
        <Route path="/login" element={<LoginPage onLogin={fetchDashboard} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/entrega/:token" element={<EntregaPage />} />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="dashboard">
              <DashboardHome userData={userData} fetchDashboard={fetchDashboard} dashboardData={dashboardData} loading={loading} activePix={activePix} setActivePix={setActivePix} handleManualPix={handleManualPix} handleDeleteTransaction={handleDeleteTransaction} />
            </DashboardLayout>
          </PrivateRoute>
        } />


        <Route path="/pix" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="pix">
              <PixPage handleManualPix={handleManualPix} activePix={activePix} setActivePix={setActivePix} balance={commonProps.balance} />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/vendas" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="vendas">
              <SalesPage transactions={dashboardData?.transactions} loading={loading} onViewQr={setActivePix} onDelete={handleDeleteTransaction} />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/relatorios" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="relatorios">
              <ReportsPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/saques" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="saques">
              <WithdrawalsPage balance={commonProps.balance} availableForWithdraw={dashboardData?.available_for_withdraw} pendingWithdrawals={dashboardData?.pending_withdrawals} transactions={dashboardData?.transactions} />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/afiliado" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="afiliado">
              <AffiliatePage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/config" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="settings">
              <SettingsPage userData={commonProps.userData} onProfileSaved={fetchDashboard} />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/admin" element={
          <PrivateRoute>
            <AdminRoute userData={userData}>
              <DashboardLayout {...commonProps} activeTab="admin">
                <AdminPage />
              </DashboardLayout>
            </AdminRoute>
          </PrivateRoute>
        } />

        <Route path="/admin/vendas" element={
          <PrivateRoute>
            <AdminRoute userData={userData}>
              <DashboardLayout {...commonProps} activeTab="admin-vendas">
                <AdminTransactionsPage />
              </DashboardLayout>
            </AdminRoute>
          </PrivateRoute>
        } />

        <Route path="/admin/apis" element={
          <PrivateRoute>
            <AdminRoute userData={userData}>
              <DashboardLayout {...commonProps} activeTab="apis">
                <AdminApisPage />
              </DashboardLayout>
            </AdminRoute>
          </PrivateRoute>
        } />

        <Route path="/admin/gateways" element={
          <PrivateRoute>
            <AdminRoute userData={userData}>
              <DashboardLayout {...commonProps} activeTab="admin-gateways">
                <AdminGatewaysPage />
              </DashboardLayout>
            </AdminRoute>
          </PrivateRoute>
        } />

        <Route path="/checkouts" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="checkouts">
              <CheckoutsPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/checkout-builder" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="checkout-builder">
              <CheckoutBuilderPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/admin/usuarios" element={
          <PrivateRoute>
            <AdminRoute userData={userData}>
              <DashboardLayout {...commonProps} activeTab="admin-usuarios">
                <AdminUsersPage />
              </DashboardLayout>
            </AdminRoute>
          </PrivateRoute>
        } />

        <Route path="/admin/produtos" element={
          <PrivateRoute>
            <AdminRoute userData={userData}>
              <DashboardLayout {...commonProps} activeTab="admin-produtos">
                <AdminProdutosPage />
              </DashboardLayout>
            </AdminRoute>
          </PrivateRoute>
        } />

        <Route path="/admin/banners" element={
          <PrivateRoute>
            <AdminRoute userData={userData}>
              <DashboardLayout {...commonProps} activeTab="admin-banners">
                <AdminBannersPage />
              </DashboardLayout>
            </AdminRoute>
          </PrivateRoute>
        } />

        <Route path="/admin/anuncios" element={
          <PrivateRoute>
            <AdminRoute userData={userData}>
              <DashboardLayout {...commonProps} activeTab="admin-anuncios">
                <AdminAnunciosPage />
              </DashboardLayout>
            </AdminRoute>
          </PrivateRoute>
        } />

        <Route path="/admin/saques" element={
          <PrivateRoute>
            <AdminRoute userData={userData}>
              <DashboardLayout {...commonProps} activeTab="admin-saques">
                <AdminSaquesPage />
              </DashboardLayout>
            </AdminRoute>
          </PrivateRoute>
        } />

        <Route path="/vendedor/produtos" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="produtos">
              <ProdutosPage />
            </DashboardLayout>
          </PrivateRoute>
        } />
        <Route path="/vendedor/produtos/novo" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="produtos">
              <CriarProdutoPage />
            </DashboardLayout>
          </PrivateRoute>
        } />
        <Route path="/vendedor/produtos/editar/:id" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="produtos">
              <CriarProdutoPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/vendedor/cupons" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="cupons">
              <CuponsPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/vendedor/assinaturas" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="assinaturas">
              <AssinaturasPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/vendedor/loja" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="loja">
              <LojaPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/vitrine" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="vitrine">
              <VitrinePage />
            </DashboardLayout>
          </PrivateRoute>
        } />
        <Route path="/vitrine/produto/:id" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="vitrine">
              <ProductDetailPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/chat" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="chat">
              <ChatPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/admin/chats" element={
          <PrivateRoute>
            <AdminRoute userData={userData}>
              <DashboardLayout {...commonProps} activeTab="admin-chats">
                <AdminChatsPage />
              </DashboardLayout>
            </AdminRoute>
          </PrivateRoute>
        } />

        <Route path="/parceiros" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="parceiros">
              <ParceirosPage />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/premiacoes" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="premiacoes">
              <PremiacoesPage dashboardData={dashboardData} />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/chat/:token" element={<BuyerChatPage />} />

        <Route path="/p/:slug" element={<CheckoutPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {activePix && createPortal(
        <PixModal
          pixData={activePix}
          onClose={() => setActivePix(null)}
          onPaymentSuccess={() => {
            setActivePix(null);
            fetchDashboard();
          }}
        />,
        document.body
      )}
    </>
    </ThemeProvider>
  );
}
