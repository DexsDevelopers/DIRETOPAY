import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, History, BarChart3, Wallet, Settings, LogOut,
    ChevronRight, ChevronDown, X, Gift, ExternalLink, ShoppingBag,
    Package, Store, Sparkles, Link2, Palette, ShieldCheck, Image,
    Users, Ticket, Megaphone, MessageCircle, RefreshCw, Cpu,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

function SidebarLink({ item, location, onTabChange, onClose, isDark }) {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    return (
        <Link
            to={item.path}
            onClick={() => { onTabChange(item.id); if (window.innerWidth < 1024) onClose(); }}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 group mb-0.5",
                isActive
                    ? isDark
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'bg-primary/10 text-primary font-semibold border border-primary/15'
                    : isDark
                        ? 'text-gray-400 hover:bg-white/[0.05] hover:text-white'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            )}
        >
            <span className={cn(
                "shrink-0 w-[18px] transition-colors",
                isActive ? 'text-primary' : isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-700'
            )}>
                {item.icon}
            </span>
            <span className="flex-1 text-[13.5px] font-medium leading-none">{item.label}</span>
            {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 opacity-70" />
            )}
        </Link>
    );
}

function SidebarSection({ label, items, location, linkProps, isDark, defaultOpen = false }) {
    const hasActive = items.some(
        item => location.pathname === item.path || location.pathname.startsWith(item.path + '/')
    );
    const [open, setOpen] = useState(defaultOpen || hasActive);

    useEffect(() => { if (hasActive) setOpen(true); }, [location.pathname]);

    return (
        <div>
            <button
                onClick={() => setOpen(o => !o)}
                className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-150 group select-none",
                    isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'
                )}
            >
                <span className={cn(
                    "text-[11px] font-bold tracking-[0.12em] uppercase",
                    hasActive ? 'text-primary' : isDark ? 'text-gray-500' : 'text-gray-400'
                )}>
                    {label}
                </span>
                <ChevronDown
                    size={14}
                    className={cn(
                        "transition-transform duration-300 shrink-0",
                        hasActive ? 'text-primary' : isDark ? 'text-gray-600' : 'text-gray-300',
                        open ? 'rotate-0' : '-rotate-90'
                    )}
                />
            </button>

            <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
            )}>
                <div className="px-2 pb-3 pt-0.5">
                    {items.map(item => (
                        <SidebarLink key={item.id} item={item} isDark={isDark} {...linkProps} />
                    ))}
                </div>
            </div>

            {/* Separador entre seções */}
            <div className={cn("mx-4 mb-1", isDark ? 'border-b border-white/[0.04]' : 'border-b border-gray-100')} />
        </div>
    );
}

export default function Sidebar({ isOpen, activeTab, onTabChange, onClose, userData }) {
    const location = useLocation();
    const { isDark } = useTheme();
    const userInitial = userData?.name?.charAt(0).toUpperCase() || 'L';
    const userName = userData?.name?.split(' ')[0] || 'Usuário';
    const userEmail = userData?.email || '';

    const principalItems = [
        { id: 'dashboard',  icon: <LayoutDashboard size={17} />, label: 'Dashboard',  path: '/dashboard' },
        { id: 'vendas',     icon: <History size={17} />,         label: 'Vendas',     path: '/vendas' },
        { id: 'relatorios', icon: <BarChart3 size={17} />,       label: 'Relatórios', path: '/relatorios' },
        { id: 'saques',     icon: <Wallet size={17} />,          label: 'Saques',     path: '/saques' },
        { id: 'afiliado',   icon: <Gift size={17} />,            label: 'Afiliado',   path: '/afiliado' },
    ];

    const vendedorItems = [
        { id: 'checkouts',        icon: <Link2 size={17} />,        label: 'Checkouts',      path: '/checkouts' },
        { id: 'checkout-builder', icon: <Palette size={17} />,      label: 'Criar Checkout', path: '/checkout-builder' },
        { id: 'produtos',         icon: <Package size={17} />,      label: 'Produtos',       path: '/vendedor/produtos' },
        { id: 'cupons',           icon: <Ticket size={17} />,       label: 'Cupons',         path: '/vendedor/cupons' },
        { id: 'assinaturas',      icon: <RefreshCw size={17} />,    label: 'Assinaturas',    path: '/vendedor/assinaturas' },
        { id: 'loja',             icon: <Store size={17} />,        label: 'Minha Loja',     path: '/vendedor/loja' },
        { id: 'chat',             icon: <MessageCircle size={17} />, label: 'Chat',           path: '/chat' },
    ];

    const vitrineItems = [
        { id: 'vitrine', icon: <Sparkles size={17} />, label: 'Explorar Vitrine', path: '/vitrine' },
    ];

    const contaItems = [
        { id: 'settings', icon: <Settings size={17} />, label: 'Configurações', path: '/config' },
    ];

    const adminItems = [
        { id: 'admin',          icon: <ShieldCheck size={17} />,    label: 'Admin Geral',     path: '/admin',           accent: true },
        { id: 'admin-usuarios', icon: <Users size={17} />,          label: 'Usuários',        path: '/admin/usuarios',  accent: true },
        { id: 'admin-vendas',   icon: <ShoppingBag size={17} />,    label: 'Todas as Vendas', path: '/admin/vendas',    accent: true },
        { id: 'admin-produtos', icon: <Package size={17} />,        label: 'Produtos',        path: '/admin/produtos',  accent: true },
        { id: 'apis',           icon: <Settings size={17} />,       label: 'Gestão de APIs',  path: '/admin/apis',      accent: true },
        { id: 'admin-banners',  icon: <Image size={17} />,          label: 'Banners',         path: '/admin/banners',   accent: true },
        { id: 'admin-anuncios', icon: <Megaphone size={17} />,      label: 'Anúncios',        path: '/admin/anuncios',  accent: true },
        { id: 'admin-chats',    icon: <MessageCircle size={17} />,  label: 'Chats',           path: '/admin/chats',     accent: true },
        { id: 'admin-gateways', icon: <Cpu size={17} />,            label: 'Gateways',        path: '/admin/gateways',  accent: true },
        { id: 'admin-saques',   icon: <Wallet size={17} />,         label: 'Saques',          path: '/admin/saques',    accent: true },
    ];

    const linkProps = { location, onTabChange, onClose };
    const sectionProps = { location, linkProps, isDark };

    const bg     = isDark ? 'bg-[#0f0f14]'       : 'bg-white';
    const border = isDark ? 'border-white/[0.06]' : 'border-gray-100';
    const shadow = isDark ? 'shadow-[4px_0_32px_rgba(0,0,0,0.5)]' : 'shadow-[4px_0_32px_rgba(192,0,106,0.07)]';

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
            )}
            <aside className={`fixed z-50 top-0 left-0 h-full w-[280px] ${bg} border-r ${border} ${shadow} flex flex-col transform transition-transform duration-300 ease-out will-change-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header */}
                <div className={`px-5 pt-5 pb-4 border-b ${border}`}>
                    <div className="flex items-center justify-between mb-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-base font-black",
                                isDark
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'bg-primary/10 text-primary border border-primary/20'
                            )}>
                                {userInitial}
                            </div>
                            <div className="min-w-0">
                                <p className={cn("text-[14px] font-bold truncate leading-tight", isDark ? 'text-white' : 'text-gray-900')}>
                                    {userName}
                                </p>
                                <p className="text-[11px] text-primary font-semibold mt-0.5">LunarPay</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={cn(
                                "p-2 rounded-xl transition-colors shrink-0",
                                isDark ? 'text-gray-500 hover:text-gray-200 hover:bg-white/8' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                            )}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
                    <SidebarSection label="Principal"     items={principalItems} defaultOpen={true} {...sectionProps} />
                    <SidebarSection label="Vendedor"      items={vendedorItems}  {...sectionProps} />
                    <SidebarSection label="Vitrine"       items={vitrineItems}   {...sectionProps} />
                    <SidebarSection label="Conta"         items={contaItems}     {...sectionProps} />
                    {userData?.is_admin && (
                        <SidebarSection label="Administração" items={adminItems} {...sectionProps} />
                    )}
                </nav>

                {/* Footer */}
                <div className={`border-t ${border}`}>
                    {/* Ecossistema */}
                    <div className="px-4 pt-3 pb-2">
                        <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-2 px-1", isDark ? 'text-gray-600' : 'text-gray-400')}>
                            Ecossistema
                        </p>
                        <a
                            href="/sso_redirect.php"
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl text-[13.5px] font-medium transition-all group",
                                isDark ? 'text-violet-400 hover:bg-violet-500/10' : 'text-violet-600 hover:bg-violet-50'
                            )}
                        >
                            <MessageCircle size={17} className="shrink-0" />
                            <span className="flex-1">7K Chat</span>
                            <ExternalLink size={13} className="opacity-30 group-hover:opacity-70 transition-opacity" />
                        </a>
                    </div>

                    {/* Logout */}
                    <div className={`px-4 pb-4 pt-1 border-t ${border}`}>
                        <button
                            onClick={() => window.location.href = '../auth/logout.php'}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13.5px] font-medium transition-all",
                                isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'
                            )}
                        >
                            <LogOut size={17} />
                            Sair da Conta
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
