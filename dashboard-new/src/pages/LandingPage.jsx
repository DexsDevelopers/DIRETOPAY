import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Zap, ShieldCheck, BarChart3, ArrowRight, CheckCircle,
    QrCode, Webhook, Globe, TrendingUp, Star, ChevronDown,
    Menu, X, DollarSign, RefreshCw, Lock, Clock, Users,
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
    { label: 'Produto',  href: '#produto' },
    { label: 'Recursos', href: '#recursos' },
    { label: 'Preços',   href: '#precos' },
    { label: 'FAQ',      href: '#faq' },
];

const STATS = [
    { value: 'R$ 12M+', label: 'Processado',  note: 'volume total na plataforma' },
    { value: '4.200+',  label: 'Vendedores',   note: 'ativos todos os dias' },
    { value: '99.97%',  label: 'Uptime',       note: 'SLA mensal garantido' },
    { value: '~200ms',  label: 'PIX gerado',   note: 'tempo médio de criação' },
];

const TRUST = [
    { icon: X,          color: '#ef4444', label: 'Sem documentos',       desc: 'Não pedimos RG, CNH nem comprovante de residência.' },
    { icon: ShieldCheck,color: '#10b981', label: 'Sem dados pessoais',    desc: 'Apenas nome, e-mail e sua chave PIX. Nada mais.' },
    { icon: CheckCircle,color: '#6366f1', label: 'Sem CNPJ obrigatório',  desc: 'Pessoa física aceita. Comece com seu CPF agora.' },
    { icon: Zap,        color: '#f59e0b', label: 'Taxa única e fixa',     desc: 'Sem surpresas. Você sabe exatamente o que paga.' },
];

const FEATURES = [
    { icon: Zap,        color: '#10b981', title: 'PIX Instantâneo',        desc: 'Cobranças em menos de 200ms com QR Code e copia-e-cola automático.' },
    { icon: Webhook,    color: '#6366f1', title: 'Webhooks em Tempo Real', desc: 'Notificações automáticas ao seu sistema quando o PIX confirmar.' },
    { icon: BarChart3,  color: '#f59e0b', title: 'Dashboard Completo',     desc: 'Relatórios, gráficos e métricas de venda em tempo real.' },
    { icon: ShieldCheck,color: '#0ea5e9', title: 'Antifraude Nativo',      desc: 'Proteção multicamada contra chargebacks e acessos suspeitos.' },
    { icon: Globe,      color: '#ec4899', title: 'Checkout Personalizado', desc: 'Páginas de venda com sua marca sem precisar programar.' },
    { icon: RefreshCw,  color: '#a855f7', title: 'Cobranças Recorrentes',  desc: 'Assinaturas e planos mensais gerenciados automaticamente.' },
];

const PAYMENTS = [
    { name: 'Lucas M.',  value: 'R$ 297,00', tag: 'Pago' },
    { name: 'Amanda C.', value: 'R$ 89,90',  tag: 'Pago' },
    { name: 'Rafael T.', value: 'R$ 497,00', tag: 'Pago' },
    { name: 'Bianca F.', value: 'R$ 147,00', tag: 'Pago' },
    { name: 'Thiago S.', value: 'R$ 997,00', tag: 'Pago' },
];

const FAQ = [
    { q: 'Preciso enviar documentos para abrir conta?', a: 'Não. Basta informar nome, e-mail e sua chave PIX para começar. Zero burocracia, zero documentos.' },
    { q: 'Qual a taxa cobrada por transação?',           a: 'Taxa fixa e transparente por transação aprovada. Sem mensalidade e sem cobranças escondidas. Você só paga quando vender.' },
    { q: 'Como recebo meu dinheiro?',                    a: 'O saldo cai na sua conta DiretoPay em segundos após o pagamento. Saque a qualquer momento direto no seu PIX.' },
    { q: 'Preciso de CNPJ?',                             a: 'Não. Pessoas físicas com CPF podem criar conta e começar a vender imediatamente, sem burocracia.' },
    { q: 'Posso integrar via API?',                      a: 'Sim. Temos API REST completa com documentação interativa, SDKs e webhooks para todos os eventos de pagamento.' },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/[0.06] last:border-0">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between py-5 text-left gap-4">
                <span className="text-[15px] font-semibold text-white">{q}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} className="text-gray-400 shrink-0" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                        className="text-[14px] text-gray-400 pb-5 leading-relaxed overflow-hidden">
                        {a}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <div className="min-h-screen bg-[#050709] text-white font-sans antialiased overflow-x-hidden">

            {/* ── BACKGROUND GRID ── */}
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `linear-gradient(rgba(16,185,129,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.035) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }} />
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{ background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(16,185,129,0.13) 0%, transparent 65%)' }} />

            {/* ── NAV ── */}
            <motion.nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-[#050709]/85 backdrop-blur-2xl border-b border-white/[0.07] shadow-xl shadow-black/30' : ''
            }`}>
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center group">
                        <img src="/logo-diretopay.webp" alt="DiretoPay" className="h-8 sm:h-9 w-auto" />
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(l => (
                            <a key={l.label} href={l.href}
                                className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.06]">
                                {l.label}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <Link to="/login" className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors px-4 py-2">
                            Entrar
                        </Link>
                        <Link to="/register"
                            className="text-[13px] font-bold bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/45 hover:-translate-y-px">
                            Começar grátis →
                        </Link>
                    </div>

                    <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="md:hidden border-t border-white/[0.07] bg-[#050709]/96 backdrop-blur-2xl px-5 py-4 space-y-1">
                            {NAV_LINKS.map(l => (
                                <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                                    className="block py-2.5 px-3 text-[14px] text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all">
                                    {l.label}
                                </a>
                            ))}
                            <div className="pt-3 flex flex-col gap-2">
                                <Link to="/login" onClick={() => setMenuOpen(false)}
                                    className="text-center py-2.5 text-[14px] font-medium text-gray-300 border border-white/10 rounded-xl hover:border-white/20 transition-colors">Entrar</Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)}
                                    className="text-center py-2.5 text-[14px] font-bold bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-colors">Começar grátis</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* ── HERO ── */}
            <section className="relative z-10 pt-36 pb-20 px-5 overflow-hidden">
                {/* Glow orbs */}
                <div className="absolute -top-32 -left-48 w-[700px] h-[700px] rounded-full opacity-15 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }} />
                <div className="absolute top-40 -right-48 w-[500px] h-[500px] rounded-full opacity-8 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />

                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-14 items-center">

                        {/* Left: copy */}
                        <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-[12px] font-bold mb-7">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Plataforma de pagamentos PIX
                            </div>

                            <h1 className="text-[46px] sm:text-[60px] font-black tracking-tight leading-[1.03] mb-6">
                                Receba PIX<br />
                                <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    sem burocracia.
                                </span>
                            </h1>

                            <p className="text-[16px] sm:text-[18px] text-gray-400 leading-relaxed mb-5 max-w-md">
                                Crie cobranças, gerencie vendas e saque quando quiser.
                                <strong className="text-gray-200"> Sem pedir documentos, sem dados pessoais</strong> desnecessários.
                            </p>

                            {/* Trust pills */}
                            <div className="flex flex-wrap gap-2.5 mb-9">
                                {['Sem documentos', 'Sem CNPJ', 'Taxa fixa', 'Ativo em 2 min'].map(t => (
                                    <span key={t} className="flex items-center gap-1.5 text-[12px] text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                        <CheckCircle size={11} className="shrink-0" /> {t}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link to="/register"
                                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all text-[15px] shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0">
                                    Criar conta grátis <ArrowRight size={16} />
                                </Link>
                                <Link to="/demo"
                                    className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-gray-300 hover:text-white font-medium px-7 py-3.5 rounded-xl transition-all text-[15px]">
                                    Ver demonstração
                                </Link>
                            </div>
                        </motion.div>

                        {/* Right: dashboard + payment plates */}
                        <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
                            className="relative hidden lg:block">

                            {/* Main card */}
                            <div className="relative rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl p-6 shadow-2xl shadow-black/50">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <p className="text-[12px] text-gray-500 mb-1">Saldo disponível</p>
                                        <p className="text-[34px] font-black text-white">R$ 4.820,00</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                                        <TrendingUp size={20} className="text-emerald-400" />
                                    </div>
                                </div>
                                {/* Mini chart */}
                                <div className="flex items-end gap-1 h-14 mb-4">
                                    {[35, 55, 40, 72, 50, 85, 65, 100, 72, 88, 92, 100].map((h, i) => (
                                        <motion.div key={i}
                                            initial={{ height: 0 }} animate={{ height: `${h}%` }}
                                            transition={{ duration: 0.5, delay: 0.4 + i * 0.04 }}
                                            className="flex-1 rounded-sm"
                                            style={{ background: i >= 9 ? '#10b981' : 'rgba(16,185,129,0.18)' }} />
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-[12px]">
                                    <span className="text-gray-500">Últimos 30 dias</span>
                                    <span className="text-emerald-400 font-bold">↑ +24,3%</span>
                                </div>
                            </div>

                            {/* Floating payment plates */}
                            {[
                                { name: 'Lucas M.',  value: 'R$ 297,00', top: '-22px', right: '-44px' },
                                { name: 'Amanda C.', value: 'R$ 89,90',  top: '145px', right: '-50px' },
                                { name: 'Rafael T.', value: 'R$ 497,00', top: '312px', right: '-40px' },
                            ].map((p, i) => (
                                <motion.div key={i}
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.55 + i * 0.18 }}
                                    className="absolute flex items-center gap-3 bg-[#0b1a13]/90 backdrop-blur-xl border border-emerald-500/25 rounded-2xl px-4 py-3 shadow-xl shadow-emerald-500/10"
                                    style={{ right: p.right, top: p.top, zIndex: 10 }}>
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <DollarSign size={14} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400">{p.name}</p>
                                        <p className="text-[14px] font-bold text-emerald-300">{p.value}</p>
                                    </div>
                                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/15 px-1.5 py-0.5 rounded-full ml-1">PAGO</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── PLATFORMS MARQUEE ── */}
            <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.015] overflow-hidden py-6">
                <p className="text-center text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-5">Compatível com os maiores sistemas do mercado</p>
                <div className="relative">
                    {/* fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #050709, transparent)' }} />
                    <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #050709, transparent)' }} />
                    <motion.div
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                        className="flex items-center gap-10 w-max">
                        {[
                            'Hotmart', 'Kiwify', 'Eduzz', 'Monetizze', 'Braip',
                            'Shopify', 'WooCommerce', 'WordPress', 'Lastlink', 'Ticto',
                            'PerfectPay', 'Guru', 'Pepper', 'Memberkit', 'Cademi',
                            'Hotmart', 'Kiwify', 'Eduzz', 'Monetizze', 'Braip',
                            'Shopify', 'WooCommerce', 'WordPress', 'Lastlink', 'Ticto',
                            'PerfectPay', 'Guru', 'Pepper', 'Memberkit', 'Cademi',
                        ].map((name, i) => (
                            <span key={i} className="text-[13px] font-black text-gray-500 hover:text-gray-300 transition-colors whitespace-nowrap tracking-tight opacity-50 hover:opacity-100 cursor-default">
                                {name}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="relative z-10 border-b border-white/[0.06] bg-white/[0.015]">
                <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {STATS.map(({ value, label, note }, i) => (
                        <motion.div key={label}
                            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                            className="text-center">
                            <p className="text-[30px] sm:text-[38px] font-black tracking-tight"
                                style={{ background: 'linear-gradient(135deg, #fff 30%, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {value}
                            </p>
                            <p className="text-[13px] font-semibold text-gray-300 mt-1">{label}</p>
                            <p className="text-[11px] text-gray-600 mt-0.5">{note}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── TRUST / SEM DOCUMENTOS ── */}
            <section className="relative z-10 py-20 px-5">
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="text-center mb-12">
                        <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Zero burocracia</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                            Sem documentos.<br />Sem complicação.
                        </h2>
                        <p className="text-gray-400 text-[15px] max-w-lg mx-auto">
                            Não pedimos documentos, RG, CNH ou dados pessoais. Apenas e-mail, nome e sua chave PIX.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {TRUST.map(({ icon: Icon, color, label, desc }, i) => (
                            <motion.div key={label}
                                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm p-5 overflow-hidden group cursor-default transition-all hover:border-white/[0.13] hover:shadow-lg hover:shadow-black/30">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18, transparent 70%)` }} />
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 relative"
                                    style={{ background: `${color}15`, border: `1px solid ${color}28` }}>
                                    <Icon size={18} style={{ color }} />
                                </div>
                                <h3 className="text-[14px] font-bold text-white mb-1.5 relative">{label}</h3>
                                <p className="text-[12px] text-gray-500 leading-relaxed relative">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRODUCT MOCK ── */}
            <section id="produto" className="relative z-10 py-20 px-5 border-t border-white/[0.06]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Produto</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Tudo para vender mais</h2>
                        <p className="text-gray-400 mt-3 text-[15px] max-w-lg mx-auto">Do QR Code ao relatório financeiro — tudo em um só lugar.</p>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="rounded-2xl border border-white/[0.1] bg-[#080e14]/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/60">
                        {/* Window bar */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            <div className="flex-1 mx-3">
                                <div className="bg-white/5 rounded-md h-5 w-52 flex items-center px-2">
                                    <span className="text-[10px] text-gray-500">app.diretopay.site/dashboard</span>
                                </div>
                            </div>
                        </div>
                        {/* KPI Cards */}
                        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Saldo',       value: 'R$ 4.820,00', color: '#10b981', icon: DollarSign },
                                { label: 'Hoje',        value: 'R$ 340,00',   color: '#6366f1', icon: TrendingUp },
                                { label: 'Transações',  value: '127',         color: '#f59e0b', icon: QrCode },
                                { label: 'Aprovação',   value: '97,3%',       color: '#0ea5e9', icon: CheckCircle },
                            ].map(({ label, value, color, icon: Icon }) => (
                                <div key={label} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.13] transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] text-gray-500">{label}</span>
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                                            <Icon size={12} style={{ color }} />
                                        </div>
                                    </div>
                                    <p className="text-[18px] font-bold text-white">{value}</p>
                                </div>
                            ))}
                        </div>
                        {/* Payments list */}
                        <div className="px-5 pb-5">
                            <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                                    <span className="text-[12px] font-semibold text-gray-300">Pagamentos recentes</span>
                                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ao vivo
                                    </span>
                                </div>
                                {PAYMENTS.map((t, i) => (
                                    <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-[11px] font-bold text-emerald-300">
                                                {t.name[0]}
                                            </div>
                                            <span className="text-[12px] text-gray-300">{t.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{t.tag}</span>
                                            <span className="text-[13px] font-bold text-white">{t.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="recursos" className="relative z-10 py-20 px-5 border-t border-white/[0.06]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Recursos</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Infraestrutura para escalar</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
                            <motion.div key={title}
                                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                                whileHover={{ y: -5 }}
                                className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm p-6 overflow-hidden group cursor-default transition-all hover:border-white/[0.14] hover:shadow-xl hover:shadow-black/30">
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}14, transparent 70%)` }} />
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 relative"
                                    style={{ background: `${color}15`, border: `1px solid ${color}28` }}>
                                    <Icon size={18} style={{ color }} />
                                </div>
                                <h3 className="text-[14px] font-bold text-white mb-2 relative">{title}</h3>
                                <p className="text-[13px] text-gray-500 leading-relaxed relative">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="relative z-10 py-20 px-5 border-t border-white/[0.06]">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Como funciona</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Comece em 3 passos</h2>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-8 relative">
                        <div className="hidden sm:block absolute top-10 left-[28%] right-[28%] h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
                        {[
                            { step: '01', icon: Lock,       title: 'Crie sua conta',     desc: 'Cadastro gratuito em 2 minutos. Sem documentos, sem burocracia.' },
                            { step: '02', icon: QrCode,     title: 'Configure seu PIX',  desc: 'Informe sua chave PIX e já comece a gerar cobranças imediatamente.' },
                            { step: '03', icon: DollarSign, title: 'Saque na hora',      desc: 'Saldo disponível a qualquer momento. Sem taxas ocultas, sem espera.' },
                        ].map(({ step, icon: Icon, title, desc }, i) => (
                            <motion.div key={step}
                                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.12 }}
                                className="text-center relative group">
                                <div className="relative inline-block mb-5">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/20">
                                        <Icon size={22} className="text-emerald-400" />
                                    </div>
                                    <span className="absolute -top-2 -right-2 text-[9px] font-black text-emerald-400 bg-[#050709] border border-emerald-500/30 rounded-full w-5 h-5 flex items-center justify-center">{step}</span>
                                </div>
                                <h3 className="text-[15px] font-bold text-white mb-2">{title}</h3>
                                <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="precos" className="relative z-10 py-20 px-5 border-t border-white/[0.06]">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Preços</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Taxa fixa. Sem surpresas.</h2>
                        <p className="text-gray-400 mt-3 text-[15px]">Pague apenas quando vender. Zero mensalidade. Zero taxas escondidas.</p>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.07] to-transparent p-8 overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none"
                            style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(16,185,129,0.14), transparent)' }} />

                        <div className="relative text-center mb-8">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Star size={10} fill="currentColor" /> Único plano · Sem mensalidade
                            </span>
                            <div className="flex items-baseline justify-center gap-2 mb-2">
                                <span className="text-[60px] font-black tracking-tight text-white leading-none">1,49%</span>
                            </div>
                            <p className="text-gray-400 text-[15px]">por transação aprovada</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 mb-8 relative">
                            {[
                                'Cobranças PIX ilimitadas',
                                'Checkout personalizado',
                                'Webhooks em tempo real',
                                'Dashboard e relatórios',
                                'Assinaturas recorrentes',
                                'API REST + documentação',
                                'Suporte via chat 24/7',
                                'Sem documentos exigidos',
                            ].map(f => (
                                <div key={f} className="flex items-center gap-2.5">
                                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                                    <span className="text-[13px] text-gray-300">{f}</span>
                                </div>
                            ))}
                        </div>

                        <Link to="/register"
                            className="relative flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl text-[15px] transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0">
                            Começar grátis agora <ArrowRight size={16} />
                        </Link>
                        <p className="text-center text-[12px] text-gray-600 mt-3 relative">Sem cartão de crédito · Sem documentos · Ativo em 2 minutos</p>
                    </motion.div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="relative z-10 py-20 px-5 border-t border-white/[0.06]">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mb-3">FAQ</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Perguntas frequentes</h2>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm px-6 overflow-hidden">
                        {FAQ.map(item => <FaqItem key={item.q} {...item} />)}
                    </div>
                </div>
            </section>

            {/* ── CTA FINAL ── */}
            <section className="relative z-10 py-24 px-5 border-t border-white/[0.06] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(16,185,129,0.10), transparent)' }} />
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto text-center relative">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center mx-auto mb-7 shadow-2xl shadow-emerald-500/40">
                        <Zap size={28} className="text-white" fill="white" />
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                        Comece a vender<br />
                        <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            hoje mesmo.
                        </span>
                    </h2>
                    <p className="text-gray-400 text-[16px] mb-9 max-w-md mx-auto">
                        Sem documentos. Sem complicação. Sua conta estará ativa em menos de 2 minutos.
                    </p>
                    <Link to="/register"
                        className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-2xl transition-all text-[16px] shadow-2xl shadow-emerald-500/35 hover:shadow-emerald-500/55 hover:-translate-y-0.5 active:translate-y-0">
                        Criar minha conta grátis <ArrowRight size={18} />
                    </Link>
                    <p className="text-[12px] text-gray-600 mt-5">Sem cartão de crédito · Taxa fixa de 1,49% · Saque a qualquer hora</p>
                </motion.div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="relative z-10 border-t border-white/[0.06] py-10 px-5">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
                    <img src="/logo-diretopay.webp" alt="DiretoPay" className="h-7 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                    <p className="text-[12px] text-gray-600">© {new Date().getFullYear()} DiretoPay. Todos os direitos reservados.</p>
                    <div className="flex items-center gap-5">
                        <Link to="/login"    className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors">Entrar</Link>
                        <Link to="/register" className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors">Criar conta</Link>
                        <Link to="/docs"     className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors">API Docs</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
