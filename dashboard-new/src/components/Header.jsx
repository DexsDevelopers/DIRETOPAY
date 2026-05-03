import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, Bell, Search, User, X, Info, CheckCircle, AlertTriangle, AlertCircle, Check } from 'lucide-react';

const typeConfig = {
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    success: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    danger: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
};

export default function Header({ onMenuClick, notifications = [], userData, onMarkRead, onMarkAllRead }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications?.filter(n => !n.is_read)?.length || 0;

    const handleMarkRead = async (id) => {
        if (onMarkRead) onMarkRead(id);
    };

    const handleMarkAllRead = async () => {
        if (onMarkAllRead) onMarkAllRead();
    };

    return (
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_12px_rgba(124,58,237,0.06)]">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                    <Menu size={24} />
                </button>

                <div className="relative group hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar transações..."
                        className="bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-primary/30 focus:bg-white transition-all w-64"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Bell size={20} className={showNotifications ? "text-primary" : "text-gray-500"} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-primary rounded-full flex items-center justify-center text-[9px] font-black text-white px-1">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && createPortal(
                        <div className="fixed inset-0 z-[9999]">
                            <div className="absolute inset-0 bg-black/10" onClick={() => setShowNotifications(false)} />
                            <div className="absolute inset-0 bg-white flex flex-col md:inset-auto md:top-[80px] md:right-4 md:bottom-auto md:left-auto md:w-80 md:max-h-[460px] md:rounded-[24px] md:border md:border-purple-100 md:shadow-[0_20px_60px_rgba(124,58,237,0.15)] md:bg-white">
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors md:hidden">
                                            <X size={18} className="text-gray-400" />
                                        </button>
                                        <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">Notificações</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAllRead} className="text-[9px] font-black text-primary/60 hover:text-primary uppercase tracking-wider transition-colors">
                                                Ler todas
                                            </button>
                                        )}
                                        <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => {
                                            const cfg = typeConfig[n.type] || typeConfig.info;
                                            const Icon = cfg.icon;
                                            return (
                                                <div
                                                    key={n.id}
                                                    className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-purple-50/50' : 'opacity-60'}`}
                                                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                                                            <Icon size={14} className={cfg.color} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-bold text-gray-900 mb-1">{n.title}</p>
                                                                {!n.is_read && <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />}
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 leading-relaxed">{n.message}</p>
                                                            <p className="text-[9px] text-gray-400 font-black mt-2 uppercase tracking-wide">{n.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Bell className="mx-auto text-gray-200 mb-2" size={32} />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nenhuma notificação</p>
                                        </div>
                                    )}
                                </div>
                            </div>
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
