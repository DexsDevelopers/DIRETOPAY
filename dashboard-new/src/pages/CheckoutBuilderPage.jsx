import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Trash2, Save, Palette, Package, Globe, Layout, ArrowLeft,
    RefreshCw, Image as ImageIcon, Upload, Loader2, ExternalLink,
    ChevronDown, Type, MousePointer2, Layers, ToggleLeft, ToggleRight,
    Sliders, Eye, Shield, Star, Clock, Users, Zap, Info,
    Smartphone, MessageCircle, BarChart2, UserCheck, Link2, AlignLeft
} from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

// ── Theme Presets ────────────────────────────────────────────────────────────
const PRESETS = [
    { key: 'dark',     label: 'Dark',    bg: '#08080a', primary: '#00ff88' },
    { key: 'midnight', label: 'Noite',   bg: '#0d0d1a', primary: '#a78bfa' },
    { key: 'ocean',    label: 'Oceano',  bg: '#021221', primary: '#38bdf8' },
    { key: 'crimson',  label: 'Crimson', bg: '#0d0407', primary: '#f43f5e' },
    { key: 'fire',     label: 'Fogo',    bg: '#0c0602', primary: '#f97316' },
    { key: 'gold',     label: 'Ouro',    bg: '#0d0a00', primary: '#fbbf24' },
    { key: 'indigo',   label: 'Indigo',  bg: '#06061a', primary: '#818cf8' },
    { key: 'light',    label: 'Claro',   bg: '#f1f5f9', primary: '#6366f1' },
];

const FONTS = [
    { value: 'Outfit',        label: 'Outfit (padrão)' },
    { value: 'Inter',         label: 'Inter' },
    { value: 'Poppins',       label: 'Poppins' },
    { value: 'Roboto',        label: 'Roboto' },
    { value: 'Montserrat',    label: 'Montserrat' },
    { value: 'Space Grotesk', label: 'Space Grotesk' },
];

const GRAD_DIRS = [
    { value: '135deg', label: '↘' },
    { value: '180deg', label: '↓' },
    { value: '90deg',  label: '→' },
    { value: '225deg', label: '↙' },
];

const DEFAULT_CS = {
    bg_type: 'solid',
    gradient_from: '#0a0a0f',
    gradient_to: '#1a0a2e',
    gradient_dir: '135deg',
    logo_url: '',
    font_family: 'Outfit',
    btn_radius: 'rounded',
    layout: '2col',
    show_countdown: true,
    countdown_minutes: 15,
    show_viewers: true,
    show_guarantee: true,
    guarantee_text: 'Garantia de 7 Dias',
    guarantee_sub: 'Não ficou satisfeito? Devolvemos 100% do seu dinheiro, sem perguntas.',
    show_social: true,
    social_count: '2.400',
    show_trust_seals: true,
    cta_text: '',
    show_sticky_mobile: true,
    // Textos personalizados
    headline: '',
    subheadline: '',
    urgency_text: '',
    // Campos do comprador
    require_phone: true,
    require_cpf: false,
    require_address: false,
    // Rastreamento
    pixel_fb: '',
    pixel_gtag: '',
    pixel_tiktok: '',
    // Pós-venda
    redirect_url: '',
    support_whatsapp: '',
    thank_you_msg: '',
};

// ── Reusable sub-components ─────────────────────────────────────────────────
function SideSection({ title, icon, defaultOpen = true, children }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <button type="button" onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <span className="font-black text-sm text-gray-800 flex items-center gap-2">{icon}{title}</span>
                <ChevronDown size={14} className={cn('text-gray-400 transition-transform duration-200', open && 'rotate-180')} />
            </button>
            {open && <div className="px-5 pb-5 space-y-4 border-t border-gray-50 pt-4">{children}</div>}
        </div>
    );
}

function Toggle({ value, onChange }) {
    return (
        <button type="button" onClick={() => onChange(!value)}
            className={cn('w-11 h-6 rounded-full p-0.5 transition-all duration-300 shrink-0', value ? 'bg-primary' : 'bg-gray-200')}>
            <div className={cn('w-5 h-5 bg-white rounded-full shadow transition-transform duration-300', value ? 'translate-x-5' : 'translate-x-0')} />
        </button>
    );
}

function ToggleRow({ icon, label, sub, value, onChange }) {
    return (
        <label className="flex items-center justify-between gap-3 cursor-pointer group">
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-gray-400 shrink-0">{icon}</span>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-700 leading-tight truncate">{label}</p>
                    {sub && <p className="text-[10px] text-gray-400 font-medium leading-tight">{sub}</p>}
                </div>
            </div>
            <Toggle value={value} onChange={onChange} />
        </label>
    );
}

const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/40 transition-all font-medium';
const labelCls = 'text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5';

export default function CheckoutBuilderPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const checkoutId = searchParams.get('id');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [itemUploading, setItemUploading] = useState(null);
    const bannerFileRef = useRef();
    const logoFileRef = useRef();
    const itemFileRefs = useRef({});

    const [form, setForm] = useState({
        title: '', slug: '', primary_color: '#00ff88', secondary_color: '#08080a',
        active: true, checkout_banner_url: '',
        items: [{ id: Date.now(), name: '', price: '', image_url: '' }],
    });
    const [cs, setCs] = useState({ ...DEFAULT_CS });
    const setCSF = (k, v) => setCs(s => ({ ...s, [k]: v }));

    useEffect(() => { if (checkoutId) fetchCheckoutData(); }, [checkoutId]);

    const uploadImage = async (file) => {
        const fd = new FormData();
        fd.append('image', file);
        const res = await fetch('/upload_image.php', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) return data.url;
        throw new Error(data.error || 'Erro no upload');
    };

    const fetchCheckoutData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/get_checkouts.php');
            const data = await res.json();
            if (data.success) {
                const found = data.checkouts.find(c => c.id == checkoutId);
                if (found) {
                    setForm({
                        title: found.title || '',
                        slug: found.slug || '',
                        primary_color: found.primary_color || '#00ff88',
                        secondary_color: found.secondary_color || '#08080a',
                        active: found.active == 1,
                        checkout_banner_url: found.checkout_banner_url || '',
                        items: found.items?.length > 0
                            ? found.items.map(i => ({ ...i, id: i.id || Date.now() }))
                            : [{ id: Date.now(), name: '', price: '', image_url: '' }],
                    });
                    if (found.custom_settings) {
                        try { setCs({ ...DEFAULT_CS, ...JSON.parse(found.custom_settings) }); }
                        catch { }
                    }
                }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleAddItem = () => setForm(f => ({ ...f, items: [...f.items, { id: Date.now(), name: '', price: '', image_url: '' }] }));
    const handleRemoveItem = (id) => { if (form.items.length === 1) return; setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) })); };
    const handleItemChange = (id, field, value) => setForm(f => ({ ...f, items: f.items.map(i => i.id === id ? { ...i, [field]: value } : i) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('action', 'save_checkout');
            if (checkoutId) fd.append('id', checkoutId);
            fd.append('title', form.title);
            fd.append('slug', form.slug);
            fd.append('primary_color', form.primary_color);
            fd.append('secondary_color', form.secondary_color);
            fd.append('active', form.active ? '1' : '0');
            fd.append('checkout_banner_url', form.checkout_banner_url);
            fd.append('items', JSON.stringify(form.items));
            fd.append('custom_settings', JSON.stringify(cs));
            const res = await fetch('/checkout_actions.php', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) navigate('/checkouts');
            else alert(data.error);
        } catch { alert('Erro ao salvar'); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <RefreshCw className="animate-spin text-primary" size={32} />
        </div>
    );

    // ── Mini preview background ───────────────────────────────────────────────
    const previewBg = cs.bg_type === 'gradient'
        ? `linear-gradient(${cs.gradient_dir}, ${cs.gradient_from}, ${cs.gradient_to})`
        : form.secondary_color;

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link to="/checkouts" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-3 text-xs font-black uppercase tracking-widest">
                    <ArrowLeft size={13} /> Voltar
                </Link>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <Layout className="text-primary" size={30} />
                            {checkoutId ? 'Editar' : 'Novo'} <span className="text-primary italic">Checkout</span>
                        </h1>
                        <p className="text-gray-400 text-sm font-medium mt-1">Configure cada detalhe da sua experiência de venda.</p>
                    </div>
                    {form.slug && (
                        <a href={`/p/${form.slug}`} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-black text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-all">
                            <Eye size={13} /> Visualizar <ExternalLink size={11} />
                        </a>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Page Info */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-5">
                        <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm">
                            <Globe size={16} className="text-primary" /> Informações da Página
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Título</label>
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="Ex: Mentoria Premium" required className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Slug (URL)</label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-primary/40 transition-all">
                                    <span className="text-gray-400 font-black text-sm mr-1">/p/</span>
                                    <input value={form.slug}
                                        onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                                        placeholder="meu-checkout" required
                                        className="bg-transparent border-none w-full text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Banner */}
                        <div>
                            <label className={labelCls}>Banner do Checkout</label>
                            <input ref={bannerFileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                const file = e.target.files?.[0]; if (!file) return;
                                setBannerUploading(true);
                                try { const url = await uploadImage(file); setForm(f => ({ ...f, checkout_banner_url: url })); }
                                catch (err) { alert(err.message); }
                                finally { setBannerUploading(false); e.target.value = ''; }
                            }} />
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input value={form.checkout_banner_url}
                                        onChange={e => setForm(f => ({ ...f, checkout_banner_url: e.target.value }))}
                                        placeholder="URL do banner ou faça upload →"
                                        className={cn(inputCls, 'pl-9')} />
                                </div>
                                <button type="button" onClick={() => bannerFileRef.current?.click()} disabled={bannerUploading}
                                    className="flex items-center gap-1.5 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-black text-xs transition-all disabled:opacity-50 shrink-0">
                                    {bannerUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
                                </button>
                            </div>
                            {form.checkout_banner_url && (
                                <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 h-24">
                                    <img src={form.checkout_banner_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm">
                                <Package size={16} className="text-primary" /> Itens do Pedido
                            </h3>
                            <button type="button" onClick={handleAddItem}
                                className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-black transition-all">
                                <Plus size={12} /> Adicionar
                            </button>
                        </div>
                        <div className="space-y-3">
                            {form.items.map((item) => (
                                <motion.div key={item.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                        <div className="md:col-span-5">
                                            <label className={cn(labelCls, 'ml-0')}>Nome</label>
                                            <input value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                                                placeholder="Nome do produto" required
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/30 transition-all" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={cn(labelCls, 'ml-0')}>Preço (R$)</label>
                                            <input type="number" step="0.01" value={item.price}
                                                onChange={e => handleItemChange(item.id, 'price', e.target.value)}
                                                placeholder="97,00" required
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-black text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/30 transition-all" />
                                        </div>
                                        <div className="md:col-span-5">
                                            <label className={cn(labelCls, 'ml-0')}>Foto</label>
                                            <input ref={el => itemFileRefs.current[item.id] = el} type="file" accept="image/*" className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0]; if (!file) return;
                                                    setItemUploading(item.id);
                                                    try { const url = await uploadImage(file); handleItemChange(item.id, 'image_url', url); }
                                                    catch (err) { alert(err.message); }
                                                    finally { setItemUploading(null); e.target.value = ''; }
                                                }} />
                                            <div className="flex gap-1 items-center">
                                                {item.image_url && <img src={item.image_url} className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0" alt="" onError={e => e.target.style.display='none'} />}
                                                <input value={item.image_url} onChange={e => handleItemChange(item.id, 'image_url', e.target.value)}
                                                    placeholder="URL ou upload"
                                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/30 transition-all" />
                                                <button type="button" onClick={() => itemFileRefs.current[item.id]?.click()}
                                                    disabled={itemUploading === item.id}
                                                    className="p-2 text-primary/50 hover:text-primary hover:bg-primary/10 rounded-lg transition-all shrink-0 disabled:opacity-30">
                                                    {itemUploading === item.id ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                </button>
                                                <button type="button" onClick={() => handleRemoveItem(item.id)}
                                                    className="p-2 text-red-400/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Mini Preview */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm mb-4">
                            <Eye size={16} className="text-primary" /> Pré-visualização do Tema
                        </h3>
                        <div className="rounded-2xl overflow-hidden border border-gray-200 h-36 relative flex items-center justify-center"
                            style={{ background: previewBg }}>
                            <div className="text-center">
                                <div className="w-8 h-1 rounded-full mx-auto mb-2" style={{ background: form.primary_color }} />
                                <p className="text-xs font-black" style={{ color: form.primary_color, fontFamily: cs.font_family }}>
                                    {form.title || 'Seu Checkout'}
                                </p>
                                <div className="mt-3 mx-auto px-6 py-2 text-[10px] font-black text-black inline-block"
                                    style={{
                                        background: form.primary_color,
                                        borderRadius: cs.btn_radius === 'pill' ? '9999px' : cs.btn_radius === 'sharp' ? '4px' : '10px',
                                    }}>
                                    Pagar com PIX
                                </div>
                            </div>
                            {cs.show_countdown && (
                                <div className="absolute top-0 left-0 right-0 text-center py-1 text-[9px] font-black text-black"
                                    style={{ background: form.primary_color }}>
                                    ⏱ Oferta expira em 15:00
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR ────────────────────────────────────────── */}
                <div className="space-y-3 xl:sticky xl:top-6 xl:self-start xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto pr-1">

                    {/* 🎨 Aparência */}
                    <SideSection title="Aparência" icon={<Palette size={14} className="text-primary" />}>
                        {/* Presets */}
                        <div>
                            <label className={labelCls}>Temas prontos</label>
                            <div className="grid grid-cols-4 gap-2">
                                {PRESETS.map(p => (
                                    <button key={p.key} type="button"
                                        onClick={() => { setForm(f => ({ ...f, primary_color: p.primary, secondary_color: p.bg })); }}
                                        title={p.label}
                                        className={cn('flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all',
                                            form.secondary_color === p.bg && form.primary_color === p.primary
                                                ? 'border-primary bg-primary/5' : 'border-transparent hover:border-gray-200')}>
                                        <div className="w-8 h-8 rounded-lg border border-white/20 relative overflow-hidden" style={{ background: p.bg }}>
                                            <div className="absolute bottom-0 left-0 right-0 h-2.5" style={{ background: p.primary }} />
                                        </div>
                                        <span className="text-[9px] font-black text-gray-500">{p.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Primary color */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-700">Cor Principal</p>
                                <p className="text-[10px] text-gray-400">Botões e destaques</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-gray-400">{form.primary_color}</span>
                                <input type="color" value={form.primary_color}
                                    onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                                    className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 overflow-hidden p-0.5" />
                            </div>
                        </div>

                        {/* Background type */}
                        <div>
                            <label className={labelCls}>Tipo de Fundo</label>
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                {[{ v: 'solid', l: 'Sólido' }, { v: 'gradient', l: 'Gradiente' }].map(o => (
                                    <button key={o.v} type="button" onClick={() => setCSF('bg_type', o.v)}
                                        className={cn('flex-1 py-1.5 rounded-md text-xs font-bold transition-all',
                                            cs.bg_type === o.v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700')}>
                                        {o.l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {cs.bg_type === 'solid' ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-700">Cor de Fundo</p>
                                    <p className="text-[10px] text-gray-400">Fundo da página</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-gray-400">{form.secondary_color}</span>
                                    <input type="color" value={form.secondary_color}
                                        onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))}
                                        className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 overflow-hidden p-0.5" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className={labelCls}>De</label>
                                        <input type="color" value={cs.gradient_from}
                                            onChange={e => setCSF('gradient_from', e.target.value)}
                                            className="w-full h-9 rounded-lg cursor-pointer border border-gray-200 overflow-hidden p-0.5" />
                                    </div>
                                    <div className="flex-1">
                                        <label className={labelCls}>Para</label>
                                        <input type="color" value={cs.gradient_to}
                                            onChange={e => setCSF('gradient_to', e.target.value)}
                                            className="w-full h-9 rounded-lg cursor-pointer border border-gray-200 overflow-hidden p-0.5" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Direção</label>
                                    <div className="grid grid-cols-4 gap-1">
                                        {GRAD_DIRS.map(d => (
                                            <button key={d.value} type="button" onClick={() => setCSF('gradient_dir', d.value)}
                                                className={cn('py-2 rounded-lg text-sm font-black transition-all border',
                                                    cs.gradient_dir === d.value ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary/30')}>
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </SideSection>

                    {/* ✍️ Design */}
                    <SideSection title="Design" icon={<Sliders size={14} className="text-primary" />}>
                        {/* Font */}
                        <div>
                            <label className={labelCls}>Fonte</label>
                            <select value={cs.font_family} onChange={e => setCSF('font_family', e.target.value)} className={inputCls}>
                                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                        </div>

                        {/* Button radius */}
                        <div>
                            <label className={labelCls}>Estilo do Botão</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { v: 'pill',    l: 'Arredondado', r: '9999px' },
                                    { v: 'rounded', l: 'Suave',       r: '12px' },
                                    { v: 'sharp',   l: 'Quadrado',    r: '4px' },
                                ].map(o => (
                                    <button key={o.v} type="button" onClick={() => setCSF('btn_radius', o.v)}
                                        className={cn('py-2 border text-[10px] font-black transition-all',
                                            cs.btn_radius === o.v ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary/30')}
                                        style={{ borderRadius: o.r }}>
                                        {o.l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Layout */}
                        <div>
                            <label className={labelCls}>Layout</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { v: '2col', l: '2 Colunas', icon: '⬜⬜' },
                                    { v: '1col', l: '1 Coluna',  icon: '⬜' },
                                ].map(o => (
                                    <button key={o.v} type="button" onClick={() => setCSF('layout', o.v)}
                                        className={cn('flex flex-col items-center gap-1 py-3 border rounded-xl text-[10px] font-black transition-all',
                                            cs.layout === o.v ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary/30')}>
                                        <span className="text-base">{o.icon}</span>
                                        {o.l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </SideSection>

                    {/* ⚙️ Elementos */}
                    <SideSection title="Elementos" icon={<Layers size={14} className="text-primary" />}>
                        <ToggleRow icon={<Clock size={13} />} label="Timer de urgência" sub="Contador regressivo" value={cs.show_countdown} onChange={v => setCSF('show_countdown', v)} />
                        {cs.show_countdown && (
                            <div className="pl-6">
                                <label className={labelCls}>Minutos</label>
                                <input type="number" min="1" max="60" value={cs.countdown_minutes}
                                    onChange={e => setCSF('countdown_minutes', parseInt(e.target.value) || 15)}
                                    className={inputCls} />
                            </div>
                        )}
                        <ToggleRow icon={<Users size={13} />} label="Visitantes ativos" sub="Prova social em tempo real" value={cs.show_viewers} onChange={v => setCSF('show_viewers', v)} />
                        <ToggleRow icon={<Shield size={13} />} label="Garantia" sub="Caixa de garantia" value={cs.show_guarantee} onChange={v => setCSF('show_guarantee', v)} />
                        <ToggleRow icon={<Star size={13} />} label="Prova social" sub="Clientes satisfeitos" value={cs.show_social} onChange={v => setCSF('show_social', v)} />
                        {cs.show_social && (
                            <div className="pl-6">
                                <label className={labelCls}>Nº de clientes</label>
                                <input value={cs.social_count} onChange={e => setCSF('social_count', e.target.value)}
                                    placeholder="2.400" className={inputCls} />
                            </div>
                        )}
                        <ToggleRow icon={<Zap size={13} />} label="Selos de segurança" sub="SSL, anti-fraude, aprovação" value={cs.show_trust_seals} onChange={v => setCSF('show_trust_seals', v)} />
                        <ToggleRow icon={<MousePointer2 size={13} />} label="CTA fixo mobile" sub="Botão flutuante no celular" value={cs.show_sticky_mobile} onChange={v => setCSF('show_sticky_mobile', v)} />
                    </SideSection>

                    {/* 📝 Textos */}
                    <SideSection title="Textos da Página" icon={<AlignLeft size={14} className="text-primary" />} defaultOpen={false}>
                        <div>
                            <label className={labelCls}>Título Principal (Headline)</label>
                            <input value={cs.headline} onChange={e => setCSF('headline', e.target.value)}
                                placeholder="Ex: Garanta sua vaga agora!" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Subtítulo</label>
                            <input value={cs.subheadline} onChange={e => setCSF('subheadline', e.target.value)}
                                placeholder="Ex: Apenas 10 vagas disponíveis" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Texto de Urgência (acima do timer)</label>
                            <input value={cs.urgency_text} onChange={e => setCSF('urgency_text', e.target.value)}
                                placeholder="Ex: ⚠️ Oferta encerra em breve!" className={inputCls} />
                        </div>
                    </SideSection>

                    {/* 👤 Campos do Comprador */}
                    <SideSection title="Campos do Comprador" icon={<UserCheck size={14} className="text-primary" />} defaultOpen={false}>
                        <ToggleRow icon={<Smartphone size={13} />} label="Telefone obrigatório" sub="Solicitar telefone no checkout" value={cs.require_phone} onChange={v => setCSF('require_phone', v)} />
                        <ToggleRow icon={<UserCheck size={13} />} label="CPF obrigatório" sub="Solicitar CPF do comprador" value={cs.require_cpf} onChange={v => setCSF('require_cpf', v)} />
                        <ToggleRow icon={<Package size={13} />} label="Endereço de entrega" sub="Para produtos físicos" value={cs.require_address} onChange={v => setCSF('require_address', v)} />
                    </SideSection>

                    {/* 📊 Rastreamento */}
                    <SideSection title="Rastreamento / Pixels" icon={<BarChart2 size={14} className="text-primary" />} defaultOpen={false}>
                        <div>
                            <label className={labelCls}>Facebook Pixel ID</label>
                            <input value={cs.pixel_fb} onChange={e => setCSF('pixel_fb', e.target.value)}
                                placeholder="Ex: 1234567890123456" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Google Tag / Analytics ID</label>
                            <input value={cs.pixel_gtag} onChange={e => setCSF('pixel_gtag', e.target.value)}
                                placeholder="Ex: G-XXXXXXXXXX ou AW-XXXXXXXXX" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>TikTok Pixel ID</label>
                            <input value={cs.pixel_tiktok} onChange={e => setCSF('pixel_tiktok', e.target.value)}
                                placeholder="Ex: XXXXXXXXXXXXXXXX" className={inputCls} />
                        </div>
                    </SideSection>

                    {/* 🎯 Pós-venda */}
                    <SideSection title="Pós-venda" icon={<Link2 size={14} className="text-primary" />} defaultOpen={false}>
                        <div>
                            <label className={labelCls}>Redirecionar após pagamento</label>
                            <input value={cs.redirect_url} onChange={e => setCSF('redirect_url', e.target.value)}
                                placeholder="https://seusite.com/obrigado" className={inputCls} />
                            <p className="text-[10px] text-gray-400 mt-1">Deixe vazio para usar a página padrão de entrega</p>
                        </div>
                        <div>
                            <label className={labelCls}>WhatsApp de Suporte</label>
                            <div className="relative">
                                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" size={14} />
                                <input value={cs.support_whatsapp} onChange={e => setCSF('support_whatsapp', e.target.value)}
                                    placeholder="5511999999999 (só números)" className={cn(inputCls, 'pl-9')} />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Mensagem de Agradecimento</label>
                            <textarea value={cs.thank_you_msg} onChange={e => setCSF('thank_you_msg', e.target.value)}
                                rows={2} placeholder="Ex: Obrigado pela compra! Entraremos em contato em breve."
                                className={cn(inputCls, 'resize-none')} />
                        </div>
                    </SideSection>

                    {/* 📝 Conteúdo */}
                    <SideSection title="Conteúdo" icon={<Type size={14} className="text-primary" />} defaultOpen={false}>
                        {/* Logo */}
                        <div>
                            <label className={labelCls}>Logo da Marca</label>
                            <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                const file = e.target.files?.[0]; if (!file) return;
                                setLogoUploading(true);
                                try { const url = await uploadImage(file); setCSF('logo_url', url); }
                                catch (err) { alert(err.message); }
                                finally { setLogoUploading(false); e.target.value = ''; }
                            }} />
                            <div className="flex gap-2">
                                <input value={cs.logo_url} onChange={e => setCSF('logo_url', e.target.value)}
                                    placeholder="URL do logo" className={cn(inputCls, 'flex-1')} />
                                <button type="button" onClick={() => logoFileRef.current?.click()} disabled={logoUploading}
                                    className="px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-black transition-all disabled:opacity-50 shrink-0">
                                    {logoUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                </button>
                            </div>
                            {cs.logo_url && <img src={cs.logo_url} className="mt-2 h-10 object-contain rounded-lg" alt="Logo" onError={e => e.target.style.display='none'} />}
                        </div>

                        {/* CTA text */}
                        <div>
                            <label className={labelCls}>Texto do Botão (CTA)</label>
                            <input value={cs.cta_text} onChange={e => setCSF('cta_text', e.target.value)}
                                placeholder="Pagar com PIX (padrão)" className={inputCls} />
                        </div>

                        {/* Guarantee texts */}
                        {cs.show_guarantee && <>
                            <div>
                                <label className={labelCls}>Título da Garantia</label>
                                <input value={cs.guarantee_text} onChange={e => setCSF('guarantee_text', e.target.value)}
                                    placeholder="Garantia de 7 Dias" className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Texto da Garantia</label>
                                <textarea value={cs.guarantee_sub} onChange={e => setCSF('guarantee_sub', e.target.value)}
                                    rows={2} placeholder="Descrição..." className={cn(inputCls, 'resize-none')} />
                            </div>
                        </>}
                    </SideSection>

                    {/* Status + Save */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 space-y-4">
                        <ToggleRow icon={<Zap size={13} />} label="Checkout Ativo" sub="Aceitar novas vendas" value={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} />

                        <button type="submit" disabled={saving}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-60">
                            {saving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : <><Save size={18} /> Salvar Checkout</>}
                        </button>

                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex gap-2">
                            <Info className="text-amber-500 shrink-0 mt-0.5" size={14} />
                            <p className="text-[10px] text-amber-600 leading-relaxed font-medium">
                                URL pública: <span className="font-black">/p/{form.slug || 'sua-url'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
