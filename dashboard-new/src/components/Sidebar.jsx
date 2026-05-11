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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group mb-0.5 text-sm font-semibold",
                isActive
                    ? 'bg-primary/15 text-primary'
                    : isDark
                        ? 'text-gray-400 hover:bg-white/6 hover:text-gray-100'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            )}
        >
            <span className={cn(
                "shrink-0 transition-colors",
                isActive ? 'text-primary' : isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'
            )}>
                {item.icon}
            </span>
            <span className="flex-1 truncate">{item.label}</span>
            {isActive && <ChevronRight size={13} className="shrink-0 opacity-50" />}
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
        <div className="mb-1">
            <button
                onClick={() => setOpen(o => !o)}
                className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors duration-150",
                    hasActive
                        ? 'text-primary'
                        : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                )}
            >
                <span>{label}</span>
                <ChevronDown size={14} className={cn("transition-transform duration-200 shrink-0", open ? 'rotate-0' : '-rotate-90')} />
            </button>

            <div className={cn(
                "overflow-hidden transition-all duration-250 ease-in-out",
                open ? 'max-h-[500px] opacity-100 mt-0.5' : 'max-h-0 opacity-0'
            )}>
                <div className="pl-1 pb-1">
                    {items.map(item => (
                        <SidebarLink key={item.id} item={item} isDark={isDark} {...linkProps} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Sidebar({ isOpen, activeTab, onTabChange, onClose, userData }) {
    const location = useLocation();
    const { isDark } = useTheme();
    const userInitial = userData?.name?.charAt(0).toUpperCase() || 'L';
    const userName = userData?.name?.split(' ')[0] || 'Usuário';

    const principalItems = [
        { id: 'dashboard',  icon: <LayoutDashboard size={17} />, label: 'Dashboard',  path: '/dashboard' },
        { id: 'vendas',     icon: <History size={17} />,         label: 'Vendas',     path: '/vendas' },
        { id: 'relatorios', icon: <BarChart3 size={17} />,       label: 'Relatórios', path: '/relatorios' },
        { id: 'saques',     icon: <Wallet size={17} />,          label: 'Saques',     path: '/saques' },
        { id: 'afiliado',   icon: <Gift size={17} />,            label: 'Afiliado',   path: '/afiliado' },
    ];

    const vendedorItems = [
        { id: 'checkouts',        icon: <Link2 size={17} />,       label: 'Checkouts',     path: '/checkouts' },
        { id: 'checkout-builder', icon: <Palette size={17} />,     label: 'Criar Checkout',path: '/checkout-builder' },
        { id: 'produtos',         icon: <Package size={17} />,     label: 'Produtos',      path: '/vendedor/produtos' },
        { id: 'cupons',           icon: <Ticket size={17} />,      label: 'Cupons',        path: '/vendedor/cupons' },
        { id: 'assinaturas',      icon: <RefreshCw size={17} />,   label: 'Assinaturas',   path: '/vendedor/assinaturas' },
        { id: 'loja',             icon: <Store size={17} />,       label: 'Minha Loja',    path: '/vendedor/loja' },
        { id: 'chat',             icon: <MessageCircle size={17} />,label: 'Chat',          path: '/chat' },
    ];

    const vitrineItems = [
        { id: 'vitrine', icon: <Sparkles size={17} />, label: 'Explorar Vitrine', path: '/vitrine' },
    ];

    const contaItems = [
        { id: 'settings', icon: <Settings size={17} />, label: 'Configurações', path: '/config' },
    ];

    const adminItems = [
        { id: 'admin',          icon: <ShieldCheck size={17} />,   label: 'Admin Geral',       path: '/admin',           accent: true },
        { id: 'admin-usuarios', icon: <Users size={17} />,         label: 'Usuários',          path: '/admin/usuarios',  accent: true },
        { id: 'admin-vendas',   icon: <ShoppingBag size={17} />,   label: 'Todas as Vendas',   path: '/admin/vendas',    accent: true },
        { id: 'admin-produtos', icon: <Package size={17} />,       label: 'Produtos',          path: '/admin/produtos',  accent: true },
        { id: 'apis',           icon: <Settings size={17} />,      label: 'Gestão de APIs',    path: '/admin/apis',      accent: true },
        { id: 'admin-banners',  icon: <Image size={17} />,         label: 'Banners',           path: '/admin/banners',   accent: true },
        { id: 'admin-anuncios', icon: <Megaphone size={17} />,     label: 'Anúncios',          path: '/admin/anuncios',  accent: true },
        { id: 'admin-chats',    icon: <MessageCircle size={17} />, label: 'Chats',             path: '/admin/chats',     accent: true },
        { id: 'admin-gateways', icon: <Cpu size={17} />,           label: 'Gateways',          path: '/admin/gateways',  accent: true },
        { id: 'admin-saques',   icon: <Wallet size={17} />,        label: 'Saques',            path: '/admin/saques',    accent: true },
    ];

    const linkProps = { location, onTabChange, onClose };
    const sectionProps = { location, linkProps, isDark };

    const bg     = isDark ? 'bg-[#111118]'      : 'bg-white';
    const border = isDark ? 'border-white/[0.06]': 'border-gray-100';
    const shadow = isDark ? 'shadow-[4px_0_24px_rgba(0,0,0,0.4)]' : 'shadow-[4px_0_24px_rgba(192,0,106,0.06)]';

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
            )}
            <aside className={`fixed z-50 top-0 left-0 h-full w-[272px] ${bg} border-r ${border} ${shadow} flex flex-col transform transition-transform duration-300 ease-out will-change-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header — logo + user */}
                <div className={`px-5 py-4 flex items-center justify-between border-b ${border}`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                            <span className="text-primary font-black text-base">{userInitial}</span>
                        </div>
                        <div className="min-w-0">
                            <p className={`text-sm font-bold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{userName}</p>
                            <p className="text-xs text-primary font-semibold">LunarPay</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-gray-200 hover:bg-white/8' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-3 overflow-y-auto custom-scrollbar space-y-0.5">
                    <SidebarSection label="Principal"       items={principalItems} defaultOpen={true} {...sectionProps} />
                    <SidebarSection label="Vendedor"        items={vendedorItems}  {...sectionProps} />
                    <SidebarSection label="Vitrine"         items={vitrineItems}   {...sectionProps} />
                    <SidebarSection label="Conta"           items={contaItems}     {...sectionProps} />
                    {userData?.is_admin && (
                        <SidebarSection label="Administração" items={adminItems}   {...sectionProps} />
                    )}
                </nav>

                {/* Ecossistema */}
                <div className={`px-3 py-3 border-t ${border}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest px-2 mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Ecossistema</p>
                    <a href="/sso_redirect.php"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${isDark ? 'text-violet-400 hover:bg-violet-500/10' : 'text-violet-600 hover:bg-violet-50'}`}
                    >
                        <MessageCircle size={17} className="shrink-0" />
                        <span className="flex-1">7K Chat</span>
                        <ExternalLink size={13} className="opacity-40 group-hover:opacity-80 transition-opacity" />
                    </a>
                </div>

                {/* Logout */}
                <div className={`px-3 py-3 border-t ${border}`}>
                    <button
                        onClick={() => window.location.href = '../auth/logout.php'}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}
                    >
                        <LogOut size={17} />
                        Sair da Conta
                    </button>
                </div>
            </aside>
        </>
    );
}
