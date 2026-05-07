import React from 'react';
import {
    LayoutDashboard,
    History,
    BarChart3,
    Wallet,
    Settings,
    LogOut,
    ChevronRight,
    X,
    Gift,
    GraduationCap,
    ExternalLink,
    ShoppingBag,
    Package,
    Store,
    Sparkles,
    Link2,
    Palette,
    ShieldCheck,
    Image,
    Users,
    Ticket,
    Megaphone,
    MessageCircle,
    RefreshCw,
    Cpu,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

function SidebarSection({ label, children }) {
    return (
        <div className="pt-5">
            <p className="px-6 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
            {children}
        </div>
    );
}

function SidebarLink({ item, location, onTabChange, onClose }) {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    return (
        <Link
            to={item.path}
            onClick={() => {
                onTabChange(item.id);
                if (window.innerWidth < 1024) onClose();
            }}
            className={cn(
                "w-full flex items-center justify-between px-6 py-3 rounded-full transition-all duration-300 group mb-1",
                isActive
                    ? item.accent
                        ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                        : 'bg-primary/10 text-primary font-bold border border-primary/20'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            )}
        >
            <div className="flex items-center gap-3">
                <span className={cn(
                    "transition-colors",
                    isActive ? 'text-primary' : (item.accent ? 'text-primary' : 'text-gray-400 group-hover:text-gray-900')
                )}>
                    {item.icon}
                </span>
                <span className="text-[13px] font-bold uppercase tracking-widest">{item.label}</span>
            </div>
            {isActive
                ? <ChevronRight size={14} className="opacity-50" />
                : <ChevronRight size={14} className="opacity-0 group-hover:opacity-20 transition-opacity" />
            }
        </Link>
    );
}

export default function Sidebar({ isOpen, activeTab, onTabChange, onClose, userData }) {
    const location = useLocation();
    const userInitial = userData?.name?.charAt(0).toUpperCase() || 'G';

    const principalItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard' },
        { id: 'vendas', icon: <History size={18} />, label: 'Vendas', path: '/vendas' },
        { id: 'relatorios', icon: <BarChart3 size={18} />, label: 'Relatórios', path: '/relatorios' },
        { id: 'saques', icon: <Wallet size={18} />, label: 'Saques', path: '/saques' },
        { id: 'afiliado', icon: <Gift size={18} />, label: 'Afiliado', path: '/afiliado' },
    ];

    const vendedorItems = [
        { id: 'checkouts', icon: <Link2 size={18} />, label: 'Checkouts', path: '/checkouts' },
        { id: 'checkout-builder', icon: <Palette size={18} />, label: 'Criar Checkout', path: '/checkout-builder' },
        { id: 'produtos', icon: <Package size={18} />, label: 'Produtos', path: '/vendedor/produtos' },
        { id: 'cupons',   icon: <Ticket size={18} />,  label: 'Cupons',   path: '/vendedor/cupons' },
        { id: 'assinaturas', icon: <RefreshCw size={18} />, label: 'Assinaturas', path: '/vendedor/assinaturas' },
        { id: 'loja', icon: <Store size={18} />, label: 'Minha Loja', path: '/vendedor/loja' },
        { id: 'chat', icon: <MessageCircle size={18} />, label: 'Chat', path: '/chat' },
    ];

    const vitrineItems = [
        { id: 'vitrine', icon: <Sparkles size={18} />, label: 'Explorar Vitrine', path: '/vitrine' },
    ];

    const contaItems = [
        { id: 'settings', icon: <Settings size={18} />, label: 'Configurações', path: '/config' },
    ];

    const adminItems = [
        { id: 'admin',          icon: <ShieldCheck size={18} />, label: 'Admin Geral',        path: '/admin',           accent: true },
        { id: 'admin-usuarios', icon: <Users size={18} />,      label: 'Gestão de Usuários', path: '/admin/usuarios',   accent: true },
        { id: 'admin-vendas', icon: <ShoppingBag size={18} />, label: 'Todas as Vendas', path: '/admin/vendas', accent: true },
        { id: 'admin-produtos', icon: <Package size={18} />, label: 'Moderar Produtos', path: '/admin/produtos', accent: true },
        { id: 'apis', icon: <Settings size={18} />, label: 'Gestão de APIs', path: '/admin/apis', accent: true },
        { id: 'admin-banners',  icon: <Image size={18} />,    label: 'Banners da Loja', path: '/admin/banners',  accent: true },
        { id: 'admin-anuncios', icon: <Megaphone size={18} />, label: 'Anúncios', path: '/admin/anuncios', accent: true },
        { id: 'admin-chats', icon: <MessageCircle size={18} />, label: 'Chats', path: '/admin/chats', accent: true },
        { id: 'admin-gateways', icon: <Cpu size={18} />, label: 'Gateways', path: '/admin/gateways', accent: true },
        { id: 'admin-saques', icon: <Wallet size={18} />, label: 'Saques', path: '/admin/saques', accent: true },
    ];

    const linkProps = { location, onTabChange, onClose };

    return (
        <>
        {isOpen && (
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
        )}
        <aside className={`fixed z-50 top-0 left-0 h-full w-[280px] bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 ease-out will-change-transform shadow-[4px_0_24px_rgba(124,58,237,0.06)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                        <span className="text-primary font-bold text-xl">{userInitial}</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">GHOST<span className="text-primary italic">PIX</span></span>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar">

                <SidebarSection label="Principal">
                    {principalItems.map(item => <SidebarLink key={item.id} item={item} {...linkProps} />)}
                </SidebarSection>

                <SidebarSection label="Vendedor">
                    {vendedorItems.map(item => <SidebarLink key={item.id} item={item} {...linkProps} />)}
                </SidebarSection>

                <SidebarSection label="Vitrine PixGhost">
                    {vitrineItems.map(item => <SidebarLink key={item.id} item={item} {...linkProps} />)}
                </SidebarSection>

                <SidebarSection label="Conta">
                    {contaItems.map(item => <SidebarLink key={item.id} item={item} {...linkProps} />)}
                </SidebarSection>

                {userData?.is_admin && (
                    <SidebarSection label="Administração">
                        {adminItems.map(item => <SidebarLink key={item.id} item={item} {...linkProps} />)}
                    </SidebarSection>
                )}
            </nav>

            {/* Ecossistema */}
            <div className="px-4 pt-4 border-t border-gray-100">
                <p className="px-6 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ecossistema</p>
                <a
                    href="/sso_redirect.php"
                    className="w-full flex items-center justify-between px-6 py-3 rounded-full text-violet-500 bg-violet-50 border border-violet-100 hover:bg-violet-100 transition-all duration-300 group mb-1"
                >
                    <div className="flex items-center gap-3">
                        <MessageCircle size={20} className="text-violet-500" />
                        <span className="text-[13px] font-bold uppercase tracking-widest">7K CHAT</span>
                    </div>
                    <ExternalLink size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                </a>
            </div>

            {/* Logout */}
            <div className="p-4 mt-auto border-t border-gray-100">
                <button
                    onClick={() => window.location.href = '../auth/logout.php'}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-semibold"
                >
                    <LogOut size={20} />
                    Sair da Conta
                </button>
            </div>
        </aside>
        </>
    );
}
