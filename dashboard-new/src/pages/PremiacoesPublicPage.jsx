import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowRight, CheckCircle, Gem, Crown, Flame, Award } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const PLATES = [
    {
        amount: '10K',
        full: 'R$ 10.000',
        desc: 'Sua primeira prova de que o jogo é real. Você saiu do zero e mostrou que é possível.',
        perks: ['Placa física personalizada', 'Entrega no seu endereço', 'Certificado digital de seller'],
        icon: Star,
        color: '#10b981',
        glow: 'rgba(16,185,129,0.3)',
        badge: 'STARTER',
    },
    {
        amount: '50K',
        full: 'R$ 50.000',
        desc: 'Você mostrou consistência. Meio mercado te conhece e o dinheiro responde.',
        perks: ['Placa prata 50K exclusiva', 'Destaque no ranking DiretoPay', 'Acesso a grupo VIP de sellers'],
        icon: Award,
        color: '#f59e0b',
        glow: 'rgba(245,158,11,0.3)',
        badge: 'SILVER',
    },
    {
        amount: '100K',
        full: 'R$ 100.000',
        desc: 'Seis dígitos. Você é parte de um grupo seleto que realmente escala no digital.',
        perks: ['Placa de metal dourada 100K', 'Gerente de contas exclusivo', 'Acesso VIP a novos recursos beta'],
        icon: Gem,
        color: '#6366f1',
        glow: 'rgba(99,102,241,0.3)',
        badge: 'GOLD',
    },
    {
        amount: '500K',
        full: 'R$ 500.000',
        desc: 'Meio milhão. Sua operação virou uma verdadeira máquina de faturamento.',
        perks: ['Placa platina 500K premium', 'Suporte prioritário 24/7', 'Taxas operacionais reduzidas'],
        icon: Crown,
        color: '#ec4899',
        glow: 'rgba(236,72,153,0.3)',
        badge: 'PLATINUM',
    },
    {
        amount: '1M',
        full: 'R$ 1.000.000',
        desc: 'O clube do milhão. Performance, consistência e mentalidade de elite.',
        perks: ['Placa diamante 1M edição especial', 'Gerente executivo dedicado', 'Benefícios exclusivos vitalícios'],
        icon: Flame,
        color: '#f97316',
        glow: 'rgba(249,115,22,0.4)',
        badge: 'DIAMANTE',
    },
];

const STEPS = [
    { n: '01', title: 'Crie sua conta',     desc: 'Cadastro em 2 minutos, sem CNPJ, sem burocracia.' },
    { n: '02', title: 'Comece a vender',    desc: 'Gere cobranças PIX e receba na hora.' },
    { n: '03', title: 'Bata a meta',        desc: 'Acompanhe seu progresso no dashboard em tempo real.' },
    { n: '04', title: 'Ganhe sua placa',    desc: 'Receba a placa física em casa e entre para o ranking.' },
];

export default function PremiacoesPublicPage() {
    const [active, setActive] = useState(0);
    const plate = PLATES[active];
    const PlateIcon = plate.icon;

    return (
        <PublicLayout>
            {/* Hero */}
            <section className="py-24 px-5 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-6">
                        <Trophy size={12} /> Programa de Premiações
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                        Vença metas.<br />
                        <span className="text-emerald-400">Ganhe sua placa.</span>
                    </h1>
                    <p className="text-gray-400 text-[16px] max-w-xl mx-auto">
                        Na DiretoPay, cada conquista de faturamento vira uma placa física entregue na sua casa.
                        Do 10K ao 1M — qual será a sua?
                    </p>
                </motion.div>
            </section>

            {/* Plate selector */}
            <section className="px-5 pb-20 border-t border-white/[0.06] pt-16">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Conquistas disponíveis</p>
                        <h2 className="text-3xl font-black tracking-tight">Escolha sua próxima meta</h2>
                    </div>

                    {/* Plate amount buttons */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {PLATES.map((p, i) => (
                            <motion.button key={p.amount} onClick={() => setActive(i)}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                                className={`px-5 py-2.5 rounded-xl text-[13px] font-black border transition-all ${active === i
                                    ? 'text-white border-transparent'
                                    : 'text-gray-400 border-white/10 hover:border-white/20 hover:text-white bg-white/[0.02]'}`}
                                style={active === i ? { background: `linear-gradient(135deg, ${p.color}30, ${p.color}15)`, borderColor: `${p.color}50`, color: p.color, boxShadow: `0 0 20px ${p.glow}` } : {}}>
                                {p.full}
                            </motion.button>
                        ))}
                    </div>

                    {/* Plate card */}
                    <AnimatePresence mode="wait">
                        <motion.div key={active}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35 }}
                            className="max-w-2xl mx-auto">
                            <div className="relative rounded-3xl border overflow-hidden p-8 md:p-12"
                                style={{ borderColor: `${plate.color}30`, background: `linear-gradient(135deg, ${plate.color}10, #050709 60%)`, boxShadow: `0 0 60px ${plate.glow}` }}>

                                {/* Hex pattern bg */}
                                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='48' viewBox='0 0 28 48'%3E%3Cg fill='${encodeURIComponent(plate.color)}' fill-opacity='1'%3E%3Cpolygon points='14,0 28,8 28,24 14,32 0,24 0,8'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '28px 48px' }} />

                                {/* Badge */}
                                <div className="absolute top-5 right-5 text-[10px] font-black px-3 py-1 rounded-full border"
                                    style={{ color: plate.color, borderColor: `${plate.color}40`, background: `${plate.color}15` }}>
                                    {plate.badge}
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    {/* Icon */}
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${plate.color}25, ${plate.color}10)`, border: `1px solid ${plate.color}35`, boxShadow: `0 0 30px ${plate.glow}` }}>
                                        <PlateIcon size={36} style={{ color: plate.color }} />
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-[13px] font-bold uppercase tracking-widest mb-1" style={{ color: plate.color }}>
                                            Placa de Faturamento
                                        </p>
                                        <h3 className="text-4xl font-black text-white mb-1">{plate.full}</h3>
                                        <p className="text-gray-400 text-[14px] leading-relaxed">{plate.desc}</p>
                                    </div>
                                </div>

                                {/* Perks */}
                                <div className="mt-8 pt-6 border-t border-white/[0.06] grid sm:grid-cols-3 gap-3">
                                    {plate.perks.map(perk => (
                                        <div key={perk} className="flex items-start gap-2">
                                            <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: plate.color }} />
                                            <span className="text-[13px] text-gray-300">{perk}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div className="mt-8">
                                    <Link to="/register"
                                        className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl transition-all text-white text-[14px] hover:-translate-y-px"
                                        style={{ background: `linear-gradient(135deg, ${plate.color}, ${plate.color}bb)`, boxShadow: `0 8px 30px ${plate.glow}` }}>
                                        Quero a placa de {plate.full} <ArrowRight size={15} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Social proof */}
                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="text-center text-[13px] text-gray-500 mt-8">
                        <Trophy size={12} className="inline mr-1 text-emerald-400" />
                        Mais de <span className="text-emerald-400 font-bold">500 placas</span> já entregues para sellers da DiretoPay
                    </motion.p>
                </div>
            </section>

            {/* How it works */}
            <section className="px-5 pb-20 border-t border-white/[0.06] pt-16">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-[12px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Como funciona</p>
                        <h2 className="text-3xl font-black tracking-tight">Da conta à placa em 4 passos</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {STEPS.map(({ n, title, desc }, i) => (
                            <motion.div key={n}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className="relative text-center p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">{n}</div>
                                <h3 className="text-[14px] font-bold text-white mb-2">{title}</h3>
                                <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-5 py-24 border-t border-white/[0.06] text-center overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(16,185,129,0.10), transparent)' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="relative max-w-lg mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                        Qual será sua primeira placa?
                    </h2>
                    <p className="text-gray-400 mb-8">Crie sua conta agora e comece a acumular faturamento rumo à sua conquista.</p>
                    <Link to="/register"
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-emerald-500/30 hover:-translate-y-px text-[15px]">
                        Começar agora — é grátis <ArrowRight size={16} />
                    </Link>
                </motion.div>
            </section>
        </PublicLayout>
    );
}
