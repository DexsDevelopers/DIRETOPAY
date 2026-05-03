import React, { useState, useEffect } from 'react';
import {
    Plus,
    Link as LinkIcon,
    ExternalLink,
    Copy,
    Edit3,
    Trash2,
    Search,
    ShoppingBag,
    Palette,
    CheckCircle2,
    Clock,
    RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function CheckoutsPage() {
    const [checkouts, setCheckouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    const fetchCheckouts = async () => {
        try {
            const res = await fetch('/get_checkouts.php');
            const data = await res.json();
            if (data.success) {
                setCheckouts(data.checkouts);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCheckouts();
    }, []);

    const handleCopy = (id, url) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este checkout permanentemente?')) return;
        try {
            const formData = new FormData();
            formData.append('action', 'delete_checkout');
            formData.append('id', id);
            const res = await fetch('/checkout_actions.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) fetchCheckouts();
        } catch (err) { alert('Erro ao excluir'); }
    };

    const filtered = checkouts.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <RefreshCw className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-10 p-6 lg:p-10 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-4">
                        <ShoppingBag className="text-primary" size={36} />
                        Produtos e <span className="text-primary italic">Links</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Crie e gerencie suas páginas de pagamento personalizadas.</p>
                </div>

                <Link
                    to="/checkout-builder"
                    className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(124,58,237,0.25)]"
                >
                    <Plus size={20} /> NOVO CHECKOUT
                </Link>
            </div>

            {/* Filtro e Stats Mini */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou slug..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-3xl py-4 pl-16 pr-8 text-lg text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-primary/30 focus:bg-white transition-all font-medium"
                    />
                </div>
                <div className="hidden lg:flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-3xl border border-gray-200 italic">
                    <Clock className="text-primary" size={18} />
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{checkouts.length} CHECKOUTS ATIVOS</span>
                </div>
            </div>

            {/* Grid de Checkouts */}
            {filtered.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 p-20 rounded-[40px] text-center space-y-6">
                    <ShoppingBag size={64} className="mx-auto text-gray-200" />
                    <h2 className="text-2xl font-black text-gray-400 italic">Nenhum checkout encontrado</h2>
                    <Link to="/checkout-builder" className="text-primary font-bold hover:underline">Criar meu primeiro link agora →</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filtered.map((checkout) => (
                        <motion.div
                            key={checkout.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-100 group rounded-[32px] overflow-hidden flex flex-col p-8 transition-all shadow-sm hover:border-primary/20 hover:shadow-[0_20px_60px_rgba(124,58,237,0.12)]"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-black truncate max-w-[200px]">{checkout.title}</h3>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">URL: /p/{checkout.slug}</span>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    checkout.active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-gray-50 text-gray-400 border-gray-200"
                                )}>
                                    {checkout.active ? "ATIVO" : "INATIVO"}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="p-3 bg-white rounded-xl border border-gray-100">
                                    <Palette size={20} style={{ color: checkout.primary_color }} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tema Visual</span>
                                    <span className="text-xs font-bold text-gray-600 uppercase">{checkout.primary_color}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-auto">
                                <button
                                    onClick={() => handleCopy(checkout.id, checkout.url)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[11px] transition-all",
                                        copiedId === checkout.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-gray-50 text-gray-500 hover:bg-primary hover:text-white"
                                    )}
                                >
                                    {copiedId === checkout.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    {copiedId === checkout.id ? "COPIADO!" : "COPIAR URL"}
                                </button>

                                <Link
                                    to={`/checkout-builder?id=${checkout.id}`}
                                    className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl text-gray-500 font-black text-[11px] hover:bg-gray-100 transition-all border border-gray-200"
                                >
                                    <Edit3 size={16} /> EDITAR
                                </Link>
                            </div>

                            <div className="mt-4 flex justify-between items-center px-1">
                                <a
                                    href={checkout.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-black text-gray-400 hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-widest"
                                >
                                    <ExternalLink size={10} /> Visualizar Checkout
                                </a>
                                <button
                                    onClick={() => handleDelete(checkout.id)}
                                    className="text-red-500/30 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

