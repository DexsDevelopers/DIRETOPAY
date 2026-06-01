// DiretoPay SPA v2.1 - Build for Auth & Checkout
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, History, Wallet, Settings, Menu, Loader2, Sun, Moon } from 'lucide-react';
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

// Pages — lazy loaded para reduzir bundle inicial
const LandingPage          = React.lazy(() => import('./pages/LandingPage'));
const SalesPage            = React.lazy(() => import('./pages/SalesPage'));
const WithdrawalsPage      = React.lazy(() => import('./pages/WithdrawalsPage'));
const SettingsPage         = React.lazy(() => import('./pages/SettingsPage'));
const CheckoutPage         = React.lazy(() => import('./pages/CheckoutPage'));
const LoginPage            = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage         = React.lazy(() => import('./pages/RegisterPage'));
const AdminPage            = React.lazy(() => import('./pages/AdminPage'));
const AdminApisPage        = React.lazy(() => import('./pages/AdminApisPage'));
const AdminTransactionsPage= React.lazy(() => import('./pages/AdminTransactionsPage'));
const CheckoutsPage        = React.lazy(() => import('./pages/CheckoutsPage'));
const CheckoutBuilderPage  = React.lazy(() => import('./pages/CheckoutBuilderPage'));
const ApiDocsPage          = React.lazy(() => import('./pages/ApiDocsPage'));
const ReportsPage          = React.lazy(() => import('./pages/ReportsPage'));
const AffiliatePage        = React.lazy(() => import('./pages/AffiliatePage'));
const DemoPage             = React.lazy(() => import('./pages/DemoPage'));
const ForgotPasswordPage   = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage    = React.lazy(() => import('./pages/ResetPasswordPage'));
const ProdutosPage         = React.lazy(() => import('./pages/ProdutosPage'));
const AssinaturasPage      = React.lazy(() => import('./pages/AssinaturasPage'));
const CuponsPage           = React.lazy(() => import('./pages/CuponsPage'));
const CriarProdutoPage     = React.lazy(() => import('./pages/CriarProdutoPage'));
const LojaPage             = React.lazy(() => import('./pages/LojaPage'));
const VitrinePage          = React.lazy(() => import('./pages/VitrinePage'));
const ProductDetailPage    = React.lazy(() => import('./pages/ProductDetailPage'));
const AdminProdutosPage    = React.lazy(() => import('./pages/AdminProdutosPage'));
const AdminUsersPage       = React.lazy(() => import('./pages/AdminUsersPage'));
const AdminAnunciosPage    = React.lazy(() => import('./pages/AdminAnunciosPage'));
const AdminBannersPage     = React.lazy(() => import('./pages/AdminBannersPage'));
const EntregaPage          = React.lazy(() => import('./pages/EntregaPage'));
const ChatPage             = React.lazy(() => import('./pages/ChatPage'));
const AdminChatsPage       = React.lazy(() => import('./pages/AdminChatsPage'));
const AdminSaquesPage      = React.lazy(() => import('./pages/AdminSaquesPage'));
const PixPage              = React.lazy(() => import('./pages/PixPage'));
const AdminGatewaysPage    = React.lazy(() => import('./pages/AdminGatewaysPage'));
const BuyerChatPage        = React.lazy(() => import('./pages/BuyerChatPage'));
const ParceirosPage        = React.lazy(() => import('./pages/ParceirosPage'));
const PremiacoesPage       = React.lazy(() => import('./pages/PremiacoesPage'));
const BankAccountsPage     = React.lazy(() => import('./pages/BankAccountsPage'));
const DashboardHomePage    = React.lazy(() => import('./pages/DashboardHomePage'));
const AnnouncementModal    = React.lazy(() => import('./components/AnnouncementModal'));

// Fallback leve usado pelo Suspense enquanto o chunk da página carrega
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div style={{
        width: 28, height: 28,
        border: '3px solid rgba(30,164,101,0.2)',
        borderTopColor: '#1ea465',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px] -z-10 pointer-events-none" />

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
    console.log("DiretoPay SPA v2.2 - Iniciando carga de dados...");
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

  return (
    <ThemeProvider>
    <>
      {showWhatsAppPopup && <WhatsAppPopup onClose={() => setShowWhatsAppPopup(false)} />}
      <React.Suspense fallback={<PageLoader />}>
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
              <React.Suspense fallback={<PageLoader />}>
                <DashboardHomePage userData={userData} fetchDashboard={fetchDashboard} dashboardData={dashboardData} loading={loading} setActivePix={setActivePix} handleDeleteTransaction={handleDeleteTransaction} />
              </React.Suspense>
            </DashboardLayout>
          </PrivateRoute>
        } />


        <Route path="/pix" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="pix">
              <PixPage handleManualPix={handleManualPix} activePix={activePix} setActivePix={setActivePix} balance={commonProps.balance} userData={commonProps.userData} fetchDashboard={fetchDashboard} />
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
              <WithdrawalsPage balance={commonProps.balance} availableForWithdraw={dashboardData?.available_for_withdraw} pendingWithdrawals={dashboardData?.pending_withdrawals} transactions={dashboardData?.transactions} userData={commonProps.userData} />
            </DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/financeiro/contas" element={
          <PrivateRoute>
            <DashboardLayout {...commonProps} activeTab="contas-bancarias">
              <BankAccountsPage />
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
      </React.Suspense>
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
