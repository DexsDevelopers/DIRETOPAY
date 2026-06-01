import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, Lock, ShieldCheck, CheckCircle, Loader2,
    ArrowRight, Clock, Star, Users, Zap, BadgeCheck, Gift,
    ChevronRight, Eye, CreditCard, QrCode,
    Phone, MessageCircle, MapPin, ThumbsUp, X, Tag, AlertTriangle, Check, Mail
} from 'lucide-react';
import { cn } from '../lib/utils';
import PixModal from '../components/PixModal';

/* ── Default custom settings ─────────────────────────────── */
const DEFAULT_CS = {
    bg_type: 'solid', gradient_from: '#0a0a0f', gradient_to: '#1a0a2e', gradient_dir: '135deg',
    logo_url: '', font_family: 'Outfit', btn_radius: 'rounded', layout: '2col',
    show_countdown: true, show_viewers: true, show_guarantee: true,
    guarantee_text: 'Garantia de 7 Dias',
    guarantee_sub: 'Não ficou satisfeito? Devolvemos 100% do seu dinheiro, sem perguntas.',
    show_social: true, social_count: '2.400', show_trust_seals: true, cta_text: '',
    show_sticky_mobile: true,
    font_color_override: '',
};

/* ── helpers ─────────────────────────────────────────────── */
const fmtBRL = (v) =>
    parseFloat(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const maskCPF = (v) => {
    const n = v.replace(/\D/g, '').slice(0, 11);
    if (n.length <= 3) return n;
    if (n.length <= 6) return `${n.slice(0,3)}.${n.slice(3)}`;
    if (n.length <= 9) return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6)}`;
    return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9)}`;
};

/* ── Countdown hook (15 min) ─────────────────────────────── */
function useCountdown(seconds) {
    const [left, setLeft] = useState(seconds);
    useEffect(() => {
        if (left <= 0) return;
        const t = setTimeout(() => setLeft(l => l - 1), 1000);
        return () => clearTimeout(t);
    }, [left]);
    const m = String(Math.floor(left / 60)).padStart(2, '0');
    const s = String(left % 60).padStart(2, '0');
    return { m, s, expired: left <= 0 };
}

/* ── Fake viewers hook ───────────────────────────────────── */
function useViewers(base = 7) {
    const [v, setV] = useState(base + Math.floor(Math.random() * 6));
    useEffect(() => {
        const t = setInterval(() => {
            setV(c => Math.max(4, c + (Math.random() > 0.5 ? 1 : -1)));
        }, 4500);
        return () => clearInterval(t);
    }, []);
    return v;
}

/* ── Trust Badge ─────────────────────────────────────────── */
function TrustBadge({ icon, label, sub, color }) {
    return (
        <div className="flex flex-col items-center gap-1.5 text-center">
            <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: `${color}18` }}
            >
                <span style={{ color }}>{icon}</span>
            </div>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-wider leading-tight">{label}</p>
            {sub && <p className="text-[9px] text-white/25 font-medium leading-tight">{sub}</p>}
        </div>
    );
}

/* ── Product Selection Helpers ───────────────────────────── */
const getOriginalPrice = (price) => {
    const p = parseFloat(price);
    if (Math.abs(p - 17.90) < 0.1) return 39.90;
    if (Math.abs(p - 37.90) < 0.1) return 59.90;
    const raw = p * 1.6;
    return Math.ceil(raw / 10) * 10 - 0.10;
};

const getProductEmoji = (name, isFeatured) => {
    const lower = name.toLowerCase();
    if (lower.includes('bronze')) return '🥉';
    if (lower.includes('prata') || lower.includes('silver')) return '🥈';
    if (lower.includes('ouro') || lower.includes('gold')) return '🥇';
    return isFeatured ? '🥇' : '📦';
};

const getFeaturedItemId = (items) => {
    if (!items || items.length === 0) return null;
    const keywords = ['ouro', 'gold', 'mais escolhido', 'premium', 'completo', 'vip'];
    for (const item of items) {
        const nameLower = item.name.toLowerCase();
        if (keywords.some(k => nameLower.includes(k))) {
            return item.id;
        }
    }
    let maxPrice = -1;
    let featuredId = items[0].id;
    for (const item of items) {
        const p = parseFloat(item.price);
        if (p > maxPrice) {
            maxPrice = p;
            featuredId = item.id;
        }
    }
    return featuredId;
};

/* ═══════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
    const { slug } = useParams();
    const [data, setData]               = useState(null);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerDoc, setCustomerDoc] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [exitPopupVisible, setExitPopupVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activePix, setActivePix]     = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const formRef = useRef(null);
    const [selectedItems, setSelectedItems] = useState([]);

    const hasPaidRef = useRef(false);
    const { m, s, expired } = useCountdown(15 * 60);
    const viewers = useViewers(8);

    useEffect(() => { fetchCheckout(); }, [slug]);

    useEffect(() => {
        if (data?.items) {
            const csSettings = data.checkout.custom_settings || {};
            if (csSettings.allow_item_selection && data.items.length > 1) {
                const featuredId = getFeaturedItemId(data.items);
                setSelectedItems([featuredId]);
            } else {
                setSelectedItems(data.items.map(item => item.id));
            }
        }
    }, [data]);

    // Inject Google Font when data loads
    useEffect(() => {
        if (!data) return;
        const font = data.checkout.custom_settings?.font_family || 'Outfit';
        if (font === 'Outfit') return;
        const id = 'ck-font';
        document.getElementById(id)?.remove();
        const link = Object.assign(document.createElement('link'), {
            id, rel: 'stylesheet',
            href: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700;800;900&display=swap`
        });
        document.head.appendChild(link);
        return () => document.getElementById('ck-font')?.remove();
    }, [data]);

    // Inject pixels (FB, GTAg, TikTok) + exit popup
    useEffect(() => {
        if (!data) return;
        const cs2 = { ...DEFAULT_CS, ...(data.checkout.custom_settings || {}) };
        // Facebook Pixel
        if (cs2.pixel_fb) {
            const s = document.createElement('script');
            s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${cs2.pixel_fb}');fbq('track','PageView');`;
            document.head.appendChild(s);
        }
        // Google Analytics / GTAg
        if (cs2.pixel_gtag) {
            const s = document.createElement('script');
            s.async = true;
            s.src = `https://www.googletagmanager.com/gtag/js?id=${cs2.pixel_gtag}`;
            document.head.appendChild(s);
            const s2 = document.createElement('script');
            s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${cs2.pixel_gtag}');`;
            document.head.appendChild(s2);
        }
        // TikTok Pixel
        if (cs2.pixel_tiktok) {
            const s = document.createElement('script');
            s.innerHTML = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript',o.async=!0,o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load('${cs2.pixel_tiktok}');ttq.page();}(window,document,'ttq');`;
            document.head.appendChild(s);
        }
        // Exit popup
        if (cs2.show_exit_popup) {
            const handleMouseLeave = (e) => {
                if (e.clientY <= 0 && !hasPaidRef.current) setExitPopupVisible(true);
            };
            document.addEventListener('mouseleave', handleMouseLeave);
            return () => document.removeEventListener('mouseleave', handleMouseLeave);
        }
    }, [data]);

    // Inject UTMify script if seller has token configured
    useEffect(() => {
        if (!data?.has_utmify) return;
        const id = 'utmify-script';
        if (document.getElementById(id)) return;
        const s = document.createElement('script');
        s.id = id;
        s.src = 'https://cdn.utmify.com.br/scripts/utms/latest.js';
        s.setAttribute('data-utmify-prevent-xcod-sck', '');
        s.setAttribute('data-utmify-prevent-subids', '');
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
        return () => document.getElementById(id)?.remove();
    }, [data]);

    const fetchCheckout = async () => {
        // Usar dados pré-carregados pelo PHP se disponíveis
        if (window.__CHECKOUT_DATA__ && window.__CHECKOUT_DATA__.success) {
            const json = window.__CHECKOUT_DATA__;
            window.__CHECKOUT_DATA__ = null; // Limpa para evitar reuso indevido
            
            setData(json);
            const sellerId = json.checkout?.user_id;
            if (sellerId) {
                fetch('/track_store_event.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event: 'store_visit', seller_id: sellerId, extra: json.checkout?.title || '' })
                }).catch(() => {});
                const handleUnload = () => {
                    if (!hasPaidRef.current) {
                        navigator.sendBeacon('/track_store_event.php',
                            JSON.stringify({ event: 'cart_abandoned', seller_id: sellerId, extra: json.checkout?.title || '' }));
                    }
                };
                window.addEventListener('beforeunload', handleUnload);
            }
            setLoading(false);
            return;
        }

        try {
            const res  = await fetch(`/get_checkout_data.php?slug=${slug}`);
            const json = await res.json();
            if (json.success) {
                setData(json);
                const sellerId = json.checkout?.user_id;
                if (sellerId) {
                    fetch('/track_store_event.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ event: 'store_visit', seller_id: sellerId, extra: json.checkout?.title || '' })
                    }).catch(() => {});
                    const handleUnload = () => {
                        if (!hasPaidRef.current) {
                            navigator.sendBeacon('/track_store_event.php',
                                JSON.stringify({ event: 'cart_abandoned', seller_id: sellerId, extra: json.checkout?.title || '' }));
                        }
                    };
                    window.addEventListener('beforeunload', handleUnload);
                }
            } else setError(json.error);
        } catch { setError('Erro ao conectar com o servidor'); }
        finally  { setLoading(false); }
    };

    const handlePay = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        const csSettings = { ...DEFAULT_CS, ...(data?.checkout?.custom_settings || {}) };
        if (csSettings.allow_item_selection && selectedItems.length === 0) {
            alert('Selecione pelo menos um produto para comprar.');
            setIsProcessing(false);
            return;
        }
        try {
            const selectedItemIds = csSettings.allow_item_selection ? selectedItems : data.items.map(item => item.id);
            if (paymentMethod === 'card') {
                const res = await fetch('/process_checkout_card.php', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        checkout_id:       data.checkout.id,
                        customer_name:     customerName,
                        customer_document: customerDoc.replace(/\D/g, ''),
                        selected_item_ids: selectedItemIds
                    })
                });
                const d = await res.json();
                if (d.success && d.checkout_url) {
                    window.location.href = d.checkout_url;
                } else {
                    alert(d.message || 'Erro ao gerar link de cartão');
                }
            } else {
                const res = await fetch('/process_checkout.php', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        checkout_id:       data.checkout.id,
                        customer_name:     customerName,
                        customer_document: customerDoc.replace(/\D/g, ''),
                        selected_item_ids: selectedItemIds
                    })
                });
                const d = await res.json();
                if (d.success) {
                    hasPaidRef.current = true;
                    setActivePix({ id: d.pix_id, amount: d.amount, code: d.pix_code || '', image: d.qr_image || '' });
                } else {
                    alert(d.message || 'Erro ao gerar PIX');
                }
            }
        } catch (err) { alert('Erro: ' + (err?.message || 'Falha de conexão')); }
        finally  { setIsProcessing(false); }
    };

    /* ── Loading ── */
    if (loading) return (
        <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
            <Loader2 className="text-primary animate-spin" size={48} />
        </div>
    );

    /* ── Error ── */
    if (error) return (
        <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="text-red-500" size={40} />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Checkout indisponível</h1>
            <p className="text-white/40 mb-8">Esta página de pagamento não está disponível no momento.</p>
        </div>
    );

    const primary   = data.checkout.primary_color   || '#4ade80';
    const secondary = data.checkout.secondary_color || '#000000';
    const isUrgent  = !expired;
    const cs = { ...DEFAULT_CS, ...(data.checkout.custom_settings || {}) };
    const bgCss = cs.bg_type === 'gradient'
        ? `linear-gradient(${cs.gradient_dir}, ${cs.gradient_from}, ${cs.gradient_to})`
        : (secondary === '#000000' ? '#08080a' : secondary);
    const btnR = cs.btn_radius === 'pill' ? '9999px' : cs.btn_radius === 'sharp' ? '6px' : '16px';
    const fontFam = `'${cs.font_family || 'Outfit'}', sans-serif`;
    const btnColor = cs.btn_color_override || primary;
    const itemsTotal = data?.items
        ? data.items.filter(item => selectedItems.includes(item.id)).reduce((sum, item) => sum + parseFloat(item.price), 0)
        : 0;
    const currentTotal = cs.allow_item_selection ? itemsTotal : (data?.total || 0);
    const finalTotal = couponApplied ? Math.max(0, currentTotal - couponDiscount) : currentTotal;

    const getHexColor = (col) => {
        if (!col) return '';
        if (col.startsWith('#')) {
            if (col.length === 4) {
                return '#' + col[1] + col[1] + col[2] + col[2] + col[3] + col[3];
            }
            return col;
        }
        return col;
    };
    const fontColor = getHexColor(cs.font_color_override);

    /* ── RENDER ── */
    return (
        <div
            className="min-h-screen text-white relative overflow-x-hidden"
            style={{ background: bgCss, fontFamily: fontFam }}
        >
            {fontColor && (
                <style>{`
                    .min-h-screen.text-white {
                        color: ${fontColor} !important;
                    }
                    .text-white {
                        color: ${fontColor} !important;
                    }
                    .text-white\\/70 {
                        color: ${fontColor}b3 !important;
                    }
                    .text-white\\/60 {
                        color: ${fontColor}99 !important;
                    }
                    .text-white\\/50 {
                        color: ${fontColor}80 !important;
                    }
                    .text-white\\/40 {
                        color: ${fontColor}66 !important;
                    }
                    .text-white\\/30 {
                        color: ${fontColor}4d !important;
                    }
                    .text-white\\/25 {
                        color: ${fontColor}40 !important;
                    }
                    .text-white\\/20 {
                        color: ${fontColor}33 !important;
                    }
                    .text-white\\/15 {
                        color: ${fontColor}26 !important;
                    }
                    .text-white\\/8 {
                        color: ${fontColor}14 !important;
                    }
                `}</style>
            )}
            {/* Ambient glow */}
            <div
                className="fixed inset-0 -z-10 pointer-events-none opacity-[0.07]"
                style={{ backgroundImage: `radial-gradient(ellipse at 20% 40%, ${primary}, transparent 50%), radial-gradient(ellipse at 80% 20%, ${primary}, transparent 50%)` }}
            />

            {/* ── BACKGROUND IMAGE ── */}
            {cs.bg_image_url && (
                <div className="fixed inset-0 -z-10 pointer-events-none" style={{ backgroundImage: `url(${cs.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: (cs.bg_image_opacity ?? 70) / 100 }} />
            )}

            {/* ── SCARCITY BAR ── */}
            {cs.show_scarcity && (
                <div className="w-full bg-red-500/10 border-b border-red-500/20 py-2 px-4 flex items-center justify-center gap-2">
                    <AlertTriangle size={13} className="text-red-400 shrink-0" />
                    <span className="text-xs font-black text-red-300">
                        {cs.scarcity_stock ? `Restam apenas ${cs.scarcity_stock} vagas!` : (cs.scarcity_text || 'Vagas limitadas!')}
                    </span>
                </div>
            )}

            {/* ── TOP URGENCY BAR ── */}
            {cs.show_countdown && (
            <AnimatePresence>
                {isUrgent && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="w-full text-black text-center py-2.5 px-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
                        style={{ background: primary }}
                    >
                        <Clock size={14} />
                        <span>Oferta expira em</span>
                        <span className="bg-black/20 px-2.5 py-0.5 rounded-full font-black tabular-nums">
                            {m}:{s}
                        </span>
                        <span>— Garanta agora!</span>
                    </motion.div>
                )}
            </AnimatePresence>
            )}

            {/* ── BANNER ── */}
            {data.checkout.banner_url && (
                <div className="max-w-4xl mx-auto px-4 mt-6">
                    <div className="rounded-[24px] overflow-hidden border border-white/10 shadow-2xl bg-white/[0.02] backdrop-blur-sm">
                        <img src={data.checkout.banner_url} className="w-full h-auto block" alt="Banner" />
                    </div>
                </div>
            )}

            {/* ── LOGO ── */}
            {cs.logo_url && (
                <div className="flex justify-center pt-6">
                    <img src={cs.logo_url} alt="Logo" className="h-14 object-contain" />
                </div>
            )}

            {/* ── LIVE VIEWERS BADGE ── */}
            {cs.show_viewers && (
            <div className="flex justify-center mt-6">
                <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                    </span>
                    <span className="text-xs font-black text-white/60">
                        <span className="text-white">{viewers}</span> pessoas visualizando agora
                    </span>
                    <Eye size={12} className="text-white/30" />
                </motion.div>
            </div>
            )}

            {/* ── MAIN CONTENT ── */}
            <div className="max-w-4xl mx-auto px-4 py-6 pb-36 md:pb-10">

                {/* Title / Headline */}
                <h1 className="text-2xl md:text-3xl font-black text-center mb-2 leading-tight">
                    {cs.headline || data.checkout.title}
                </h1>
                {cs.subheadline && (
                    <p className="text-center text-white/50 text-sm font-medium mb-3">{cs.subheadline}</p>
                )}
                {cs.urgency_text && (
                    <div className="flex justify-center mb-6">
                        <span className="text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border" style={{ color: primary, borderColor: `${primary}40`, background: `${primary}10` }}>
                            {cs.urgency_text}
                        </span>
                    </div>
                )}
                {!cs.headline && !cs.subheadline && !cs.urgency_text && <div className="mb-6" />}

                {/* ── PRODUCT SELECTION CARDS (KITS) ── */}
                {cs.allow_item_selection && data.items.length > 1 && (
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            {data.items.map((item) => {
                                const isSelected = selectedItems.includes(item.id);
                                const isFeatured = item.id === getFeaturedItemId(data.items);
                                const originalPrice = getOriginalPrice(item.price);
                                const emoji = getProductEmoji(item.name, isFeatured);
                                
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItems([item.id])}
                                        className={`relative cursor-pointer transition-all duration-300 rounded-[32px] p-6 flex flex-col items-center justify-between border-4 select-none ${
                                            isFeatured
                                                ? `bg-[#f5b823] text-black ${
                                                    isSelected
                                                        ? 'border-black shadow-2xl scale-[1.02] opacity-100'
                                                        : 'border-transparent opacity-60 hover:opacity-90 hover:scale-[1.01]'
                                                  }`
                                                : `bg-white text-slate-900 ${
                                                    isSelected
                                                        ? 'border-slate-900 shadow-2xl scale-[1.02] opacity-100'
                                                        : 'border-transparent opacity-60 hover:opacity-90 hover:scale-[1.01]'
                                                  }`
                                        }`}
                                    >
                                        {/* Tag Mais Escolhido */}
                                        {isFeatured && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#121214] text-[#f5b823] text-[10px] font-black uppercase tracking-widest px-5 py-1.5 rounded-full shadow-lg border border-[#f5b823]/20">
                                                ★ MAIS ESCOLHIDO
                                            </div>
                                        )}

                                        {/* Título do Kit */}
                                        <h3 className="text-lg font-black text-center mb-4 flex items-center justify-center gap-2 text-slate-950">
                                            <span className="text-xl">{emoji}</span>
                                            <span>{item.name}</span>
                                        </h3>

                                        {/* Imagem do Produto */}
                                        <div className="w-full bg-white rounded-[24px] p-4 mb-4 border border-slate-100 flex items-center justify-center aspect-[4/3] overflow-hidden shadow-inner">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
                                                />
                                            ) : (
                                                <Gift className="w-12 h-12 text-slate-300 animate-pulse" />
                                            )}
                                        </div>

                                        {/* Preço e Seleção */}
                                        <div className="text-center w-full mt-auto">
                                            <p className="text-[11px] font-bold line-through text-slate-500">
                                                De R$ {fmtBRL(originalPrice)}
                                            </p>
                                            <p className={`text-3xl font-black ${
                                                isFeatured ? 'text-slate-950' : 'text-green-600'
                                            }`}>
                                                R$ {fmtBRL(item.price)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className={cs.layout === '1col' ? 'max-w-xl mx-auto space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-5'}>

                    {/* ── LEFT: ORDER SUMMARY ── */}
                    <div className="space-y-4">
                        <div className="bg-white/[0.03] border border-white/8 rounded-[28px] p-6">
                            <h3 className="text-xs font-black text-white/30 uppercase tracking-widest mb-6">Resumo do pedido</h3>
                            
                            <div className="space-y-4">
                                {data.items
                                    .filter(item => !cs.allow_item_selection || selectedItems.includes(item.id))
                                    .map((item, i) => {
                                        return (
                                            <div key={i} className="flex items-center gap-4 animate-fadeIn">
                                                {item.image_url ? (
                                                    <img src={item.image_url} className="w-14 h-14 rounded-2xl object-cover border border-white/10 flex-shrink-0" alt={item.name} />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center border border-white/5" style={{ background: `${primary}15` }}>
                                                        <Gift size={20} style={{ color: primary }} />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-white text-sm leading-tight">{item.name}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={primary} style={{ color: primary }} />)}
                                                        <span className="text-[10px] text-white/30 ml-1">5.0</span>
                                                    </div>
                                                </div>
                                                <span className="font-black text-white whitespace-nowrap">
                                                    R$ {fmtBRL(item.price)}
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>

                            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs font-black text-white/30 uppercase tracking-widest">Total</span>
                                <span className="text-2xl font-black" style={{ color: primary }}>
                                    R$ {fmtBRL(finalTotal)}
                                </span>
                            </div>
                        </div>

                        {/* Guarantee */}
                        {cs.show_guarantee && (
                        <div className="bg-white/[0.02] border border-white/6 rounded-[24px] p-5 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center bg-green-500/10">
                                <BadgeCheck size={22} className="text-green-400" />
                            </div>
                            <div>
                                <p className="font-black text-sm text-white">{cs.guarantee_text}</p>
                                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{cs.guarantee_sub}</p>
                            </div>
                        </div>
                        )}

                        {/* Social proof */}
                        {cs.show_social && (
                        <div className="bg-white/[0.02] border border-white/6 rounded-[24px] p-5 flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {['A','B','C','D'].map(l => (
                                    <div key={l} className="w-8 h-8 rounded-full border-2 border-[#08080a] flex items-center justify-center text-[10px] font-black text-black" style={{ background: primary }}>
                                        {l}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs font-black text-white">+{cs.social_count} clientes satisfeitos</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {[1,2,3,4,5].map(sv => <Star key={sv} size={10} fill={primary} style={{ color: primary }} />)}
                                    <span className="text-[10px] text-white/30">4.9 de avaliação</span>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* Benefits */}
                        {cs.show_benefits && cs.benefits?.length > 0 && (
                        <div className="bg-white/[0.02] border border-white/6 rounded-[24px] p-5">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Check size={13} style={{ color: primary }} /> O que você recebe
                            </h3>
                            <ul className="space-y-2.5">
                                {cs.benefits.map((b, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: `${primary}20` }}>
                                            <Check size={11} style={{ color: primary }} />
                                        </div>
                                        <span className="text-sm text-white/70 font-medium leading-snug">{b}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        )}

                        {/* Testimonials */}
                        {cs.show_testimonials && cs.testimonials?.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <ThumbsUp size={13} style={{ color: primary }} /> Quem já comprou
                            </h3>
                            {cs.testimonials.map((t, i) => (
                                <div key={i} className="bg-white/[0.02] border border-white/6 rounded-[20px] p-4">
                                    <div className="flex items-center gap-1 mb-2">
                                        {Array.from({ length: t.stars || 5 }).map((_, s) => (
                                            <Star key={s} size={11} fill={primary} style={{ color: primary }} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-white/60 italic leading-relaxed">"{t.text}"</p>
                                    <p className="text-[11px] font-black text-white/30 mt-2">— {t.name}</p>
                                </div>
                            ))}
                        </div>
                        )}

                        {/* Order Bump */}
                        {cs.show_order_bump && cs.order_bump_title && (
                        <div className="border-2 rounded-[24px] p-5" style={{ borderColor: `${primary}60`, background: `${primary}08` }}>
                            <div className="flex items-start gap-3">
                                <input type="checkbox" id="order-bump" className="mt-1 w-4 h-4 accent-primary shrink-0" />
                                <label htmlFor="order-bump" className="cursor-pointer">
                                    <p className="font-black text-sm" style={{ color: primary }}>SIM! Quero adicionar:</p>
                                    <p className="font-black text-white text-base mt-0.5">{cs.order_bump_title}</p>
                                    {cs.order_bump_desc && <p className="text-xs text-white/50 mt-1 leading-relaxed">{cs.order_bump_desc}</p>}
                                    {cs.order_bump_price && (
                                        <p className="font-black mt-2 text-sm" style={{ color: primary }}>+ R$ {parseFloat(cs.order_bump_price).toFixed(2).replace('.',',')}</p>
                                    )}
                                </label>
                            </div>
                        </div>
                        )}

                    </div>

                    {/* ── RIGHT: PAYMENT FORM ── */}
                    <div className="bg-white/[0.03] border border-white/8 rounded-[28px] p-6 flex flex-col">

                        {/* Payment method selector */}
                        <div className="flex gap-2 mb-5">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('pix')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border font-black text-sm transition-all ${
                                    paymentMethod === 'pix'
                                        ? 'border-[--c] text-[--c]'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                }`}
                                style={paymentMethod === 'pix' ? { '--c': primary, background: `${primary}18` } : {}}
                            >
                                <QrCode size={15} /> PIX
                            </button>
                            <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed select-none relative overflow-hidden">
                                <CreditCard size={15} />
                                <span className="text-sm font-black">Cartão</span>
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full tracking-widest">Manutenção</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                paymentMethod === 'card' ? 'bg-blue-500/10' : 'bg-green-500/10'
                            }`}>
                                {paymentMethod === 'card'
                                    ? <CreditCard size={18} className="text-blue-400" />
                                    : <Zap size={18} className="text-green-400" />}
                            </div>
                            <div>
                                <h2 className="font-black text-base leading-tight">
                                    {paymentMethod === 'card' ? 'Pagamento via Cartão' : 'Pagamento via PIX'}
                                </h2>
                                <p className="text-[11px] text-white/30 font-medium">
                                    {paymentMethod === 'card' ? 'Até 12x • 100% seguro' : 'Aprovação instantânea • 100% seguro'}
                                </p>
                            </div>
                        </div>

                        <form ref={formRef} onSubmit={handlePay} className="flex flex-col gap-4 flex-1">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: João Silva"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 font-bold text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-white/15"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                                    CPF
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="000.000.000-00"
                                    value={customerDoc}
                                    onChange={e => setCustomerDoc(maskCPF(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 font-bold text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-white/15"
                                />
                            </div>

                            {/* Extra: Email */}
                            {cs.require_email !== false && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">E-mail</label>
                                <input type="email" placeholder="seu@email.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 font-bold text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-white/15" />
                            </div>
                            )}

                            {/* Extra: Phone */}
                            {cs.require_phone && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                                <input type="tel" placeholder="(11) 9 0000-0000" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 font-bold text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-white/15" />
                            </div>
                            )}

                            {/* Extra: Address */}
                            {cs.require_address && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Endereço completo</label>
                                <input type="text" placeholder="Rua, número, bairro, cidade" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 font-bold text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-white/15" />
                            </div>
                            )}

                            {/* Coupon */}
                            {cs.show_coupon && (
                            <div className="flex gap-2">
                                <input type="text" placeholder="Código de cupom" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 font-bold text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-white/15" />
                                <button type="button" onClick={() => { if (couponCode.trim()) { setCouponApplied(true); setCouponDiscount(data.total * 0.1); } }}
                                    className="px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all" style={{ background: `${primary}20`, color: primary }}>
                                    <Tag size={14} />
                                </button>
                            </div>
                            )}
                            {couponApplied && (
                                <p className="text-xs font-black text-green-400 flex items-center gap-1"><Check size={12} /> Cupom aplicado! − R$ {fmtBRL(couponDiscount)}</p>
                            )}

                            {/* Trust seals */}
                            {cs.show_trust_seals && (
                            <div className="grid grid-cols-3 gap-3 py-2">
                                <TrustBadge icon={<Lock size={16} />}       label="Criptografado" sub="SSL 256-bit"    color={primary} />
                                <TrustBadge icon={<ShieldCheck size={16} />} label="Anti-fraude"   sub="Protegido"     color={primary} />
                                <TrustBadge icon={<CheckCircle size={16} />} label="Aprovação"     sub="Instantânea"   color={primary} />
                            </div>
                            )}

                            {/* CTA Button */}
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                disabled={isProcessing}
                                style={paymentMethod === 'pix' ? { background: btnColor, borderRadius: btnR } : { borderRadius: btnR }}
                                className={`w-full py-5 font-black text-base flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 transition-all mt-auto ${
                                    paymentMethod === 'card'
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                        : 'text-black'
                                } ${cs.btn_pulse && paymentMethod === 'pix' ? 'animate-pulse' : ''}`}
                            >
                                {isProcessing ? (
                                    <><Loader2 className="animate-spin" size={20} /> {paymentMethod === 'card' ? 'Gerando link...' : 'Gerando PIX...'}</>
                                ) : paymentMethod === 'card' ? (
                                    <><CreditCard size={20} />{cs.cta_text || `Pagar R$ ${fmtBRL(finalTotal)} com Cartão`}<ArrowRight size={18} /></>
                                ) : (
                                    <><Zap size={20} />{cs.cta_text || `Pagar R$ ${fmtBRL(finalTotal)} com PIX`}<ArrowRight size={18} /></>
                                )}
                            </motion.button>

                            <p className="text-center text-[10px] text-white/20 font-bold">
                                🔒 Seus dados estão protegidos e criptografados
                            </p>
                        </form>
                    </div>
                </div>

                {/* Footer trust */}
                {cs.show_trust_seals && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[10px] font-black text-white/15 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><ShieldCheck size={12} /> Compra Segura</span>
                    <span className="flex items-center gap-1.5"><BadgeCheck size={12} /> Dados Protegidos</span>
                    <span className="flex items-center gap-1.5"><Users size={12} /> +{cs.social_count} Clientes</span>
                    <span className="flex items-center gap-1.5"><Zap size={12} /> PIX Instantâneo</span>
                </div>
                )}
                <p className="text-center text-[10px] text-white/8 font-black uppercase tracking-[0.4em] mt-4">
                    Powered by DiretoPay Technology
                </p>
            </div>

            {/* ── STICKY CTA (mobile only) ── */}
            {cs.show_sticky_mobile && (
            <AnimatePresence>
                {!activePix && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 md:hidden z-50 p-4"
                        style={{ background: `linear-gradient(to top, ${bgCss.startsWith('linear') ? '#000' : bgCss} 70%, transparent)` }}
                    >
                        <button
                            onClick={() => formRef.current?.requestSubmit()}
                            disabled={isProcessing}
                            style={paymentMethod === 'pix' ? { background: primary, borderRadius: btnR } : { borderRadius: btnR }}
                            className={`w-full py-4 font-black text-base flex items-center justify-center gap-2 shadow-2xl disabled:opacity-40 transition-all ${
                                paymentMethod === 'card' ? 'bg-blue-500 text-white' : 'text-black'
                            }`}
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : paymentMethod === 'card' ? (
                                <><CreditCard size={18} /> {cs.cta_text || `Pagar R$ ${fmtBRL(finalTotal)} com Cartão`}</>
                            ) : (
                                <><Zap size={18} /> {cs.cta_text || `Pagar R$ ${fmtBRL(finalTotal)} com PIX`}</>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-white/20 font-bold mt-2">
                            🔒 Pagamento 100% seguro
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
            )}

            {/* ── PIX MODAL ── */}
            {activePix && (
                <PixModal
                    pixData={activePix}
                    onClose={() => setActivePix(null)}
                    statusEndpoint="/check_checkout_status.php"
                    onPaymentSuccess={() => {
                        hasPaidRef.current = true;
                        if (cs.redirect_url) {
                            window.location.href = cs.redirect_url;
                        }
                    }}
                />
            )}

            {/* ── WHATSAPP FLOAT ── */}
            {cs.show_whatsapp_float && cs.support_whatsapp && (
                <a
                    href={`https://wa.me/${cs.support_whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(cs.whatsapp_float_msg || 'Olá! Tenho uma dúvida.')}`}
                    target="_blank" rel="noreferrer"
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
                    style={{ background: '#25D366' }}
                >
                    <MessageCircle size={26} className="text-white" fill="white" />
                </a>
            )}

            {/* ── EXIT POPUP ── */}
            <AnimatePresence>
            {exitPopupVisible && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setExitPopupVisible(false)}
                >
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                        className="relative max-w-sm w-full rounded-[32px] p-8 text-center shadow-2xl border border-white/10"
                        style={{ background: bgCss }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setExitPopupVisible(false)} className="absolute top-4 right-4 text-white/30 hover:text-white">
                            <X size={18} />
                        </button>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: `${primary}20` }}>
                            <Zap size={28} style={{ color: primary }} />
                        </div>
                        <h3 className="text-xl font-black mb-2">{cs.exit_popup_title || 'Espere! Oferta especial para você'}</h3>
                        <p className="text-white/50 text-sm mb-6 leading-relaxed">{cs.exit_popup_msg || 'Não perca esta oportunidade única!'}</p>
                        <button onClick={() => setExitPopupVisible(false)}
                            className="w-full py-4 font-black rounded-2xl text-black shadow-xl"
                            style={{ background: primary, borderRadius: btnR }}
                        >
                            {cs.exit_popup_cta || 'Quero aproveitar!'}
                        </button>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* Custom scripts */}
            {data.checkout.custom_html_body && (
                <div dangerouslySetInnerHTML={{ __html: data.checkout.custom_html_body }} />
            )}
        </div>
    );
}
