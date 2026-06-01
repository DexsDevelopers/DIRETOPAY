import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Store, Sun, Moon, Play, Trophy, Medal, Crown, Gem,
    Network, User, Landmark, Check, Flame, Gift, Lock, ArrowRight,
    CheckCircle, Zap, Code2, ExternalLink, ChevronDown, Star,
    Layers, BarChart3, Rocket, Globe, Activity, ArrowUpRight, HelpCircle,
    Smartphone, Server, RefreshCw, Cpu, Award, DollarSign, Users, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

// ===== MILITARY-GRADE AWARDS METADATA =====
const MILESTONE_PLATES = [
    {
        id: '10k',
        amount: '10K',
        title: 'Clube de Entrada',
        badge: 'Bronze Tier',
        desc: 'O passaporte de validação digital.',
        subdesc: 'Ao atingir R$ 10.000 transacionados na DiretoPay, você oficializa sua entrada no mercado com a placa física exclusiva de Bronze. Uma conquista simbólica do seu primeiro marco de escala.',
        image: '/assets/placa-10k-D-keX8kW.webp',
        perks: ['Acesso ao canal do Telegram VIP', 'Suporte prioritário via chat', 'Certificado digital de validação']
    },
    {
        id: '100k',
        amount: '100K',
        title: 'Clube dos 6 Dígitos',
        badge: 'Silver Tier',
        desc: 'A consolidação da sua estrutura de vendas.',
        subdesc: 'Alcançar R$ 100.000 faturados demonstra consistência e profissionalismo. Receba a placa de Prata Escovada com acabamento industrial premium na sua casa.',
        image: '/assets/placa-100k-L8htTMxu.webp',
        perks: ['Isenção de taxa de saque por 30 dias', 'Acesso antecipado a novos produtos beta', 'Suporte gerencial exclusivo']
    },
    {
        id: '250k',
        amount: '250K',
        title: 'Alta Performance',
        badge: 'Gold Tier',
        desc: 'O nível onde apenas os consistentes operam.',
        subdesc: 'Bater R$ 250.000 na DiretoPay te garante o troféu Ouro Premium. Um marco visual para o seu escritório de que seu funil de vendas é altamente lucrativo.',
        image: '/assets/placa-250k-p9cuG3oH.webp',
        perks: ['Gerente de Contas dedicado no WhatsApp', 'Redução personalizada da taxa fixa do Pix', 'Painel de relatórios avançados ativado']
    },
    {
        id: '500k',
        amount: '500K',
        title: 'Meio Milhão',
        badge: 'Platinum Tier',
        desc: 'Preparando sua operação para o topo do mercado.',
        subdesc: 'Com R$ 500.000 transacionados, você ganha a Placa de Platina de Luxo e consultoria exclusiva de otimização de checkout diretamente com nosso time de engenharia financeira.',
        image: '/assets/placa-500k-Dywjx6p8.webp',
        perks: ['Taxas Pix VIP sob medida', 'Consultoria de otimização de conversão', 'Webhooks redundantes dedicados']
    },
    {
        id: '1m',
        amount: '1M',
        title: 'Clube Black Milionário',
        badge: 'Black Diamond',
        desc: 'O Olimpo absoluto do e-commerce brasileiro.',
        subdesc: 'Um milhão de reais transacionados! A placa Black definitiva é entregue em uma caixa de luxo personalizada, marcando sua consolidação definitiva entre os maiores do mercado.',
        image: '/assets/placa-1milhao-D7KkbHhg.webp',
        perks: ['Taxa Pix exclusiva a partir de 0.89%', 'Encontros de Mastermind presenciais', 'Acesso à infraestrutura de servidores dedicados']
    }
];

// ===== CURSOR SPOTLIGHT EFFECT =====
function SpotlightCursor() {
    const [pos, setPos] = useState({ x: -999, y: -999 });
    useEffect(() => {
        const move = (e) => setPos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);
    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
            style={{ background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(16,185,129,0.05), transparent 40%)` }}
        />
    );
}

// ===== PARTICLES BACKGROUND =====
function Particles({ count = 15 }) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 4,
    }));
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(p => (
                <motion.div key={p.id}
                    className="absolute rounded-full bg-emerald-500/15"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                    animate={{ y: [0, -60, 0], opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}

// ===== GLOWING MESH OVERLAYS =====
function GrainOverlay() {
    return (
        <div className="pointer-events-none fixed inset-0 z-[9998] opacity-[0.012]"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundSize: '128px'
            }}
        />
    );
}

// ===== TYPEWRITER TITLE EFFECT =====
function Typewriter({ words, className = '' }) {
    const [index, setIndex] = useState(0);
    const [displayed, setDisplayed] = useState('');
    const [deleting, setDeleting] = useState(false);
    
    useEffect(() => {
        const word = words[index % words.length];
        const speed = deleting ? 35 : 70;
        const timeout = setTimeout(() => {
            if (!deleting && displayed.length < word.length) {
                setDisplayed(word.slice(0, displayed.length + 1));
            } else if (deleting && displayed.length > 0) {
                setDisplayed(displayed.slice(0, -1));
            } else if (!deleting) {
                setTimeout(() => setDeleting(true), 2500);
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
            <span className="animate-pulse ml-0.5 text-emerald-400">|</span>
        </span>
    );
}

// ===== INTERACTIVE SAVINGS CALCULATOR =====
function SavingsCalculator() {
    const { isDark } = useTheme();
    const [revenue, setRevenue] = useState(75000);
    const [ticket, setTicket] = useState(97);

    // Dynamic fee rates based on monthly processing revenue
    const getDiretoRate = (val) => {
        if (val < 30000) return 0.0149; // 1.49% under 30k
        if (val < 100000) return 0.0129; // 1.29% under 100k
        if (val < 300000) return 0.0109; // 1.09% under 300k
        return 0.0099; // 0.99% flat for high volume
    };

    const rateStandard = 0.0299; // Standard gateway Pix rate
    const flatStandard = 1.00; // Standard flat fee per order

    const transactions = Math.round(revenue / ticket);
    const costStandard = (revenue * rateStandard) + (transactions * flatStandard);
    
    const rateDireto = getDiretoRate(revenue);
    const costDireto = revenue * rateDireto; // No flat fee at DiretoPay

    const monthlySavings = costStandard - costDireto;
    const annualSavings = monthlySavings * 12;
    // Estimated conversion increase thanks to instant routing failover (12% average)
    const recoveredRevenue = revenue * 0.12;
    const totalAdvantage = monthlySavings + recoveredRevenue;

    return (
        <div className={`p-6 sm:p-8 rounded-[32px] border transition-all relative overflow-hidden ${
            isDark 
                ? 'bg-[#0b0c10]/95 border-white/5 shadow-2xl' 
                : 'bg-white border-emerald-100 shadow-[0_15px_40px_rgba(16,185,129,0.04)]'
        }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
            
            <div className="mb-6">
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    Calculadora de Eficiência
                </span>
                <h3 className={`text-xl sm:text-2xl font-black mt-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Estime seus ganhos imediatos
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                    Compare os custos de transação do mercado e veja a diferença de faturamento líquido.
                </p>
            </div>

            <div className="space-y-6">
                {/* Revenue Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Faturamento Mensal</span>
                        <span className="text-emerald-500 font-extrabold text-sm">
                            R$ {revenue.toLocaleString('pt-BR')}
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="5000" 
                        max="500000" 
                        step="5000"
                        value={revenue}
                        onChange={(e) => setRevenue(Number(e.target.value))}
                        className="w-full h-1.5 bg-emerald-950/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                        <span>R$ 5K</span>
                        <span>R$ 100K</span>
                        <span>R$ 250K</span>
                        <span>R$ 500K+</span>
                    </div>
                </div>

                {/* Ticket Selector */}
                <div className="space-y-2">
                    <span className={`block text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Ticket Médio do Produto
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                        {[47, 97, 197, 497].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTicket(t)}
                                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                    ticket === t
                                        ? 'bg-primary text-black border-primary font-black shadow-[0_4px_12px_rgba(30,164,101,0.2)]'
                                        : isDark
                                            ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                R$ {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Performance Metrics Cards */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                        <div className="text-[9px] text-gray-500 font-black uppercase tracking-wider mb-1">Custo Concorrentes</div>
                        <div className="text-sm font-extrabold text-red-500">R$ {costStandard.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-[8px] text-gray-400 mt-0.5 mt-1">Pix: 2.99% + R$ 1,00</div>
                    </div>
                    <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50/50 border-emerald-100'}`}>
                        <div className="text-[9px] text-emerald-500 font-black uppercase tracking-wider mb-1">Custo DiretoPay</div>
                        <div className="text-sm font-extrabold text-emerald-500">R$ {costDireto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-[8px] text-emerald-400/80 mt-1">Taxa Unificada: {(rateDireto * 100).toFixed(2)}%</div>
                    </div>
                </div>

                {/* Final Advantage Summary Banner */}
                <div className="bg-gradient-to-br from-emerald-600 to-green-800 p-5 rounded-2xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-200">Economia + Recuperação Mensal</div>
                            <div className="text-xl sm:text-2xl font-black mt-0.5">
                                + R$ {totalAdvantage.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </div>
                            <div className="text-[9px] text-emerald-100/75 mt-0.5">
                                Economia de R$ {monthlySavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} + R$ {recoveredRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} recuperados.
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-[8px] font-black uppercase tracking-widest bg-black/25 px-2.5 py-1 rounded-full border border-white/10 block">
                                R$ {annualSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== REAL-TIME FAILOVER CHECKOUT SIMULATOR =====
function CheckoutSimulator() {
    const { isDark } = useTheme();
    const [simState, setSimState] = useState('idle'); // idle -> routing -> failover -> paying -> success
    const [progress, setProgress] = useState(0);

    const startSimulation = () => {
        setSimState('routing');
        setProgress(0);
    };

    useEffect(() => {
        let interval;
        if (simState === 'routing') {
            interval = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setSimState('failover'), 600);
                        return 100;
                    }
                    return p + 15;
                });
            }, 100);
        } else if (simState === 'failover') {
            const timeout = setTimeout(() => {
                setSimState('paying');
            }, 2500);
            return () => clearTimeout(timeout);
        }
        return () => clearInterval(interval);
    }, [simState]);

    return (
        <div className={`p-6 sm:p-8 rounded-[32px] border relative overflow-hidden flex flex-col justify-between h-full ${
            isDark 
                ? 'bg-[#08090d] border-white/5 shadow-2xl' 
                : 'bg-white border-emerald-100 shadow-[0_15px_40px_rgba(16,185,129,0.04)]'
        }`}>
            <div className="mb-4">
                <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    Simulador Anti-Instabilidade
                </span>
                <h3 className={`text-xl font-black mt-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Roteamento em Tempo Real
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                    Veja como a DiretoPay salva uma transação em menos de 1 segundo se uma adquirente cair.
                </p>
            </div>

            {/* Mobile Mockup Card Container */}
            <div className={`flex-1 min-h-[300px] border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                isDark ? 'bg-black/40 border-white/5' : 'bg-gray-50/50 border-gray-100'
            }`}>
                <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500/10" />

                {/* MOCKUP HEADER */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5 text-[9px] font-bold text-gray-500 uppercase">
                    <span className="flex items-center gap-1.5">
                        <Smartphone size={10} /> Pix Checkout
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                        Conexão Criptografada
                    </span>
                </div>

                {/* SIMULATION STATES SCREEN */}
                <div className="my-auto py-4 flex flex-col items-center justify-center min-h-[200px]">
                    <AnimatePresence mode="wait">
                        {simState === 'idle' && (
                            <motion.div 
                                key="idle" 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full text-center space-y-4"
                            >
                                <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20">
                                    <Store size={22} />
                                </div>
                                <div>
                                    <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Checkout de Exemplo</div>
                                    <div className="text-[11px] text-gray-500 mt-1">Produto: Acesso Premium Vip</div>
                                    <div className="text-base font-black text-emerald-500 mt-1">R$ 97,00</div>
                                </div>
                                <button 
                                    onClick={startSimulation}
                                    className="w-full bg-primary text-black font-black uppercase text-[10px] tracking-wider py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                                >
                                    Pagar com Pix
                                </button>
                            </motion.div>
                        )}

                        {simState === 'routing' && (
                            <motion.div 
                                key="routing" 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full text-center space-y-4"
                            >
                                <RefreshCw className="animate-spin text-emerald-500 mx-auto" size={28} />
                                <div>
                                    <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Roteamento Inteligente</div>
                                    <div className="text-[10px] text-gray-400 mt-1">Analisando latência das adquirentes...</div>
                                </div>
                                <div className="w-full bg-emerald-950/20 h-1.5 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-emerald-500" 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${progress}%` }} 
                                    />
                                </div>
                            </motion.div>
                        )}

                        {simState === 'failover' && (
                            <motion.div 
                                key="failover" 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full space-y-3"
                            >
                                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl p-3.5 flex items-start gap-2.5">
                                    <Cpu className="shrink-0 text-amber-500 mt-0.5 animate-pulse" size={16} />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-wider">Falha no Gateway Alpha</div>
                                        <p className="text-[9px] leading-relaxed text-gray-400 mt-1">
                                            Queda de conexão detectada (Time-out). Redirecionando transação para adquirente secundária...
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 font-bold">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                                    Failover acionado em 180ms
                                </div>
                            </motion.div>
                        )}

                        {simState === 'paying' && (
                            <motion.div 
                                key="paying" 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full text-center space-y-3"
                            >
                                <div className="mx-auto w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center border border-gray-200">
                                    <div className="w-full h-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQAQMAAAD2275QAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUHBAcMEww0a8lExQAAADpJREFUOMtjYGBgQAILGDBAgwEM4AGkGQYwAM1gAJsBB1AZMIDAQDrhBzAATvgBDIATfgAD4IQfgAgDAJkVC/wD391bAAAAAElFTkSuQmCC')] bg-cover" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-emerald-400 uppercase">Pix Gerado via Gateway Beta!</div>
                                    <p className="text-[9px] text-gray-500 mt-1">Copie o código abaixo para simular o pagamento.</p>
                                </div>
                                <button 
                                    onClick={() => setSimState('success')}
                                    className="w-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold uppercase text-[9px] tracking-wider py-2 rounded-xl hover:bg-emerald-500/20 active:scale-95 transition-all"
                                >
                                    Confirmar Pagamento Simulado
                                </button>
                            </motion.div>
                        )}

                        {simState === 'success' && (
                            <motion.div 
                                key="success" 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full text-center space-y-4"
                            >
                                <div className="mx-auto w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/40">
                                    <CheckCircle size={22} className="animate-bounce" />
                                </div>
                                <div>
                                    <div className="text-xs font-black text-emerald-500 uppercase tracking-wider">Aprovado e Liquidado!</div>
                                    <div className="text-[10px] text-gray-500 mt-1">Split de saldo enviado ao dashboard</div>
                                    <div className="text-[9px] text-gray-400/90 mt-1 bg-white/5 py-1 px-2.5 rounded-lg border border-white/5 w-fit mx-auto">
                                        Split: R$ 87,30 (Seller) | R$ 9,70 (Afiliado)
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSimState('idle')}
                                    className="w-full bg-white/5 border border-white/10 dark:text-gray-300 hover:text-white text-gray-700 font-bold uppercase text-[9px] tracking-wider py-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                                >
                                    Reiniciar Fluxo
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* MOCKUP FOOTER */}
                <div className="pt-2 border-t border-white/5 text-center text-[8px] text-gray-600 font-bold uppercase">
                    Processado por DiretoPay Ltda
                </div>
            </div>
        </div>
    );
}

// ===== RAKING BOARD / ELITE BOARD =====
function LeaderboardRow({ rank, name, segment, approval, volume, badge, avatar, color }) {
    const { isDark } = useTheme();
    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            whileHover={{ x: 3 }}
            className={`flex items-center gap-3 sm:gap-4 rounded-2xl px-4 py-3.5 transition-all border ${
                isDark 
                    ? 'bg-[#0b0c10]/80 border-white/5 hover:border-emerald-500/10' 
                    : 'bg-white border-gray-100 shadow-sm hover:border-emerald-500/10'
            }`}
        >
            {/* RANK BADGE */}
            <div className={`w-7 h-7 shrink-0 flex items-center justify-center font-black text-xs rounded-lg border ${color}`}>
                {rank}
            </div>

            {/* AVATAR BOX */}
            <div className="w-9 h-9 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center font-black text-emerald-400 text-xs">
                {avatar}
            </div>

            {/* MERCHANT INFO */}
            <div className="flex-1 min-w-0">
                <div className={`font-black text-xs sm:text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[8px] text-gray-500 font-black uppercase tracking-wider">{segment}</span>
                    <span className="text-gray-700 text-[8px]">•</span>
                    <span className="text-[8px] text-emerald-400 font-extrabold">{approval} Aprovação</span>
                </div>
            </div>

            {/* PERFORMANCE BADGES */}
            <div className="text-right shrink-0">
                <div className="text-xs sm:text-sm font-black text-emerald-500">{volume}</div>
                <div className="text-[8px] text-gray-500 font-extrabold uppercase mt-0.5 tracking-wider">{badge}</div>
            </div>
        </motion.div>
    );
}

// ===== PILLAR OPTIMIZED FEATURES =====
function PillarCard({ icon: Icon, title, desc, delay = 0 }) {
    const { isDark } = useTheme();
    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className={`p-6 rounded-[28px] group relative overflow-hidden transition-all duration-300 border ${
                isDark 
                    ? 'bg-[#0b0c10]/90 border-white/5 hover:border-emerald-500/25 shadow-2xl' 
                    : 'bg-white border-gray-100 hover:border-emerald-500/25 shadow-sm'
            }`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <Icon size={80} className="text-emerald-500" />
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-emerald-400 mb-5 border ${
                isDark ? 'bg-white/[0.02] border-white/10' : 'bg-emerald-50 border-emerald-100'
            }`}>
                <Icon size={18} />
            </div>
            <h4 className={`text-base font-black mb-2 tracking-tight group-hover:text-emerald-500 transition-colors ${
                isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>
                {title}
            </h4>
            <p className={`text-[11px] font-semibold leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
                {desc}
            </p>
        </motion.div>
    );
}

// ===== FAQ ACCORDION ITEM =====
function AccordionItem({ title, content }) {
    const [isOpen, setIsOpen] = useState(false);
    const { isDark } = useTheme();
    return (
        <div className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-emerald-100/30'}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full py-5 flex items-center justify-between text-left group">
                <span className={`text-sm sm:text-base font-black group-hover:text-emerald-400 transition-colors ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                    {title}
                </span>
                <div className={cn("w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 ml-4", 
                    isDark ? 'border-white/10 bg-white/5' : 'border-emerald-100 bg-emerald-50/50',
                    isOpen && "rotate-180 border-emerald-500/30 bg-emerald-500/10"
                )}>
                    <ChevronDown className={cn("text-gray-400 transition-colors", isOpen && "text-emerald-400")} size={14} />
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
                        <p className="pb-5 text-[11px] sm:text-xs text-gray-500 leading-relaxed font-semibold">
                            {content}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ===== THEME TOGGLER =====
function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();
    return (
        <button onClick={toggleTheme} title={isDark ? 'Modo Claro' : 'Modo Escuro'}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
                isDark 
                    ? 'border-white/10 bg-white/5 hover:bg-white/10' 
                    : 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50'
            }`}
        >
            <span className={`transition-all duration-300 ${isDark ? 'text-amber-400 rotate-0' : 'text-gray-400 -rotate-12'}`}>
                {isDark ? <Sun size={12} /> : <Moon size={12} />}
            </span>
            <span className="hidden sm:block text-[8px] font-black uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors">
                {isDark ? 'Claro' : 'Escuro'}
            </span>
        </button>
    );
}

// ===== MAIN LANDING PAGE COMPONENT =====
export default function LandingPage() {
    const [onlineSellers, setOnlineSellers] = useState(1487);
    const [scrolled, setScrolled] = useState(false);
    const [activePlate, setActivePlate] = useState(0);
    const { isDark } = useTheme();

    useEffect(() => {
        const interval = setInterval(() => {
            setOnlineSellers(prev => prev + (Math.random() > 0.45 ? Math.floor(Math.random() * 3) : -Math.floor(Math.random() * 2)));
        }, 4000);
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => { clearInterval(interval); window.removeEventListener('scroll', handleScroll); };
    }, []);

    return (
        <div className={`min-h-screen font-['Outfit'] overflow-x-hidden selection:bg-primary selection:text-white ${
            isDark ? 'bg-[#06070a] text-gray-100' : 'bg-white text-gray-900'
        }`}>
            <SpotlightCursor />
            <GrainOverlay />
            
            {/* FLOATING SELLERS HEADER */}
            <div className={`sticky top-0 z-[60] backdrop-blur-2xl border-b py-2 px-4 sm:px-6 transition-all duration-300 ${
                isDark ? 'bg-[#06070a]/95 border-white/5' : 'bg-white/95 border-emerald-50'
            }`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary">
                            +{onlineSellers.toLocaleString('pt-BR')} Sellers Transacionando
                        </span>
                    </div>
                    <p className={`text-[9px] sm:text-[10px] font-bold truncate text-center flex-1 mx-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                        🚀 Liquidação redundante via Pix ativa sem interrupções.
                    </p>
                    <a href="https://whatsapp.com/channel/0029VbC56v0GZNComh5KQ73J" rel="noopener noreferrer" target="_blank"
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-primary text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all whitespace-nowrap">
                        Canal Oficial <ArrowRight size={10} />
                    </a>
                </div>
            </div>

            {/* DYNAMIC FLOATING NAVBAR */}
            <nav className={`fixed z-50 flex items-center justify-between transition-all duration-500
                ${scrolled
                    ? 'left-1/2 -translate-x-1/2 top-3 w-[94%] sm:w-[90%] max-w-6xl h-14 sm:h-16 rounded-full px-5 sm:px-8 border shadow-[0_8px_32px_rgba(16,185,129,0.06)] backdrop-blur-3xl ' + (isDark ? 'bg-[#08090d]/90 border-white/10' : 'bg-white/90 border-emerald-100')
                    : 'left-0 translate-x-0 top-[34px] w-full h-16 sm:h-20 rounded-none px-6 sm:px-12 border-b border-transparent backdrop-blur-sm ' + (isDark ? 'bg-[#06070a]/70' : 'bg-white/70')
                }`}>
                <div className="flex items-center">
                    <img src={isDark ? "/logo_premium.png?v=3" : "/logo_white.jpg?v=3"} alt="DiretoPay Logo" className="h-6 sm:h-7 w-auto" />
                </div>
                
                <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-wider text-gray-500">
                    <a href="#" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : ''}`}>Início</a>
                    <a href="#tecnologia" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : ''}`}>Roteamento</a>
                    <a href="#calculadora" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : ''}`}>Economia</a>
                    <a href="#trofeus" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : ''}`}>Recompensas</a>
                    <Link to="/docs" className={`hover:text-emerald-500 transition-colors flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-white' : ''}`}>
                        API Docs <Code2 size={12} />
                    </Link>
                    <a href="#faq" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : ''}`}>Dúvidas</a>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />
                    <Link to="/login" className={`hidden sm:block text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition-all hover:border-emerald-500 hover:text-emerald-500 ${
                        isDark ? 'text-gray-300 border-white/15' : 'text-gray-600 border-gray-200'
                    }`}>
                        Entrar
                    </Link>
                    <Link to="/register" className="bg-primary text-black text-[10px] font-black uppercase tracking-wider px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:brightness-110 transition-all shadow-[0_4px_16px_rgba(16,185,129,0.2)] whitespace-nowrap">
                        Registrar
                    </Link>
                </div>
            </nav>

            {/* HERO SECTION - MODERN MESH GRIDS */}
            <section className={`pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden ${
                isDark ? 'bg-[#06070a]' : 'bg-[#fcfdfc]'
            }`}
                style={isDark ? {
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.01) 25%, rgba(255,255,255,0.01) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.01) 75%, rgba(255,255,255,0.01) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.01) 25%, rgba(255,255,255,0.01) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.01) 75%, rgba(255,255,255,0.01) 76%, transparent 77%)',
                    backgroundSize: '75px 75px'
                } : {
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, #ebfaee 25%, #ebfaee 26%, transparent 27%, transparent 74%, #ebfaee 75%, #ebfaee 76%, transparent 77%), linear-gradient(90deg, transparent 24%, #ebfaee 25%, #ebfaee 26%, transparent 27%, transparent 74%, #ebfaee 75%, #ebfaee 76%, transparent 77%)',
                    backgroundSize: '75px 75px'
                }}>
                <Particles count={20} />
                <div className={`absolute bottom-0 inset-x-0 h-32 pointer-events-none ${
                    isDark ? 'bg-gradient-to-t from-[#06070a]' : 'bg-gradient-to-t from-[#fcfdfc]'
                } to-transparent`} />
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none ${
                    isDark ? 'bg-emerald-950/10 opacity-30' : 'bg-emerald-100/40 opacity-40'
                }`} />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        
                        {/* HERO COPYWRITING */}
                        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                transition={{ duration: 0.5 }}
                                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                                    isDark ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Infraestrutura Invisível para Processamento de Volume
                            </motion.div>

                            <div className="space-y-4">
                                <motion.h1 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: 0.1 }}
                                    className={`text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight uppercase ${
                                        isDark ? 'text-white' : 'text-gray-900'
                                    }`}
                                >
                                    Seu checkout Pix <br />
                                    operando com{' '}
                                    <Typewriter
                                        words={['redundância total!', 'uptime máximo!', 'split imediato!', 'segurança blindada!']}
                                        className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent italic"
                                    />
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ delay: 0.2 }}
                                    className="text-gray-500 text-xs sm:text-sm max-w-lg mx-auto lg:mx-0 font-bold leading-relaxed"
                                >
                                    A DiretoPay conecta seu negócio diretamente com as maiores credenciadoras financeiras do país. Roteamento inteligente v2 com contingência em milissegundos e Split integrado para produtores e afiliados.
                                </motion.p>
                            </div>

                            {/* CTAS */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
                            >
                                <Link to="/register" className="w-full sm:w-auto bg-primary text-black h-12 px-8 rounded-xl flex items-center justify-center font-black hover:brightness-110 active:scale-95 transition-all gap-2 text-[10px] uppercase tracking-wider shadow-[0_4px_16px_rgba(16,185,129,0.25)]">
                                    Começar Operação <ArrowRight size={13} />
                                </Link>
                                <a href="#tecnologia" className={`w-full sm:w-auto border h-12 px-8 rounded-xl font-black hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider ${
                                    isDark ? 'text-gray-300 border-white/10 hover:border-white/20' : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}>
                                    Ver Detalhes Técnicos
                                </a>
                            </motion.div>

                            {/* CORE HIGHLIGHTS */}
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ delay: 0.4 }}
                                className="flex flex-wrap justify-center lg:justify-start gap-2.5 pt-2"
                            >
                                {[
                                    { icon: ShieldCheck, text: 'LGPD & PCI Compliance' },
                                    { icon: Zap, text: 'Split 100% Automatizado' },
                                    { icon: Lock, text: 'Contingência Anti-Bloqueio' },
                                    { icon: Landmark, text: 'Saques Automáticos' }
                                ].map((item, i) => (
                                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold ${
                                        isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-600'
                                    }`}>
                                        <item.icon size={12} className="text-emerald-400 shrink-0" />
                                        {item.text}
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* HERO VISUAL CHECKOUT SIMULATOR */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: 0.25, duration: 0.6 }}
                            className="lg:col-span-5 relative hidden lg:block"
                        >
                            <CheckoutSimulator />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* SECTION: API & SMART ROUTING DEMO */}
            <section id="tecnologia" className={`py-20 px-6 border-y ${
                isDark ? 'bg-[#08090d] border-white/5' : 'bg-white border-gray-100'
            }`}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-6">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                                <Network size={12} /> Contingência Instantânea
                            </span>
                            <h2 className={`text-2xl sm:text-4xl font-black uppercase leading-tight tracking-tight ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                                Evite perdas por quedas de adquirente. <br />
                                <span className="text-emerald-500 italic">Roteamento de alta precisão.</span>
                            </h2>
                            <p className="text-gray-500 text-xs sm:text-sm font-semibold leading-relaxed max-w-xl">
                                Nosso ecossistema monitora a integridade de processamento das maiores instituições bancárias a cada segundo. Caso uma falha ocorra, a requisição é redirecionada silenciosamente para outra operadora de split, garantindo que o Pix do cliente aprove sem lentidão ou recusas.
                            </p>

                            <div className="grid grid-cols-2 gap-2.5 pt-2">
                                {[
                                    'Multi-Adquirencia Nativa',
                                    'Uptime de 99.98% Medido',
                                    'Tempo de Resposta < 80ms',
                                    'Webhooks Sincronizados'
                                ].map((item, i) => (
                                    <div key={i} className={`flex items-center gap-2 px-3 py-3 rounded-xl border ${
                                        isDark ? 'bg-white/[0.01] border-white/5' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                        <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                                        <span className={`font-black text-[10px] uppercase tracking-wider ${
                                            isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* DIAGRAM PANEL */}
                        <div className={`relative rounded-3xl overflow-hidden border p-6 sm:p-8 shadow-2xl ${
                            isDark ? 'bg-[#0b0c10] border-white/5' : 'bg-[#fafbfa] border-gray-200'
                        }`}>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
                            
                            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5 text-[9px] font-black uppercase text-gray-500">
                                <span>Fluxo de Pagamento</span>
                                <span className="text-emerald-400">Roteamento Ativo</span>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {/* CUSTOMER */}
                                <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">A</div>
                                        <div>
                                            <div className="text-[10px] font-bold text-white">Consumidor Final</div>
                                            <div className="text-[8px] text-gray-500">Geração do QR Code</div>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">PIX COP-COL</span>
                                </div>

                                {/* GATEWAYS */}
                                <div className="pl-4 border-l border-emerald-500/30 space-y-3">
                                    {[
                                        { name: 'Adquirente A (Principal)', status: 'Indisponível (502 Timeout)', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
                                        { name: 'Adquirente B (Segurança)', status: 'Acionada e Ativa (Aprovado em 220ms)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
                                    ].map((g, idx) => (
                                        <div key={idx} className={`p-2.5 rounded-xl border text-[9px] font-bold ${g.color}`}>
                                            <div className="flex items-center justify-between">
                                                <span>{g.name}</span>
                                                <span className="text-[8px] uppercase tracking-wider font-extrabold">{g.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* MERCHANT WALLET */}
                                <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</div>
                                        <div>
                                            <div className="text-[10px] font-bold text-white">Split e Liquidação</div>
                                            <div className="text-[8px] text-emerald-400/80">Saldo disponível em conta na hora</div>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-white bg-emerald-500 px-2.5 py-0.5 rounded-full">SAQUE PIX LIBERADO</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION: INTERACTIVE SAVINGS CALCULATOR */}
            <section id="calculadora" className="py-24 px-4 sm:px-6 max-w-5xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 space-y-6">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                        <DollarSign size={12} /> Custos Transparentes
                    </span>
                    <h2 className={`text-2xl sm:text-4xl font-black uppercase leading-tight tracking-tight ${
                        isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                        Chega de taxas ocultas e tarifas de saque abusivas.
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm font-semibold leading-relaxed">
                        Nossa precificação diminui automaticamente de acordo com o crescimento do seu volume mensal de vendas. Sem mensalidade, sem custo de integração, sem pegadinhas. Pague apenas uma porcentagem justa por Pix liquidado com sucesso.
                    </p>
                    <div className="space-y-3 font-semibold text-gray-500 text-xs">
                        <div className="flex gap-2.5"><CheckCircle className="text-emerald-500 shrink-0" size={16} /><p>Taxa decrescente até 0.99% flat.</p></div>
                        <div className="flex gap-2.5"><CheckCircle className="text-emerald-500 shrink-0" size={16} /><p>Tarifa zero para transferência ou liquidação Pix.</p></div>
                        <div className="flex gap-2.5"><CheckCircle className="text-emerald-500 shrink-0" size={16} /><p>Antecipação automática sem juros embutidos.</p></div>
                    </div>
                </div>
                <div className="lg:col-span-7">
                    <SavingsCalculator />
                </div>
            </section>

            {/* SECTION: MILESTONE AWARDS / TROPHY VAULT */}
            <section id="trofeus" className={`py-24 px-6 overflow-hidden relative ${
                isDark ? 'bg-[#06070a]' : 'bg-[#fafbfa]'
            }`}>
                <div className={`absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none ${
                    isDark ? 'bg-emerald-950/5 opacity-20' : 'bg-emerald-100/30'
                }`} />
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-wider mb-6">
                            <Trophy size={12} /> Troféus Físicos
                        </span>
                        <h2 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                            Galeria de Metas e Conquistas
                        </h2>
                        <p className="text-gray-500 text-xs sm:text-sm font-semibold leading-relaxed">
                            Alcançar volume de vendas é uma marca histórica. Para homenagear os sellers que movimentam a economia digital, enviamos nossas placas físicas exclusivas diretamente para sua empresa.
                        </p>
                    </div>

                    {/* DYNAMIC TROPHY WRAPPER */}
                    <div className={`grid lg:grid-cols-2 gap-10 p-6 sm:p-10 rounded-[32px] border ${
                        isDark ? 'bg-[#0b0c10]/70 border-white/5' : 'bg-white border-emerald-100 shadow-xl'
                    }`}>
                        
                        {/* LEFT COLUMN - PLATE DISPLAY */}
                        <div className="flex flex-col items-center justify-center relative min-h-[320px]">
                            <div className="absolute inset-0 bg-primary/5 rounded-full blur-[70px] pointer-events-none animate-pulse" />
                            
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activePlate}
                                    initial={{ scale: 0.9, opacity: 0, rotateY: -15 }}
                                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, rotateY: 15 }}
                                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                    className="relative w-full max-w-[200px] aspect-[3/4] flex items-center justify-center"
                                >
                                    <img
                                        src={MILESTONE_PLATES[activePlate].image}
                                        alt={MILESTONE_PLATES[activePlate].title}
                                        className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full uppercase tracking-wider">
                                <Award size={12} className="fill-current" />
                                Mais de 500 troféus fabricados e entregues
                            </div>
                        </div>

                        {/* RIGHT COLUMN - METRICS & DETAILS */}
                        <div className="flex flex-col justify-between space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Metas de Faturamento</span>
                                    <span className="text-gray-700 font-bold">•</span>
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{MILESTONE_PLATES[activePlate].badge}</span>
                                </div>
                                <h3 className={`text-2xl font-black uppercase ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {MILESTONE_PLATES[activePlate].title}
                                </h3>
                                <div className="text-lg font-black text-emerald-500">
                                    A partir de R$ {MILESTONE_PLATES[activePlate].amount} transacionados
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                                    {MILESTONE_PLATES[activePlate].subdesc}
                                </p>
                            </div>

                            {/* PERKS INCLUDED */}
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider block mb-1">Privilégios Inclusos:</span>
                                <div className="grid sm:grid-cols-2 gap-2 text-[10px] font-bold text-gray-400">
                                    {MILESTONE_PLATES[activePlate].perks.map((p, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5">
                                            <Check size={11} className="text-emerald-400 shrink-0" />
                                            <span>{p}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TABS CONTROLS */}
                            <div className="space-y-4 pt-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {MILESTONE_PLATES.map((p, idx) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setActivePlate(idx)}
                                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                                                activePlate === idx
                                                    ? 'bg-primary text-black border-primary shadow-[0_4px_12px_rgba(30,164,101,0.25)]'
                                                    : isDark
                                                        ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                                                        : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-900'
                                            }`}
                                        >
                                            {p.amount}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {MILESTONE_PLATES.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActivePlate(idx)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                activePlate === idx ? 'w-6 bg-primary' : 'w-1.5 bg-gray-600'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION: ELITE LEADERBOARD */}
            <section className={`py-24 px-6 border-t ${
                isDark ? 'bg-[#08090d] border-white/5' : 'bg-white border-gray-100'
            }`}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-6">
                            <Flame size={12} /> Elite da DiretoPay
                        </span>
                        <h2 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                            Ecossistema dos Grandes Sellers
                        </h2>
                        <p className="text-gray-500 text-xs sm:text-sm font-semibold leading-relaxed">
                            Nossa infraestrutura foi desenhada para operações que exigem escala constante. Confira os volumes de faturamento aprovados de alguns dos nossos principais parceiros neste mês.
                        </p>
                    </div>

                    <div className={`p-4 sm:p-6 rounded-[32px] border ${
                        isDark ? 'bg-black/30 border-white/5' : 'bg-gray-50/50 border-gray-100'
                    }`}>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-emerald-400" />
                                <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Leaderboard de Operações</h3>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                Atualizado em tempo real
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            <LeaderboardRow rank="1" name="Marcos R. (Vendas Digitais)" segment="Infoprodutos" approval="99.8%" volume="R$ 1.284.940" badge="Elite Black" avatar="MR" color="text-yellow-400 border-yellow-400/20" />
                            <LeaderboardRow rank="2" name="Ana L. (DropScale Ltda)" segment="Dropshipping" approval="99.5%" volume="R$ 847.300" badge="Diamond Tier" avatar="AL" color="text-gray-400 border-gray-400/20" />
                            <LeaderboardRow rank="3" name="João S. (EducaPlay)" segment="SaaS & Ensino" approval="99.9%" volume="R$ 512.450" badge="Gold Tier" avatar="JS" color="text-orange-400 border-orange-400/20" />
                            <LeaderboardRow rank="4" name="Clara F. (Digital Hub)" segment="E-commerce" approval="99.3%" volume="R$ 294.100" badge="Silver Tier" avatar="CF" color="text-emerald-400 border-emerald-500/20" />
                            <LeaderboardRow rank="5" name="Rafael P. (Metodologia Escala)" segment="Mentoria" approval="99.6%" volume="R$ 114.900" badge="Bronze Tier" avatar="RP" color="text-emerald-400 border-emerald-500/20" />
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION: PILLARS & BENEFITS */}
            <section className={`py-24 px-6 overflow-hidden relative ${
                isDark ? 'bg-[#06070a]' : 'bg-[#fafbfa]'
            }`}>
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8 ${
                        isDark ? 'border-white/5' : 'border-emerald-100/30'
                    }`}>
                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Pilares da Operação</span>
                            <h2 className={`text-2xl sm:text-4xl font-black uppercase tracking-tight ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                                Tecnologia desenhada para converter
                            </h2>
                        </div>
                        <p className="max-w-xs text-xs font-semibold leading-relaxed text-gray-500">
                            Focamos em velocidade de carregamento, roteamento redundante e split transparente para maximizar o seu lucro líquido.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <PillarCard icon={ShieldCheck} title="Privacidade Garantida" desc="Criptografia militar de transações para blindagem completa da sua operação de vendas." delay={0.05} />
                        <PillarCard icon={Zap} title="Carregamento Flash" desc="Checkout otimizado que carrega instantaneamente, evitando perdas de clientes por lag de tela." delay={0.1} />
                        <PillarCard icon={Layers} title="Painel Multifuncional" desc="Dashboard completo para gerenciar splits, taxas, afiliados e saques em uma única tela." delay={0.15} />
                        <PillarCard icon={BarChart3} title="Relatórios Granulares" desc="Acompanhe com precisão o volume de Pix pendentes, gerados, pagos e abandonos de checkout." delay={0.2} />
                        <PillarCard icon={Rocket} title="Split em Tempo Real" desc="Divisão automatizada da comissão do coprodutor e do afiliado diretamente no ato da compra." delay={0.25} />
                        <PillarCard icon={Globe} title="SLA de 99.98% de Uptime" desc="Sua API sempre no ar devido ao nosso sistema distribuído geograficamente em múltiplos servidores." delay={0.3} />
                    </div>
                </div>
            </section>

            {/* SECTION: DEVELOPER TERMINAL DEMO */}
            <section id="tecnologia" className={`py-20 px-4 sm:px-6 border-y ${
                isDark ? 'bg-[#08090d] border-white/5' : 'bg-white border-gray-100'
            }`}>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    <div className="lg:col-span-6 space-y-6">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            Developers First
                        </span>
                        <h2 className={`text-2xl sm:text-4xl font-black uppercase tracking-tight ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                            Integração limpa. <br /> API REST padronizada.
                        </h2>
                        <div className="space-y-4 text-gray-500 text-xs sm:text-sm font-semibold">
                            <div className="flex gap-3"><CheckCircle className="text-emerald-500 shrink-0" size={16} /><p>Endpoints rápidos com resposta em formato JSON.</p></div>
                            <div className="flex gap-3"><CheckCircle className="text-emerald-500 shrink-0" size={16} /><p>Autenticação via chave Bearer token para segurança total.</p></div>
                            <div className="flex gap-3"><CheckCircle className="text-emerald-500 shrink-0" size={16} /><p>Webhooks automáticos com lógica de retry integrado.</p></div>
                        </div>
                        <Link to="/docs" className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-wider border transition-all ${
                            isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}>
                            Explorar API Docs <ExternalLink size={12} />
                        </Link>
                    </div>

                    {/* MOCK TERMINAL BLOCK */}
                    <div className="lg:col-span-6 relative group">
                        <div className="absolute inset-0 bg-emerald-500/5 blur-[60px] opacity-25 rounded-full" />
                        <div className={`border rounded-2xl p-5 sm:p-6 font-mono text-[10px] sm:text-xs leading-relaxed shadow-xl relative overflow-hidden overflow-x-auto ${
                            isDark ? 'bg-[#0b0c10] border-white/5 text-white/80' : 'bg-[#0a0b10] border-gray-900 text-white/90'
                        }`}>
                            <div className="flex gap-1.5 mb-5">
                                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                            </div>
                            <div className="space-y-1 text-gray-400">
                                <p className="text-gray-600">// Importe e inicialize a biblioteca da DiretoPay</p>
                                <p><span className="text-emerald-400">import</span> {'{'} DiretoClient {'}'} <span className="text-emerald-400">from</span> <span className="text-orange-400">"@diretopay/sdk"</span>;</p>
                                <p><span className="text-emerald-400">const</span> client = <span className="text-blue-400">new</span> <span className="text-emerald-400">DiretoClient</span>{'({'} apiKey: <span className="text-orange-400">"dp_live_sec_..."</span> {'})'};</p>
                                <p>&nbsp;</p>
                                <p className="text-gray-600">// Criação da transação com Split habilitado</p>
                                <p><span className="text-emerald-400">const</span> pix = <span className="text-emerald-400">await</span> client.<span className="text-blue-400">createPixOrder</span>{'({'}</p>
                                <p className="pl-4">amount: <span className="text-orange-400">19700</span>, <span className="text-gray-600">// R$ 197,00</span></p>
                                <p className="pl-4">description: <span className="text-orange-400">"Mentoria Premium"</span>,</p>
                                <p className="pl-4">split: {'['}</p>
                                <p className="pl-8">{'{'} role: <span className="text-orange-400">"affiliate"</span>, percent: <span className="text-orange-400">30</span> {'}'}</p>
                                <p className="pl-4">{']'}</p>
                                <p>{'});'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION: FAQ DÚVIDAS */}
            <section id="faq" className={`py-24 px-4 sm:px-6 ${isDark ? 'bg-[#06070a]' : 'bg-white'}`}>
                <div className="max-w-3xl mx-auto space-y-12">
                    <div className="space-y-2.5 text-center">
                        <h2 className={`text-2xl sm:text-4xl font-black uppercase tracking-tight ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                            Perguntas Frequentes
                        </h2>
                        <p className="text-gray-500 font-extrabold uppercase tracking-wider text-[10px]">
                            Central de Ajuda e Suporte
                        </p>
                    </div>

                    <div className={`border rounded-[32px] p-5 sm:p-8 ${
                        isDark ? 'bg-[#0b0c10]/40 border-white/5' : 'bg-emerald-50/10 border-emerald-100'
                    }`}>
                        <AccordionItem title="Como a DiretoPay protege os dados das minhas vendas?" content="Utilizamos canais criptografados de ponta a ponta e redundância geograficamente distribuída de servidores. Todos os seus dados de faturamento e taxas acordadas permanecem protegidos sob rígidos protocolos de sigilo bancário." />
                        <AccordionItem title="Qual é o tempo de repasse/saque do Pix?" content="A liberação do Pix ocorre em D+0. Assim que a transação é confirmada e liquidada pela adquirente secundária, o saldo fica disponível em seu painel operacional para saque imediato via Pix para sua chave cadastrada." />
                        <AccordionItem title="Existe split automatizado de afiliados?" content="Sim. Oferecemos suporte completo a Split de pagamentos direto na API. Você pode configurar porcentagens fixas de split para coprodutores, afiliados ou parceiros de tráfego na própria chamada de checkout." />
                        <AccordionItem title="Preciso pagar mensalidade ou taxa de setup?" content="Não. A DiretoPay não cobra custos mensais, tarifas de integração ou mensalidades ocultas. Você paga apenas uma pequena porcentagem fixa sobre o volume de Pix transacionados e aprovados com sucesso." />
                        <AccordionItem title="Como funciona o suporte técnico?" content="Nossa equipe técnica atende desenvolvedores via documentação oficial e canal dedicado de suporte. Para contas corporativas de alto volume (acima de R$ 50k/mês), oferecemos gerente de contas dedicado no WhatsApp." />
                    </div>
                </div>
            </section>

            {/* SECTION: HERO CALL TO ACTION BANNER */}
            <section className={`py-20 px-4 sm:px-6 ${isDark ? 'bg-[#06070a]' : 'bg-[#fafdfa]'}`}>
                <div className="max-w-6xl mx-auto bg-gradient-to-br from-emerald-600 via-emerald-800 to-green-950 p-8 sm:p-16 rounded-[32px] relative overflow-hidden text-center shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-[70px]" />
                    <div className="space-y-6 relative z-10">
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase text-white leading-none">
                            Pronto para processar com <br />
                            <span className="text-emerald-200 italic">redundância real?</span>
                        </h2>
                        <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto font-bold leading-relaxed">
                            Crie sua conta em 1 minuto e integre sua operação à infraestrutura Pix mais estável do mercado digital.
                        </p>
                        <div className="pt-2">
                            <Link to="/register" className="inline-flex items-center justify-center bg-white text-emerald-800 h-13 px-8 rounded-xl text-xs font-black hover:bg-emerald-50 transition-all active:scale-95 shadow-xl uppercase tracking-wider">
                                Ativar Minha Conta <ChevronRight size={13} />
                            </Link>
                        </div>
                        <p className="text-white/40 font-black uppercase tracking-wider text-[8px]">
                            Sem compromisso de volume mínimo.
                        </p>
                    </div>
                </div>
            </section>

            {/* MODERNIZED FOOTER */}
            <footer className={`px-4 sm:px-6 pb-8 pt-2 ${isDark ? 'bg-[#06070a]' : 'bg-gray-50'}`}>
                <div className={`max-w-6xl mx-auto border rounded-[32px] px-6 sm:px-8 py-8 shadow-sm ${
                    isDark ? 'bg-[#08090d] border-white/5' : 'bg-white border-emerald-100'
                }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-[11px] font-bold">
                        
                        {/* BRAND IDENTIFICATION */}
                        <div className="space-y-3">
                            <img src={isDark ? "/logo_premium.png?v=3" : "/logo_white.jpg?v=3"} alt="DiretoPay Logo" className="h-6 w-auto" />
                            <p className="text-gray-500 leading-relaxed font-semibold">
                                Plataforma robusta de intermediação de pagamentos com foco em checkout Pix simplificado, split automatizado e contingência de servidores.
                            </p>
                        </div>

                        {/* NAV LINKS */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Navegação</p>
                            <ul className="space-y-1.5 text-gray-400 font-semibold">
                                <li><a href="#" className="hover:text-emerald-500 transition-colors">Início</a></li>
                                <li><a href="#tecnologia" className="hover:text-emerald-500 transition-colors">Roteamento</a></li>
                                <li><a href="#calculadora" className="hover:text-emerald-500 transition-colors">Economia</a></li>
                                <li><a href="#trofeus" className="hover:text-emerald-500 transition-colors">Recompensas</a></li>
                            </ul>
                        </div>

                        {/* SUPPORT API */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Tecnologia</p>
                            <ul className="space-y-1.5 text-gray-400 font-semibold">
                                <li><Link to="/docs" className="hover:text-emerald-500 transition-colors">API References</Link></li>
                                <li><Link to="/termos" className="hover:text-emerald-500 transition-colors">Termos de Serviço</Link></li>
                                <li><Link to="/privacidade" className="hover:text-emerald-500 transition-colors">Privacidade</Link></li>
                            </ul>
                        </div>

                        {/* EMAIL CHANNELS */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Canais de Contato</p>
                            <ul className="space-y-1.5 text-gray-400 font-semibold">
                                <li>Email: <a href="mailto:contato@diretopay.com.br" className="hover:text-emerald-500 transition-colors">contato@diretopay.com.br</a></li>
                                <li>Atendimento: <a href="https://wa.me/5511988627674" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">WhatsApp Suporte</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className={`border-t pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-gray-400 font-semibold ${
                        isDark ? 'border-white/5' : 'border-emerald-100/50'
                    }`}>
                        <span>© {new Date().getFullYear()} DiretoPay. Todos os direitos reservados.</span>
                        <div className="flex gap-4">
                            <a href="https://instagram.com/user.diretopay" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">Instagram</a>
                            <a href="#" className="hover:text-emerald-500 transition-colors">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
