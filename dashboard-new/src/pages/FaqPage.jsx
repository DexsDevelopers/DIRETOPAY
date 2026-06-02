import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, ArrowRight, HelpCircle, Plus } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import { AuroraBg, DotGrid, Particles, ShimmerButton, GlowCard, GradientText, PulseBadge } from '../components/AnimatedUI';

const FAQS = [
    {
        q: 'Como criar minha conta na DiretoPay?',
        a: 'Acesse /register, preencha nome, e-mail e senha. Sem CNPJ, sem análise de crédito, sem espera. Em menos de 2 minutos você já pode gerar cobranças PIX.',
    },
    {
        q: 'Qual é a taxa por transação?',
        a: 'A DiretoPay cobra apenas 1,49% por transação aprovada. Sem mensalidade, sem taxa de adesão, sem cobranças escondidas. Você paga só quando vende.',
    },
    {
        q: 'Quando recebo meu dinheiro?',
        a: 'As vendas aprovadas ficam disponíveis para saque no mesmo dia (D+0). Você solicita o saque e ele cai na sua conta bancária em minutos via PIX.',
    },
    {
        q: 'Preciso de CNPJ para usar a plataforma?',
        a: 'Não. A DiretoPay aceita pessoas físicas. Você pode começar a vender com CPF, sem precisar abrir empresa ou ter CNPJ.',
    },
    {
        q: 'Como funciona o checkout personalizado?',
        a: 'No painel, acesse "Checkouts" e crie uma página de pagamento com o nome do seu produto, sua logo e cores. Cada checkout tem um link único que você compartilha com seus clientes.',
    },
    {
        q: 'A DiretoPay tem API?',
        a: 'Sim. Temos uma API REST completa e documentada em /docs. Você pode integrar geração de cobranças, webhooks e consulta de status em qualquer linguagem ou plataforma.',
    },
    {
        q: 'O que são as "Placas de Faturamento"?',
        a: 'É o nosso programa de premiações. Quando você atinge marcos de faturamento (10K, 50K, 100K, 500K, 1M), recebe uma placa física personalizada entregue no seu endereço, junto com benefícios exclusivos.',
    },
    {
        q: 'Como funciona o suporte?',
        a: 'Atendemos via WhatsApp e chat interno 24/7. Clientes com placa 100K+ têm gerente de contas exclusivo com acesso direto por número privado.',
    },
    {
        q: 'Posso usar a DiretoPay para assinaturas recorrentes?',
        a: 'Sim. O módulo de assinaturas permite criar planos mensais ou com qualquer periodicidade, com cobrança automática e gestão completa de inadimplência.',
    },
    {
        q: 'A plataforma é segura?',
        a: 'Sim. Todas as transações usam HTTPS e tokenização. Temos antifraude nativo, monitoramento de anomalias em tempo real e equipe de segurança dedicada.',
    },
];

function FaqItem({ q, a, index }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: index * 0.05, duration: 0.4 }}
            className={`rounded-2xl border transition-all duration-300 mb-3 overflow-hidden ${
                open
                    ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                    : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12]'
            }`}>
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between py-5 px-6 text-left gap-4 group">
                <span className="text-[14px] font-semibold text-gray-200 group-hover:text-white transition-colors">{q}</span>
                <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                        open ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400' : 'border-white/10 text-gray-500 group-hover:text-emerald-400 group-hover:border-emerald-500/30'
                    }`}>
                    <Plus size={14} />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden">
                        <p className="text-[14px] text-gray-400 px-6 pb-5 leading-relaxed border-t border-white/[0.05] pt-4">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FaqPage() {
    return (
        <PublicLayout>
            {/* Hero */}
            <section className="relative py-28 px-5 text-center overflow-hidden">
                <AuroraBg />
                <DotGrid />
                <Particles count={15} color="#10b981" className="opacity-40" />
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.10), transparent 70%)' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10">
                    <div className="flex justify-center mb-6">
                        <PulseBadge color="#10b981">Perguntas Frequentes</PulseBadge>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                        Tire suas dúvidas<br />
                        <GradientText from="#10b981" to="#34d399">sobre a DiretoPay</GradientText>
                    </h1>
                    <p className="text-gray-400 text-[16px] max-w-xl mx-auto">
                        Tudo que você precisa saber antes de começar. Não encontrou resposta? Fale com a gente no WhatsApp.
                    </p>
                </motion.div>
            </section>

            {/* FAQ */}
            <section className="px-5 pb-20 border-t border-white/[0.06] pt-12">
                <div className="max-w-2xl mx-auto">
                    {FAQS.map((item, i) => (
                        <FaqItem key={item.q} {...item} index={i} />
                    ))}
                </div>
            </section>

            {/* Still have questions */}
            <section className="px-5 pb-24">
                <div className="max-w-2xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-500/15 border border-emerald-500/20 shrink-0">
                            <MessageCircle size={22} className="text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[15px] font-bold text-white mb-1">Ainda tem dúvidas?</h3>
                            <p className="text-[13px] text-gray-500">Nossa equipe responde em minutos pelo WhatsApp.</p>
                        </div>
                        <ShimmerButton className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 text-[13px] whitespace-nowrap">
                            <a href="https://wa.me/5551996148568" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">Falar no WhatsApp <ArrowRight size={14} /></a>
                        </ShimmerButton>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-5 py-20 border-t border-white/[0.06] text-center overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(16,185,129,0.10), transparent)' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="relative max-w-lg mx-auto">
                    <h2 className="text-3xl font-black tracking-tight mb-4">Pronto para começar?</h2>
                    <p className="text-gray-400 mb-8">Junte-se a 4.200+ sellers que já vendem com a DiretoPay.</p>
                    <ShimmerButton className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-emerald-500/30 hover:-translate-y-px text-[15px]">
                        <Link to="/register" className="flex items-center gap-2">Criar conta grátis <ArrowRight size={16} /></Link>
                    </ShimmerButton>
                </motion.div>
            </section>
        </PublicLayout>
    );
}
