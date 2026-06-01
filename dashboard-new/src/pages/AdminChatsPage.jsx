import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, Search, CheckCheck, Package, ArrowLeft, XCircle, RotateCcw, RefreshCw, Crown, User, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

function timeAgo(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function AdminChatsPage() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRoom, setActiveRoom] = useState(null);
    const [roomMeta, setRoomMeta] = useState(null);
    const [messages, setMessages] = useState([]);
    const [msgInput, setMsgInput] = useState('');
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const messagesEndRef = useRef(null);
    const pollRef = useRef(null);
    const lastMsgId = useRef(0);

    const fetchRooms = useCallback(async () => {
        try {
            const res = await fetch(`../chat_api.php?action=rooms&status=${filter}`);
            const data = await res.json();
            if (data.success) setRooms(data.rooms);
        } catch {}
    }, [filter]);

    useEffect(() => {
        setLoading(true);
        fetchRooms().finally(() => setLoading(false));
        const interval = setInterval(fetchRooms, 8000);
        return () => clearInterval(interval);
    }, [fetchRooms]);

    const fetchMessages = useCallback(async (roomId, after = 0) => {
        try {
            const res = await fetch(`../chat_api.php?action=messages&room_id=${roomId}&after=${after}`);
            const data = await res.json();
            if (data.success) {
                if (after > 0 && data.messages.length > 0) {
                    setMessages(prev => [...prev, ...data.messages]);
                } else if (after === 0) {
                    setMessages(data.messages);
                }
                if (data.messages.length > 0) {
                    lastMsgId.current = Math.max(...data.messages.map(m => m.id));
                }
                if (data.room) setRoomMeta(data.room);
                return data;
            }
        } catch {}
        return null;
    }, []);

    const openRoom = useCallback(async (room) => {
        setActiveRoom(room);
        setMessages([]);
        setRoomMeta(null);
        lastMsgId.current = 0;
        await fetchMessages(room.id);
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(() => fetchMessages(room.id, lastMsgId.current), 3000);
    }, [fetchMessages]);

    useEffect(() => {
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    // Lock parent scroll on mobile to prevent background scrolling
    useEffect(() => {
        const main = document.querySelector('main');
        if (main) { main.style.overflow = 'hidden'; }
        document.body.style.overflow = 'hidden';
        return () => {
            if (main) { main.style.overflow = ''; }
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!msgInput.trim() || !activeRoom || sending) return;
        setSending(true);
        try {
            const res = await fetch('../chat_api.php?action=send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room_id: activeRoom.id, message: msgInput.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setMsgInput('');
                await fetchMessages(activeRoom.id, lastMsgId.current);
            }
        } catch {}
        setSending(false);
    };

    const toggleStatus = async () => {
        if (!activeRoom) return;
        try {
            const res = await fetch('../chat_api.php?action=toggle_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ room_id: activeRoom.id }),
            });
            const data = await res.json();
            if (data.success) {
                setActiveRoom(prev => ({ ...prev, status: data.status }));
                if (roomMeta) setRoomMeta(prev => ({ ...prev, status: data.status }));
                fetchRooms();
            }
        } catch {}
    };

    const filtered = rooms.filter(r => {
        if (!search) return true;
        const q = search.toLowerCase();
        return r.buyer_name?.toLowerCase().includes(q)
            || r.product_name?.toLowerCase().includes(q)
            || r.seller_name?.toLowerCase().includes(q);
    });

    const showChat = !!activeRoom;
    const totalUnread = rooms.reduce((s, r) => s + (parseInt(r.unread) || 0), 0);

    return (
        <div className="-m-4 lg:-m-8 h-[calc(100%+2rem)] lg:h-[calc(100%+4rem)] flex flex-col md:flex-row gap-0 overflow-hidden animate-in fade-in duration-500 bg-gray-50">
            {/* ── Room List ── */}
            <div className={cn(
                "w-full md:w-[340px] lg:w-[380px] flex-shrink-0 border-r border-gray-100 flex flex-col bg-white",
                showChat ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 md:p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-black flex items-center gap-2">
                            <ShieldCheck size={20} className="text-primary" />
                            Admin Chats
                            {totalUnread > 0 && (
                                <span className="bg-primary text-black text-[10px] font-black px-2 py-0.5 rounded-full">{totalUnread}</span>
                            )}
                        </h2>
                        <button onClick={fetchRooms} className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                            <RefreshCw size={14} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar cliente, produto ou vendedor..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/40 transition-colors"
                        />
                    </div>
                    <div className="flex gap-1.5 mt-3">
                        {[['all', 'Todos'], ['open', 'Abertos'], ['closed', 'Fechados']].map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                                    filter === key ? "bg-primary/15 text-primary" : "bg-gray-50 text-gray-400 hover:text-gray-900 border border-gray-100"
                                )}
                            >{label}</button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-10 flex justify-center"><RefreshCw className="animate-spin text-primary" size={24} /></div>
                    ) : filtered.length === 0 ? (
                        <div className="p-10 text-center text-gray-300 text-sm font-bold">Nenhum chat</div>
                    ) : filtered.map(room => (
                        <button
                            key={room.id}
                            onClick={() => openRoom(room)}
                            className={cn(
                                "w-full text-left p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                                activeRoom?.id === room.id && "!bg-[rgba(30,164,101,0.12)] border-l-2 border-l-primary"
                            )}
                        >
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold truncate text-gray-900">{room.buyer_name}</span>
                                        {room.unread > 0 && (
                                            <span className="bg-primary text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">{room.unread}</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                        <Package size={10} className="inline mr-1" />
                                        {room.product_name || `Pedido #${room.order_id}`}
                                    </p>
                                    <p className="text-[10px] text-amber-400/60 truncate mt-0.5">
                                        <User size={9} className="inline mr-1" />
                                        {room.seller_name}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-[10px] text-gray-400">{room.last_message_at ? timeAgo(room.last_message_at) : ''}</span>
                                    <div className={cn(
                                        "text-[8px] font-black uppercase mt-1",
                                        room.status === 'open' ? 'text-emerald-500' : 'text-gray-300'
                                    )}>{room.status === 'open' ? 'aberto' : 'fechado'}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Chat Area ── */}
            <div className={cn("flex-1 flex flex-col min-h-0 bg-gray-50", showChat ? "flex" : "hidden md:flex")}>
                {activeRoom ? (
                    <>
                        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                            <button
                                onClick={() => { setActiveRoom(null); if (pollRef.current) clearInterval(pollRef.current); }}
                                className="md:hidden p-1.5 text-gray-400 hover:text-gray-900"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold truncate text-gray-900">{activeRoom.buyer_name}</h3>
                                <p className="text-[11px] text-gray-400 truncate">
                                    {activeRoom.product_name || `Pedido #${activeRoom.order_id}`}
                                    {activeRoom.seller_name && <span className="text-amber-400/50 ml-2">• Vendedor: {activeRoom.seller_name}</span>}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-full text-[9px] font-black flex items-center gap-1">
                                    <Crown size={9} /> ADMIN
                                </span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                                    activeRoom.status === 'open' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-100 text-gray-400'
                                )}>{activeRoom.status === 'open' ? 'aberto' : 'fechado'}</span>
                                <button onClick={toggleStatus} className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    activeRoom.status === 'open' ? "text-red-400 hover:bg-red-500/10" : "text-emerald-400 hover:bg-emerald-500/10"
                                )}>
                                    {activeRoom.status === 'open' ? <XCircle size={16} /> : <RotateCcw size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 overscroll-contain">
                            {messages.length === 0 && (
                                <div className="text-center py-10 text-gray-300 text-sm font-bold">
                                    Nenhuma mensagem ainda.
                                </div>
                            )}
                            {messages.map((msg, i) => {
                                const isMe = msg.sender_type === 'admin';
                                const isSeller = msg.sender_type === 'seller';
                                const showDateSep = i === 0 || formatDate(messages[i-1].created_at) !== formatDate(msg.created_at);
                                return (
                                    <React.Fragment key={msg.id}>
                                        {showDateSep && (
                                            <div className="text-center py-2">
                                                <span className="text-[10px] bg-gray-100 text-gray-400 px-3 py-1 rounded-full font-bold">{formatDate(msg.created_at)}</span>
                                            </div>
                                        )}
                                        <div className={cn("flex", isMe ? "justify-end" : isSeller ? "justify-end" : "justify-start")}>
                                            <div className={cn(
                                                "max-w-[80%] md:max-w-[65%] rounded-2xl px-4 py-2.5",
                                                isMe
                                                    ? "bg-amber-500/15 border border-amber-500/20"
                                                    : isSeller
                                                        ? "bg-primary/15 border border-primary/20"
                                                        : "bg-white border border-gray-200"
                                            )}>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase",
                                                        isMe ? 'text-amber-400' : isSeller ? 'text-primary' : 'text-gray-400'
                                                    )}>
                                                        {isMe && <Crown size={8} className="inline mr-1" />}
                                                        {msg.sender_name}
                                                    </span>
                                                </div>
                                                <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                                                <div className={cn("flex items-center gap-1 mt-1", (isMe || isSeller) ? "justify-end" : "justify-start")}>
                                                    <span className="text-[9px] text-gray-400">{formatTime(msg.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {activeRoom.status === 'open' ? (
                            <div className="p-3 md:p-4 border-t border-gray-100 bg-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <Crown size={10} className="text-amber-400" />
                                    <span className="text-[10px] text-amber-400/70 font-bold">Respondendo como Dono da Plataforma</span>
                                </div>
                                <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                                    <input
                                        value={msgInput}
                                        onChange={e => setMsgInput(e.target.value)}
                                        placeholder="Responder como Dono da Plataforma..."
                                        maxLength={2000}
                                        className="flex-1 bg-amber-50 border border-amber-200 rounded-xl py-3 px-4 text-sm text-gray-900 placeholder:text-amber-300 focus:outline-none focus:border-amber-400/40 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !msgInput.trim()}
                                        className="px-4 bg-amber-500 text-black rounded-xl font-black text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-4 border-t border-gray-100 text-center text-gray-400 text-xs font-bold bg-white">
                                Chat encerrado.
                                <button onClick={toggleStatus} className="text-primary ml-2 hover:underline">Reabrir</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <ShieldCheck size={48} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">Admin — Todos os Chats</p>
                            <p className="text-gray-300 text-sm mt-1">Selecione para ver e responder como Dono da Plataforma</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
