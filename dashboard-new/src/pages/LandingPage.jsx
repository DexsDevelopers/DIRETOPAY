import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, CheckCircle, Zap, Shield, Rocket, MessageCircle,
    ChevronDown, ExternalLink, Code2, Globe, BarChart3, Layers, Sparkles,
    ShieldCheck, Store, Sun, Moon, Play, Trophy, Medal, Crown, Gem,
    Network, User, Landmark, Check, Flame, Gift, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

// ===== COMPONENTES AUXILIARES =====

function DashboardMockup() {
    const [currentSale, setCurrentSale] = useState(0);
    const salesData = [
        { amount: 'R$ 69,95' }, { amount: 'R$ 149,90' }, { amount: 'R$ 297,00' },
        { amount: 'R$ 47,00' }, { amount: 'R$ 97,00' }
    ];

    useEffect(() => {
        const interval = setInterval(() => setCurrentSale(p => (p + 1) % salesData.length), 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative" style={{ perspective: '1000px' }}>
            <motion.div
                initial={{ opacity: 0, rotateY: -10 }}
                animate={{ opacity: 1, rotateY: -5 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-gradient-to-br from-[#1a1a24] to-[#0f0f16] border border-white/10 rounded-3xl p-6 shadow-2xl"
                style={{ transformStyle: 'preserve-3d', animation: 'float 6s ease-in-out infinite' }}
            >
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center font-bold text-white">G</div>
                        <div>
                            <div className="text-xs text-gray-400">Bem-vindo,</div>
                            <div className="font-semibold text-white">Ghost Seller 👋</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Online
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="text-xs text-gray-400 mb-1">Faturamento Hoje</div>
                        <div className="text-xl font-bold text-emerald-400">R$ 12.450,00</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="text-xs text-gray-400 mb-1">Vendas</div>
                        <div className="text-xl font-bold text-white">847</div>
                    </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 h-24 flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                            transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                            className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t opacity-70" />
                    ))}
                </div>
            </motion.div>
            <motion.div key={currentSale} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-4 -left-4 bg-black/95 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4 z-10 shadow-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Check className="text-white" size={24} />
                </div>
                <div>
                    <div className="text-xs text-gray-400">Venda realizada no Pix!</div>
                    <div className="font-bold text-white">Comissão: {salesData[currentSale].amount}</div>
                </div>
                <div className="text-xs text-gray-500 ml-2">agora</div>
            </motion.div>
            <style>{`@keyframes float { 0%, 100% { transform: rotateY(-5deg) translateY(0); } 50% { transform: rotateY(-5deg) translateY(-15px); } }`}</style>
        </div>
    );
}

function AwardCard({ icon: Icon, amount, name, desc, color, delay }) {
    const colors = { platinum: '#e5e7eb', gold: '#fbbf24', wine: '#be185d', emerald: '#10b981' };
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }} whileHover={{ y: -10, scale: 1.03 }}
            className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 text-center overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, ${colors[color]}, transparent)` }} />
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${colors[color]}40, ${colors[color]}20)` }}>
                <Icon size={32} style={{ color: colors[color] }} />
            </div>
            <div className="text-2xl font-black mb-2" style={{ color: colors[color] }}>{amount}</div>
            <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function RankingItem({ position, name, sales, amount, avatar, type }) {
    const styles = {
        gold: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
        silver: 'bg-gray-300/20 text-gray-300 border-gray-300/30',
        bronze: 'bg-orange-400/20 text-orange-400 border-orange-400/30',
        regular: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return (
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.06)' }}
            className="flex items-center gap-5 bg-gray-50 border border-gray-200 rounded-2xl p-5 transition-all">
            <div className={`w-10 h-10 flex items-center justify-center font-black rounded-xl border ${styles[type]}`}>{position}</div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center font-bold text-white">{avatar}</div>
            <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
                <div className="text-xs text-gray-400">{sales} vendas este mês</div>
            </div>
            <div className="text-lg font-bold text-emerald-400">{amount}</div>
        </motion.div>
    );
}

function FeatureCard({ icon: Icon, title, desc, delay = 0 }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }} whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(124,58,237,0.12)' }}
            className="bg-white p-10 rounded-[40px] border border-purple-100 shadow-sm group relative overflow-hidden transition-all duration-300">
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
            <button onClick={() => setIsOpen(!isOpen)} className="w-full py-8 flex items-center justify-between text-left group">
                <span className="text-lg md:text-xl font-bold text-gray-700 group-hover:text-gray-900 transition-colors pr-8">{title}</span>
                <div className={cn("w-10 h-10 rounded-full border border-purple-100 flex items-center justify-center transition-all duration-500 bg-purple-50", isOpen && "rotate-180 border-primary/30 bg-primary/10")}>
                    <ChevronDown className={cn("text-gray-400 transition-colors", isOpen && "text-primary")} size={20} />
                </div>
            </button>
            {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                    <p className="pb-8 text-gray-500 leading-relaxed max-w-2xl font-medium">{content}</p>
                </motion.div>
            )}
        </div>
    );
}

function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();
    return (
        <button onClick={toggleTheme} title={isDark ? 'Claro' : 'Escuro'}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-purple-100 bg-white/60 backdrop-blur-sm hover:bg-purple-50 hover:border-purple-200 transition-all group">
            <span className={`transition-all duration-300 ${isDark ? 'text-amber-500 rotate-0' : 'text-gray-400 -rotate-12'}`}>
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </span>
            <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-700 transition-colors">
                {isDark ? 'Claro' : 'Escuro'}
            </span>
        </button>
    );
}

// ===== COMPONENTE PRINCIPAL =====

export default function LandingPage() {
    const [onlineUsers, setOnlineUsers] = useState(2348);
    const [scrolled, setScrolled] = useState(false);
    const { isDark } = useTheme();

    useEffect(() => {
        const interval = setInterval(() => {
            setOnlineUsers(prev => prev + (Math.random() > 0.4 ? Math.floor(Math.random() * 5) : -Math.floor(Math.random() * 3)));
        }, 3000);
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => { clearInterval(interval); window.removeEventListener('scroll', handleScroll); };
    }, []);

    return (
        <div className={`min-h-screen font-['Outfit'] overflow-x-hidden selection:bg-primary selection:text-white ${isDark ? 'bg-[#0a0a0f] text-gray-100' : 'bg-white text-gray-900'}`}>
            
            {/* Announcement Bar */}
            <div className={`sticky top-0 z-[60] backdrop-blur-2xl border-b py-2 px-4 sm:px-6 ${isDark ? 'bg-[#0f0f16]/95 border-white/5' : 'bg-white/97 border-purple-100/80'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-primary">+{onlineUsers.toLocaleString('pt-BR')} <span className="hidden sm:inline">ao vivo</span></span>
                    </div>
                    <p className={`text-[10px] sm:text-[11px] font-semibold truncate text-center flex-1 mx-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className="hidden sm:inline">🚀 </span>Canal Oficial no WhatsApp já está ativo!
                    </p>
                    <a href="https://whatsapp.com/channel/0029VbC56v0GZNComh5KQ73J" rel="noopener noreferrer" target="_blank"
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-[#25D366]/20 transition-all whitespace-nowrap">
                        Explorar <ArrowRight size={10} />
                    </a>
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

            {/* Hero Section V2 */}
            <section className={`pt-32 sm:pt-40 pb-20 px-6 relative overflow-hidden min-h-screen ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
                <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none ${isDark ? 'bg-gradient-to-bl from-purple-900/20 to-violet-900/10 opacity-40' : 'bg-gradient-to-bl from-purple-100 to-violet-50 opacity-60'}`} />
                <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none ${isDark ? 'bg-gradient-to-tr from-purple-900/15 to-transparent opacity-30' : 'bg-gradient-to-tr from-purple-50 to-transparent opacity-40'}`} />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[80vh]">
                        {/* Lado Esquerdo */}
                        <div className="space-y-8 text-center lg:text-left">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
                                className={`inline-flex items-center gap-3 px-5 py-3 rounded-full border ${isDark ? 'bg-purple-950/40 border-purple-500/40' : 'bg-primary/5 border-primary/15'}`}>
                                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'} animate-pulse`} />
                                <span className={`text-sm font-black tracking-tight ${isDark ? 'text-purple-300' : 'text-primary'}`}>+3.000 Sellers que confiam em nós!</span>
                            </motion.div>

                            <div className="space-y-6">
                                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                    className="text-4xl sm:text-5xl lg:text-6xl font-[1000] leading-[0.95] tracking-[-0.04em] text-gray-900">
                                    O lado invisível que faz <br />
                                    <span className="bg-gradient-to-r from-purple-500 to-violet-600 bg-clip-text text-transparent">sua operação crescer!</span>
                                </motion.h1>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                    className="text-gray-500 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                                    Receba via Pix com <strong>anonimato garantido</strong>. Sem exposição de CPF/CNPJ, saques instantâneos e <strong>blindagem total contra MED</strong>.
                                </motion.p>
                            </div>

                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Link to="/register" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-violet-600 text-white h-14 sm:h-16 px-8 rounded-2xl flex items-center justify-center font-black hover:opacity-90 hover:scale-105 transition-all shadow-[0_16px_40px_rgba(124,58,237,0.35)] active:scale-95 group whitespace-nowrap">
                                    <ShieldCheck className="mr-2" size={20} />
                                    Quero ser um Ghost
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                                </Link>
                                <a href="#solucoes" className="w-full sm:w-auto bg-gray-50 border border-gray-200 h-14 sm:h-16 px-8 rounded-2xl text-gray-700 font-black hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center whitespace-nowrap">
                                    <Play size={18} className="mr-2" />
                                    Ver como funciona
                                </a>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                                className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                                {[{ icon: ShieldCheck, text: '100% Anônimo' }, { icon: Zap, text: 'Saque Instantâneo' }, { icon: Lock, text: 'Anti-MED' }].map((item, i) => (
                                    <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                        <item.icon size={16} className="text-primary" />
                                        <span className="text-sm font-bold text-gray-600">{item.text}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Lado Direito - Dashboard */}
                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
                            className="relative order-first lg:order-last">
                            <DashboardMockup />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Awards Section */}
            <section className={`py-24 px-6 ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-black mb-6">
                            <Trophy size={16} /> Programa de Recompensas
                        </motion.div>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                            className="text-3xl sm:text-5xl font-black mb-4">A Ghosts vibra a cada meta batida!</motion.h2>
                        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg">Reconhecemos sua performance com prêmios exclusivos. Cada marco é uma conquista celebrada.</motion.p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AwardCard icon={Medal} amount="100 Mil" name="Ghost Platinum" desc="Para quem transforma os primeiros 100 mil em apenas o começo." color="platinum" delay={0.1} />
                        <AwardCard icon={Trophy} amount="500 Mil" name="Ghost Gold" desc="Reconhece a ousadia de quem encara grandes desafios." color="gold" delay={0.2} />
                        <AwardCard icon={Crown} amount="1 Milhão" name="Ghost Wine" desc="Celebra a excelência rara e sofisticação estratégica." color="wine" delay={0.3} />
                        <AwardCard icon={Gem} amount="5 Milhões" name="Ghost Emerald" desc="Para quem chega aos 5 milhões não por acaso, mas por legado." color="emerald" delay={0.4} />
                    </div>
                </div>
            </section>

            {/* Multi-Adquirentes Section */}
            <section className={`py-24 px-6 ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-black mb-6">
                                <Network size={16} /> Multi-Adquirentes
                            </motion.div>
                            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                                className="text-3xl sm:text-4xl font-black mb-6 leading-tight">
                                Adquirente falhou?<br /><span className="text-primary">A Ghosts encontra outra rota na mesma hora.</span>
                            </motion.h2>
                            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                                className="text-gray-400 text-lg mb-8 leading-relaxed">
                                Deixe a Ghosts encontrar a rota com maior chance de aprovação enquanto você foca em vender! Nosso sistema inteligente alterna automaticamente entre múltiplos processadores.
                            </motion.p>
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                                className="grid grid-cols-2 gap-4">
                                {['Fácil', 'Rápido', 'Seguro', 'Eficaz'].map((item, i) => (
                                    <div key={i} className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                        <CheckCircle size={20} className="text-emerald-400" />
                                        <span className="font-bold text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                            className={`rounded-3xl p-8 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                            <div className="grid grid-cols-3 gap-4 items-center">
                                {/* Coluna 1: Cliente */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border w-full justify-center ${isDark ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200 shadow-sm'}`}>
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}><User size={18} /></div>
                                        <span className="font-bold text-sm">Seu Cliente</span>
                                    </div>
                                    <div className="flex gap-1 mt-3">
                                        {[0,1,2].map(i => <div key={i} className="w-6 h-0.5 bg-gray-300 rounded-full" />)}
                                        <ArrowRight size={14} className="text-gray-400 -ml-1" />
                                    </div>
                                </div>

                                {/* Coluna 2: Adquirentes */}
                                <div className="flex flex-col gap-3">
                                    {[
                                        { label: 'Adquirente 1', active: false },
                                        { label: 'Adquirente 2', active: true },
                                        { label: 'Adquirente 3', active: false },
                                    ].map(({ label, active }) => (
                                        <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                                            active
                                                ? 'bg-purple-500/15 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                                                : isDark ? 'bg-white/5 border-white/10 opacity-50' : 'bg-white border-gray-200 opacity-60 shadow-sm'
                                        }`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-purple-500/20' : isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                                                <Landmark size={16} className={active ? 'text-purple-400' : ''} />
                                            </div>
                                            <span className={`font-bold text-sm ${active ? 'text-purple-400' : ''}`}>{label}</span>
                                            {active && <span className="ml-auto text-[10px] font-black text-purple-400 uppercase">Ativo</span>}
                                        </div>
                                    ))}
                                </div>

                                {/* Coluna 3: Resultado */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex gap-1 mb-3 rotate-180">
                                        {[0,1,2].map(i => <div key={i} className="w-6 h-0.5 bg-emerald-400/50 rounded-full" />)}
                                        <ArrowRight size={14} className="text-emerald-400 -ml-1" />
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-emerald-500/10 border-emerald-500 w-full justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                        <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                            <Check size={18} className="text-emerald-400" />
                                        </div>
                                        <span className="font-bold text-sm text-emerald-400">Pix Gerado!</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Ranking Section */}
            <section className={`py-24 px-6 ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-black mb-6">
                            <Flame size={16} /> Competição Mensal
                        </motion.div>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                            className="text-3xl sm:text-5xl font-black mb-4">Na Ghosts, sua performance importa!</motion.h2>
                        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg">Todos os meses, os sellers disputam o ranking para ganhar prêmios exclusivos. Vendeu mais? Sobe no ranking. Atingiu o topo? Premiação garantida!</motion.p>
                    </div>
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className={`rounded-3xl p-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'} shadow-xl`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <Trophy size={32} className="text-yellow-400" />
                                <h3 className="text-2xl font-black">Top Sellers - Maio 2025</h3>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-black">
                                <Gift size={16} /> Prêmios todos os meses
                            </div>
                        </div>
                        <div className="space-y-3">
                            <RankingItem position="1" name="Marcos R." sales="1.247" amount="R$ 89.420,00" avatar="MR" type="gold" />
                            <RankingItem position="2" name="Ana L." sales="982" amount="R$ 67.890,00" avatar="AL" type="silver" />
                            <RankingItem position="3" name="João S." sales="756" amount="R$ 54.230,00" avatar="JS" type="bronze" />
                            <RankingItem position="4" name="Carla F." sales="634" amount="R$ 45.120,00" avatar="CF" type="regular" />
                            <RankingItem position="5" name="Rafael P." sales="523" amount="R$ 38.450,00" avatar="RP" type="regular" />
                        </div>
                    </motion.div>
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
                        <FeatureCard icon={ShieldCheck} title="Anonimato Bancário" desc="Seus dados pessoais ou da sua empresa nunca são revelados ao pagador. Total descrição para o seu negócio." delay={0.1} />
                        <FeatureCard icon={Zap} title="Conversão Extrema" desc="Checkout otimizado para o Pix. Experiência de um clique que reduz o abandono em até 45%." delay={0.2} />
                        <FeatureCard icon={Layers} title="Multicontas em Um" desc="Gerencie múltiplos projetos e fluxos financeiros em uma única dashboard integrada e centralizada." delay={0.3} />
                        <FeatureCard icon={BarChart3} title="Analytics em Real-time" desc="Acompanhe cada centavo que entra. Insights detalhados de conversão e comportamento do cliente." delay={0.4} />
                        <FeatureCard icon={Rocket} title="Saques Sem Taxas" desc="Transferências ultra-rápidas e gratuitas para sua conta bancária de preferência logo após o processamento." delay={0.5} />
                        <FeatureCard icon={Globe} title="Infraestrutura Global" desc="Servidores distribuídos para garantir que seu link esteja sempre no ar, 24 horas por dia, 7 dias por semana." delay={0.6} />
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
                            <div className="flex gap-4"><CheckCircle className="text-primary shrink-0" size={24} /><p>Endpoints simplificados e RESTful</p></div>
                            <div className="flex gap-4"><CheckCircle className="text-primary shrink-0" size={24} /><p>Autenticação via Bearer Token de alta segurança</p></div>
                            <div className="flex gap-4"><CheckCircle className="text-primary shrink-0" size={24} /><p>Webhooks redundantes e configuráveis</p></div>
                        </div>
                        <Link to="/docs" className="inline-flex items-center gap-2 px-10 py-5 bg-gray-50 border border-gray-200 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all group">
                            LER DOCUMENTAÇÃO <ExternalLink className="opacity-40 group-hover:opacity-100 transition-opacity" size={20} />
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
                            <div className="space-y-2 text-white/80">
                                <p className="text-white/20">// Initialize your integration</p>
                                <p><span className="text-purple-400">const</span> ghost = <span className="text-blue-400">new</span> <span className="text-purple-400">GhostPix</span>{'({'} key: <span className="text-orange-400">'pk_live_...'</span> {'})'};</p>
                                <p>&nbsp;</p>
                                <p className="text-white/20">// Generate an anonymous Pix</p>
                                <p><span className="text-purple-400">await</span> ghost.<span className="text-blue-400">createTransaction</span>{'({'}</p>
                                <p className="pl-4">amount: <span className="text-orange-400">97.00</span>,</p>
                                <p className="pl-4">customer: <span className="text-purple-300">'John Doe'</span></p>
                                <p>{'})'};</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="py-20 border-y border-gray-100 overflow-hidden bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
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
                        <AccordionItem title="O Ghost Pix é realmente anônimo?" content="Sim. Utilizamos uma camada de abstração bancária onde seus dados pessoais ou da sua empresa nunca aparecem para o pagador final. O dinheiro cai na nossa conta de liquidação e é repassado instantaneamente para você." />
                        <AccordionItem title="Tem alguma taxa por transação?" content="Não! A Ghost Pix não cobra taxa por transação. Você recebe o valor integral das suas vendas diretamente no seu saldo, sem surpresas e sem taxas escondidas." />
                        <AccordionItem title="Como funciona o sistema de saques?" content="Após a confirmação do pagamento pelo nosso sistema (que ocorre em milissegundos), o saldo fica disponível em sua conta Ghost Pix. Você pode solicitar o saque via Pix para sua chave cadastrada a qualquer momento, sem taxas." />
                        <AccordionItem title="Posso integrar com qualquer site ou bot?" content="Com certeza. Nossa API REST é agnóstica de linguagem e plataforma. Seja em um bot de Telegram, um dashboard customizado ou um e-commerce em WordPress, a integração é fluida e documentada." />
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
                            <div className="flex items-center gap-2 text-gray-400"><Lock size={12} /><span className="text-[9px] font-black uppercase">FIPS 140-2 Compliant</span></div>
                            <div className="flex items-center gap-2 text-gray-400"><ShieldCheck size={12} /><span className="text-[9px] font-black uppercase">PCI DSS Certified</span></div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
