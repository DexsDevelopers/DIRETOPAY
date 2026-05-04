import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, Bell, Search, User, X, Info, CheckCircle, AlertTriangle, AlertCircle,
    Zap, DollarSign, ShoppingCart, Eye, TrendingUp, RefreshCw, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function reativarNotificacoes() {
    localStorage.removeItem('push_subscribed');
    localStorage.removeItem('push_prompt_dismissed');
    window.location.reload();
}

const NOTIF_TYPES = {
    info:           { icon: Info,          color: 'text-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-100',    label: 'Info' },
    success:        { icon: CheckCircle,   color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Sistema' },
    warning:        { icon: AlertTriangle, color: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-100',   label: 'Aviso' },
    danger:         { icon: AlertCircle,   color: 'text-red-500',     bg: 'bg-red-50',     border: 'border-red-100',     label: 'Alerta' },
    sale_generated: { icon: Zap,           color: 'text-violet-500',  bg: 'bg-violet-50',  border: 'border-violet-100',  label: 'PIX Gerado' },
    sale_paid:      { icon: DollarSign,    color: 'text-green-500',   bg: 'bg-green-50',   border: 'border-green-100',   label: 'Venda Paga' },
    cart_abandoned: { icon: ShoppingCart,  color: 'text-orange-500',  bg: 'bg-orange-50',  border: 'border-orange-100',  label: 'Abandono' },
    store_visit:    { icon: Eye,           color: 'text-sky-500',     bg: 'bg-sky-50',     border: 'border-sky-100',     label: 'Visita' },
    sale:           { icon: TrendingUp,    color: 'text-green-500',   bg: 'bg-green-50',   border: 'border-green-100',   label: 'Venda' },
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
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_12px_rgba(124,58,237,0.06)]">
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
                                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className="absolute inset-0 bg-white flex flex-col md:inset-auto md:top-[76px] md:right-4 md:bottom-auto md:left-auto md:w-[390px] md:max-h-[580px] md:rounded-[28px] md:border md:border-gray-100 md:shadow-[0_24px_80px_rgba(124,58,237,0.16)]"
                            >
                                {/* Panel Header */}
                                <div className="p-5 pb-3 border-b border-gray-50 shrink-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <button onClick={() => setShow(false)} className="p-1 hover:bg-gray-100 rounded-lg md:hidden">
                                                <X size={18} className="text-gray-400" />
                                            </button>
                                            <div className="w-8 h-8 rounded-xl overflow-hidden border border-purple-100 shadow-sm shrink-0">
                                                <img src="/logo_premium.png" alt="Ghost Pix"
                                                    className="w-full h-full object-cover"
                                                    onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><span class="text-white font-black text-xs">G</span></div>'; }} />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-gray-900 leading-none">Notificações</p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Ghost Pix</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {unreadCount > 0 && (
                                                <button onClick={onMarkAllRead}
                                                    className="text-[9px] font-black text-primary/60 hover:text-primary uppercase tracking-wider transition-colors px-2 py-1 hover:bg-primary/5 rounded-lg">
                                                    Ler todas
                                                </button>
                                            )}
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${unreadCount > 0 ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-gray-100 text-gray-400'}`}>
                                                {unreadCount > 0 ? `${unreadCount} nova${unreadCount > 1 ? 's' : ''}` : 'zero'}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Tabs */}
                                    <div className="flex gap-1 bg-gray-50 p-1 rounded-2xl">
                                        {TABS.map(t => {
                                            const tabUnread = (t.types
                                                ? notifications.filter(n => t.types.includes(n.type) && !n.is_read)
                                                : notifications.filter(n => !n.is_read)
                                            ).length;
                                            return (
                                                <button key={t.id} onClick={() => setTab(t.id)}
                                                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all relative ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
                                                    {t.label}
                                                    {tabUnread > 0 && (
                                                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full text-[7px] text-white font-black flex items-center justify-center">
                                                            {tabUnread > 9 ? '9+' : tabUnread}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* List */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    {filtered.length > 0 ? (
                                        <div className="divide-y divide-gray-50/80">
                                            {filtered.map(n => {
                                                const cfg = NOTIF_TYPES[n.type] || NOTIF_TYPES.info;
                                                const Icon = cfg.icon;
                                                return (
                                                    <div key={n.id}
                                                        onClick={() => !n.is_read && onMarkRead?.(n.id)}
                                                        className={`flex gap-3.5 px-5 py-4 cursor-pointer transition-all hover:bg-gray-50/80 ${!n.is_read ? 'bg-violet-50/30' : ''}`}>
                                                        {/* Icon */}
                                                        <div className={`w-10 h-10 rounded-2xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 mt-0.5`}>
                                                            <Icon size={16} className={cfg.color} />
                                                        </div>
                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-lg ${cfg.bg} ${cfg.color}`}>
                                                                        {cfg.label}
                                                                    </span>
                                                                    {!n.is_read && <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shrink-0" />}
                                                                </div>
                                                                <span className="text-[9px] text-gray-300 font-bold shrink-0">
                                                                    {timeAgo(n.created_at || n.time)}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-gray-900 leading-snug">{n.title}</p>
                                                            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center shadow-inner">
                                                <Bell size={22} className="text-gray-300" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-gray-400">Tudo em dia!</p>
                                                <p className="text-[11px] text-gray-300 mt-1">Nenhuma notificação aqui</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 border-t border-gray-50 shrink-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] text-gray-300 font-bold">{notifications.length} no total</p>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                            <span className="text-[9px] text-gray-300 font-bold">Atualiza a cada 30s</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={reativarNotificacoes}
                                        className="w-full py-2 rounded-xl border border-dashed border-gray-200 text-[10px] font-black text-gray-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5">
                                        <RefreshCw size={10} /> Reativar Notificações Push
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-violet-600 p-[1.5px] cursor-pointer hover:rotate-12 transition-transform">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-sm italic text-primary">
                            {userData?.name ? userData.name.charAt(0).toUpperCase() : <User size={18} className="text-primary" />}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
