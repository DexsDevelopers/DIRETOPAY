import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { AuroraBg, DotGrid, Particles, ShimmerButton, GlowCard, GradientText, PulseBadge, StatCard, FeatureCard, CustomCursor, NoiseOverlay, ClipReveal, LineReveal, CountUp, Marquee, MagneticButton, PageLoader, SectionLabel, Reveal } from '../components/AnimatedUI';
import {
    Zap, ShieldCheck, BarChart3, ArrowRight, CheckCircle,
    QrCode, Webhook, Globe, TrendingUp, ChevronDown,
    Menu, X, DollarSign, RefreshCw, Lock,
    Instagram, MessageCircle, MapPin, Users,
    Trophy, Award, Gem, Crown, Flame, Star,
    Sun, Moon, Code2,
} from 'lucide-react';

const NAV_LINKS = [
    { label: 'Início',     href: '/' },
    { label: 'Benefícios', href: '/beneficios' },
    { label: 'Premiações', href: '/premiacoes' },
    { label: 'API Docs',   href: '/docs',        icon: Code2 },
    { label: 'FAQ',        href: '/faq' },
    { label: 'Contato',    href: 'https://wa.me/5551996148568', external: true },
    { label: 'Canal',      href: 'https://whatsapp.com/channel/0029Vb7xewz7z4kaRdHkhO1e', external: true },
];

const STATS = [
    { to: 12,    prefix: 'R$ ', suffix: 'M+', label: 'Processado',  note: 'volume total na plataforma', decimals: 0 },
    { to: 4200,  prefix: '',   suffix: '+',  label: 'Vendedores',   note: 'ativos todos os dias',        decimals: 0 },
    { to: 99.97, prefix: '',   suffix: '%',  label: 'Uptime',       note: 'SLA mensal garantido',       decimals: 2 },
    { to: 200,   prefix: '~', suffix: 'ms', label: 'PIX gerado',   note: 'tempo médio de criação',     decimals: 0 },
];

const MARQUEE_ITEMS = ['PIX Instantâneo', 'Sem Mensalidade', 'D+0 Saque', 'Antifraude', 'Checkout Próprio', 'Webhooks', 'API REST', '99.97% Uptime', 'Sem CNPJ'];

const TICKER = [
    { name: 'Lucas M.',  value: 'R$ 297,00' },
    { name: 'Amanda C.', value: 'R$ 89,90'  },
    { name: 'Rafael T.', value: 'R$ 497,00' },
    { name: 'Bianca F.', value: 'R$ 147,00' },
    { name: 'Thiago S.', value: 'R$ 997,00' },
];

const BENEFITS = [
    { icon: Zap,        color: '#10b981', title: 'Aprovação Instantânea', desc: 'Produtos aprovados na hora. Sem esperar 2 a 3 dias.' },
    { icon: DollarSign, color: '#6366f1', title: 'Saque Direto no PIX',   desc: 'Liquidação imediata na sua chave PIX cadastrada.' },
    { icon: ShieldCheck,color: '#f59e0b', title: 'Anti-fraude Nativo',    desc: 'Proteção multicamada contra chargebacks e MED.' },
];

const FEATURES = [
    { icon: Zap,        color: '#10b981', title: 'PIX Instantâneo',        desc: 'Cobranças em menos de 200ms com QR Code e copia-e-cola.' },
    { icon: Webhook,    color: '#6366f1', title: 'Webhooks em Tempo Real', desc: 'Notificações automáticas ao seu sistema quando o PIX confirmar.' },
    { icon: BarChart3,  color: '#f59e0b', title: 'Dashboard Completo',     desc: 'Relatórios, gráficos e métricas de venda em tempo real.' },
    { icon: ShieldCheck,color: '#0ea5e9', title: 'Antifraude Nativo',      desc: 'Proteção multicamada contra chargebacks e acessos suspeitos.' },
    { icon: Globe,      color: '#ec4899', title: 'Checkout Personalizado', desc: 'Páginas de venda com sua marca sem precisar programar.' },
    { icon: RefreshCw,  color: '#a855f7', title: 'Cobranças Recorrentes',  desc: 'Assinaturas e planos mensais gerenciados automaticamente.' },
];

const PLATES = [
    { amount: '10K',  full: 'R$ 10.000',    desc: 'Primeira prova de que o jogo é real. Você saiu do zero.' },
    { amount: '50K',  full: 'R$ 50.000',    desc: 'Você mostrou consistência. O mercado te responde.' },
    { amount: '100K', full: 'R$ 100.000',   desc: 'Seis dígitos. Você é parte de um grupo seleto de sellers.' },
    { amount: '500K', full: 'R$ 500.000',   desc: 'Meio milhão. Sua operação virou uma verdadeira máquina.' },
    { amount: '1M',   full: 'R$ 1.000.000', desc: 'O clube do milhão. Performance e consistência de elite.' },
];

const TESTIMONIALS = [
    { initials: 'CR', name: 'Carlos R.',  role: 'Info-produtor', revenue: 'R$ 45K/mês',  stars: 5, text: 'Abri minha conta em 2 minutos e já estava vendendo no mesmo dia. Sem burocracia, sem CNPJ, sem dor de cabeça.' },
    { initials: 'BF', name: 'Beatriz F.', role: 'Afiliada',      revenue: 'R$ 12K/mês',  stars: 5, text: 'Saque na hora, toda vez. Já testei outras plataformas e a DiretoPay é a única que realmente entrega.' },
    { initials: 'TV', name: 'Thiago V.',  role: 'Lançador',      revenue: 'R$ 180K/mês', stars: 5, text: 'Uso a API para integrar no meu funil e funciona perfeitamente. Documentação clara e suporte rápido.' },
];

const RANKING = [
    { initials: 'MR', name: 'Marcos R.', sales: 1247, amount: 'R$ 89.420,00', pos: 1 },
    { initials: 'AL', name: 'Ana L.',    sales: 982,  amount: 'R$ 67.890,00', pos: 2 },
    { initials: 'JS', name: 'João S.',   sales: 756,  amount: 'R$ 54.230,00', pos: 3 },
    { initials: 'CF', name: 'Carla F.',  sales: 634,  amount: 'R$ 45.120,00', pos: 4 },
    { initials: 'RP', name: 'Rafael P.', sales: 523,  amount: 'R$ 38.450,00', pos: 5 },
];

const POS_COLORS = ['#fbbf24', '#cbd5e1', '#f97316', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.25)'];

const COMPARISON = [
    { feature: 'Exposição de dados (CPF/CNPJ)', bad: 'Alta — Exposto no checkout', good: 'Zero — 100% oculto' },
    { feature: 'Aprovação de produtos',          bad: '2–3 dias úteis',            good: 'Instantânea' },
    { feature: 'Velocidade de saque',            bad: 'D+15 ou D+30',             good: 'Imediata via PIX' },
    { feature: 'Documentos exigidos',            bad: 'CPF, RG, comprovante',      good: 'Apenas e-mail' },
    { feature: 'Suporte especializado',          bad: 'Tickets lentos',            good: 'WhatsApp 24/7' },
];

const FAQ = [
    { q: 'Preciso enviar documentos?',  a: 'Não. Apenas nome, e-mail e chave PIX. Zero burocracia.' },
    { q: 'Qual a taxa por transação?',  a: 'Taxa fixa e transparente. Sem mensalidade, sem cobranças escondidas.' },
    { q: 'Como recebo meu dinheiro?',   a: 'O saldo cai na sua conta DiretoPay em segundos. Saque quando quiser.' },
    { q: 'Preciso de CNPJ?',            a: 'Não. Pessoa física com CPF pode criar conta e vender imediatamente.' },
    { q: 'Posso integrar via API?',     a: 'Sim. API REST completa com documentação interativa, SDKs e webhooks.' },
];

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

export default function LandingPage() {
    const { isDark, toggleTheme } = useTheme();
    const [menuOpen,    setMenuOpen]    = useState(false);
    const [scrolled,    setScrolled]    = useState(false);
    const [tickerIdx,   setTickerIdx]   = useState(0);
    const [tickerVisible, setTickerVisible] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState(2348);
    const [activePlate, setActivePlate] = useState(0);
    const [loaded,      setLoaded]      = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => {
        const iv = setInterval(() => {
            setTickerVisible(false);
            setTimeout(() => { setTickerIdx(i => (i + 1) % TICKER.length); setTickerVisible(true); }, 320);
        }, 3200);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        const iv = setInterval(() => {
            setOnlineUsers(n => {
                const d = Math.random() > 0.4 ? Math.floor(Math.random() * 15) : -Math.floor(Math.random() * 8);
                const next = n + d;
                return next < 2100 ? n + 50 : next;
            });
        }, 5000);
        return () => clearInterval(iv);
    }, []);

    const ticker = TICKER[tickerIdx];

    return (
        <div className="min-h-screen bg-[#050709] text-white font-sans antialiased overflow-x-hidden">

            {/* Awwwards: Cursor + Noise + Loader */}
            <CustomCursor />
            <NoiseOverlay />
            {!loaded && <PageLoader onDone={() => setLoaded(true)} />}

            {/* Background: Aurora + Grid + Particles */}
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
                backgroundSize: '64px 64px',
            }} />
            <div className="fixed inset-0 pointer-events-none z-0">
                <AuroraBg />
            </div>
            <div className="fixed inset-0 pointer-events-none z-0">
                <Particles count={18} color="#10b981" className="opacity-30" />
            </div>
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{ background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(16,185,129,0.12) 0%, transparent 65%)' }} />

            {/* ── NAV ── */}
            <motion.nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#050709]/90 backdrop-blur-2xl border-b border-white/[0.07] shadow-xl shadow-black/30' : ''}`}>
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                    <Link to="/"><img src="/logo-diretopay.webp" alt="DiretoPay" className="h-8 sm:h-9 w-auto" /></Link>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(l => {
                            const Ico = l.icon;
                            const inner = <>{Ico && <Ico size={12} className="inline mr-1 opacity-70" />}{l.label}</>;
                            const cls = `text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-white/[0.05]`;
                            return l.external
                                ? <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                                : <a key={l.label} href={l.href} className={cls}>{inner}</a>;
                        })}
                    </div>

                    {/* Right: theme + auth */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* Theme toggle — like LunarPay's ☀ CLARO chip */}
                        <button onClick={toggleTheme}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-gray-300 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-3 py-1.5 transition-all">
                            {isDark ? <Sun size={12} /> : <Moon size={12} />}
                            <span>{isDark ? 'CLARO' : 'ESCURO'}</span>
                        </button>
                        <Link to="/login" className="text-[13px] font-medium text-gray-400 hover:text-white px-4 py-2 transition-colors">Login</Link>
                        <Link to="/register" className="text-[13px] font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-px">Cadastre-se</Link>
                    </div>

                    <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile full-screen menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-40 bg-[#050709] flex flex-col pt-20 px-6 pb-10 md:hidden">
                        <nav className="flex flex-col gap-1 mt-4">
                            {NAV_LINKS.map(l => {
                                const Ico = l.icon;
                                return (
                                    <a key={l.label} href={l.href} target={l.external ? '_blank' : undefined}
                                        rel={l.external ? 'noopener noreferrer' : undefined}
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center gap-2 py-3.5 px-4 rounded-2xl text-[14px] font-medium text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">
                                        {Ico && <Ico size={14} className="opacity-60" />}
                                        {l.label}
                                    </a>
                                );
                            })}
                        </nav>
                        <div className="mt-auto flex flex-col gap-3">
                            {/* Theme toggle mobile */}
                            <button onClick={toggleTheme}
                                className="flex items-center justify-center gap-2 py-3 text-[12px] font-bold text-gray-300 border border-white/10 rounded-2xl hover:border-white/20 transition-colors">
                                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                                {isDark ? 'Mudar para Claro' : 'Mudar para Escuro'}
                            </button>
                            <Link to="/login" onClick={() => setMenuOpen(false)}
                                className="text-center py-3 text-[13px] font-medium text-gray-300 border border-white/10 rounded-2xl hover:border-white/20 transition-colors">Login</Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)}
                                className="text-center py-4 text-[13px] font-semibold bg-emerald-500 text-white rounded-2xl hover:bg-emerald-400 transition-colors shadow-xl shadow-emerald-500/30">Cadastre-se</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── ANNOUNCEMENT BANNER ── */}
            <div className="relative z-10 flex justify-center pt-24 pb-2 px-5">
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.09] rounded-2xl px-5 py-3 backdrop-blur-xl shadow-xl shadow-black/30">
                    <MessageCircle size={14} className="text-emerald-400 shrink-0" />
                    <span className="text-[13px] text-gray-300 hidden sm:inline">Entre no canal oficial para novidades e avisos!</span>
                    <a href="https://wa.me/5551996148568" target="_blank" rel="noopener noreferrer"
                        className="text-[10px] font-black bg-white text-black px-3 py-1.5 rounded-lg tracking-widest hover:bg-gray-100 transition-colors whitespace-nowrap">ENTRAR AGORA</a>
                </motion.div>
            </div>

            {/* ── SOCIAL PROOF BADGE ── */}
            <div className="relative z-10 flex justify-center mt-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-2">
                    <div className="flex -space-x-2">
                        {['#10b981','#6366f1','#f59e0b','#0ea5e9'].map((c, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050709] flex items-center justify-center text-[8px] font-bold"
                                style={{ background: c }}>{['MR','AL','JS','CF'][i]}</div>
                        ))}
                    </div>
                    <span className="text-[12px] font-semibold text-gray-300">
                        +<span className="text-emerald-400">{onlineUsers.toLocaleString('pt-BR')}</span> vendedores ativos agora
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </motion.div>
            </div>

            {/* ── HERO ── */}
            <section id="sistema" className="relative z-10 pt-12 pb-20 px-5 overflow-hidden">
                <div className="absolute -top-32 -left-48 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }} />

                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-14 items-center">

                        {/* Left */}
                        <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                            <div className="mb-6">
                                <PulseBadge color="#10b981">+3.000 Sellers que confiam em nós</PulseBadge>
                            </div>
                            <h1 className="text-[42px] sm:text-[56px] font-black tracking-tight leading-[1.03] mb-5">
                                <ClipReveal delay={0.05}>
                                    A plataforma que escala com
                                </ClipReveal>
                                <ClipReveal delay={0.18}>
                                    <GradientText from="#10b981" to="#34d399">sua operação crescer!</GradientText>
                                </ClipReveal>
                            </h1>
                            <p className="text-[16px] text-gray-400 leading-relaxed mb-6 max-w-md">
                                Receba via PIX com <strong className="text-gray-200">aprovação instantânea</strong>. Sem burocracia, saques rápidos e <strong className="text-gray-200">total proteção</strong>.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {['Sem documentos','Sem CNPJ','Taxa fixa','Ativo em 2 min'].map(t => (
                                    <span key={t} className="flex items-center gap-1.5 text-[12px] text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                        <CheckCircle size={11} className="shrink-0" /> {t}
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 mb-10">
                                <MagneticButton className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-[15px] shadow-2xl shadow-emerald-500/30">
                                    <Link to="/register" className="flex items-center gap-2">Criar conta grátis <ArrowRight size={16} /></Link>
                                </MagneticButton>
                                <a href="#recursos"
                                    className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] text-gray-300 font-medium px-7 py-3.5 rounded-xl transition-all text-[15px]">
                                    Ver como funciona
                                </a>
                            </div>
                            {/* Benefit cards */}
                            <div className="grid grid-cols-3 gap-3">
                                {BENEFITS.map(({ icon: Icon, color, title, desc }) => (
                                    <motion.div key={title} whileHover={{ y: -4, scale: 1.02 }}
                                        className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 hover:border-white/[0.14] transition-all cursor-default">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                                            style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                                            <Icon size={15} style={{ color }} />
                                        </div>
                                        <p className="text-[12px] font-bold text-white mb-1">{title}</p>
                                        <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Right: floating 3D dashboard */}
                        <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
                            className="relative hidden lg:block">
                            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                                <div style={{ transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)' }} className="relative">
                                    <div className="rounded-3xl border border-white/[0.1] p-6 shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
                                        style={{ background: 'linear-gradient(145deg, rgba(20,20,25,0.98), rgba(10,10,15,0.99))' }}>
                                        <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.05]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                                                    style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)' }}>D</div>
                                                <div>
                                                    <p className="text-[11px] text-gray-500">Bem-vindo,</p>
                                                    <p className="text-[13px] font-bold">DiretoPay Seller 👋</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4">
                                                <p className="text-[10px] text-gray-500 mb-1">Faturamento Hoje</p>
                                                <p className="text-[20px] font-black text-emerald-400">R$ 12.450,00</p>
                                            </div>
                                            <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4">
                                                <p className="text-[10px] text-gray-500 mb-1">Vendas</p>
                                                <p className="text-[20px] font-black text-white">847</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/[0.02] rounded-xl p-4 h-20 flex items-end gap-1.5">
                                            {[40,65,45,80,55,90,70].map((h, i) => (
                                                <motion.div key={i}
                                                    initial={{ height: 0 }} animate={{ height: `${h}%` }}
                                                    transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
                                                    className="flex-1 rounded-sm"
                                                    style={{ background: i >= 5 ? 'linear-gradient(to top, #10b981, #34d399)' : 'rgba(16,185,129,0.2)' }} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Live ticker */}
                                    <AnimatePresence mode="wait">
                                        {tickerVisible && (
                                            <motion.div key={tickerIdx}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.3 }}
                                                className="absolute -bottom-5 -left-6 flex items-center gap-3 border border-white/[0.1] rounded-2xl px-4 py-3 backdrop-blur-xl shadow-2xl z-10"
                                                style={{ background: 'rgba(0,0,0,0.95)' }}>
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                                    style={{ background: 'linear-gradient(135deg, #10b981, #22c55e)' }}>
                                                    <CheckCircle size={16} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] text-gray-400">Venda realizada no Pix!</p>
                                                    <p className="text-[14px] font-bold text-white">Comissão: {ticker.value}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── MARQUEE ── */}
            <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.015] overflow-hidden py-5">
                <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Compatível com os maiores sistemas</p>
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #050709, transparent)' }} />
                    <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #050709, transparent)' }} />
                    <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        className="flex items-center gap-10 w-max">
                        {['Hotmart','Kiwify','Eduzz','Monetizze','Braip','Shopify','WooCommerce','Lastlink','Ticto','PerfectPay','Guru','Pepper',
                          'Hotmart','Kiwify','Eduzz','Monetizze','Braip','Shopify','WooCommerce','Lastlink','Ticto','PerfectPay','Guru','Pepper',
                        ].map((name, i) => (
                            <span key={i} className="text-[13px] font-black text-gray-500 whitespace-nowrap tracking-tight opacity-40 hover:opacity-80 transition-opacity cursor-default">{name}</span>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="relative z-10 border-b border-white/[0.06]">
                <div className="max-w-5xl mx-auto px-5 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map(({ to, prefix, suffix, label, note, decimals }, i) => (
                        <Reveal key={label} delay={i * 0.08} className="text-center">
                            <p className="text-[38px] sm:text-[48px] font-black tracking-tight tabular-nums"
                                style={{ background: 'linear-gradient(135deg, #fff 30%, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                <CountUp from={0} to={to} prefix={prefix} suffix={suffix} decimals={decimals} duration={2} />
                            </p>
                            <p className="text-[13px] font-bold text-gray-300 mt-1.5 uppercase tracking-wider">{label}</p>
                            <p className="text-[11px] text-gray-600 mt-0.5">{note}</p>
                        </Reveal>
                    ))}
                </div>
                {/* Awwwards marquee belt */}
                <div className="border-t border-white/[0.04] py-4">
                    <Marquee items={MARQUEE_ITEMS} speed={60} />
                </div>
            </section>

            {/* ── CONQUISTAS / PLACAS ── */}
            <section className="relative z-10 py-20 px-5 border-t border-white/[0.06]">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <SectionLabel number="02" label="Conquistas" />
                        <ClipReveal delay={0.05}>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                                Celebre suas <GradientText from="#f59e0b" to="#fbbf24">conquistas</GradientText>
                            </h2>
                        </ClipReveal>
                        <p className="text-gray-500 text-[14px] max-w-sm mx-auto">
                            Receba placas exclusivas ao atingir marcos de faturamento. Mostre ao mundo o seu sucesso!
                        </p>
                    </div>

                    {/* Carousel */}
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                        {/* Left: selector */}
                        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <p className={`text-[12px] font-black uppercase tracking-widest text-gray-500 mb-3`}>Ao você faturar</p>

                            {/* Amount box */}
                            <div className="inline-flex items-center justify-center border-2 border-emerald-500 rounded-2xl px-6 py-3 mb-6"
                                style={{ background: 'rgba(16,185,129,0.06)' }}>
                                <AnimatePresence mode="wait">
                                    <motion.p key={activePlate}
                                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-[32px] font-black text-emerald-400 leading-none">
                                        {PLATES[activePlate].amount}
                                    </motion.p>
                                </AnimatePresence>
                            </div>

                            {/* Description */}
                            <AnimatePresence mode="wait">
                                <motion.div key={`desc-${activePlate}`}
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex items-start gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <Trophy size={14} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Você recebe:</p>
                                        <p className="text-[14px] text-gray-300 leading-relaxed">{PLATES[activePlate].desc}</p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Dots */}
                            <div className="flex items-center gap-2">
                                {PLATES.map((_, i) => (
                                    <button key={i} onClick={() => setActivePlate(i)}
                                        className={`transition-all duration-300 rounded-full ${
                                            i === activePlate
                                                ? 'w-7 h-2.5 bg-emerald-500'
                                                : 'w-2.5 h-2.5 bg-white/15 hover:bg-white/30'
                                        }`} />
                                ))}
                            </div>
                        </motion.div>

                        {/* Right: plate card */}
                        <div className="flex justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div key={activePlate}
                                    initial={{ opacity: 0, scale: 0.88, rotateY: -12 }}
                                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, scale: 0.88, rotateY: 12 }}
                                    transition={{ duration: 0.38, ease: [0.22,1,0.36,1] }}
                                    className="relative w-[240px] sm:w-[270px] rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                                    style={{ aspectRatio: '3/4', background: 'linear-gradient(145deg, #0c2d1a 0%, #061510 60%, #030c08 100%)' }}>

                                    {/* Hex grid bg */}
                                    <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='60' viewBox='0 0 52 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='26,2 50,15 50,45 26,58 2,45 2,15' fill='none' stroke='%2310b981' stroke-width='1.5'/%3E%3C/svg%3E")`, backgroundSize: '52px 60px' }} />

                                    {/* Radial glow */}
                                    <div className="absolute inset-0 pointer-events-none"
                                        style={{ background: 'radial-gradient(circle at 50% 38%, rgba(16,185,129,0.30) 0%, transparent 58%)' }} />

                                    {/* Top shimmer */}
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent" />

                                    {/* Content */}
                                    <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center gap-0">
                                        {/* Trophy icon */}
                                        <div className="w-14 h-14 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 flex items-center justify-center mb-5">
                                            <Trophy size={26} className="text-emerald-400" />
                                        </div>

                                        <p className="text-[9px] font-black text-emerald-300/50 tracking-[0.38em] uppercase mb-3">PARABÉNS</p>

                                        <p className="text-[62px] font-black text-white leading-none tracking-tight mb-1">
                                            {PLATES[activePlate].amount}
                                        </p>

                                        <p className="text-[9px] font-black text-emerald-300/50 tracking-[0.38em] uppercase">FATURADOS</p>

                                        {/* Logo */}
                                        <div className="mt-auto pt-10">
                                            <img src="/logo-diretopay.webp" alt="DiretoPay" className="h-4 opacity-25 mx-auto" />
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Social proof */}
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="mt-10 text-center">
                        <p className="text-[13px] text-gray-500">
                            <Trophy size={12} className="inline mr-1 text-emerald-400" />
                            Mais de <span className="text-emerald-400 font-bold">500 peças</span> já entregues para nossos sellers!
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── DEPOIMENTOS ── */}
            <section id="recursos" className="relative z-10 py-20 px-5 border-t border-white/[0.06]">
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-4">
                            <Star size={12} fill="currentColor" /> O que nossos sellers dizem
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Resultados reais de quem usa</h2>
                        <p className="text-gray-500 text-[14px]">Sellers de todo o Brasil já faturam com a DiretoPay.</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-5">
                        {TESTIMONIALS.map(({ initials, name, role, revenue, stars, text }, i) => (
                            <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                                whileHover={{ y: -6 }}
                                className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 flex flex-col gap-4 cursor-default hover:border-white/[0.16] transition-all">
                                {/* Stars */}
                                <div className="flex gap-1">
                                    {Array.from({ length: stars }).map((_, si) => (
                                        <Star key={si} size={12} className="text-yellow-400" fill="currentColor" />
                                    ))}
                                </div>
                                {/* Quote */}
                                <p className="text-[14px] text-gray-300 leading-relaxed flex-1">"{text}"</p>
                                {/* Footer */}
                                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)' }}>{initials}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-bold text-white">{name}</p>
                                        <p className="text-[11px] text-gray-500">{role}</p>
                                    </div>
                                    <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg shrink-0">{revenue}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── COMPARISON ── */}
            <section className="relative z-10 py-20 px-5 border-t border-white/[0.06]">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-4">
                            <ShieldCheck size={13} /> Comparativo
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Por que escolher a DiretoPay?</h2>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="rounded-2xl border border-white/[0.08] overflow-hidden">
                        <div className="grid grid-cols-3 bg-white/[0.03] border-b border-white/[0.08] px-5 py-3">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Recurso</span>
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Outras plataformas</span>
                            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider text-center">DiretoPay</span>
                        </div>
                        {COMPARISON.map(({ feature, bad, good }, i) => (
                            <div key={i} className="grid grid-cols-3 px-5 py-4 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
                                <span className="text-[13px] font-semibold text-gray-300 self-center">{feature}</span>
                                <span className="text-[12px] text-red-400 text-center self-center">{bad}</span>
                                <div className="flex items-center justify-center gap-1.5">
                                    <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                                    <span className="text-[12px] font-bold text-emerald-400">{good}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="relative z-10 py-20 px-5 border-t border-white/[0.06]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Como funciona</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Comece em 4 passos</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { n:'01', icon: Lock,       t:'Crie sua conta',       d:'Cadastro gratuito em 2 minutos. Sem documentos.' },
                            { n:'02', icon: QrCode,     t:'Cadastre seu produto', d:'Aprovação instantânea. Sem burocracia.' },
                            { n:'03', icon: TrendingUp, t:'Comece a vender',      d:'Compartilhe o link do checkout e venda agora.' },
                            { n:'04', icon: DollarSign, t:'Saque na hora',        d:'Saldo disponível a qualquer momento no seu PIX.' },
                        ].map(({ n, icon: Icon, t, d }, i) => (
                            <motion.div key={n} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                                whileHover={{ y: -6 }}
                                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 group hover:border-white/[0.14] transition-all cursor-default">
                                <div className="relative inline-block mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300">
                                        <Icon size={20} className="text-emerald-400" />
                                    </div>
                                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black text-emerald-400 bg-[#050709] border border-emerald-500/30 rounded-full w-5 h-5 flex items-center justify-center">{n}</span>
                                </div>
                                <h3 className="text-[14px] font-bold text-white mb-2">{t}</h3>
                                <p className="text-[12px] text-gray-500 leading-relaxed">{d}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── RANKING ── */}
            <section className="relative z-10 py-20 px-5 border-t border-white/[0.06]" style={{ background: 'linear-gradient(180deg, rgba(16,185,129,0.02), transparent)' }}>
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-4">
                            <Flame size={13} /> Competição Mensal
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Na DiretoPay, sua performance importa!</h2>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/80 backdrop-blur-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Trophy size={22} className="text-yellow-400" />
                                <h3 className="text-[15px] font-bold">Top Sellers — Junho 2025</h3>
                            </div>
                            <div className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[11px] font-bold px-3 py-1.5 rounded-full">Prêmios mensais</div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {RANKING.map(({ initials, name, sales, amount, pos }, i) => (
                                <motion.div key={pos} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                                    whileHover={{ x: 6 }}
                                    className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-4 hover:bg-white/[0.06] transition-all cursor-default">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[14px] shrink-0"
                                        style={{ background: `${POS_COLORS[i]}22`, color: POS_COLORS[i] }}>{pos}</div>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[12px] shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)' }}>{initials}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-white">{name}</p>
                                        <p className="text-[11px] text-gray-500">{sales.toLocaleString('pt-BR')} vendas este mês</p>
                                    </div>
                                    <p className="text-[14px] font-black text-emerald-400 shrink-0">{amount}</p>
                                </motion.div>
                            ))}
                        </div>
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

            {/* ── SOBRE ── */}
            <section id="sobre" className="relative z-10 py-16 px-5 border-t border-white/[0.06]">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-8 sm:p-12 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                            <Users size={22} className="text-emerald-400" />
                        </div>
                        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-3">Sobre nós</p>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">Feito por vendedores, para vendedores.</h2>
                        <p className="text-gray-400 text-[15px] leading-relaxed max-w-xl mx-auto mb-7">
                            A DiretoPay é uma plataforma de pagamentos PIX focada em <strong className="text-gray-200">vendedores digitais brasileiros</strong>. Zero burocracia, aprovação imediata e saque na hora.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <a href="https://instagram.com/diretopay_" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[12px] font-bold text-gray-400 hover:text-pink-400 transition-colors border border-white/10 hover:border-pink-500/30 px-4 py-2.5 rounded-xl">
                                <Instagram size={13} /> @diretopay_
                            </a>
                            <a href="https://wa.me/5551996148568" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[12px] font-bold text-gray-400 hover:text-emerald-400 transition-colors border border-white/10 hover:border-emerald-500/30 px-4 py-2.5 rounded-xl">
                                <MessageCircle size={13} /> WhatsApp Suporte
                            </a>
                        </div>
                    </motion.div>
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
                    <p className="text-gray-400 text-[16px] mb-9 max-w-md mx-auto">Sem documentos. Sem burocracia. Ativo em menos de 2 minutos.</p>
                    <Link to="/register"
                        className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-2xl transition-all text-[16px] shadow-2xl shadow-emerald-500/35 hover:-translate-y-0.5">
                        Criar minha conta grátis <ArrowRight size={18} />
                    </Link>
                    <p className="text-[12px] text-gray-600 mt-5">Taxa fixa · Saque a qualquer hora · Sem CNPJ</p>
                </motion.div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="relative z-10 border-t border-white/[0.06] py-12 px-5">
                <div className="max-w-5xl mx-auto">
                    <div className="grid sm:grid-cols-4 gap-10 mb-10">
                        <div className="sm:col-span-1">
                            <img src="/logo-diretopay.webp" alt="DiretoPay" className="h-7 w-auto opacity-70 hover:opacity-100 transition-opacity mb-3" />
                            <p className="text-[12px] text-gray-500 leading-relaxed mb-4">Plataforma de pagamentos PIX para vendedores digitais.</p>
                            <div className="flex flex-wrap gap-2">
                                <a href="https://instagram.com/diretopay_" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-pink-400 transition-colors px-2.5 py-1.5 rounded-lg border border-white/[0.06] hover:border-pink-500/25">
                                    <Instagram size={11} /> @diretopay_
                                </a>
                                <a href="https://wa.me/5551996148568" target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-lg border border-white/[0.06] hover:border-emerald-500/25">
                                    <MessageCircle size={11} /> Suporte
                                </a>
                            </div>
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-gray-300 uppercase tracking-wider mb-4">Atalhos</p>
                            {[['Criar conta','/register'],['Login','/login'],['API & Docs','/docs'],['Dashboard','/dashboard']].map(([l,h]) => (
                                <Link key={l} to={h} className="block text-[13px] text-gray-500 hover:text-gray-200 transition-colors mb-2">{l}</Link>
                            ))}
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-gray-300 uppercase tracking-wider mb-4">Legal</p>
                            {[['Termos de Uso','/termos'],['Privacidade','/privacidade'],['Sobre nós','/sobre']].map(([l,h]) => (
                                <a key={l} href={h} className="block text-[13px] text-gray-500 hover:text-gray-200 transition-colors mb-2">{l}</a>
                            ))}
                        </div>
                        <div>
                            <p className="text-[12px] font-bold text-gray-300 uppercase tracking-wider mb-4">Contato</p>
                            <a href="https://wa.me/5551996148568" target="_blank" rel="noopener noreferrer"
                                className="block text-[13px] text-gray-500 hover:text-emerald-400 transition-colors mb-2">WhatsApp Suporte</a>
                            <a href="https://instagram.com/diretopay_" target="_blank" rel="noopener noreferrer"
                                className="block text-[13px] text-gray-500 hover:text-pink-400 transition-colors mb-2">Instagram</a>
                            <a href="mailto:suporte@diretopay.site"
                                className="block text-[13px] text-gray-500 hover:text-gray-200 transition-colors">E-mail</a>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/[0.05]">
                        <p className="text-[11px] text-gray-600">© {new Date().getFullYear()} DiretoPay. Todos os direitos reservados.</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                            <MapPin size={11} />
                            Av. Paulista, 1374 — Bela Vista, São Paulo - SP
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
