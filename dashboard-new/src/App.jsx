// LunarPay SPA v2.1 - Build for Auth & Checkout
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, History, Wallet, Settings, Menu, Loader2, Sun, Moon, QrCode, Link2, ArrowUpRight, Plus, RefreshCw, TrendingUp, TrendingDown, ArrowRight, Banknote, ShoppingCart } from 'lucide-react';
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
    const balance = dashboardData?.balance || '0,00';
    const stats = dashboardData?.stats || {};

    const miniStats = [
      { label: 'Saldo Total',   value: `R$ ${stats.total_paid   || '0,00'}`, icon: Banknote,     accent: '#7c3aed', accentBg: '#f5f3ff' },
      { label: 'Volume Mensal', value: `R$ ${stats.month_volume || '0,00'}`, icon: TrendingUp,   accent: '#0891b2', accentBg: '#ecfeff' },
      { label: 'Vendas Hoje',   value: `R$ ${stats.today_volume || '0,00'}`, icon: TrendingUp,   accent: '#16a34a', accentBg: '#f0fdf4' },
      { label: 'Pendentes',     value: stats.pending_count || '0',           icon: TrendingDown, accent: '#d97706', accentBg: '#fffbeb' },
    ];

    const quickActions = [
      { icon: QrCode,       label: 'PIX',    sub: 'Gerar e receber',   action: () => navigate('/pix'),       hex: '#7c3aed', bg: '#f5f3ff' },
      { icon: Link2,        label: 'Links',  sub: 'Checkouts',         action: () => navigate('/checkouts'), hex: '#db2777', bg: '#fdf2f8' },
      { icon: ArrowUpRight, label: 'Saques', sub: 'Transferir saldo',  action: () => navigate('/saques'),    hex: '#059669', bg: '#f0fdf4' },
      { icon: ShoppingCart, label: 'Vendas', sub: 'Ver transações',    action: () => navigate('/vendas'),    hex: '#d97706', bg: '#fffbeb' },
    ];

    return (
      <div className="space-y-4 animate-in fade-in duration-500 pb-10">

        {/* ── TOP ROW: balance + stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Balance Card */}
          <div className="lg:col-span-2">
            <div className="relative rounded-[24px] overflow-hidden p-7 h-full min-h-[160px]"
              style={{ background: 'linear-gradient(135deg, #13011f 0%, #0d0818 60%, #020010 100%)' }}>
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(ellipse at 80% 10%, #a78bfa, transparent 55%), radial-gradient(ellipse at 10% 90%, #ec4899, transparent 55%)' }} />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em] mb-2">Saldo Disponível</p>
                    <h1 className="text-4xl font-black text-white tracking-tight leading-none">R$ {balance}</h1>
                  </div>
                  <button onClick={fetchDashboard} className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-all active:scale-95 shrink-0 border border-white/10">
                    <RefreshCw size={14} className="text-white/50" />
                  </button>
                </div>
                <div className="mt-auto pt-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-black text-white/30 uppercase tracking-widest">Olá, {userData?.name?.split(' ')[0] || 'Usuário'} 👋</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #a78bfa, #ec4899, #38bdf8, #34d399, #a78bfa)' }} />
            </div>
          </div>

          {/* Stats grid */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-3">
            {miniStats.map(({ label, value, icon: Icon, accent, accentBg }) => (
              <div key={label} className="bg-white rounded-[20px] p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] border border-gray-100/80 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] leading-tight">{label}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: accentBg }}>
                    <Icon size={15} style={{ color: accent }} />
                  </div>
                </div>
                <p className="text-2xl font-black text-gray-900 leading-none tracking-tight">{value}</p>
                <div className="mt-2 h-1 rounded-full opacity-20" style={{ background: accent }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, label, sub, action, hex, bg }) => (
            <button key={label} onClick={action}
              className="group relative flex items-center gap-4 bg-white rounded-[20px] px-5 py-4 shadow-[0_1px_8px_rgba(0,0,0,0.06)] border border-gray-100/80 hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all active:scale-[0.98] text-left overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${bg}, transparent 70%)` }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 relative z-10" style={{ background: bg }}>
                <Icon size={20} style={{ color: hex }} />
              </div>
              <div className="relative z-10">
                <p className="font-black text-gray-900 text-sm leading-tight">{label}</p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── RECENT TRANSACTIONS ── */}
        <div className="bg-white rounded-[20px] shadow-[0_1px_8px_rgba(0,0,0,0.06)] border border-gray-100/80 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-black text-gray-900 flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <History size={13} className="text-primary" />
              </span>
              Últimas transações
            </h2>
            <button onClick={() => navigate('/vendas')} className="text-[11px] font-black text-primary flex items-center gap-1 hover:opacity-70 transition-opacity">
              ver tudo <ArrowRight size={12} />
            </button>
          </div>
          <TransactionsTable transactions={dashboardData?.transactions?.slice(0, 8)} loading={loading} onViewQr={setActivePix} onDelete={handleDeleteTransaction} />
        </div>

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
