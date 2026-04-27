import React, { useState, useEffect, useCallback } from 'react';
import { Image, Plus, Trash2, Edit3, Eye, EyeOff, RefreshCw, Save, X, ExternalLink, ArrowUp, ArrowDown, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY = { id: null, title: '', image_url: '', link_url: '', link_target: '_blank', sort_order: 0, active: true };

function BannerForm({ initial, onSave, onCancel, loading }) {
    const [form, setForm] = useState(initial);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/[0.03] border border-primary/20 rounded-2xl p-6 space-y-4"
        >
            <h3 className="font-black text-sm flex items-center gap-2">
                <LayoutTemplate size={16} className="text-primary" />
                {initial.id ? 'Editar Banner' : 'Novo Banner'}
            </h3>

            {/* Preview */}
            {form.image_url && (
                <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-[21/6] bg-white/[0.02]">
                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-white/60">Preview</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Título (interno)</label>
                    <input value={form.title} onChange={e => set('title', e.target.value)}
                        placeholder="Ex: Promoção de Verão"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/40" />
                </div>
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Ordem <span className="text-white/20">(menor = primeiro)</span></label>
                    <input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value)||0)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/40" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">URL da Imagem *</label>
                <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
                    placeholder="https://exemplo.com/banner.jpg"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/40 font-mono text-xs" />
                <p className="text-[10px] text-white/20">Recomendado: 1200×400px ou proporção 3:1</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Link ao Clicar</label>
                    <input value={form.link_url} onChange={e => set('link_url', e.target.value)}
                        placeholder="https://pixghost.site/loja (opcional)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/40 font-mono text-xs" />
                </div>
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Abrir em</label>
                    <select value={form.link_target} onChange={e => set('link_target', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/40">
                        <option value="_blank" className="bg-[#111]">Nova aba</option>
                        <option value="_self" className="bg-[#111]">Mesma aba</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <button onClick={() => onSave(form)} disabled={loading || !form.image_url}
                    className="flex-1 py-3 bg-primary text-black font-black text-sm rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                    {loading ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                    {initial.id ? 'Salvar Alterações' : 'Criar Banner'}
                </button>
                <button onClick={onCancel} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white/50 hover:bg-white/10 transition-all">
                    <X size={15} />
                </button>
            </div>
        </motion.div>
    );
}

export default function AdminBannersPage() {
    const [banners, setBanners]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing]   = useState(null);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState('');

    const load = useCallback(async () => {
        try {
            const res  = await fetch('../manage_banners.php?action=list');
            const data = await res.json();
            if (data.success) setBanners(data.banners || []);
        } catch {}
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const flash = (type, msg) => {
        if (type === 'ok') setSuccess(msg); else setError(msg);
        setTimeout(() => { setSuccess(''); setError(''); }, 3000);
    };

    const handleSave = async (form) => {
        setSaving(true);
        const action = form.id ? 'update' : 'create';
        try {
            const res  = await fetch(`../manage_banners.php?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                flash('ok', form.id ? 'Banner atualizado!' : 'Banner criado!');
                setShowForm(false); setEditing(null);
                load();
            } else flash('err', data.error || 'Erro ao salvar');
        } catch { flash('err', 'Erro de conexão'); }
        setSaving(false);
    };

    const handleToggle = async (id) => {
        try {
            const res  = await fetch('../manage_banners.php?action=toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (data.success) setBanners(prev => prev.map(b => b.id === id ? { ...b, active: data.active ? 1 : 0 } : b));
        } catch {}
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir este banner?')) return;
        try {
            const res  = await fetch('../manage_banners.php?action=delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (data.success) { setBanners(prev => prev.filter(b => b.id !== id)); flash('ok', 'Banner excluído'); }
        } catch {}
    };

    const activeBanners = banners.filter(b => parseInt(b.active));

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                            <Image size={20} className="text-primary" />
                        </div>
                        Banners da Loja
                    </h1>
                    <p className="text-white/30 text-sm mt-1">Gerencie os banners exibidos na loja pública <a href="/loja" target="_blank" className="text-primary hover:underline">/loja</a></p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                        {activeBanners.length} ativo{activeBanners.length !== 1 ? 's' : ''}
                    </span>
                    <button onClick={() => { setEditing(null); setShowForm(s => !s); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-black text-sm rounded-xl hover:bg-primary/90 transition-all">
                        {showForm ? <X size={15} /> : <Plus size={15} />}
                        {showForm ? 'Cancelar' : 'Novo Banner'}
                    </button>
                </div>
            </div>

            {/* Alerts */}
            <AnimatePresence>
                {success && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold rounded-xl">
                        ✓ {success}
                    </motion.div>
                )}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl">
                        ⚠ {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form */}
            <AnimatePresence>
                {(showForm && !editing) && (
                    <BannerForm key="new" initial={EMPTY} onSave={handleSave} onCancel={() => setShowForm(false)} loading={saving} />
                )}
            </AnimatePresence>

            {/* Info */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <LayoutTemplate size={16} className="text-primary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold mb-1">Como funcionam os banners</p>
                        <p className="text-xs text-white/30 leading-relaxed">
                            Os banners aparecem no topo da <a href="/loja" target="_blank" className="text-primary">loja pública</a> como um carrossel automático.
                            Use imagens de <strong className="text-white/60">1200×400px</strong> para melhor qualidade. Banners inativos não aparecem para os visitantes.
                        </p>
                    </div>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-primary" size={28} /></div>
            ) : banners.length === 0 ? (
                <div className="flex flex-col items-center py-24 gap-4 text-center">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                        <Image size={28} className="text-white/20" />
                    </div>
                    <div>
                        <p className="font-bold text-white/40">Nenhum banner ainda</p>
                        <p className="text-sm text-white/20 mt-1">Crie seu primeiro banner para a loja</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {banners.map((banner, idx) => (
                        <motion.div key={banner.id} layout
                            className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-colors ${parseInt(banner.active) ? 'border-white/8' : 'border-white/[0.04] opacity-60'}`}>
                            {editing === banner.id ? (
                                <div className="p-5">
                                    <BannerForm
                                        initial={{ ...banner, active: !!parseInt(banner.active) }}
                                        onSave={handleSave}
                                        onCancel={() => setEditing(null)}
                                        loading={saving}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                                    {/* Thumbnail */}
                                    <div className="w-full sm:w-36 h-20 rounded-xl overflow-hidden bg-white/[0.03] border border-white/10 flex-shrink-0">
                                        {banner.image_url ? (
                                            <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Image size={20} className="text-white/15" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${parseInt(banner.active) ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/30 border border-white/10'}`}>
                                                {parseInt(banner.active) ? 'Ativo' : 'Inativo'}
                                            </span>
                                            <span className="text-[10px] text-white/20 font-mono">#{banner.sort_order} ordem</span>
                                        </div>
                                        <p className="font-bold text-sm truncate">{banner.title || <span className="text-white/30 italic">Sem título</span>}</p>
                                        {banner.link_url && (
                                            <a href={banner.link_url} target="_blank" rel="noopener noreferrer"
                                                className="text-[11px] text-primary/60 hover:text-primary flex items-center gap-1 truncate mt-0.5 transition-colors">
                                                <ExternalLink size={10} /> {banner.link_url}
                                            </a>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 sm:shrink-0">
                                        <button onClick={() => handleToggle(banner.id)} title={parseInt(banner.active) ? 'Desativar' : 'Ativar'}
                                            className={`p-2 rounded-xl transition-all ${parseInt(banner.active) ? 'text-green-400 hover:bg-green-500/10' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}>
                                            {parseInt(banner.active) ? <Eye size={15} /> : <EyeOff size={15} />}
                                        </button>
                                        <button onClick={() => { setEditing(banner.id); setShowForm(false); }} title="Editar"
                                            className="p-2 rounded-xl text-white/40 hover:text-primary hover:bg-primary/10 transition-all">
                                            <Edit3 size={15} />
                                        </button>
                                        <button onClick={() => handleDelete(banner.id)} title="Excluir"
                                            className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {banners.length > 0 && (
                <p className="text-center text-xs text-white/15 pb-4">
                    Altere o campo "Ordem" de cada banner para reordenar. Menor número = aparece primeiro.
                </p>
            )}
        </div>
    );
}
