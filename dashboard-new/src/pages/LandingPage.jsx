import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// ===== EFEITOS UIVERSE =====

/* 1. Spotlight cursor glow */
function SpotlightCursor() {
    const [pos, setPos] = useState({ x: -999, y: -999 });
    useEffect(() => {
        const move = (e) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);
    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
            style={{ background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(30,164,101,0.07), transparent 40%)` }}
        />
    );
}

/* 2. Floating particles hero */
function Particles({ count = 18 }) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 4,
    }));
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(p => (
                <motion.div key={p.id}
                    className="absolute rounded-full bg-primary/20"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                    animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}

/* 3. Grain texture overlay */
function GrainOverlay() {
    return (
        <div className="pointer-events-none fixed inset-0 z-[9998] opacity-[0.025]"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundSize: '128px'
            }}
        />
    );
}

/* 4. Shimmer button wrapper */
function ShimmerButton({ children, className = '', ...props }) {
    return (
        <div className="relative group inline-flex" {...props}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-rose-500 rounded-2xl blur opacity-50 group-hover:opacity-80 transition duration-500 group-hover:duration-200 animate-pulse" />
            <div className={`relative ${className}`}>{children}</div>
        </div>
    );
}

/* 5. Typewriter */
function Typewriter({ words, className = '' }) {
    const [index, setIndex] = useState(0);
    const [displayed, setDisplayed] = useState('');
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        const word = words[index % words.length];
        const speed = deleting ? 50 : 100;
        const timeout = setTimeout(() => {
            if (!deleting && displayed.length < word.length) {
                setDisplayed(word.slice(0, displayed.length + 1));
            } else if (deleting && displayed.length > 0) {
                setDisplayed(displayed.slice(0, -1));
            } else if (!deleting) {
                setTimeout(() => setDeleting(true), 1400);
            } else {
                setDeleting(false);
                setIndex(i => i + 1);
            }
        }, speed);
        return () => clearTimeout(timeout);
    }, [displayed, deleting, index, words]);
    return (
        <span className={className}>
            {displayed}
            <span className="animate-pulse">|</span>
        </span>
    );
}

/* 6. Animated border card */
function AnimatedBorderCard({ children, className = '' }) {
    return (
        <div className={`relative group ${className}`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 rounded-3xl opacity-0 group-hover:opacity-30 blur transition duration-500" />
            <div className="relative h-full">{children}</div>
        </div>
    );
}

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
                className="bg-gradient-to-br from-[#1a0010] to-[#0f0008] border border-white/10 rounded-3xl p-6 shadow-2xl"
                style={{ transformStyle: 'preserve-3d', animation: 'float 6s ease-in-out infinite' }}
            >
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-700 rounded-xl flex items-center justify-center font-bold text-white">L</div>
                        <div>
                            <div className="text-xs text-gray-400">Bem-vindo,</div>
                            <div className="font-semibold text-white">Lunar Member 👋</div>
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
                            className="flex-1 bg-gradient-to-t from-rose-700 to-pink-500 rounded-t opacity-70" />
                    ))}
                </div>
            </motion.div>
            <motion.div key={currentSale} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-4 -left-4 bg-[#0f0008]/95 border border-pink-900/30 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-4 z-10 shadow-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-700 rounded-xl flex items-center justify-center">
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
    const { isDark } = useTheme();
    const palette = {
        platinum: { hex: isDark ? '#e2e8f0' : '#64748b', glow: 'rgba(100,116,139,0.15)', border: isDark ? 'rgba(226,232,240,0.2)' : 'rgba(100,116,139,0.25)', bg: isDark ? 'rgba(226,232,240,0.06)' : 'rgba(100,116,139,0.06)', badge: 'PLATINUM' },
        gold:     { hex: '#f59e0b', glow: 'rgba(245,158,11,0.18)',  border: 'rgba(245,158,11,0.3)',   bg: isDark ? 'rgba(245,158,11,0.07)'  : 'rgba(245,158,11,0.06)',  badge: 'GOLD' },
        wine:     { hex: '#1ea465', glow: 'rgba(30,164,101,0.20)',   border: 'rgba(30,164,101,0.3)',    bg: isDark ? 'rgba(30,164,101,0.08)'   : 'rgba(30,164,101,0.06)',   badge: 'WINE' },
        emerald:  { hex: '#10b981', glow: 'rgba(16,185,129,0.18)',  border: 'rgba(16,185,129,0.3)',   bg: isDark ? 'rgba(16,185,129,0.07)'  : 'rgba(16,185,129,0.06)',  badge: 'EMERALD' },
    };
    const p = palette[color];
    const cardBg = isDark
        ? `linear-gradient(160deg, ${p.bg}, #0d0d14)`
        : `linear-gradient(160deg, ${p.bg}, #ffffff)`;
    return (
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }} whileHover={{ y: -8, scale: 1.02 }}
            className="relative rounded-3xl p-px overflow-hidden group cursor-default"
            style={{ background: `linear-gradient(135deg, ${p.border}, ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)'} 60%, ${p.border})` }}>
            {/* inner card */}
            <div className="relative rounded-3xl p-8 text-center h-full flex flex-col items-center"
                style={{ background: cardBg }}>
                {/* ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-24 rounded-full blur-[40px] pointer-events-none"
                    style={{ background: p.glow }} />
                {/* badge */}
                <div className="text-[9px] font-black tracking-[0.3em] mb-5 px-3 py-1 rounded-full border"
                    style={{ color: p.hex, borderColor: p.border, background: p.bg }}>
                    {p.badge}
                </div>
                {/* icon */}
                <motion.div
                    animate={{ boxShadow: [`0 0 16px ${p.glow}`, `0 0 36px ${p.glow}`, `0 0 16px ${p.glow}`] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay }}
                    className="w-20 h-20 mb-6 rounded-2xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${p.hex}22, ${p.hex}0a)`, border: `1px solid ${p.border}` }}>
                    <Icon size={36} style={{ color: p.hex }} />
                </motion.div>
                {/* amount */}
                <div className="text-3xl font-black mb-1" style={{ color: p.hex }}>{amount}</div>
                <h3 className={`text-base font-black mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
        </motion.div>
    );
}

function RankingItem({ position, name, sales, amount, avatar, type }) {
    const { isDark } = useTheme();
    const badgeStyles = {
        gold:    'bg-yellow-400/20 text-yellow-500 border-yellow-400/40',
        silver:  'bg-gray-200/60  text-gray-500  border-gray-300/60',
        bronze:  'bg-orange-400/20 text-orange-500 border-orange-400/40',
        regular: 'bg-gray-100     text-gray-500  border-gray-200'
    };
    const avatarStyles = {
        gold:    'from-yellow-400 to-orange-400',
        silver:  'from-gray-400   to-gray-500',
        bronze:  'from-orange-400 to-orange-600',
        regular: 'from-pink-600   to-rose-700'
    };
    return (
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            whileHover={{ x: 4 }}
            className="flex items-center gap-4 rounded-2xl px-5 py-4 transition-all"
            style={isDark
                ? { background: '#1a1a24', boxShadow: '6px 6px 16px #0d0d16, -6px -6px 16px #272732' }
                : { background: '#e8e8f0', boxShadow: '6px 6px 16px #c4c4cc, -6px -6px 16px #ffffff' }}>
            {/* Posição */}
            <div className={`w-9 h-9 shrink-0 flex items-center justify-center font-black text-sm rounded-xl border ${badgeStyles[type]}`}>
                {position}
            </div>
            {/* Avatar */}
            <div className={`w-11 h-11 shrink-0 bg-gradient-to-br ${avatarStyles[type]} rounded-xl flex items-center justify-center font-black text-white text-sm`}>
                {avatar}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="font-black text-gray-900 text-sm truncate">{name}</div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">{sales} vendas este mês</div>
            </div>
            {/* Valor */}
            <div className="text-sm sm:text-base font-black text-emerald-500 shrink-0">{amount}</div>
        </motion.div>
    );
}

function FeatureCard({ icon: Icon, title, desc, delay = 0 }) {
    const { isDark } = useTheme();
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -6 }}
            className="p-10 rounded-[40px] group relative overflow-hidden transition-all duration-300 cursor-default"
            style={isDark ? {
                background: '#1a1a24',
                boxShadow: '10px 10px 30px #0d0d16, -10px -10px 30px #272732'
            } : {
                background: '#e8e8f0',
                boxShadow: '10px 10px 30px #c4c4cc, -10px -10px 30px #ffffff'
            }}>
            <div className="absolute top-0 right-0 p-8 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                <Icon size={120} className="text-primary" />
            </div>
            {/* icon pill - neumorphic inset */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary mb-8 transition-all"
                style={isDark ? {
                    background: '#1a1a24',
                    boxShadow: 'inset 4px 4px 10px #0d0d16, inset -4px -4px 10px #272732'
                } : {
                    background: '#e8e8f0',
                    boxShadow: 'inset 4px 4px 10px #c4c4cc, inset -4px -4px 10px #ffffff'
                }}>
                <Icon size={26} />
            </div>
            <h3 className={`text-2xl font-black mb-4 tracking-tight group-hover:text-primary transition-colors ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{title}</h3>
            <p className={`font-medium leading-relaxed transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{desc}</p>
        </motion.div>
    );
}

function StatItem({ label, value }) {
    return (
        <div className="text-center space-y-1">
            <p className="text-3xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{value}</p>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap">{label}</p>
        </div>
    );
}

function AccordionItem({ title, content }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-pink-100 last:border-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full py-8 flex items-center justify-between text-left group">
                <span className="text-lg md:text-xl font-bold text-gray-700 group-hover:text-gray-900 transition-colors pr-8">{title}</span>
                <div className={cn("w-10 h-10 rounded-full border border-pink-100 flex items-center justify-center transition-all duration-500 bg-pink-50", isOpen && "rotate-180 border-primary/30 bg-primary/10")}>
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
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-pink-100 bg-white/60 backdrop-blur-sm hover:bg-pink-50 hover:border-pink-200 transition-all group">
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
            <SpotlightCursor />
            <GrainOverlay />
            
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

            {/* Navbar — full-width no topo, pill flutuante ao rolar */}
            <nav className={`fixed z-50 flex items-center justify-between transition-all duration-500
                ${scrolled
                    ? 'left-1/2 -translate-x-1/2 top-3 w-[94%] sm:w-[90%] max-w-6xl h-14 sm:h-16 rounded-[32px] px-5 sm:px-8 border shadow-[0_8px_32px_rgba(30,164,101,0.12)] backdrop-blur-3xl ' + (isDark ? 'bg-[#0f0f16]/95 border-white/10' : 'bg-white/95 border-pink-100')
                    : 'left-0 translate-x-0 top-[38px] sm:top-[38px] w-full h-16 sm:h-20 rounded-none px-6 sm:px-16 border-b border-transparent backdrop-blur-sm ' + (isDark ? 'bg-[#0a0a0f]/80' : 'bg-white/80')
                }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                    <img src={isDark ? "/logo_premium.png?v=3" : "/logo_white.jpg?v=3"} alt="DiretoPay" className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl shadow-[0_0_16px_rgba(30,164,101,0.3)]" />
                    <span className={`font-black text-base sm:text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Lunar<span className="text-primary">Pay</span></span>
                </div>
                <div className="hidden lg:flex items-center gap-8 text-[12px] font-semibold text-gray-500">
                    <a href="#" className={`hover:text-gray-900 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : ''}`}>Início</a>
                    <a href="#solucoes" className={`hover:text-gray-900 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : ''}`}>Benefícios</a>
                    <a href="#" className={`hover:text-gray-900 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : ''}`}>Premiações</a>
                    <Link to="/docs" className={`hover:text-primary transition-colors flex items-center gap-1.5 ${isDark ? 'text-gray-400' : ''}`}>API Docs <Code2 size={13} /></Link>
                    <a href="#faq" className={`hover:text-gray-900 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : ''}`}>FAQ</a>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />
                    <Link to="/login" className={`hidden sm:block text-[12px] font-semibold px-4 py-2 rounded-full border transition-all hover:border-primary hover:text-primary ${isDark ? 'text-gray-300 border-white/15' : 'text-gray-600 border-gray-200'}`}>Login</Link>
                    <Link to="/register" className="bg-gradient-to-r from-pink-600 to-rose-700 text-white text-[11px] sm:text-[12px] font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:opacity-90 transition-all active:scale-95 shadow-[0_4px_16px_rgba(30,164,101,0.35)] whitespace-nowrap">Cadastre-se</Link>
                </div>
            </nav>

            {/* Hero Section V2 */}
            <section className={`pt-36 sm:pt-44 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden ${isDark ? 'bg-[#0a0a0f]' : 'bg-[#F8F8FC]'}`}
                style={isDark ? {
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.03) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.03) 75%, rgba(255,255,255,0.03) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.03) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.03) 75%, rgba(255,255,255,0.03) 76%, transparent 77%)',
                    backgroundSize: '55px 55px'
                } : {
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, #E1E1E8 25%, #E1E1E8 26%, transparent 27%, transparent 74%, #E1E1E8 75%, #E1E1E8 76%, transparent 77%), linear-gradient(90deg, transparent 24%, #E1E1E8 25%, #E1E1E8 26%, transparent 27%, transparent 74%, #E1E1E8 75%, #E1E1E8 76%, transparent 77%)',
                    backgroundSize: '55px 55px'
                }}>
                <Particles count={22} />
                {/* fade bottom para suavizar saída do grid */}
                <div className={`absolute bottom-0 inset-x-0 h-40 pointer-events-none ${isDark ? 'bg-gradient-to-t from-[#0a0a0f]' : 'bg-gradient-to-t from-[#F8F8FC]'} to-transparent`} />
                <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none ${isDark ? 'bg-gradient-to-bl from-rose-900/20 to-pink-900/10 opacity-40' : 'bg-gradient-to-bl from-pink-100 to-rose-50 opacity-60'}`} />
                <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none ${isDark ? 'bg-gradient-to-tr from-rose-900/15 to-transparent opacity-30' : 'bg-gradient-to-tr from-pink-50 to-transparent opacity-40'}`} />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                        {/* Lado Esquerdo */}
                        <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${isDark ? 'bg-rose-950/40 border-rose-500/40' : 'bg-primary/5 border-primary/15'}`}>
                                <div className={`w-2 h-2 shrink-0 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'} animate-pulse`} />
                                <span className={`text-xs sm:text-sm font-black tracking-tight ${isDark ? 'text-pink-300' : 'text-primary'}`}>+3.000 Sellers que confiam em nós!</span>
                            </motion.div>

                            <div className="space-y-6">
                                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                    className={`text-[2.2rem] sm:text-5xl lg:text-6xl font-[1000] leading-[1.1] tracking-[-0.03em] ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    O lado invisível que faz{' '}
                                    <Typewriter
                                        words={['sua operação crescer!', 'suas vendas explodirem!', 'seu lucro decolar!', 'você ficar anônimo!']}
                                        className="bg-gradient-to-r from-pink-600 to-rose-700 bg-clip-text text-transparent"
                                    />
                                </motion.h1>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                    className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                                    Receba via Pix com <strong>anonimato garantido</strong>. Sem exposição de CPF/CNPJ, saques instantâneos e <strong>blindagem total contra MED</strong>.
                                </motion.p>
                            </div>

                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <ShimmerButton className="w-full sm:w-auto">
                                <Link to="/register" className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-700 text-white h-14 px-8 rounded-2xl flex items-center justify-center font-black hover:opacity-90 transition-all active:scale-95 group">
                                    <ShieldCheck className="mr-2 shrink-0" size={20} />
                                    Quero entrar na DiretoPay
                                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform shrink-0" size={18} />
                                </Link>
                                </ShimmerButton>
                                <a href="#solucoes" className="w-full sm:w-auto bg-gray-50 border border-gray-200 h-14 px-8 rounded-2xl text-gray-700 font-black hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                                    <Play size={18} className="shrink-0" />
                                    Ver como funciona
                                </a>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                                className="flex flex-wrap justify-center lg:justify-start gap-3">
                                {[{ icon: ShieldCheck, text: '100% Anônimo' }, { icon: Zap, text: 'Saque Instantâneo' }, { icon: Lock, text: 'Anti-MED' }, { icon: User, text: 'Sem Documentos' }].map((item, i) => (
                                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}>
                                        <item.icon size={14} className="text-primary shrink-0" />
                                        {item.text}
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Lado Direito - Dashboard: só desktop */}
                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
                            className="relative hidden lg:block">
                            <DashboardMockup />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Awards Section */}
            <section className={`relative py-28 px-6 overflow-hidden ${isDark ? 'bg-[#0d0d14]' : 'bg-[#faf9ff]'}`}>
                {/* decorative glows */}
                <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-yellow-500/5' : 'bg-yellow-300/20'}`} />
                <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-pink-700/8' : 'bg-pink-300/20'}`} />
                <div className={`absolute top-1/2 left-0 w-72 h-72 rounded-full blur-[100px] pointer-events-none ${isDark ? 'bg-emerald-900/10' : 'bg-emerald-100/40'}`} />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-black mb-6">
                            <Trophy size={16} /> Programa de Recompensas
                        </motion.div>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                            className={`text-3xl sm:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>A DiretoPay vibra a cada meta batida!</motion.h2>
                        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                            className="text-gray-500 text-lg">Reconhecemos sua performance com prêmios exclusivos. Cada marco é uma conquista celebrada.</motion.p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AwardCard icon={Medal} amount="100 Mil" name="Lunar Platinum" desc="Para quem transforma os primeiros 100 mil em apenas o começo." color="platinum" delay={0.1} />
                        <AwardCard icon={Trophy} amount="500 Mil" name="Lunar Gold" desc="Reconhece a ousadia de quem encara grandes desafios." color="gold" delay={0.2} />
                        <AwardCard icon={Crown} amount="1 Milhão" name="Lunar Wine" desc="Celebra a excelência rara e sofisticação estratégica." color="wine" delay={0.3} />
                        <AwardCard icon={Gem} amount="5 Milhões" name="Lunar Emerald" desc="Para quem chega aos 5 milhões não por acaso, mas por legado." color="emerald" delay={0.4} />
                    </div>
                </div>
            </section>

            {/* Multi-Adquirentes Section */}
            <section className={`py-16 sm:py-24 px-4 sm:px-6 ${isDark ? 'bg-[#0a0a0f]' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
                        <div>
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-black mb-6">
                                <Network size={16} /> Multi-Adquirentes
                            </motion.div>
                            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                                className="text-3xl sm:text-4xl font-black mb-6 leading-tight">
                                Adquirente falhou?<br /><span className="text-primary">A DiretoPay encontra outra rota na mesma hora.</span>
                            </motion.h2>
                            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                                className="text-gray-400 text-lg mb-8 leading-relaxed">
                                Deixe a DiretoPay encontrar a rota com maior chance de aprovação enquanto você foca em vender! Nosso sistema inteligente alterna automaticamente entre múltiplos processadores.
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
                            className="relative rounded-3xl overflow-hidden bg-[#0f0008] border border-pink-900/30 p-5 sm:p-8 shadow-2xl">

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-700/10 rounded-full blur-[60px] pointer-events-none" />

                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                                <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">Roteamento Inteligente em Tempo Real</span>
                            </div>

                            {/* Mobile: stacked layout */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-2 relative z-10">

                                {/* Cliente */}
                                <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                                        <User size={20} className="text-gray-300" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400">Cliente</span>
                                </div>

                                {/* Seta — horizontal no sm+, vertical no mobile */}
                                <div className="hidden sm:flex flex-1 items-center">
                                    <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-rose-600/60" />
                                    <ArrowRight size={14} className="text-pink-400 shrink-0" />
                                </div>
                                <div className="flex sm:hidden items-center justify-center text-pink-400">
                                    <ArrowRight size={14} className="rotate-90" />
                                </div>

                                {/* Adquirentes */}
                                <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[150px]">
                                    {[
                                        { label: 'Gateway A', active: false, status: 'Offline' },
                                        { label: 'Gateway B', active: true, status: 'Ativo ✓' },
                                        { label: 'Gateway C', active: false, status: 'Stand-by' },
                                    ].map(({ label, active, status }) => (
                                        <motion.div key={label}
                                            animate={active ? { scale: [1, 1.02, 1] } : {}}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
                                                active
                                                    ? 'bg-rose-700/20 border-rose-600/80 shadow-[0_0_20px_rgba(30,164,101,0.25)]'
                                                    : 'bg-white/5 border-white/10 opacity-40'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                                                <span className={`font-bold text-sm ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase ${active ? 'text-pink-300' : 'text-gray-600'}`}>{status}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Seta */}
                                <div className="hidden sm:flex flex-1 items-center">
                                    <div className="flex-1 h-px bg-gradient-to-r from-rose-600/60 to-emerald-500/60" />
                                    <ArrowRight size={14} className="text-emerald-400 shrink-0" />
                                </div>
                                <div className="flex sm:hidden items-center justify-center text-emerald-400">
                                    <ArrowRight size={14} className="rotate-90" />
                                </div>

                                {/* Resultado */}
                                <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
                                    <motion.div
                                        animate={{ boxShadow: ['0 0 12px rgba(16,185,129,0.2)', '0 0 28px rgba(16,185,129,0.4)', '0 0 12px rgba(16,185,129,0.2)'] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center">
                                        <Check size={20} className="text-emerald-400" />
                                    </motion.div>
                                    <span className="text-xs font-bold text-emerald-400">Aprovado</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-3 gap-3 text-center">
                                {[
                                    { label: 'Uptime', value: '99.9%' },
                                    { label: 'Latência', value: '<80ms' },
                                    { label: 'Fallback', value: 'Auto' },
                                ].map(s => (
                                    <div key={s.label}>
                                        <div className="text-base sm:text-lg font-black text-white">{s.value}</div>
                                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Ranking Section */}
            <section className={`py-24 px-6 ${isDark ? 'bg-[#0a0a0f]' : ''}`} style={isDark ? {} : { background: '#e8e8f0' }}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-black mb-6">
                            <Flame size={16} /> Competição Mensal
                        </motion.div>
                        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                            className="text-3xl sm:text-5xl font-black mb-4">Na DiretoPay, sua performance importa!</motion.h2>
                        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg">Todos os meses, os sellers disputam o ranking para ganhar prêmios exclusivos. Vendeu mais? Sobe no ranking. Atingiu o topo? Premiação garantida!</motion.p>
                    </div>
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className={`rounded-3xl p-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'} shadow-xl`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <Trophy size={28} className="text-yellow-400 shrink-0" />
                                <h3 className="text-xl sm:text-2xl font-black">Top Sellers - Maio 2025</h3>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-black w-fit">
                                <Gift size={14} /> Prêmios todos os meses
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
            <section id="solucoes" className={`py-32 px-6 ${isDark ? 'bg-[#0a0a0f]' : ''}`} style={isDark ? {} : { background: '#e8e8f0' }}>
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-16 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                        <div className="space-y-4">
                            <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Soluções Corporativas</p>
                            <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>Projetado para <br /> <span className="text-primary italic">quem joga grande.</span></h2>
                        </div>
                        <p className={`max-w-xs font-bold leading-relaxed text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Eliminamos as barreiras entre sua venda e seu lucro com tecnologia de ponta.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatedBorderCard><FeatureCard icon={ShieldCheck} title="Anonimato Bancário" desc="Seus dados pessoais ou da sua empresa nunca são revelados ao pagador. Total descrição para o seu negócio." delay={0.1} /></AnimatedBorderCard>
                        <AnimatedBorderCard><FeatureCard icon={Zap} title="Conversão Extrema" desc="Checkout otimizado para o Pix. Experiência de um clique que reduz o abandono em até 45%." delay={0.2} /></AnimatedBorderCard>
                        <AnimatedBorderCard><FeatureCard icon={Layers} title="DiretoPay - Dashboard Premium" desc="Gerencie múltiplos projetos e fluxos financeiros em uma única dashboard integrada e centralizada." delay={0.3} /></AnimatedBorderCard>
                        <AnimatedBorderCard><FeatureCard icon={BarChart3} title="Analytics em Real-time" desc="Acompanhe cada centavo que entra. Insights detalhados de conversão e comportamento do cliente." delay={0.4} /></AnimatedBorderCard>
                        <AnimatedBorderCard><FeatureCard icon={Rocket} title="Saques Sem Taxas" desc="Transferências ultra-rápidas e gratuitas para sua conta bancária de preferência logo após o processamento." delay={0.5} /></AnimatedBorderCard>
                        <AnimatedBorderCard><FeatureCard icon={Globe} title="Infraestrutura Global" desc="Servidores distribuídos para garantir que seu link esteja sempre no ar, 24 horas por dia, 7 dias por semana." delay={0.6} /></AnimatedBorderCard>
                    </div>
                </div>
            </section>

            {/* API Section */}
            <section id="tecnologia" className="py-16 sm:py-32 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
                    <div className="space-y-10">
                        <div className="bg-primary/10 w-fit px-4 py-1.5 rounded-lg border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">Developers First</div>
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-gray-900">A API que <br /> <span className="text-gray-300 italic tracking-[-0.05em]">você sempre quis.</span></h2>
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
                        <div className="bg-[#0f0f14] border border-white/10 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 font-mono text-xs sm:text-sm leading-relaxed shadow-2xl relative overflow-hidden overflow-x-auto">
                            <div className="flex gap-2 mb-8">
                                <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
                            </div>
                            <div className="space-y-2 text-white/80">
                                <p className="text-white/20">// Initialize your integration</p>
                                <p><span className="text-purple-400">const</span> diretoPay = <span className="text-blue-400">new</span> <span className="text-purple-400">DiretoPay</span>{'({'} key: <span className="text-orange-400">'pk_live_...'</span> {'})'};</p>
                                <p>&nbsp;</p>
                                <p className="text-white/20">// Generate an anonymous Pix</p>
                                <p><span className="text-purple-400">await</span> diretoPay.<span className="text-blue-400">createTransaction</span>{'({'}</p>
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
                        {['TECHFLOW', 'ZENITH', 'NEXUS-X', 'CRYPTO-GEN', 'PULSE-PAY', 'DIRETOPAY-STT'].map(p => (
                            <span key={p} className="text-xl md:text-3xl font-[1000] italic tracking-tighter text-gray-600 whitespace-nowrap">{p}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-16 sm:py-32 px-4 sm:px-6 bg-white">
                <div className="max-w-4xl mx-auto space-y-20 text-center md:text-left">
                    <div className="space-y-4 text-center">
                        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-gray-900">Respostas para <br /><span className="bg-gradient-to-r from-pink-600 to-rose-700 bg-clip-text text-transparent italic">suas dúvidas.</span></h2>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Suporte humanizado disponível 24/7</p>
                    </div>
                    <div className="bg-gray-50 border border-pink-100 rounded-[28px] sm:rounded-[48px] p-5 sm:p-8 md:p-16">
                        <AccordionItem title="O DiretoPay é realmente anônimo?" content="Sim. Utilizamos uma camada de abstração bancária onde seus dados pessoais ou da sua empresa nunca aparecem para o pagador final. O dinheiro cai na nossa conta de liquidação e é repassado instantaneamente para você." />
                        <AccordionItem title="Tem alguma taxa por transação?" content="Não! A DiretoPay não cobra taxa por transação. Você recebe o valor integral das suas vendas diretamente no seu saldo, sem surpresas e sem taxas escondidas." />
                        <AccordionItem title="Como funciona o sistema de saques?" content="Após a confirmação do pagamento pelo nosso sistema (que ocorre em milissegundos), o saldo fica disponível em sua conta DiretoPay. Você pode solicitar o saque via Pix para sua chave cadastrada a qualquer momento, sem taxas." />
                        <AccordionItem title="Posso integrar com qualquer site ou bot?" content="Com certeza. Nossa API REST é agnóstica de linguagem e plataforma. Seja em um bot de Telegram, um dashboard customizado ou um e-commerce em WordPress, a integração é fluida e documentada." />
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-16 sm:py-32 px-4 sm:px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-pink-600 via-rose-600 to-rose-800 p-8 sm:p-12 md:p-32 rounded-[32px] sm:rounded-[64px] relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-[60px]" />
                    <div className="space-y-12 relative z-10">
                        <h2 className="text-3xl sm:text-5xl md:text-8xl font-black leading-[0.95] tracking-[-0.04em] uppercase text-white">O futuro dos <span className="text-pink-200">pagamentos</span> é hoje.</h2>
                        <div className="pt-6">
                            <Link to="/register" className="inline-flex items-center justify-center bg-white text-primary h-14 sm:h-20 md:h-24 px-10 sm:px-16 md:px-20 rounded-[20px] sm:rounded-[32px] text-sm sm:text-xl md:text-2xl font-black hover:bg-pink-50 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.2)] whitespace-nowrap active:scale-95">
                                CRIAR CONTA AGORA
                            </Link>
                        </div>
                        <p className="text-white/50 font-bold uppercase tracking-[0.2em] text-[10px]">Leva menos de 1 minuto para começar.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-4 sm:px-8 pb-6 pt-2 bg-gray-50">
                <div className="max-w-6xl mx-auto bg-white border border-pink-100 rounded-[28px] sm:rounded-[36px] px-6 sm:px-10 py-10 sm:py-12 shadow-sm">
                    {/* Top grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

                        {/* Col 1 - Brand */}
                        <div className="space-y-5 lg:col-span-1">
                            <div className="flex items-center gap-2">
                                <img src={isDark ? "/logo_premium.png?v=3" : "/logo_white.jpg?v=3"} alt="DiretoPay" className="w-8 h-8 rounded-lg" />
                                <span className="font-black text-base text-gray-900">Lunar<span className="text-primary">Pay</span></span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">O lado invisível que faz sua operação crescer!</p>
                            <div className="flex flex-col gap-2">
                                <a href="#" className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    LinkedIn
                                </a>
                                <a href="https://instagram.com/user.diretopay" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                    @user.diretopay
                                </a>
                            </div>
                        </div>

                        {/* Col 2 - Páginas */}
                        <div className="space-y-4">
                            <p className="text-[11px] font-black text-gray-800 uppercase tracking-[0.2em]">Páginas</p>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-primary transition-colors">Início</a></li>
                                <li><a href="#solucoes" className="hover:text-primary transition-colors">Benefícios</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Premiações</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Quem Somos</a></li>
                                <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
                            </ul>
                        </div>

                        {/* Col 3 - Informação */}
                        <div className="space-y-4">
                            <p className="text-[11px] font-black text-gray-800 uppercase tracking-[0.2em]">Informação</p>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li><a href="/suporte.php" className="hover:text-primary transition-colors">Suporte</a></li>
                                <li><a href="/privacidade.php" className="hover:text-primary transition-colors">Pol. de Privacidade</a></li>
                                <li><a href="/termos.php" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                                <li><a href="/sobre.php" className="hover:text-primary transition-colors">Sobre Nós</a></li>
                                <li><Link to="/docs" className="hover:text-primary transition-colors">API Docs</Link></li>
                            </ul>
                        </div>

                        {/* Col 4 - App Stores */}
                        <div className="space-y-3 flex flex-col justify-start">
                            <a href="#" className="flex items-center gap-3 bg-primary text-white rounded-xl px-5 py-3 hover:bg-secondary transition-colors w-full sm:w-auto">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                                <div className="text-left leading-tight">
                                    <div className="text-[9px] opacity-80">Disponível na</div>
                                    <div className="text-sm font-bold">App Store</div>
                                </div>
                            </a>
                            <a href="#" className="flex items-center gap-3 bg-primary text-white rounded-xl px-5 py-3 hover:bg-secondary transition-colors w-full sm:w-auto">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.19l12.2-12.2L12.92 8.3 3.18 23.76zm17.95-11.71L18.4 10.6l-3.4 3.4 3.4 3.4 2.77-1.54c.79-.44.79-1.63-.04-2.81zM2.4.46C2.15.72 2 1.1 2 1.6v20.8c0 .5.15.88.4 1.14l.06.06 11.65-11.65v-.3L2.46.4 2.4.46zm10.53 10.88l3.4-3.4-2.56-4.46L2.4.46C2.15.72 2 1.1 2 1.6v.08l10.93 9.66z"/></svg>
                                <div className="text-left leading-tight">
                                    <div className="text-[9px] opacity-80">Disponível no</div>
                                    <div className="text-sm font-bold">Google Play</div>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-6 gap-3">
                        <p className="text-gray-400 text-sm">© 2026 DiretoPay · CNPJ [CNPJ]</p>
                        <Link to="/register" className="text-sm text-gray-400 hover:text-primary transition-colors font-medium">Criar Conta DiretoPay →</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
