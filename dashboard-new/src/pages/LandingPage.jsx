import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Zap, ShieldCheck, BarChart3, ArrowRight, CheckCircle,
    QrCode, Webhook, Globe, Clock, TrendingUp, Star,
    ChevronDown, Menu, X, DollarSign, RefreshCw, Lock,
} from 'lucide-react';

const P = '#10b981';

const NAV_LINKS = [
    { label: 'Produto',    href: '#produto' },
    { label: 'Recursos',   href: '#recursos' },
    { label: 'Preços',     href: '#precos' },
    { label: 'Perguntas',  href: '#faq' },
];

const FEATURES = [
    { icon: Zap,        color: '#10b981', title: 'PIX Instantâneo',       desc: 'Cobranças geradas em menos de 200ms com QR Code e copia-e-cola.' },
    { icon: Webhook,    color: '#6366f1', title: 'Webhooks em Tempo Real', desc: 'Notificações automáticas para seu sistema assim que o pagamento cair.' },
    { icon: BarChart3,  color: '#f59e0b', title: 'Dashboard Completo',     desc: 'Relatórios, gráficos e métricas de venda em um só lugar.' },
    { icon: ShieldCheck,color: '#0ea5e9', title: 'Antifraude Nativo',      desc: 'Proteção multicamada contra chargebacks e acessos suspeitos.' },
    { icon: Globe,      color: '#ec4899', title: 'Checkout Personalizado', desc: 'Crie páginas de checkout com sua marca sem programar.' },
    { icon: RefreshCw,  color: '#a855f7', title: 'Cobranças Recorrentes',  desc: 'Assinaturas e planos mensais gerenciados automaticamente.' },
];

const STATS = [
    { value: 'R$ 0',    label: 'Custo de abertura',  note: 'grátis para começar' },
    { value: '200ms',   label: 'Tempo médio de PIX',  note: 'geração de cobrança' },
    { value: '99.97%',  label: 'Uptime garantido',    note: 'SLA mensal' },
    { value: '24/7',    label: 'Suporte ativo',        note: 'via chat e Telegram' },
];

const PLANS = [
    {
        name: 'Starter',
        price: 'Grátis',
        sub: 'Para começar',
        highlight: false,
        features: ['Cobranças PIX ilimitadas', 'Checkout básico', 'Webhook básico', 'Dashboard padrão'],
        cta: 'Criar conta grátis',
    },
    {
        name: 'Pro',
        price: '1,49%',
        sub: 'por transação aprovada',
        highlight: true,
        features: ['Tudo do Starter', 'Checkout personalizado', 'Assinaturas recorrentes', 'Relatórios avançados', 'Suporte prioritário'],
        cta: 'Começar grátis',
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        sub: 'volume alto',
        highlight: false,
        features: ['Tudo do Pro', 'Taxa negociada', 'Gerente dedicado', 'SLA premium', 'Integrações customizadas'],
        cta: 'Falar com vendas',
    },
];

const FAQ = [
    { q: 'Como recebo meu dinheiro?',         a: 'O saldo cai na sua conta DiretoPay em segundos após o pagamento. Você solicita o saque a qualquer momento e o PIX chega na hora.' },
    { q: 'Preciso de CNPJ para abrir conta?', a: 'Não. Pessoas físicas podem criar uma conta e começar a vender imediatamente com CPF.' },
    { q: 'Qual a taxa cobrada?',               a: 'A taxa padrão é de 1,49% por transação aprovada. Nenhuma mensalidade, nenhuma cobrança escondida.' },
    { q: 'Posso integrar via API?',            a: 'Sim. Temos API REST completa com documentação interativa, SDKs e webhooks para todos os eventos.' },
];

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/[0.06] last:border-0">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between py-5 text-left gap-4">
                <span className="text-[15px] font-semibold text-white">{q}</span>
                <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <p className="text-[14px] text-gray-400 pb-5 leading-relaxed">{a}</p>
            )}
        </div>
    );
}

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#080a0e] text-white font-sans antialiased">

            {/* ── NAV ── */}
            <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#080a0e]/90 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <Zap size={14} className="text-white" fill="white" />
                        </div>
                        <span className="text-[16px] font-black tracking-tight">
                            Direto<span className="text-emerald-500">Pay</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        {NAV_LINKS.map(l => (
                            <a key={l.label} href={l.href}
                                className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors">
                                {l.label}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/login"
                            className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors px-3 py-1.5">
                            Entrar
                        </Link>
                        <Link to="/register"
                            className="text-[13px] font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-lg transition-all">
                            Começar grátis
                        </Link>
                    </div>

                    <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-2 text-gray-400">
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {menuOpen && (
                    <div className="md:hidden border-t border-white/[0.06] bg-[#080a0e] px-5 py-4 space-y-2">
                        {NAV_LINKS.map(l => (
                            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                                className="block py-2 text-[14px] text-gray-400 hover:text-white transition-colors">
                                {l.label}
                            </a>
                        ))}
                        <div className="pt-3 flex flex-col gap-2">
                            <Link to="/login" className="text-center py-2 text-[14px] font-medium text-gray-300 border border-white/10 rounded-lg">Entrar</Link>
                            <Link to="/register" className="text-center py-2 text-[14px] font-semibold bg-emerald-500 text-white rounded-lg">Começar grátis</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* ── HERO ── */}
            <section className="pt-40 pb-24 px-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
                        style={{ background: 'radial-gradient(ellipse, #10b981 0%, transparent 70%)' }} />
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    className="relative z-10 max-w-3xl mx-auto">

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[12px] font-semibold mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Plataforma de pagamentos PIX
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] mb-6">
                        Receba pagamentos
                        <br />
                        <span className="text-emerald-500">sem complicação.</span>
                    </h1>

                    <p className="text-[16px] sm:text-[18px] text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto">
                        Crie cobranças PIX, checkouts personalizados e gerencie toda sua operação financeira em um único lugar.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link to="/register"
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-all text-[15px] w-full sm:w-auto justify-center">
                            Criar conta grátis <ArrowRight size={16} />
                        </Link>
                        <Link to="/demo"
                            className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium px-6 py-3 rounded-xl transition-all text-[15px] w-full sm:w-auto justify-center">
                            Ver demonstração
                        </Link>
                    </div>

                    <p className="text-[12px] text-gray-600 mt-5">Sem mensalidade · Sem cartão de crédito · Grátis para começar</p>
                </motion.div>
            </section>

            {/* ── STATS ── */}
            <section className="border-y border-white/[0.06] bg-white/[0.02]">
                <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map(({ value, label, note }) => (
                        <motion.div key={label}
                            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.4 }}
                            className="text-center">
                            <p className="text-[28px] sm:text-[36px] font-black text-white tracking-tight">{value}</p>
                            <p className="text-[13px] font-semibold text-gray-300 mt-1">{label}</p>
                            <p className="text-[11px] text-gray-600 mt-0.5">{note}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── PRODUCT PREVIEW ── */}
            <section id="produto" className="py-24 px-5">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-[12px] font-semibold text-emerald-500 uppercase tracking-widest mb-3">Produto</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Tudo que você precisa para vender</h2>
                        <p className="text-gray-400 mt-3 text-[15px] max-w-lg mx-auto">Uma plataforma completa do QR Code ao relatório financeiro.</p>
                    </div>

                    {/* Mock dashboard card */}
                    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="rounded-2xl border border-white/[0.08] bg-[#0d1117] overflow-hidden shadow-2xl">
                        {/* Window bar */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                            <div className="w-3 h-3 rounded-full bg-red-500/40" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                            <div className="flex-1 mx-4">
                                <div className="bg-white/5 rounded-md h-5 w-48 flex items-center px-2">
                                    <span className="text-[10px] text-gray-500">app.diretopay.site/dashboard</span>
                                </div>
                            </div>
                        </div>
                        {/* Dashboard mockup */}
                        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Saldo',          value: 'R$ 4.820,00', color: '#10b981', icon: DollarSign },
                                { label: 'Hoje',           value: 'R$ 340,00',   color: '#6366f1', icon: TrendingUp },
                                { label: 'Transações',     value: '127',         color: '#f59e0b', icon: QrCode },
                                { label: 'Taxa aprovação', value: '97,3%',       color: '#0ea5e9', icon: CheckCircle },
                            ].map(({ label, value, color, icon: Icon }) => (
                                <div key={label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
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
                        <div className="px-6 pb-6">
                            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                                    <span className="text-[12px] font-semibold text-gray-300">Transações recentes</span>
                                    <span className="text-[10px] text-emerald-500 font-medium">Ver todas</span>
                                </div>
                                {[
                                    { name: 'João Silva',    val: '+R$ 129,90', status: 'Pago',      c: 'text-emerald-400' },
                                    { name: 'Maria Souza',  val: '+R$ 59,90',  status: 'Pago',      c: 'text-emerald-400' },
                                    { name: 'Pedro Costa',  val: 'R$ 199,00',  status: 'Pendente',  c: 'text-yellow-400' },
                                ].map((t, i) => (
                                    <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center text-[11px] font-bold text-gray-400">
                                                {t.name[0]}
                                            </div>
                                            <span className="text-[12px] text-gray-300">{t.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-semibold ${t.c}`}>{t.status}</span>
                                            <span className="text-[13px] font-semibold text-white">{t.val}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="recursos" className="py-24 px-5 border-t border-white/[0.06]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[12px] font-semibold text-emerald-500 uppercase tracking-widest mb-3">Recursos</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Infraestrutura para escalar</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
                            <motion.div key={title}
                                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
                                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.14] transition-all group">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
                                    <Icon size={17} style={{ color }} />
                                </div>
                                <h3 className="text-[14px] font-bold text-white mb-1.5">{title}</h3>
                                <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-24 px-5 border-t border-white/[0.06]">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[12px] font-semibold text-emerald-500 uppercase tracking-widest mb-3">Como funciona</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">3 passos para começar</h2>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-8">
                        {[
                            { step: '01', icon: Lock,       title: 'Crie sua conta',    desc: 'Cadastro 100% gratuito em menos de 2 minutos. Sem burocracia.' },
                            { step: '02', icon: QrCode,     title: 'Gere seu PIX',      desc: 'Configure sua chave PIX e comece a receber cobranças imediatamente.' },
                            { step: '03', icon: DollarSign, title: 'Saque quando quiser', desc: 'Seu saldo fica disponível para saque a qualquer momento, sem taxas ocultas.' },
                        ].map(({ step, icon: Icon, title, desc }) => (
                            <motion.div key={step}
                                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.4 }}
                                className="relative text-center">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                                    <Icon size={20} className="text-emerald-400" />
                                </div>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[10px] font-black text-emerald-500/50 tracking-widest">{step}</div>
                                <h3 className="text-[15px] font-bold text-white mb-2">{title}</h3>
                                <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="precos" className="py-24 px-5 border-t border-white/[0.06]">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[12px] font-semibold text-emerald-500 uppercase tracking-widest mb-3">Preços</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Simples e transparente</h2>
                        <p className="text-gray-400 mt-3 text-[15px]">Pague apenas quando vender. Zero mensalidade.</p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {PLANS.map(({ name, price, sub, highlight, features, cta }) => (
                            <motion.div key={name}
                                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.4 }}
                                className={`rounded-2xl p-6 border flex flex-col ${
                                    highlight
                                        ? 'border-emerald-500/40 bg-emerald-500/5'
                                        : 'border-white/[0.07] bg-white/[0.02]'
                                }`}>
                                {highlight && (
                                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                        <Star size={10} fill="currentColor" /> Mais popular
                                    </div>
                                )}
                                <h3 className="text-[16px] font-bold text-white mb-1">{name}</h3>
                                <div className="flex items-baseline gap-1.5 mb-1">
                                    <span className="text-[28px] font-black text-white">{price}</span>
                                </div>
                                <p className="text-[12px] text-gray-500 mb-6">{sub}</p>
                                <ul className="space-y-3 flex-1 mb-6">
                                    {features.map(f => (
                                        <li key={f} className="flex items-start gap-2.5">
                                            <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                            <span className="text-[13px] text-gray-300">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/register"
                                    className={`w-full text-center py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                                        highlight
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                                            : 'border border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
                                    }`}>
                                    {cta}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="py-24 px-5 border-t border-white/[0.06]">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[12px] font-semibold text-emerald-500 uppercase tracking-widest mb-3">FAQ</p>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Perguntas frequentes</h2>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl px-6">
                        {FAQ.map(item => <FaqItem key={item.q} {...item} />)}
                    </div>
                </div>
            </section>

            {/* ── CTA FINAL ── */}
            <section className="py-24 px-5 border-t border-white/[0.06]">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-6">
                        <Zap size={24} className="text-white" fill="white" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                        Pronto para escalar?
                    </h2>
                    <p className="text-gray-400 text-[15px] mb-8 max-w-md mx-auto">
                        Junte-se a vendedores que já confiam na DiretoPay para processar seus pagamentos.
                    </p>
                    <Link to="/register"
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-[15px]">
                        Criar conta grátis <ArrowRight size={16} />
                    </Link>
                    <p className="text-[12px] text-gray-600 mt-4">Sem cartão de crédito · Comece em 2 minutos</p>
                </motion.div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-white/[0.06] py-10 px-5">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
                            <Zap size={12} className="text-white" fill="white" />
                        </div>
                        <span className="text-[14px] font-black">Direto<span className="text-emerald-500">Pay</span></span>
                    </div>
                    <p className="text-[12px] text-gray-600">© {new Date().getFullYear()} DiretoPay. Todos os direitos reservados.</p>
                    <div className="flex items-center gap-5">
                        <Link to="/login"    className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors">Entrar</Link>
                        <Link to="/register" className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors">Criar conta</Link>
                        <Link to="/docs"     className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors">Docs</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
