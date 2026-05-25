import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, History, BarChart3, Wallet, Settings, LogOut,
    ChevronRight, X, Gift, ExternalLink, ShoppingBag,
    Package, Store, Sparkles, Link2, Palette, ShieldCheck, Image,
    Users, Ticket, Megaphone, MessageCircle, RefreshCw, Cpu, Handshake, Trophy,
    Building2,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

/* ─── Item simples (sem filhos) ─────────────────────────────────────── */
function NavItem({ item, location, onTabChange, onClose, isDark }) {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    return (
        <Link
            to={item.path}
            onClick={() => { onTabChange(item.id); if (window.innerWidth < 1024) onClose(); }}
            className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-150 group w-full mb-0.5",
                isActive
                    ? 'bg-primary text-white font-semibold shadow-[0_4px_14px_rgba(192,0,106,0.35)]'
                    : isDark
                        ? 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
        >
            <span className={cn("shrink-0", isActive ? 'text-white' : isDark ? 'text-gray-500 group-hover:text-gray-200' : 'text-gray-400 group-hover:text-gray-700')}>
                {item.icon}
            </span>
            <span className="text-[14px] font-medium">{item.label}</span>
        </Link>
    );
}

/* ─── Subitem (filho indentado) ──────────────────────────────────────── */
function NavSubItem({ item, location, onTabChange, onClose, isDark }) {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    if (item.external) {
        return (
            <a
                href={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={cn(
                    "flex items-center gap-3 pl-11 pr-4 py-2.5 rounded-xl transition-all duration-150 group w-full mb-0.5",
                    isDark
                        ? 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-100'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                )}
            >
                <span className={cn("shrink-0", isDark ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-600')}>
                    {item.icon}
                </span>
                <span className="text-[13px] font-medium">{item.label}</span>
            </a>
        );
    }
    return (
        <Link
            to={item.path}
            onClick={() => { onTabChange(item.id); if (window.innerWidth < 1024) onClose(); }}
            className={cn(
                "flex items-center gap-3 pl-11 pr-4 py-2.5 rounded-xl transition-all duration-150 group w-full mb-0.5",
                isActive
                    ? 'text-primary font-semibold'
                    : isDark
                        ? 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-100'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            )}
        >
            <span className={cn("shrink-0", isActive ? 'text-primary' : isDark ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-600')}>
                {item.icon}
            </span>
            <span className="text-[13px] font-medium">{item.label}</span>
            {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
        </Link>
    );
}

/* ─── Grupo colapsável (com filhos) ──────────────────────────────────── */
function NavGroup({ item, location, onTabChange, onClose, isDark }) {
    const hasActive = item.children.some(
        c => location.pathname === c.path || location.pathname.startsWith(c.path + '/')
    );
    const [open, setOpen] = useState(hasActive);
    useEffect(() => { if (hasActive) setOpen(true); }, [location.pathname]);

    return (
        <div className="mb-0.5">
            <button
                onClick={() => setOpen(o => !o)}
                className={cn(
                    "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-150 group w-full",
                    hasActive
                        ? isDark ? 'text-white font-semibold' : 'text-gray-900 font-semibold'
                        : isDark ? 'text-gray-300 hover:bg-white/[0.06] hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
            >
                <span className={cn("shrink-0", hasActive ? 'text-primary' : isDark ? 'text-gray-500 group-hover:text-gray-200' : 'text-gray-400 group-hover:text-gray-700')}>
                    {item.icon}
                </span>
                <span className="flex-1 text-left text-[14px] font-medium">{item.label}</span>
                <ChevronRight
                    size={15}
                    className={cn(
                        "shrink-0 transition-transform duration-200",
                        open ? 'rotate-90 text-primary' : isDark ? 'text-gray-600' : 'text-gray-300'
                    )}
                />
            </button>

            <div
                style={{
                    display: 'grid',
                    gridTemplateRows: open ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.25s ease',
                    pointerEvents: open ? 'auto' : 'none',
                }}
            >
                <div style={{ overflow: 'hidden', minHeight: 0 }}>
                    {item.children.map(child => (
                        <NavSubItem key={child.id} item={child} location={location} onTabChange={onTabChange} onClose={onClose} isDark={isDark} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── Sidebar principal ──────────────────────────────────────────────── */
export default function Sidebar({ isOpen, activeTab, onTabChange, onClose, userData }) {
    const location = useLocation();
    const { isDark } = useTheme();
    const userInitial = userData?.name?.charAt(0).toUpperCase() || 'L';
    const userName = userData?.name?.split(' ')[0] || 'Usuário';

    const navItems = [
        { type: 'item',  id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard',    path: '/dashboard' },
        { type: 'item',  id: 'vitrine',   icon: <Sparkles size={18} />,        label: 'Vitrine',       path: '/vitrine' },
        {
            type: 'group', id: 'vendas-group', icon: <ShoppingBag size={18} />, label: 'Vendas',
            children: [
                { id: 'vendas',           icon: <History size={16} />,         label: 'Transações',    path: '/vendas' },
                { id: 'checkouts',        icon: <Link2 size={16} />,           label: 'Checkouts',     path: '/checkouts' },
                { id: 'checkout-builder', icon: <Palette size={16} />,         label: 'Criar Checkout',path: '/checkout-builder' },
                { id: 'assinaturas',      icon: <RefreshCw size={16} />,       label: 'Assinaturas',   path: '/vendedor/assinaturas' },
                { id: 'chat',             icon: <MessageCircle size={16} />,   label: 'Chat',          path: '/chat' },
            ],
        },
        {
            type: 'group', id: 'financeiro-group', icon: <BarChart3 size={18} />, label: 'Financeiro',
            children: [
                { id: 'relatorios',     icon: <BarChart3 size={16} />,   label: 'Relatórios',      path: '/relatorios' },
                { id: 'saques',         icon: <Wallet size={16} />,      label: 'Saques',           path: '/saques' },
                { id: 'contas-bancarias', icon: <Building2 size={16} />, label: 'Contas Bancárias', path: '/financeiro/contas' },
            ],
        },
        {
            type: 'group', id: 'produtos-group', icon: <Package size={18} />, label: 'Produtos',
            children: [
                { id: 'produtos', icon: <Package size={16} />, label: 'Catálogo',   path: '/vendedor/produtos' },
                { id: 'cupons',   icon: <Ticket size={16} />,  label: 'Cupons',     path: '/vendedor/cupons' },
                { id: 'loja',     icon: <Store size={16} />,   label: 'Minha Loja', path: '/vendedor/loja' },
            ],
        },
        { type: 'item', id: 'afiliado',   icon: <Gift size={18} />,       label: 'Afiliado',      path: '/afiliado' },
        { type: 'item', id: 'parceiros',    icon: <Handshake size={18} />,  label: 'Parceiros',     path: '/parceiros' },
        { type: 'item', id: 'premiacoes',   icon: <Trophy size={18} />,     label: 'Premiações',    path: '/premiacoes' },
        { type: 'item', id: 'settings',     icon: <Settings size={18} />,   label: 'Configurações', path: '/config' },
    ];

    if (userData?.is_admin) {
        navItems.push({
            type: 'group', id: 'admin-group', icon: <ShieldCheck size={18} />, label: 'Administração',
            children: [
                { id: 'admin',          icon: <ShieldCheck size={16} />,    label: 'Admin Geral',     path: '/admin' },
                { id: 'admin-usuarios', icon: <Users size={16} />,          label: 'Usuários',        path: '/admin/usuarios' },
                { id: 'admin-vendas',   icon: <ShoppingBag size={16} />,    label: 'Todas as Vendas', path: '/admin/vendas' },
                { id: 'admin-produtos', icon: <Package size={16} />,        label: 'Produtos',        path: '/admin/produtos' },
                { id: 'apis',           icon: <Settings size={16} />,       label: 'Gestão de APIs',  path: '/admin/apis' },
                { id: 'admin-whatsapp', icon: <MessageCircle size={16} className="text-[#25d366]" />, label: 'WhatsApp Bot', path: '/admin/whatsapp.php', external: true },
                { id: 'admin-banners',  icon: <Image size={16} />,          label: 'Banners',         path: '/admin/banners' },
                { id: 'admin-anuncios', icon: <Megaphone size={16} />,      label: 'Anúncios',        path: '/admin/anuncios' },
                { id: 'admin-chats',    icon: <MessageCircle size={16} />,  label: 'Chats',           path: '/admin/chats' },
                { id: 'admin-gateways', icon: <Cpu size={16} />,            label: 'Gateways',        path: '/admin/gateways' },
                { id: 'admin-saques',   icon: <Wallet size={16} />,         label: 'Saques',          path: '/admin/saques' },
            ],
        });
    }

    const bg     = isDark ? 'bg-[#13131a]'       : 'bg-white';
    const border = isDark ? 'border-white/[0.07]' : 'border-gray-100';
    const shadow = isDark ? 'shadow-[4px_0_32px_rgba(0,0,0,0.6)]' : 'shadow-[4px_0_32px_rgba(192,0,106,0.07)]';
    const sharedProps = { location, onTabChange, onClose, isDark };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
            )}
            <aside className={`fixed z-50 top-0 left-0 h-full w-[280px] ${bg} border-r ${border} ${shadow} flex flex-col transform transition-transform duration-300 ease-out will-change-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header */}
                <div className={`px-5 pt-5 pb-4 border-b ${border} flex items-center justify-between`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-base font-black",
                            isDark ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-primary/10 text-primary border border-primary/20'
                        )}>
                            {userInitial}
                        </div>
                        <div className="min-w-0">
                            <p className={cn("text-[14px] font-bold truncate leading-tight", isDark ? 'text-white' : 'text-gray-900')}>{userName}</p>
                            <p className="text-[11px] text-primary font-semibold mt-0.5">LunarPay</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={cn("p-2 rounded-xl transition-colors shrink-0", isDark ? 'text-gray-500 hover:text-gray-200 hover:bg-white/8' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100')}>
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
                    {navItems.map(item =>
                        item.type === 'group'
                            ? <NavGroup    key={item.id} item={item} {...sharedProps} />
                            : <NavItem     key={item.id} item={item} {...sharedProps} />
                    )}
                </nav>

                {/* Footer */}
                <div className={`border-t ${border}`}>
                    <div className={`px-3 pb-4 pt-3`}>
                        <button
                            onClick={() => window.location.href = '../auth/logout.php'}
                            className={cn("w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium transition-all", isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50')}
                        >
                            <LogOut size={18} />
                            Sair da Conta
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
