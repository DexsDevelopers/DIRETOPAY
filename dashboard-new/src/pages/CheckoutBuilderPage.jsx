import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Trash2, Save, Palette, Package, Globe, Layout, ArrowLeft,
    RefreshCw, Image as ImageIcon, Upload, Loader2, ExternalLink,
    ChevronDown, Type, MousePointer2, Layers, ToggleLeft, ToggleRight,
    Sliders, Eye, Shield, Star, Clock, Users, Zap, Info,
    Smartphone, MessageCircle, BarChart2, UserCheck, Link2, AlignLeft,
    Gift, MessageSquare, Tag, LogOut, ListChecks, CreditCard, Mail, X,
    Hash, Sparkles, Percent, Bold, Italic, Underline, AlignCenter, AlignRight
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
    allow_item_selection: false,
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
    require_phone: false,
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
    // Order Bump
    show_order_bump: false,
    order_bump_title: '',
    order_bump_desc: '',
    order_bump_price: '',
    order_bump_cta: 'Sim! Quero adicionar ao meu pedido',
    // Benefícios
    show_benefits: false,
    benefits: ['Entrega imediata após o pagamento', 'Suporte 24h no WhatsApp', 'Garantia total de satisfação'],
    // Depoimentos
    show_testimonials: false,
    testimonials: [
        { name: 'Maria Silva', text: 'Produto incrível, superou todas as expectativas! Recomendo demais.', stars: 5 },
        { name: 'João Santos', text: 'Entrega rápida e suporte excelente. Já comprei 3 vezes!', stars: 5 },
    ],
    // Cupom de desconto
    show_coupon: false,
    // Pop-up de saída
    show_exit_popup: false,
    exit_popup_title: 'Espere! Temos uma oferta especial para você',
    exit_popup_msg: 'Não perca esta oportunidade única. Garanta agora com desconto exclusivo!',
    exit_popup_cta: 'Quero aproveitar a oferta!',
    // Fundo avançado
    bg_image_url: '',
    bg_image_opacity: 70,
    // Formulário extra
    require_email: true,
    show_notes_field: false,
    allow_qty: false,
    max_qty: 5,
    // Métodos de pagamento
    show_pix_option: true,
    show_card_option: true,
    // WhatsApp flutuante
    show_whatsapp_float: false,
    whatsapp_float_msg: 'Olá! Tenho uma dúvida sobre o produto.',
    // Botão customizado
    btn_color_override: '',
    btn_pulse: false,
    // Aviso de escassez
    show_scarcity: false,
    scarcity_text: 'Apenas 7 vagas restantes!',
    scarcity_stock: '',
    // SEO
    seo_title: '',
    seo_description: '',
    seo_favicon: '',
    font_color_override: '',
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
    const previewBtnColor = cs.btn_color_override || form.primary_color;

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
                        <div className="border-t border-gray-100 pt-4 mt-2">
                            <ToggleRow 
                                icon={<Package size={14} />} 
                                label="Escolha de Itens pelo Cliente" 
                                sub="Permite que o comprador selecione quais produtos deseja comprar no checkout" 
                                value={cs.allow_item_selection || false} 
                                onChange={v => setCSF('allow_item_selection', v)} 
                            />
                        </div>
                    </div>

                    {/* Mini Preview */}
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                        <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm mb-4">
                            <Eye size={16} className="text-primary" /> Pré-visualização do Tema
                        </h3>
                        <div className="rounded-2xl overflow-hidden border border-gray-200 h-36 relative flex items-center justify-center"
                            style={{ background: previewBg, color: cs.font_color_override || '#ffffff' }}>
                            <div className="text-center">
                                <div className="w-8 h-1 rounded-full mx-auto mb-2" style={{ background: form.primary_color }} />
                                <p className="text-xs font-black" style={{ color: cs.font_color_override || '#ffffff', fontFamily: cs.font_family }}>
                                    {form.title || 'Seu Checkout'}
                                </p>
                                <div className={`mt-3 mx-auto px-6 py-2 text-[10px] font-black text-black inline-block ${cs.btn_pulse ? 'animate-pulse' : ''}`}
                                    style={{
                                        background: previewBtnColor,
                                        borderRadius: cs.btn_radius === 'pill' ? '9999px' : cs.btn_radius === 'sharp' ? '4px' : '10px',
                                    }}>
                                    {cs.cta_text || 'Pagar com PIX'}
                                </div>
                            </div>
                            {cs.show_countdown && (
                                <div className="absolute top-0 left-0 right-0 text-center py-1 text-[9px] font-black text-black"
                                    style={{ background: form.primary_color }}>
                                    ⏱ Oferta expira em 15:00
                                </div>
                            )}
                        </div>
                        {/* Active features chips */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {[/* eslint-disable indent */
                                { active: cs.show_countdown,    label: '⏱ Timer'       },
                                { active: cs.show_viewers,      label: '👥 Visitantes'  },
                                { active: cs.show_guarantee,    label: '🛡 Garantia'    },
                                { active: cs.show_social,       label: '⭐ Prova social' },
                                { active: cs.show_order_bump,   label: '🎁 Order Bump'  },
                                { active: cs.show_benefits,     label: '✅ Benefícios'  },
                                { active: cs.show_testimonials, label: '💬 Depoimentos' },
                                { active: cs.show_coupon,       label: '🔖 Cupom'       },
                                { active: cs.show_scarcity,     label: '⚠️ Escassez'   },
                                { active: cs.show_exit_popup,   label: '🚪 Saída popup' },
                                { active: cs.bg_image_url,      label: '🖼 Bg imagem'   },
                                { active: cs.show_whatsapp_float, label: '💬 WhatsApp'  },
                                { active: cs.btn_pulse,         label: '✨ Pulsar'      },
                            ].filter(f => f.active).map(f => (
                                <span key={f.label} className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-full">
                                    {f.label}
                                </span>
                            ))}
                            {![cs.show_countdown,cs.show_viewers,cs.show_guarantee,cs.show_order_bump,cs.show_benefits,cs.show_testimonials].some(Boolean) && (
                                <span className="text-[10px] text-gray-300 font-medium">Ative recursos no sidebar →</span>
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

                        {/* Font color */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-700">Cor da Fonte</p>
                                <p className="text-[10px] text-gray-400">Títulos e textos</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-gray-400">{cs.font_color_override || '#ffffff'}</span>
                                <input type="color" value={cs.font_color_override || '#ffffff'}
                                    onChange={e => setCSF('font_color_override', e.target.value)}
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

                    {/* 🎁 Order Bump */}
                    <SideSection title="Order Bump" icon={<Gift size={14} className="text-primary" />} defaultOpen={false}>
                        <ToggleRow icon={<Gift size={13} />} label="Ativar Order Bump" sub="Oferta extra dentro do checkout" value={cs.show_order_bump} onChange={v => setCSF('show_order_bump', v)} />
                        {cs.show_order_bump && (
                            <div className="space-y-3">
                                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
                                    <p className="text-[10px] text-violet-600 font-bold">💡 Order Bumps aumentam o ticket médio em até 30%</p>
                                </div>
                                <div>
                                    <label className={labelCls}>Título da Oferta</label>
                                    <input value={cs.order_bump_title} onChange={e => setCSF('order_bump_title', e.target.value)}
                                        placeholder="🔥 Adicione ao seu pedido!" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Descrição</label>
                                    <textarea value={cs.order_bump_desc} onChange={e => setCSF('order_bump_desc', e.target.value)}
                                        rows={2} placeholder="Ex: Mentoria bônus 1h + materiais exclusivos"
                                        className={cn(inputCls, 'resize-none')} />
                                </div>
                                <div>
                                    <label className={labelCls}>Preço do Bump (R$)</label>
                                    <input type="number" step="0.01" value={cs.order_bump_price}
                                        onChange={e => setCSF('order_bump_price', e.target.value)}
                                        placeholder="27,00" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Texto do Checkbox</label>
                                    <input value={cs.order_bump_cta} onChange={e => setCSF('order_bump_cta', e.target.value)}
                                        placeholder="Sim! Quero adicionar ao meu pedido" className={inputCls} />
                                </div>
                            </div>
                        )}
                    </SideSection>

                    {/* ✅ Benefícios */}
                    <SideSection title="Lista de Benefícios" icon={<ListChecks size={14} className="text-primary" />} defaultOpen={false}>
                        <ToggleRow icon={<ListChecks size={13} />} label="Exibir benefícios" sub="Diferenciais listados no checkout" value={cs.show_benefits} onChange={v => setCSF('show_benefits', v)} />
                        {cs.show_benefits && (
                            <div className="space-y-2">
                                {(cs.benefits || []).map((b, i) => (
                                    <div key={i} className="flex gap-1.5 items-center">
                                        <input value={b} onChange={e => {
                                            const arr = [...cs.benefits]; arr[i] = e.target.value;
                                            setCSF('benefits', arr);
                                        }} placeholder={`Benefício ${i + 1}`}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/40 transition-all" />
                                        <button type="button" onClick={() => setCSF('benefits', cs.benefits.filter((_, j) => j !== i))}
                                            className="p-1.5 hover:bg-red-50 hover:text-red-400 rounded-lg text-gray-300 transition-all shrink-0">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {(cs.benefits || []).length < 8 && (
                                    <button type="button" onClick={() => setCSF('benefits', [...(cs.benefits || []), ''])}
                                        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-black text-gray-400 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-1">
                                        <Plus size={12} /> Adicionar benefício
                                    </button>
                                )}
                            </div>
                        )}
                    </SideSection>

                    {/* 💬 Depoimentos */}
                    <SideSection title="Depoimentos" icon={<MessageSquare size={14} className="text-primary" />} defaultOpen={false}>
                        <ToggleRow icon={<Star size={13} />} label="Exibir depoimentos" sub="Prova social no checkout" value={cs.show_testimonials} onChange={v => setCSF('show_testimonials', v)} />
                        {cs.show_testimonials && (
                            <div className="space-y-3">
                                {(cs.testimonials || []).map((t, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2 relative">
                                        <button type="button" onClick={() => setCSF('testimonials', cs.testimonials.filter((_, j) => j !== i))}
                                            className="absolute top-2 right-2 p-1 hover:bg-red-50 hover:text-red-400 rounded-md text-gray-300 transition-all">
                                            <X size={10} />
                                        </button>
                                        <input value={t.name} onChange={e => {
                                            const arr = [...cs.testimonials]; arr[i] = { ...arr[i], name: e.target.value };
                                            setCSF('testimonials', arr);
                                        }} placeholder="Nome do cliente"
                                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none transition-all pr-8" />
                                        <textarea value={t.text} onChange={e => {
                                            const arr = [...cs.testimonials]; arr[i] = { ...arr[i], text: e.target.value };
                                            setCSF('testimonials', arr);
                                        }} rows={2} placeholder="Escreva o depoimento..."
                                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-900 placeholder:text-gray-300 focus:outline-none resize-none transition-all" />
                                        <div className="flex gap-1 items-center">
                                            <span className="text-[9px] text-gray-400 font-bold mr-1">Nota:</span>
                                            {[1,2,3,4,5].map(s => (
                                                <button key={s} type="button" onClick={() => {
                                                    const arr = [...cs.testimonials]; arr[i] = { ...arr[i], stars: s };
                                                    setCSF('testimonials', arr);
                                                }} className={`text-base leading-none transition-colors ${s <= t.stars ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {(cs.testimonials || []).length < 5 && (
                                    <button type="button" onClick={() => setCSF('testimonials', [...(cs.testimonials || []), { name: '', text: '', stars: 5 }])}
                                        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-black text-gray-400 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-1">
                                        <Plus size={12} /> Adicionar depoimento
                                    </button>
                                )}
                            </div>
                        )}
                    </SideSection>

                    {/* 🔖 Cupom de Desconto */}
                    <SideSection title="Cupom de Desconto" icon={<Tag size={14} className="text-primary" />} defaultOpen={false}>
                        <ToggleRow icon={<Tag size={13} />} label="Campo de cupom" sub="Permite inserir código promocional" value={cs.show_coupon} onChange={v => setCSF('show_coupon', v)} />
                        {cs.show_coupon && (
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
                                    O campo de cupom aparecerá no formulário. Gerencie os cupons em Configurações → Cupons.
                                </p>
                            </div>
                        )}
                    </SideSection>

                    {/* ⚠️ Escassez */}
                    <SideSection title="Aviso de Escassez" icon={<Zap size={14} className="text-primary" />} defaultOpen={false}>
                        <ToggleRow icon={<Zap size={13} />} label="Mostrar aviso de escassez" sub="Urgência por estoque limitado" value={cs.show_scarcity} onChange={v => setCSF('show_scarcity', v)} />
                        {cs.show_scarcity && (
                            <div className="space-y-3">
                                <div>
                                    <label className={labelCls}>Texto de Escassez</label>
                                    <input value={cs.scarcity_text} onChange={e => setCSF('scarcity_text', e.target.value)}
                                        placeholder="Apenas 7 vagas restantes!" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Estoque atual (opcional)</label>
                                    <input type="number" value={cs.scarcity_stock} onChange={e => setCSF('scarcity_stock', e.target.value)}
                                        placeholder="Ex: 7 (exibe número real)" className={inputCls} />
                                    <p className="text-[10px] text-gray-400 mt-1">Deixe vazio para usar o texto personalizado</p>
                                </div>
                            </div>
                        )}
                    </SideSection>

                    {/* 🚪 Pop-up de Saída */}
                    <SideSection title="Pop-up de Saída" icon={<LogOut size={14} className="text-primary" />} defaultOpen={false}>
                        <ToggleRow icon={<LogOut size={13} />} label="Ativar pop-up" sub="Aparece ao tentar sair sem comprar" value={cs.show_exit_popup} onChange={v => setCSF('show_exit_popup', v)} />
                        {cs.show_exit_popup && (
                            <div className="space-y-3">
                                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                                    <p className="text-[10px] text-amber-600 font-bold">💡 Pop-ups de saída recuperam até 15% dos visitantes</p>
                                </div>
                                <div>
                                    <label className={labelCls}>Título</label>
                                    <input value={cs.exit_popup_title} onChange={e => setCSF('exit_popup_title', e.target.value)}
                                        placeholder="Espere! Temos uma oferta especial" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Mensagem</label>
                                    <textarea value={cs.exit_popup_msg} onChange={e => setCSF('exit_popup_msg', e.target.value)}
                                        rows={2} placeholder="Não perca esta oportunidade única!"
                                        className={cn(inputCls, 'resize-none')} />
                                </div>
                                <div>
                                    <label className={labelCls}>Botão CTA</label>
                                    <input value={cs.exit_popup_cta} onChange={e => setCSF('exit_popup_cta', e.target.value)}
                                        placeholder="Quero aproveitar!" className={inputCls} />
                                </div>
                            </div>
                        )}
                    </SideSection>

                    {/* 🖼 Fundo Avançado */}
                    <SideSection title="Fundo Avançado" icon={<ImageIcon size={14} className="text-primary" />} defaultOpen={false}>
                        <div>
                            <label className={labelCls}>Imagem de Fundo (URL)</label>
                            <input value={cs.bg_image_url} onChange={e => setCSF('bg_image_url', e.target.value)}
                                placeholder="https://exemplo.com/bg.jpg" className={inputCls} />
                            <p className="text-[10px] text-gray-400 mt-1">Sobrepõe à cor de fundo. Deixe vazio para desativar.</p>
                        </div>
                        {cs.bg_image_url && (
                            <>
                                <div className="rounded-xl overflow-hidden h-16 border border-gray-100">
                                    <img src={cs.bg_image_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                </div>
                                <div>
                                    <label className={labelCls}>Escurecimento da sobreposição: {cs.bg_image_opacity ?? 70}%</label>
                                    <input type="range" min="0" max="95" value={cs.bg_image_opacity ?? 70}
                                        onChange={e => setCSF('bg_image_opacity', parseInt(e.target.value))}
                                        className="w-full accent-primary h-2 cursor-pointer rounded-full" />
                                    <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-1">
                                        <span>0% (transparente)</span><span>95% (escuro)</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </SideSection>

                    {/* 📋 Formulário Extra */}
                    <SideSection title="Formulário" icon={<Mail size={14} className="text-primary" />} defaultOpen={false}>
                        <ToggleRow icon={<Mail size={13} />} label="Campo de e-mail" sub="Solicitar e-mail do comprador" value={cs.require_email !== false} onChange={v => setCSF('require_email', v)} />
                        <ToggleRow icon={<MessageSquare size={13} />} label="Campo de observações" sub="Texto livre para o comprador" value={cs.show_notes_field} onChange={v => setCSF('show_notes_field', v)} />
                        <ToggleRow icon={<Hash size={13} />} label="Seletor de quantidade" sub="Comprar múltiplas unidades" value={cs.allow_qty} onChange={v => setCSF('allow_qty', v)} />
                        {cs.allow_qty && (
                            <div className="pl-6">
                                <label className={labelCls}>Quantidade máxima por pedido</label>
                                <input type="number" min="2" max="99" value={cs.max_qty || 5}
                                    onChange={e => setCSF('max_qty', parseInt(e.target.value) || 5)}
                                    className={inputCls} />
                            </div>
                        )}
                    </SideSection>

                    {/* 💳 Métodos de Pagamento */}
                    <SideSection title="Métodos de Pagamento" icon={<CreditCard size={14} className="text-primary" />} defaultOpen={false}>
                        <ToggleRow icon={<Zap size={13} />} label="PIX" sub="Pagamento instantâneo aprovado" value={cs.show_pix_option !== false} onChange={v => setCSF('show_pix_option', v)} />
                        <ToggleRow icon={<CreditCard size={13} />} label="Cartão de Crédito" sub="Parcelamento até 12x" value={cs.show_card_option !== false} onChange={v => setCSF('show_card_option', v)} />
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                            ⚠️ Pelo menos um método deve estar ativo.
                        </p>
                    </SideSection>

                    {/* ✨ Botão de Compra */}
                    <SideSection title="Botão de Compra" icon={<MousePointer2 size={14} className="text-primary" />} defaultOpen={false}>
                        <div>
                            <label className={labelCls}>Cor personalizada do botão</label>
                            <div className="flex items-center gap-2">
                                <input type="color"
                                    value={cs.btn_color_override || form.primary_color}
                                    onChange={e => setCSF('btn_color_override', e.target.value)}
                                    className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 p-0.5 shrink-0" />
                                <input value={cs.btn_color_override}
                                    onChange={e => setCSF('btn_color_override', e.target.value)}
                                    placeholder="Usa cor principal (vazio = padrão)"
                                    className={cn(inputCls, 'flex-1')} />
                                {cs.btn_color_override && (
                                    <button type="button" onClick={() => setCSF('btn_color_override', '')}
                                        className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all shrink-0">
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <ToggleRow icon={<Sparkles size={13} />} label="Efeito pulsante" sub="Botão pulsa para chamar atenção" value={cs.btn_pulse} onChange={v => setCSF('btn_pulse', v)} />
                        <div>
                            <label className={labelCls}>Ícone do Botão</label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {[
                                    { v: 'zap',   l: '⚡ Zap'    },
                                    { v: 'lock',  l: '🔒 Seguro' },
                                    { v: 'pix',   l: '📱 PIX'   },
                                    { v: 'cart',  l: '🛒 Carrinho' },
                                    { v: 'arrow', l: '→ Seta'   },
                                    { v: 'none',  l: '— Nenhum' },
                                ].map(o => (
                                    <button key={o.v} type="button" onClick={() => setCSF('btn_icon', o.v)}
                                        className={cn('py-2 border rounded-xl text-[9px] font-black transition-all',
                                            cs.btn_icon === o.v ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary/30')}>
                                        {o.l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </SideSection>

                    {/* 📱 WhatsApp Flutuante */}
                    <SideSection title="WhatsApp Flutuante" icon={<MessageCircle size={14} className="text-primary" />} defaultOpen={false}>
                        <ToggleRow icon={<MessageCircle size={13} />} label="Botão flutuante" sub="Ícone no canto da página" value={cs.show_whatsapp_float} onChange={v => setCSF('show_whatsapp_float', v)} />
                        {cs.show_whatsapp_float && (
                            <div className="space-y-3">
                                {!cs.support_whatsapp && (
                                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                                        <p className="text-[10px] text-amber-600 font-medium">
                                            ⚠️ Configure o número em Pós-venda → WhatsApp de Suporte.
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className={labelCls}>Mensagem pré-definida</label>
                                    <textarea value={cs.whatsapp_float_msg} onChange={e => setCSF('whatsapp_float_msg', e.target.value)}
                                        rows={2} placeholder="Olá! Tenho uma dúvida sobre o produto."
                                        className={cn(inputCls, 'resize-none')} />
                                </div>
                            </div>
                        )}
                    </SideSection>

                    {/* 🔍 SEO / Meta Tags */}
                    <SideSection title="SEO / Meta Tags" icon={<Globe size={14} className="text-primary" />} defaultOpen={false}>
                        <div>
                            <label className={labelCls}>Título da Página (Title Tag)</label>
                            <input value={cs.seo_title} onChange={e => setCSF('seo_title', e.target.value)}
                                placeholder={form.title || 'Título do checkout'} className={inputCls} />
                            <p className="text-[10px] text-gray-400 mt-1">Aparece na aba do navegador e resultados do Google</p>
                        </div>
                        <div>
                            <label className={labelCls}>Meta Descrição</label>
                            <textarea value={cs.seo_description} onChange={e => setCSF('seo_description', e.target.value)}
                                rows={2} placeholder="Descrição curta da página para buscadores e redes sociais..."
                                className={cn(inputCls, 'resize-none')} />
                            <p className="text-[10px] text-gray-400 mt-1">Ideal: 120–160 caracteres</p>
                        </div>
                        <div>
                            <label className={labelCls}>Favicon (URL)</label>
                            <input value={cs.seo_favicon} onChange={e => setCSF('seo_favicon', e.target.value)}
                                placeholder="https://..." className={inputCls} />
                            <p className="text-[10px] text-gray-400 mt-1">Ícone exibido na aba do navegador</p>
                        </div>
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
