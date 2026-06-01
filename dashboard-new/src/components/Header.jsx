import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, Bell, Search, User, X, Info, CheckCircle, AlertTriangle, AlertCircle,
    Zap, DollarSign, ShoppingCart, Eye, TrendingUp, RefreshCw, Sun, Moon,
    BellOff, Sparkles
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function reativarNotificacoes() {
    localStorage.removeItem('push_subscribed');
    localStorage.removeItem('push_prompt_dismissed');
    window.location.reload();
}

const P = '#1ea465';

const NOTIF_TYPES = {
    info:           { icon: Info,          hex: '#3b82f6', label: 'Info' },
    success:        { icon: CheckCircle,   hex: '#10b981', label: 'Sistema' },
    warning:        { icon: AlertTriangle, hex: '#f59e0b', label: 'Aviso' },
    danger:         { icon: AlertCircle,   hex: '#ef4444', label: 'Alerta' },
    sale_generated: { icon: Zap,           hex: P,         label: 'PIX Gerado' },
    sale_paid:      { icon: DollarSign,    hex: '#10b981', label: 'Venda Paga' },
    cart_abandoned: { icon: ShoppingCart,  hex: '#f97316', label: 'Abandono' },
    store_visit:    { icon: Eye,           hex: '#0ea5e9', label: 'Visita' },
    sale:           { icon: TrendingUp,    hex: '#10b981', label: 'Venda' },
};

const TABS = [
    { id: 'all',   label: 'Todas',   types: null },
    { id: 'sales', label: 'Vendas',  types: ['sale_generated', 'sale_paid', 'sale', 'success'] },
    { id: 'store', label: 'Loja',    types: ['cart_abandoned', 'store_visit'] },
    { id: 'sys',   label: 'Sistema', types: ['info', 'warning', 'danger'] },
];

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);
    if (isNaN(diff) || diff < 0) return '';
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function Header({ onMenuClick, notifications = [], userData, onMarkRead, onMarkAllRead }) {
    const [show, setShow] = useState(false);
    const [tab, setTab] = useState('all');
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const tabCfg = TABS.find(t => t.id === tab);
    const filtered = tabCfg?.types
        ? notifications.filter(n => tabCfg.types.includes(n.type))
        : notifications;

    const { isDark, toggleTheme } = useTheme();

    return (
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_12px_rgba(30,164,101,0.06)]">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                    <Menu size={24} />
                </button>
                <div className="relative group hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input type="text" placeholder="Buscar transações..."
                        className="bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-primary/30 focus:bg-white transition-all w-64" />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    title={isDark ? 'Modo Claro' : 'Modo Escuro'}
                    className={`p-2.5 rounded-xl transition-all ${
                        isDark
                            ? 'bg-amber-400/10 text-amber-400 hover:bg-amber-400/20'
                            : 'hover:bg-gray-100 text-gray-500'
                    }`}
                >
                    {isDark
                        ? <Sun size={18} />
                        : <Moon size={18} />}
                </button>

                {/* Bell */}
                <div className="relative">
                    <button onClick={() => setShow(s => !s)}
                        className={`relative p-2.5 rounded-xl transition-all ${show ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-primary rounded-full flex items-center justify-center text-[9px] font-black text-white px-1 shadow-md shadow-primary/40 animate-bounce">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {show && createPortal(
                        <div className="fixed inset-0 z-[9999]">
                            <div className="absolute inset-0" onClick={() => setShow(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0 flex flex-col md:inset-auto md:top-[72px] md:right-4 md:bottom-auto md:left-auto md:w-[400px] md:h-[580px] md:rounded-[24px] overflow-hidden z-10"
                                style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(30,164,101,0.1)' }}
                            >
                                {/* ── HEADER GRADIENTE ── */}
                                <div className="relative shrink-0 overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, #1a000e 0%, #3d0020 60%, #1a000e 100%)' }}>
                                    {/* glow orb */}
                                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
                                        style={{ background: 'radial-gradient(circle, rgba(30,164,101,0.35) 0%, transparent 70%)' }} />

                                    <div className="relative z-10 px-5 pt-5 pb-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => setShow(false)} className="p-1.5 hover:bg-white/10 rounded-xl transition-colors md:hidden">
                                                    <X size={16} className="text-white/60" />
                                                </button>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                                        <Bell size={16} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-white leading-none tracking-tight">Notificações</p>
                                                        <p className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>DiretoPay</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <motion.button whileTap={{ scale: 0.95 }} onClick={onMarkAllRead}
                                                        className="text-[10px] font-black px-3 py-1.5 rounded-xl transition-all"
                                                        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                                        Ler todas
                                                    </motion.button>
                                                )}
                                                <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                                                    style={unreadCount > 0
                                                        ? { background: P, color: '#fff', boxShadow: `0 4px 14px ${P}60` }
                                                        : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                                                    {unreadCount > 0 ? `${unreadCount} nova${unreadCount !== 1 ? 's' : ''}` : 'Tudo lido'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tabs pill */}
                                        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.25)' }}>
                                            {TABS.map(t => {
                                                const tabUnread = (t.types
                                                    ? notifications.filter(n => t.types.includes(n.type) && !n.is_read)
                                                    : notifications.filter(n => !n.is_read)
                                                ).length;
                                                const active = tab === t.id;
                                                return (
                                                    <button key={t.id} onClick={() => setTab(t.id)}
                                                        className="flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all relative"
                                                        style={active
                                                            ? { background: P, color: '#fff', boxShadow: `0 4px 12px ${P}50` }
                                                            : { color: 'rgba(255,255,255,0.4)' }}>
                                                        {t.label}
                                                        {tabUnread > 0 && (
                                                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[7px] text-white font-black flex items-center justify-center"
                                                                style={{ background: active ? '#fff' : P, color: active ? P : '#fff' }}>
                                                                {tabUnread > 9 ? '9+' : tabUnread}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* ── LIST ── */}
                                <div className="overflow-y-auto bg-white dark:bg-[#0f0f14] custom-scrollbar overscroll-contain flex-1"
                                    style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
                                    {filtered.length > 0 ? (
                                        <div className="p-3 space-y-1.5">
                                            {filtered.map((n, i) => {
                                                const cfg = NOTIF_TYPES[n.type] || NOTIF_TYPES.info;
                                                const Icon = cfg.icon;
                                                return (
                                                    <motion.div key={n.id}
                                                        initial={{ opacity: 0, x: -6 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.18, delay: i * 0.03 }}
                                                        onClick={() => !n.is_read && onMarkRead?.(n.id)}
                                                        className="flex gap-3 p-3.5 rounded-2xl cursor-pointer transition-all group relative overflow-hidden"
                                                        style={!n.is_read
                                                            ? { background: `${cfg.hex}08`, border: `1px solid ${cfg.hex}22` }
                                                            : { background: 'transparent', border: '1px solid transparent' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = `${cfg.hex}12`}
                                                        onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : `${cfg.hex}08`}
                                                    >
                                                        {/* left accent bar */}
                                                        {!n.is_read && (
                                                            <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                                                                style={{ background: `linear-gradient(180deg, ${cfg.hex}, ${cfg.hex}60)` }} />
                                                        )}

                                                        {/* icon */}
                                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                                                            style={{ background: `${cfg.hex}18`, border: `1px solid ${cfg.hex}30` }}>
                                                            <Icon size={16} style={{ color: cfg.hex }} />
                                                        </div>

                                                        {/* content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg"
                                                                    style={{ background: `${cfg.hex}15`, color: cfg.hex }}>
                                                                    {cfg.label}
                                                                </span>
                                                                <span className="text-[9px] font-bold text-gray-400 shrink-0">
                                                                    {timeAgo(n.created_at || n.time)}
                                                                </span>
                                                            </div>
                                                            <p className="text-[12px] font-bold text-gray-900 dark:text-white leading-snug mt-1">{n.title}</p>
                                                            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                                        </div>

                                                        {/* unread dot */}
                                                        {!n.is_read && (
                                                            <div className="w-2 h-2 rounded-full shrink-0 mt-1 animate-pulse"
                                                                style={{ background: cfg.hex, boxShadow: `0 0 6px ${cfg.hex}` }} />
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
                                            <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
                                                style={{ background: `${P}12`, border: `1px solid ${P}20` }}>
                                                <BellOff size={22} style={{ color: P }} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-gray-500">Tudo em dia!</p>
                                                <p className="text-[11px] text-gray-400 mt-1">Nenhuma notificação aqui</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ── FOOTER ── */}
                                <div className="px-4 py-3 shrink-0 bg-white dark:bg-[#0f0f14]"
                                    style={{ borderTop: '1px solid rgba(30,164,101,0.08)' }}>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <p className="text-[10px] text-gray-400 font-bold">{notifications.length} no total</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                            <span className="text-[9px] text-gray-400 font-bold">Atualiza a cada 30s</span>
                                        </div>
                                    </div>
                                    <button onClick={reativarNotificacoes}
                                        className="w-full py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5"
                                        style={{ border: `1.5px dashed ${P}30`, color: P, background: `${P}06` }}
                                        onMouseEnter={e => e.currentTarget.style.background = `${P}12`}
                                        onMouseLeave={e => e.currentTarget.style.background = `${P}06`}>
                                        <RefreshCw size={11} /> Reativar Notificações Push
                                    </button>
                                </div>
                            </motion.div>
                        </div>,
                        document.body
                    )}
                </div>

                <div className="h-8 w-[1px] bg-gray-200 mx-2" />

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold leading-none text-gray-900">{userData?.name || 'Usuário'}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1 font-bold">Plano Classic</p>
                    </div>
                    <div className="w-10 h-10 rounded-full p-[1.5px] cursor-pointer hover:rotate-12 transition-transform"
                        style={{ background: `linear-gradient(135deg, ${P}, #126b41)` }}>
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-sm" style={{ color: P }}>
                            {userData?.name ? userData.name.charAt(0).toUpperCase() : <User size={18} />}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
