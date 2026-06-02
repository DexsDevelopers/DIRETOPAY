import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, History, BarChart3, Wallet, Settings, LogOut,
    ChevronDown, X, Gift, ShoppingBag,
    Package, Store, Sparkles, Link2, Palette, ShieldCheck, Image,
    Users, Ticket, Megaphone, MessageCircle, RefreshCw, Cpu, Handshake, Trophy,
    Building2, Zap, QrCode,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

function NavLabel({ label, isDark }) {
    return (
        <p className={cn("px-3 pt-5 pb-1.5 text-[9px] font-black uppercase tracking-[0.12em]",
            isDark ? 'text-gray-600' : 'text-gray-400')}>
            {label}
        </p>
    );
}

function NavItem({ item, location, onTabChange, onClose, isDark }) {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    return (
        <Link
            to={item.path}
            onClick={() => { onTabChange(item.id); if (window.innerWidth < 1024) onClose(); }}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group w-full mb-0.5 relative",
                isActive
                    ? isDark
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-emerald-50 text-emerald-700'
                    : isDark
                        ? 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-100'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            )}
        >
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-500" />
            )}
            <span className={cn("shrink-0 w-[18px] h-[18px] flex items-center justify-center",
                isActive
                    ? 'text-emerald-500'
                    : isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600')}>
                {item.icon}
            </span>
            <span className={cn("text-[13px] flex-1 truncate", isActive ? 'font-semibold' : 'font-medium')}>
                {item.label}
            </span>
            {item.badge && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500 text-white">
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

function NavSubItem({ item, location, onTabChange, onClose, isDark }) {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    const Tag = item.external ? 'a' : Link;
    const props = item.external ? { href: item.path } : { to: item.path };
    return (
        <Tag
            {...props}
            onClick={() => { if (!item.external) onTabChange(item.id); if (window.innerWidth < 1024) onClose(); }}
            className={cn(
                "flex items-center gap-2.5 pl-9 pr-3 py-2 rounded-lg transition-all duration-150 group w-full mb-0.5 relative",
                isActive
                    ? isDark ? 'text-emerald-400 bg-emerald-500/8' : 'text-emerald-700 bg-emerald-50/80'
                    : isDark ? 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-200' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
            )}
        >
            <span className={cn("shrink-0", isActive ? 'text-emerald-500' : isDark ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-300 group-hover:text-gray-500')}>
                {item.icon}
            </span>
            <span className={cn("text-[12.5px] flex-1 truncate", isActive ? 'font-semibold' : 'font-medium')}>
                {item.label}
            </span>
        </Tag>
    );
}

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
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group w-full",
                    hasActive
                        ? isDark ? 'text-gray-100 font-semibold' : 'text-gray-800 font-semibold'
                        : isDark ? 'text-gray-400 hover:bg-white/[0.05] hover:text-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                )}
            >
                <span className={cn("shrink-0 w-[18px] h-[18px] flex items-center justify-center",
                    hasActive ? 'text-emerald-500' : isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600')}>
                    {item.icon}
                </span>
                <span className="flex-1 text-left text-[13px] font-medium truncate">{item.label}</span>
                <ChevronDown
                    size={13}
                    className={cn("shrink-0 transition-transform duration-200",
                        open ? 'rotate-180 text-emerald-500' : isDark ? 'text-gray-600' : 'text-gray-300'
                    )}
                />
            </button>
            <div style={{
                display: 'grid',
                gridTemplateRows: open ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.22s ease',
                pointerEvents: open ? 'auto' : 'none',
            }}>
                <div style={{ overflow: 'hidden', minHeight: 0 }}>
                    <div className="pt-0.5 pb-1">
                        {item.children.map(child => (
                            <NavSubItem key={child.id} item={child} location={location} onTabChange={onTabChange} onClose={onClose} isDark={isDark} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Sidebar({ isOpen, activeTab, onTabChange, onClose, userData }) {
    const location = useLocation();
    const { isDark } = useTheme();
    const userInitial = userData?.name?.charAt(0).toUpperCase() || 'D';
    const userName = userData?.name?.split(' ')[0] || 'Usuário';
    const userEmail = userData?.email || '';

    const navSections = [
        {
            label: null,
            items: [
                { type: 'item', id: 'dashboard', icon: <LayoutDashboard size={15} />, label: 'Visão Geral', path: '/dashboard' },
                { type: 'item', id: 'pix',       icon: <QrCode size={15} />,          label: 'Gerar PIX',   path: '/pix', badge: 'NEW' },
                { type: 'item', id: 'vitrine',   icon: <Sparkles size={15} />,         label: 'Vitrine',     path: '/vitrine' },
            ]
        },
        {
            label: 'Vendas',
            items: [
                {
                    type: 'group', id: 'vendas-group', icon: <ShoppingBag size={15} />, label: 'Vendas',
                    children: [
                        { id: 'vendas',           icon: <History size={13} />,        label: 'Transações',     path: '/vendas' },
                        { id: 'checkouts',        icon: <Link2 size={13} />,          label: 'Checkouts',      path: '/checkouts' },
                        { id: 'checkout-builder', icon: <Palette size={13} />,        label: 'Criar Checkout', path: '/checkout-builder' },
                        { id: 'assinaturas',      icon: <RefreshCw size={13} />,      label: 'Assinaturas',    path: '/vendedor/assinaturas' },
                        { id: 'chat',             icon: <MessageCircle size={13} />,  label: 'Chat',           path: '/chat' },
                    ],
                },
                {
                    type: 'group', id: 'produtos-group', icon: <Package size={15} />, label: 'Produtos',
                    children: [
                        { id: 'produtos', icon: <Package size={13} />,  label: 'Catálogo',   path: '/vendedor/produtos' },
                        { id: 'cupons',   icon: <Ticket size={13} />,   label: 'Cupons',     path: '/vendedor/cupons' },
                        { id: 'loja',     icon: <Store size={13} />,    label: 'Minha Loja', path: '/vendedor/loja' },
                    ],
                },
            ]
        },
        {
            label: 'Finanças',
            items: [
                {
                    type: 'group', id: 'financeiro-group', icon: <BarChart3 size={15} />, label: 'Financeiro',
                    children: [
                        { id: 'relatorios',       icon: <BarChart3 size={13} />,  label: 'Relatórios',       path: '/relatorios' },
                        { id: 'saques',           icon: <Wallet size={13} />,     label: 'Saques',           path: '/saques' },
                        { id: 'contas-bancarias', icon: <Building2 size={13} />,  label: 'Contas Bancárias', path: '/financeiro/contas' },
                    ],
                },
            ]
        },
        {
            label: 'Crescimento',
            items: [
                { type: 'item', id: 'afiliado',  icon: <Gift size={15} />,      label: 'Afiliado',   path: '/afiliado' },
                { type: 'item', id: 'parceiros', icon: <Handshake size={15} />, label: 'Parceiros',  path: '/parceiros' },
                { type: 'item', id: 'premiacoes',icon: <Trophy size={15} />,    label: 'Premiações', path: '/minha-premiacao' },
            ]
        },
        {
            label: null,
            items: [
                { type: 'item', id: 'settings', icon: <Settings size={15} />, label: 'Configurações', path: '/config' },
            ]
        }
    ];

    if (userData?.is_admin) {
        navSections.push({
            label: 'Admin',
            items: [
                {
                    type: 'group', id: 'admin-group', icon: <ShieldCheck size={15} />, label: 'Administração',
                    children: [
                        { id: 'admin',          icon: <ShieldCheck size={13} />,   label: 'Admin Geral',     path: '/admin' },
                        { id: 'admin-usuarios', icon: <Users size={13} />,         label: 'Usuários',        path: '/admin/usuarios' },
                        { id: 'admin-vendas',   icon: <ShoppingBag size={13} />,   label: 'Todas as Vendas', path: '/admin/vendas' },
                        { id: 'admin-produtos', icon: <Package size={13} />,       label: 'Produtos',        path: '/admin/produtos' },
                        { id: 'apis',           icon: <Settings size={13} />,      label: 'Gestão de APIs',  path: '/admin/apis' },
                        { id: 'admin-whatsapp', icon: <MessageCircle size={13} className="text-[#25d366]" />, label: 'WhatsApp Bot', path: '/admin/whatsapp.php', external: true },
                        { id: 'admin-banners',  icon: <Image size={13} />,         label: 'Banners',         path: '/admin/banners' },
                        { id: 'admin-anuncios', icon: <Megaphone size={13} />,     label: 'Anúncios',        path: '/admin/anuncios' },
                        { id: 'admin-chats',    icon: <MessageCircle size={13} />, label: 'Chats',           path: '/admin/chats' },
                        { id: 'admin-gateways', icon: <Cpu size={13} />,           label: 'Gateways',        path: '/admin/gateways' },
                        { id: 'admin-saques',   icon: <Wallet size={13} />,        label: 'Saques',          path: '/admin/saques' },
                    ],
                }
            ]
        });
    }

    const sharedProps = { location, onTabChange, onClose, isDark };
    const bg     = isDark ? 'bg-[#0e0e13]'        : 'bg-[#fafafa]';
    const border = isDark ? 'border-white/[0.06]'  : 'border-gray-200/70';

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden" onClick={onClose} />
            )}
            <aside className={cn(
                `fixed z-50 top-0 left-0 h-full w-[248px] flex flex-col transform transition-transform duration-300 ease-out will-change-transform border-r`,
                bg, border,
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                {/* Logo / Brand */}
                <div className={cn("flex items-center justify-between px-4 h-14 border-b shrink-0", border)}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                            <Zap size={14} className="text-white" fill="white" />
                        </div>
                        <span className={cn("text-[15px] font-black tracking-tight", isDark ? 'text-white' : 'text-gray-900')}>
                            Direto<span className="text-emerald-500">Pay</span>
                        </span>
                    </div>
                    <button onClick={onClose}
                        className={cn("p-1.5 rounded-lg transition-colors", isDark ? 'text-gray-500 hover:text-gray-200 hover:bg-white/8' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200/70')}>
                        <X size={15} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2.5 py-2 overflow-y-auto custom-scrollbar">
                    {navSections.map((section, si) => (
                        <div key={si}>
                            {section.label && (
                                <p className={cn("px-3 pt-4 pb-1.5 text-[9.5px] font-black uppercase tracking-[0.1em]",
                                    isDark ? 'text-gray-600' : 'text-gray-400')}>
                                    {section.label}
                                </p>
                            )}
                            {section.items.map(item =>
                                item.type === 'group'
                                    ? <NavGroup key={item.id} item={item} {...sharedProps} />
                                    : <NavItem  key={item.id} item={item} {...sharedProps} />
                            )}
                        </div>
                    ))}
                </nav>

                {/* User footer */}
                <div className={cn("border-t p-3 shrink-0", border)}>
                    <div className={cn("flex items-center gap-3 px-2 py-2 rounded-lg mb-1", isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100')}>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-black text-sm shrink-0">
                            {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={cn("text-[12.5px] font-bold truncate leading-tight", isDark ? 'text-gray-100' : 'text-gray-800')}>{userName}</p>
                            <p className="text-[10px] text-gray-500 truncate mt-0.5">{userEmail}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = '../auth/logout.php'}
                        className={cn("w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[12.5px] font-medium transition-all",
                            isDark ? 'text-red-400/80 hover:bg-red-500/10 hover:text-red-400' : 'text-red-500/70 hover:bg-red-50 hover:text-red-600')}
                    >
                        <LogOut size={14} />
                        Sair da conta
                    </button>
                </div>
            </aside>
        </>
    );
}
