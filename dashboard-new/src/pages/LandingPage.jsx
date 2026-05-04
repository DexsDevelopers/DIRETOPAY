import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, CheckCircle, Zap, Shield, Rocket, MessageCircle,
    Cpu, Lock, ChevronDown, ExternalLink, Users, Code2, Globe,
    BarChart3, Layers, Sparkles, ShieldCheck, CreditCard, Store, Sun, Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

function FeatureCard({ icon: Icon, title, desc, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(124,58,237,0.12)' }}
            className="bg-white p-10 rounded-[40px] border border-purple-100 shadow-sm group relative overflow-hidden transition-all duration-300"
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.04] group-hover:opacity-[0.09] transition-opacity">
                <Icon size={120} className="text-primary" />
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/10 to-violet-600/10 rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/20">
                <Icon size={28} />
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight text-gray-900 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function StatItem({ label, value }) {
    return (
        <div className="text-center space-y-1">
            <p className="text-3xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{value}</p>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap">{label}</p>
        </div>
    );
}

function AccordionItem({ title, content }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-purple-100 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-8 flex items-center justify-between text-left group"
            >
                <span className="text-lg md:text-xl font-bold text-gray-700 group-hover:text-gray-900 transition-colors pr-8">{title}</span>
                <div className={cn("w-10 h-10 rounded-full border border-purple-100 flex items-center justify-center transition-all duration-500 bg-purple-50", isOpen && "rotate-180 border-primary/30 bg-primary/10")}>
                    <ChevronDown className={cn("text-gray-400 transition-colors", isOpen && "text-primary")} size={20} />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-8 text-gray-500 leading-relaxed max-w-2xl font-medium">{content}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            title={isDark ? 'Mudar para Claro' : 'Mudar para Escuro'}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-purple-100 bg-white/60 backdrop-blur-sm hover:bg-purple-50 hover:border-purple-200 transition-all group"
        >
            <span className={`transition-all duration-300 ${isDark ? 'text-amber-500 rotate-0' : 'text-gray-400 -rotate-12'}`}>
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </span>
            <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-700 transition-colors">
                {isDark ? 'Claro' : 'Escuro'}
            </span>
        </button>
    );
}

export default function LandingPage() {
    const [onlineUsers, setOnlineUsers] = useState(2348);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        console.log("LANDING PAGE COMPONENT MOUNTED");
        const interval = setInterval(() => {
            setOnlineUsers(prev => prev + (Math.random() > 0.4 ? Math.floor(Math.random() * 5) : -Math.floor(Math.random() * 3)));
        }, 3000);
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => { clearInterval(interval); window.removeEventListener('scroll', handleScroll); };
    }, []);

    return (
        <div className="bg-white min-h-screen text-gray-900 font-['Outfit'] overflow-x-hidden selection:bg-primary selection:text-white">

            {/* Announcement Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-2xl border-b border-purple-100 py-3 px-6 text-center z-[60]">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 rounded-full border border-purple-200 bg-purple-100 text-[8px] flex items-center justify-center">👤</div>)}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-primary">+{onlineUsers.toLocaleString('pt-BR')} operando agora</span>
                    </div>
                    <div className="h-4 w-px bg-purple-200 hidden sm:block" />
                    <p className="text-[11px] font-bold text-gray-400">Novidade: Nosso Canal Oficial no WhatsApp já está ativo!</p>
                    <a href="https://whatsapp.com/channel/0029VbC56v0GZNComh5KQ73J" rel="noopener noreferrer" target="_blank" className="text-[11px] font-black uppercase tracking-widest text-gray-700 hover:text-primary transition-colors flex items-center gap-2">Explorar <ArrowRight size={12} /></a>
                </div>
            </div>

            {/* Navbar */}
            <nav className={`fixed left-1/2 -translate-x-1/2 z-50 w-[94%] sm:w-[90%] max-w-6xl h-16 sm:h-20 bg-white/90 backdrop-blur-3xl border border-purple-100 rounded-[32px] px-6 sm:px-10 flex items-center justify-between shadow-[0_8px_32px_rgba(124,58,237,0.1)] transition-all duration-300 overflow-hidden ${scrolled ? 'top-3' : 'top-32 sm:top-24'}`}>
                <div className="flex items-center gap-3">
                    <img src="/logo_premium.png" alt="Ghost Pix" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
                    <span className="font-black text-lg sm:text-xl tracking-tighter text-gray-900">GHOST<span className="text-primary italic">PIX</span></span>
                </div>

                <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                    <a href="#solucoes" className="hover:text-gray-900 transition-colors">Soluções</a>
                    <a href="#tecnologia" className="hover:text-gray-900 transition-colors">Tecnologia</a>
                    <Link to="/docs" className="hover:text-primary transition-colors flex items-center gap-2">API Docs <Code2 size={14} /></Link>
                    <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
                    <a href="/loja" className="hover:text-primary transition-colors flex items-center gap-1.5"><Store size={13} />Loja</a>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    <ThemeToggle />
                    <Link to="/login" className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors px-1 sm:px-2 hidden sm:block">Entrar</Link>
                    <Link to="/register" className="bg-gradient-to-r from-purple-500 to-violet-600 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] px-4 sm:px-8 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-[0_8px_20px_rgba(124,58,237,0.3)] whitespace-nowrap">Conta</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-44 sm:pt-64 pb-20 sm:pb-32 px-6 relative overflow-hidden min-h-screen bg-white">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-purple-100 to-violet-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-50 to-transparent rounded-full blur-[80px] opacity-40 pointer-events-none" />

                <div className="max-w-6xl mx-auto text-center space-y-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 rounded-[20px] bg-primary/5 border border-primary/15 shadow-sm"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                <ShieldCheck size={16} className="text-primary" />
                            </div>
                            <span className="text-sm sm:text-base font-black text-primary tracking-tight">Sem documentos. Sem taxas. Sem burocracia.</span>
                        </div>
                        <div className="h-4 w-px bg-primary/20 hidden sm:block" />
                        <span className="text-xs sm:text-sm font-bold text-primary/60">Crie sua conta em segundos e receba 100% das suas vendas.</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500 text-[11px] font-black uppercase tracking-[0.3em]"
                    >
                        <Sparkles size={14} className="text-primary" />
                        O Gateway de Pagamentos mais veloz do mercado
                    </motion.div>

                    <div className="space-y-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-7xl lg:text-[130px] font-[1000] leading-[0.9] tracking-[-0.06em] uppercase text-gray-900"
                        >
                            Privacidade<br /><span className="bg-gradient-to-r from-purple-500 to-violet-600 bg-clip-text text-transparent italic">é Poder.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-500 text-lg sm:text-2xl max-w-3xl mx-auto font-medium leading-relaxed tracking-tight"
                        >
                            Crie links de pagamento anônimos, automatize suas vendas e escale sua operação com a infraestrutura blindada da Ghost Pix.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8"
                    >
                        <Link to="/register" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-violet-600 text-white h-14 sm:h-20 px-8 sm:px-12 rounded-[24px] flex items-center justify-center text-sm sm:text-lg font-black hover:opacity-90 hover:scale-105 transition-all shadow-[0_16px_40px_rgba(124,58,237,0.35)] active:scale-95 group whitespace-nowrap">
                            COMEÇAR AGORA
                            <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                        <Link to="/demo" className="w-full sm:w-auto bg-gray-50 border border-gray-200 h-14 sm:h-20 px-8 sm:px-12 rounded-[24px] text-gray-700 font-black hover:bg-gray-100 transition-all active:scale-95 text-sm sm:text-lg flex items-center justify-center whitespace-nowrap">
                            VER DEMO
                        </Link>
                        <a href="/loja" className="w-full sm:w-auto bg-primary/5 border border-primary/20 h-14 sm:h-20 px-8 sm:px-12 rounded-[24px] text-primary font-black hover:bg-primary/10 transition-all active:scale-95 text-sm sm:text-lg flex items-center justify-center gap-3 whitespace-nowrap">
                            <Store size={20} /> VER LOJA
                        </a>
                    </motion.div>

                    {/* Quick Stats */}
                    <div className="pt-24 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-purple-100 max-w-5xl mx-auto">
                        <StatItem label="Volume Transacionado" value="+R$ 15M" />
                        <StatItem label="Tempo de Setup" value="2 MIN" />
                        <StatItem label="Uptime da Rede" value="99.9%" />
                        <StatItem label="Taxa sobre vendas" value="0%" />
                    </div>
                </div>
            </section>

            {/* Solutions Section */}
            <section id="solucoes" className="py-32 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-200 pb-16">
                        <div className="space-y-4">
                            <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Soluções Corporativas</p>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-gray-900">Projetado para <br /> <span className="text-gray-400 italic">quem joga grande.</span></h2>
                        </div>
                        <p className="text-gray-400 max-w-xs font-bold leading-relaxed text-sm">Eliminamos as barreiras entre sua venda e seu lucro com tecnologia de ponta.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Anonimato Bancário"
                            desc="Seus dados pessoais ou da sua empresa nunca são revelados ao pagador. Total descrição para o seu negócio."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Conversão Extrema"
                            desc="Checkout otimizado para o Pix. Experiência de um clique que reduz o abandono em até 45%."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={Layers}
                            title="Multicontas em Um"
                            desc="Gerencie múltiplos projetos e fluxos financeiros em uma única dashboard integrada e centralizada."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="Analytics em Real-time"
                            desc="Acompanhe cada centavo que entra. Insights detalhados de conversão e comportamento do cliente."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon={Rocket}
                            title="Saques Sem Taxas"
                            desc="Transferências ultra-rápidas e gratuitas para sua conta bancária de preferência logo após o processamento."
                            delay={0.5}
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Infraestrutura Global"
                            desc="Servidores distribuídos para garantir que seu link esteja sempre no ar, 24 horas por dia, 7 dias por semana."
                            delay={0.6}
                        />
                    </div>
                </div>
            </section>

            {/* API Section */}
            <section id="tecnologia" className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="bg-primary/10 w-fit px-4 py-1.5 rounded-lg border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">Developers First</div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">A API que <br /> <span className="text-gray-300 italic tracking-[-0.05em]">você sempre quis.</span></h2>
                        <div className="space-y-6 text-gray-500 text-lg font-medium max-w-lg">
                            <div className="flex gap-4">
                                <CheckCircle className="text-primary shrink-0" size={24} />
                                <p>Endpoints simplificados e RESTful</p>
                            </div>
                            <div className="flex gap-4">
                                <CheckCircle className="text-primary shrink-0" size={24} />
                                <p>Autenticação via Bearer Token de alta segurança</p>
                            </div>
                            <div className="flex gap-4">
                                <CheckCircle className="text-primary shrink-0" size={24} />
                                <p>Webhooks redundantes e configuráveis</p>
                            </div>
                        </div>
                        <Link to="/docs" className="lp-btn-outline px-10 py-5 font-black text-lg group">
                            LER DOCUMENTAÇÃO
                            <ExternalLink className="ml-3 opacity-40 group-hover:opacity-100 transition-opacity" size={20} />
                        </Link>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/15 blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity rounded-full" />
                        <div className="bg-[#0f0f14] border border-white/10 rounded-[48px] p-10 font-mono text-sm leading-relaxed shadow-2xl relative overflow-hidden">
                            <div className="flex gap-2 mb-8">
                                <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-white/20">// Initialize your integration</p>
                                <p><span className="text-primary">const</span> ghost <span className="text-white/40">=</span> <span className="text-blue-400">new</span> <span className="text-purple-400">GhostPix</span>({'{'} key: <span className="text-orange-400">'pk_live_...'</span> {'}'});</p>
                                <p>&nbsp;</p>
                                <p className="text-white/20">// Generate an anonymous Pix</p>
                                <p><span className="text-primary">await</span> ghost.<span className="text-blue-400">createTransaction</span>({'{'}</p>
                                <p className="pl-4">amount: <span className="text-orange-400">97.00</span>,</p>
                                <p className="pl-4">customer: <span className="text-purple-300">'John Doe'</span></p>
                                <p>{'}'});</p>
                                <p>&nbsp;</p>
                                <p className="text-white/20">// Done. Payment generated instantly.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="py-20 border-y border-gray-100 overflow-hidden bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 overflow-hidden">
                    <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] mb-16">Empresas e Empreendedores que confiam</p>
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-10 md:gap-24 opacity-30 hover:opacity-70 transition-all duration-700">
                        {['TECHFLOW', 'ZENITH', 'NEXUS-X', 'CRYPTO-GEN', 'PULSE-PAY', 'GHOST-STT'].map(p => (
                            <span key={p} className="text-xl md:text-3xl font-[1000] italic tracking-tighter text-gray-600 whitespace-nowrap">{p}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-32 px-6 bg-white">
                <div className="max-w-4xl mx-auto space-y-20 text-center md:text-left">
                    <div className="space-y-4 text-center">
                        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-gray-900">Respostas para <br /><span className="bg-gradient-to-r from-purple-500 to-violet-600 bg-clip-text text-transparent italic">suas dúvidas.</span></h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Suporte humanizado disponível 24/7</p>
                    </div>
                    <div className="bg-gray-50 border border-purple-100 rounded-[48px] p-8 md:p-16">
                        <AccordionItem
                            title="O Ghost Pix é realmente anônimo?"
                            content="Sim. Utilizamos uma camada de abstração bancária onde seus dados pessoais ou da sua empresa nunca aparecem para o pagador final. O dinheiro cai na nossa conta de liquidação e é repassado instantaneamente para você."
                        />
                        <AccordionItem
                            title="Tem alguma taxa por transação?"
                            content="Não! A Ghost Pix não cobra taxa por transação. Você recebe o valor integral das suas vendas diretamente no seu saldo, sem surpresas e sem taxas escondidas."
                        />
                        <AccordionItem
                            title="Como funciona o sistema de saques?"
                            content="Após a confirmação do pagamento pelo nosso sistema (que ocorre em milissegundos), o saldo fica disponível em sua conta Ghost Pix. Você pode solicitar o saque via Pix para sua chave cadastrada a qualquer momento, sem taxas."
                        />
                        <AccordionItem
                            title="Posso integrar com qualquer site ou bot?"
                            content="Com certeza. Nossa API REST é agnóstica de linguagem e plataforma. Seja em um bot de Telegram, um dashboard customizado ou um e-commerce em WordPress, a integração é fluida e documentada."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-16 sm:py-32 px-4 sm:px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-violet-600 via-purple-600 to-purple-700 p-8 sm:p-12 md:p-32 rounded-[32px] sm:rounded-[64px] relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-[60px]" />
                    <div className="space-y-12 relative z-10">
                        <h2 className="text-3xl sm:text-5xl md:text-8xl font-black leading-[0.95] tracking-[-0.04em] uppercase text-white">O futuro dos <span className="text-purple-200">pagamentos</span> é hoje.</h2>
                        <div className="pt-6">
                            <Link to="/register" className="inline-flex items-center justify-center bg-white text-primary h-14 sm:h-20 md:h-24 px-10 sm:px-16 md:px-20 rounded-[20px] sm:rounded-[32px] text-sm sm:text-xl md:text-2xl font-black hover:bg-purple-50 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.2)] whitespace-nowrap active:scale-95">
                                CRIAR CONTA AGORA
                            </Link>
                        </div>
                        <p className="text-white/50 font-bold uppercase tracking-[0.2em] text-[10px]">Leva menos de 1 minuto para começar.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-24 border-t border-gray-100 bg-white px-6">
                <div className="max-w-7xl mx-auto flex flex-col gap-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                        <div className="space-y-8 col-span-1 lg:col-span-1">
                            <div className="flex items-center gap-3">
                                <img src="/logo_premium.png" alt="Ghost Pix" className="w-10 h-10 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)]" />
                                <span className="font-black text-xl tracking-tighter text-gray-900">GHOST PIX</span>
                            </div>
                            <p className="text-gray-500 font-medium leading-relaxed max-w-xs">A infraestrutura financeira definitiva para quem busca privacidade, velocidade e escala.</p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 text-purple-400 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"><MessageCircle size={18} /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 text-purple-400 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"><ExternalLink size={18} /></a>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Plataforma</p>
                            <ul className="space-y-4 text-sm font-bold text-gray-500">
                                <li><a href="#solucoes" className="hover:text-gray-900 transition-colors">Produtos</a></li>
                                <li><a href="#tecnologia" className="hover:text-gray-900 transition-colors">Tecnologia</a></li>
                                <li><Link to="/docs" className="hover:text-gray-900 transition-colors">Documentação</Link></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">Termos de Uso</a></li>
                            </ul>
                        </div>

                        <div className="space-y-8">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Desenvolvedores</p>
                            <ul className="space-y-4 text-sm font-bold text-gray-500">
                                <li><Link to="/docs" className="hover:text-gray-900 transition-colors">API Reference</Link></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">Status da Rede</a></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">SDKs</a></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">GitHub</a></li>
                            </ul>
                        </div>

                        <div className="space-y-8">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Suporte</p>
                            <ul className="space-y-4 text-sm font-bold text-gray-500">
                                <li><a href="mailto:contato@pixghost.site" className="hover:text-gray-900 transition-colors">contato@pixghost.site</a></li>
                                <li><a href="#" className="text-primary hover:text-secondary transition-colors flex items-center gap-2">Canal WhatsApp <ExternalLink size={12} /></a></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">Falar com Humano</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-100 pt-12 gap-8">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">© 2026 GHOST PIX TECHNOLOGY LTD. ALL RIGHTS RESERVED.</p>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Lock size={12} />
                                <span className="text-[9px] font-black uppercase">FIPS 140-2 Compliant</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <ShieldCheck size={12} />
                                <span className="text-[9px] font-black uppercase">PCI DSS Certified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

