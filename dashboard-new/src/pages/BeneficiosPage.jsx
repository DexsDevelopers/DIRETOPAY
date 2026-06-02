import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Zap, ShieldCheck, BarChart3, QrCode, Webhook, Globe,
    TrendingUp, RefreshCw, Lock, CheckCircle, ArrowRight, X,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { AuroraBg, DotGrid, Particles, ShimmerButton, FeatureCard, GlowCard, GradientText, PulseBadge, SplitText } from '../components/AnimatedUI';

const FEATURES = [
    { icon: Zap,        color: '#10b981', title: 'PIX Instantâneo',        desc: 'Gere cobranças em milissegundos. Confirmação em tempo real sem refresh.' },
    { icon: Webhook,    color: '#6366f1', title: 'Webhooks em tempo real',  desc: 'Notificações automáticas ao seu sistema assim que o pagamento cai.' },
    { icon: BarChart3,  color: '#f59e0b', title: 'Dashboard & Relatórios',  desc: 'Visualize receita, conversão e tendências num painel claro e rápido.' },
    { icon: QrCode,     color: '#ec4899', title: 'Checkout personalizado',   desc: 'Crie páginas de venda com sua marca e cores sem precisar de dev.' },
    { icon: RefreshCw,  color: '#06b6d4', title: 'Assinaturas recorrentes', desc: 'Cobra mensalidades e planos automáticos com gestão completa.' },
    { icon: Globe,      color: '#8b5cf6', title: 'API REST completa',        desc: 'Integre em qualquer stack com nossa API documentada e SDKs prontos.' },
    { icon: ShieldCheck,color: '#10b981', title: 'Antifraude nativo',        desc: 'Detecção automática de transações suspeitas sem custo adicional.' },
    { icon: TrendingUp, color: '#f97316', title: 'Saque em D+0',             desc: 'Receba suas vendas na conta no mesmo dia, sem burocracias.' },
    { icon: Lock,       color: '#a855f7', title: 'Sem documentos',           desc: 'Abra sua conta em 2 minutos. Sem CNPJ, sem análise demorada.' },
];

const COMPARISON = [
    { feature: 'Taxa por transação',    dp: '1,49%',        other: '2% ~ 5%' },
    { feature: 'Mensalidade',           dp: 'Grátis',       other: 'R$ 99 ~ R$ 499' },
    { feature: 'Saque',                 dp: 'D+0',          other: 'D+1 ~ D+30' },
    { feature: 'Sem CNPJ',             dp: true,           other: false },
    { feature: 'API REST',              dp: true,           other: 'Pago' },
    { feature: 'Checkout personalizado',dp: true,           other: 'Pago' },
    { feature: 'Webhooks',              dp: true,           other: 'Limitado' },
    { feature: 'Suporte 24/7',          dp: true,           other: false },
];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.45, delay },
});

export default function BeneficiosPage() {
    return (
        <PublicLayout>
            {/* Hero */}
            <section className="relative py-28 px-5 text-center overflow-hidden">
                <AuroraBg />
                <DotGrid />
                <Particles count={20} color="#10b981" className="opacity-50" />
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.12), transparent 70%)' }} />
                <motion.div {...fadeUp()} className="relative z-10">
                    <div className="flex justify-center mb-6">
                        <PulseBadge color="#10b981">Por que a DiretoPay?</PulseBadge>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                        Infraestrutura de pagamentos<br />
                        <GradientText from="#10b981" to="#34d399">que escala com você</GradientText>
                    </h1>
                    <p className="text-gray-400 text-[16px] max-w-xl mx-auto mb-8">
                        Sem burocracia, sem mensalidade, sem surpresas. Tudo que você precisa para vender mais e sacar rápido.
                    </p>
                    <ShimmerButton
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-px">
                        <Link to="/register" className="flex items-center gap-2">Criar conta grátis <ArrowRight size={16} /></Link>
                    </ShimmerButton>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="px-5 pb-20 border-t border-white/[0.06] pt-16">
                <div className="max-w-5xl mx-auto">
                    <motion.div {...fadeUp()} className="text-center mb-12">
                        <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Recursos</p>
                        <h2 className="text-3xl font-black tracking-tight">Tudo incluso. Sem custo extra.</h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map(({ icon, color, title, desc }, i) => (
                            <FeatureCard key={title} icon={icon} color={color} title={title} desc={desc} delay={i * 0.06} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison */}
            <section className="px-5 pb-20 border-t border-white/[0.06] pt-16"
                style={{ background: 'linear-gradient(180deg, rgba(16,185,129,0.02), transparent)' }}>
                <div className="max-w-3xl mx-auto">
                    <motion.div {...fadeUp()} className="text-center mb-10">
                        <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Comparativo</p>
                        <h2 className="text-3xl font-black tracking-tight">DiretoPay vs. outras plataformas</h2>
                    </motion.div>
                    <motion.div {...fadeUp(0.1)} className="rounded-2xl border border-white/[0.08] overflow-hidden">
                        <div className="grid grid-cols-3 bg-white/[0.04] border-b border-white/[0.06] px-5 py-3">
                            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Recurso</span>
                            <span className="text-[12px] font-bold text-emerald-400 uppercase tracking-wider text-center">DiretoPay</span>
                            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider text-center">Concorrentes</span>
                        </div>
                        {COMPARISON.map(({ feature, dp, other }, i) => (
                            <div key={feature} className={`grid grid-cols-3 px-5 py-3.5 border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                                <span className="text-[13px] text-gray-300">{feature}</span>
                                <span className="text-center">
                                    {typeof dp === 'boolean'
                                        ? (dp ? <CheckCircle size={15} className="text-emerald-400 mx-auto" /> : <X size={15} className="text-red-500/60 mx-auto" />)
                                        : <span className="text-[13px] font-bold text-emerald-400">{dp}</span>}
                                </span>
                                <span className="text-center">
                                    {typeof other === 'boolean'
                                        ? (other ? <CheckCircle size={15} className="text-gray-400 mx-auto" /> : <X size={15} className="text-red-500/60 mx-auto" />)
                                        : <span className="text-[13px] text-gray-500">{other}</span>}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-5 py-24 border-t border-white/[0.06] text-center overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(16,185,129,0.10), transparent)' }} />
                <motion.div {...fadeUp()} className="relative max-w-lg mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                        Pronto para começar a vender?
                    </h2>
                    <p className="text-gray-400 mb-8">Crie sua conta em 2 minutos. Sem cartão, sem CNPJ, sem burocracia.</p>
                    <ShimmerButton className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-emerald-500/30 hover:-translate-y-px text-[15px]">
                        <Link to="/register" className="flex items-center gap-2">Começar agora — é grátis <ArrowRight size={16} /></Link>
                    </ShimmerButton>
                </motion.div>
            </section>
        </PublicLayout>
    );
}
