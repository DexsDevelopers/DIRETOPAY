import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
    Menu, Bell, X, Info, CheckCircle, AlertTriangle, AlertCircle,
    Zap, DollarSign, ShoppingCart, Eye, TrendingUp, RefreshCw, Sun, Moon,
    BellOff, ChevronDown, Settings, LogOut,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { BorderBeam } from './AnimatedUI';

function reativarNotificacoes() {
    localStorage.removeItem('push_subscribed');
    localStorage.removeItem('push_prompt_dismissed');
    window.location.reload();
}

const P = '#10b981';

const NOTIF_TYPES = {
    info:           { icon: Info,          hex: '#6366f1', label: 'Info' },
    success:        { icon: CheckCircle,   hex: '#10b981', label: 'Sistema' },
    warning:        { icon: AlertTriangle, hex: '#f59e0b', label: 'Aviso' },
    danger:         { icon: AlertCircle,   hex: '#ef4444', label: 'Alerta' },
    sale_generated: { icon: Zap,           hex: '#1ea465', label: 'PIX Gerado' },
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
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function Header({ onMenuClick, notifications = [], userData, onMarkRead, onMarkAllRead }) {
    const [showNotif, setShowNotif] = useState(false);
    const [showUser, setShowUser] = useState(false);
    const [tab, setTab] = useState('all');
    const unreadCount = notifications.filter(n => !n.is_read).length;
    const { isDark, toggleTheme } = useTheme();

    const tabCfg = TABS.find(t => t.id === tab);
    const filtered = tabCfg?.types
        ? notifications.filter(n => tabCfg.types.includes(n.type))
        : notifications;

    const userName = userData?.name?.split(' ')[0] || 'Usuário';
    const userInitial = userData?.name?.charAt(0).toUpperCase() || 'U';

    const hBg     = isDark ? 'bg-[#0e0e13]/95 border-white/[0.06]' : 'bg-white/95 border-gray-200/80';
    const btnBase = isDark
        ? 'text-gray-400 hover:text-gray-100 hover:bg-white/[0.07] rounded-lg transition-all'
        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all';

    return (
        <header className={`h-14 border-b flex items-center justify-between px-4 lg:px-6 shrink-0 backdrop-blur-md sticky top-0 z-30 ${hBg}`}>
            {/* Left */}
            <div className="flex items-center gap-2">
                <button onClick={onMenuClick} className={`p-2 ${btnBase}`}>
                    <Menu size={18} />
                </button>
                <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold ${isDark ? 'bg-emerald-500/8 text-emerald-400/80 border border-emerald-500/15' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ boxShadow: '0 0 4px rgba(16,185,129,0.8)' }} />
                    Sistema operacional
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1">
                {/* Theme */}
                <button onClick={toggleTheme} className={`p-2 ${btnBase}`} title={isDark ? 'Modo claro' : 'Modo escuro'}>
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button onClick={() => { setShowNotif(s => !s); setShowUser(false); }}
                        className={`p-2 relative ${btnBase} ${showNotif ? (isDark ? 'bg-white/8 text-white' : 'bg-gray-100 text-gray-800') : ''}`}>
                        <Bell size={16} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"
                                style={{ boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
                        )}
                    </button>

                    {showNotif && createPortal(
                        <div className="fixed inset-0 z-[9999]" onClick={() => setShowNotif(false)}>
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                onClick={e => e.stopPropagation()}
                                className={`absolute top-[58px] right-4 w-[360px] max-h-[520px] rounded-2xl overflow-hidden flex flex-col shadow-2xl border relative ${isDark ? 'bg-[#111117] border-white/10' : 'bg-white border-gray-200'}`}
                            >
                                <BorderBeam colorFrom="#10b981" colorTo="#6366f1" duration={12} />
                                {/* Header */}
                                <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-white/8' : 'border-gray-100'}`}>
                                    <div className="flex items-center gap-2.5">
                                        <Bell size={14} className="text-emerald-500" />
                                        <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notificações</span>
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {unreadCount > 0 && (
                                            <button onClick={onMarkAllRead}
                                                className="text-[11px] font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
                                                Ler todas
                                            </button>
                                        )}
                                        <button onClick={() => setShowNotif(false)} className={`p-1 rounded-lg ${btnBase}`}>
                                            <X size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className={`flex gap-0.5 px-3 py-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                                    {TABS.map(t => (
                                        <button key={t.id} onClick={() => setTab(t.id)}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                                tab === t.id
                                                    ? isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'
                                                    : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                            }`}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                {/* List */}
                                <div className="overflow-y-auto flex-1 custom-scrollbar">
                                    {filtered.length > 0 ? (
                                        <div className="p-2 space-y-0.5">
                                            {filtered.map((n) => {
                                                const cfg = NOTIF_TYPES[n.type] || NOTIF_TYPES.info;
                                                const Icon = cfg.icon;
                                                return (
                                                    <div key={n.id}
                                                        onClick={() => !n.is_read && onMarkRead?.(n.id)}
                                                        className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all group ${
                                                            !n.is_read
                                                                ? isDark ? 'bg-white/5 hover:bg-white/8' : 'bg-gray-50 hover:bg-gray-100'
                                                                : isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'
                                                        }`}>
                                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                                            style={{ background: `${cfg.hex}18` }}>
                                                            <Icon size={14} style={{ color: cfg.hex }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className={`text-[12px] font-semibold truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                                                    {n.title}
                                                                </p>
                                                                <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(n.created_at || n.time)}</span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                                                        </div>
                                                        {!n.is_read && (
                                                            <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                                                                style={{ background: cfg.hex }} />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                                <BellOff size={18} className="text-gray-400" />
                                            </div>
                                            <p className="text-[12px] text-gray-400 font-medium">Nenhuma notificação</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className={`px-3 py-2.5 border-t flex items-center justify-between ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-gray-400">Atualiza a cada 30s</span>
                                    </div>
                                    <button onClick={reativarNotificacoes}
                                        className="text-[10px] text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1 transition-colors">
                                        <RefreshCw size={10} /> Reativar push
                                    </button>
                                </div>
                            </motion.div>
                        </div>,
                        document.body
                    )}
                </div>

                {/* User menu */}
                <div className="relative ml-1">
                    <button onClick={() => { setShowUser(s => !s); setShowNotif(false); }}
                        className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg transition-all ${
                            isDark ? 'hover:bg-white/[0.07]' : 'hover:bg-gray-100'
                        }`}>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-[11px]" style={{ boxShadow: '0 0 6px rgba(16,185,129,0.3)' }}>
                            {userInitial}
                        </div>
                        <span className={`text-[12.5px] font-semibold hidden sm:block ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {userName}
                        </span>
                        <ChevronDown size={12} className={`text-gray-400 transition-transform ${showUser ? 'rotate-180' : ''}`} />
                    </button>

                    {showUser && createPortal(
                        <div className="fixed inset-0 z-[9999]" onClick={() => setShowUser(false)}>
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.15 }}
                                onClick={e => e.stopPropagation()}
                                className={`absolute top-[58px] right-4 w-[200px] rounded-xl overflow-hidden shadow-xl border ${isDark ? 'bg-[#111117] border-white/10' : 'bg-white border-gray-200'}`}
                            >
                                <div className={`px-4 py-3 border-b ${isDark ? 'border-white/8' : 'border-gray-100'}`}>
                                    <p className={`text-[13px] font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{userData?.name || 'Usuário'}</p>
                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{userData?.email || ''}</p>
                                </div>
                                <div className="p-1.5">
                                    <Link to="/config" onClick={() => setShowUser(false)}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all ${isDark ? 'text-gray-300 hover:bg-white/8' : 'text-gray-600 hover:bg-gray-50'}`}>
                                        <Settings size={14} /> Configurações
                                    </Link>
                                    <button onClick={() => window.location.href = '../auth/logout.php'}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all ${isDark ? 'text-red-400/80 hover:bg-red-500/10 hover:text-red-400' : 'text-red-500/80 hover:bg-red-50 hover:text-red-600'}`}>
                                        <LogOut size={14} /> Sair da conta
                                    </button>
                                </div>
                            </motion.div>
                        </div>,
                        document.body
                    )}
                </div>
            </div>
        </header>
    );
}
