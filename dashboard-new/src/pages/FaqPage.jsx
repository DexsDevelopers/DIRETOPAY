import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, ArrowRight, HelpCircle } from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

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

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/[0.06] last:border-0">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between py-5 px-1 text-left gap-4 group">
                <span className="text-[14px] font-semibold text-gray-200 group-hover:text-white transition-colors">{q}</span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                    <ChevronDown size={16} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-[14px] text-gray-400 pb-5 px-1 leading-relaxed overflow-hidden">
                        {a}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FaqPage() {
    return (
        <PublicLayout>
            {/* Hero */}
            <section className="py-24 px-5 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-6">
                        <HelpCircle size={12} /> Perguntas Frequentes
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                        Tire suas dúvidas<br />
                        <span className="text-emerald-400">sobre a DiretoPay</span>
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
                        <motion.div key={item.q}
                            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                            <FaqItem {...item} />
                        </motion.div>
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
                        <a href="https://wa.me/5551996148568" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 text-[13px] whitespace-nowrap">
                            Falar no WhatsApp <ArrowRight size={14} />
                        </a>
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
                    <Link to="/register"
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-xl shadow-emerald-500/30 hover:-translate-y-px text-[15px]">
                        Criar conta grátis <ArrowRight size={16} />
                    </Link>
                </motion.div>
            </section>
        </PublicLayout>
    );
}
