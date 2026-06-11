import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import {
  AuroraBg,
  DotGrid,
  Particles,
  GlowCard,
  GradientText,
  Reveal,
  BorderBeam,
  MorphingText,
  ScrollProgress,
  Meteors,
  SpotlightCard,
  BlurText,
  ShinyText,
  RippleButton,
  NumberTicker,
} from "../components/AnimatedUI";
import {
  Zap,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Menu,
  X,
  DollarSign,
  Lock,
  Instagram,
  MessageCircle,
  MapPin,
  Trophy,
  Star,
  Sun,
  Moon,
  Code2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const TICKER = [
  { name: "Lucas M.", value: "R$ 297,00" },
  { name: "Amanda C.", value: "R$ 89,90" },
  { name: "Rafael T.", value: "R$ 497,00" },
  { name: "Bianca F.", value: "R$ 147,00" },
  { name: "Thiago S.", value: "R$ 997,00" },
];

const PARTNERS = [
  { name: "Google Ads", icon: Sparkles },
  { name: "utmify", icon: ShieldCheck },
  { name: "Vega", icon: Zap },
  { name: "crypta", icon: Lock },
  { name: "ASTROFY", icon: Trophy },
];

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(2348);
  const [selectedMethod, setSelectedMethod] = useState("pix");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => {
        setTickerIdx((i) => (i + 1) % TICKER.length);
        setTickerVisible(true);
      }, 320);
    }, 3200);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setOnlineUsers((n) => {
        const d =
          Math.random() > 0.4
            ? Math.floor(Math.random() * 15)
            : -Math.floor(Math.random() * 8);
        const next = n + d;
        return next < 2100 ? n + 50 : next;
      });
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const ticker = TICKER[tickerIdx];

  // Cores adaptativas do tema
  const bgGradient = isDark
    ? "from-[#0a0a0f] via-[#050508] to-[#020204]"
    : "from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]";

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050709] text-slate-800 dark:text-white font-sans antialiased overflow-x-hidden transition-colors duration-300`}>
      <ScrollProgress color="#1ea465" />
      
      {/* Background patterns */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(30,164,101,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(30,164,101,0.03) 1px, transparent 1px)`
            : `linear-gradient(rgba(30,164,101,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30,164,101,0.04) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-0">
        <AuroraBg className={isDark ? "opacity-100" : "opacity-35"} />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0 hidden md:block">
        <Particles count={12} color="#1ea465" className={isDark ? "opacity-20" : "opacity-15"} />
      </div>
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(30,164,101,0.08) 0%, transparent 65%)"
            : "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(30,164,101,0.04) 0%, transparent 65%)",
        }}
      />

      {/* ── TOP ALERT BANNER ── */}
      <div className="bg-emerald-600 dark:bg-[#0c2f1d] text-white text-[12.5px] font-semibold py-2 px-4 text-center relative z-50 flex items-center justify-center gap-2 border-b border-emerald-500/20">
        <span>Faturamento acima de R$ 10 mil/mês? É hora de escalar com a DiretoPay.</span>
        <a
          href="https://wa.me/5551996148568"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-emerald-100 transition-colors flex items-center gap-0.5"
        >
          Falar com um especialista <ChevronRight size={13} />
        </a>
      </div>

      {/* ── HEADER ── */}
      <motion.nav
        className={`fixed top-10 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 dark:bg-[#050709]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07] shadow-lg shadow-slate-100/50 dark:shadow-xl dark:shadow-black/30 py-3"
            : "py-4"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo-diretopay.webp"
              alt="DiretoPay"
              className="h-8 sm:h-9 w-auto logo-theme-adaptive"
            />
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1.5">
            {[
              { label: "Checkout", href: "#checkout" },
              { label: "Funcionalidades", href: "#funcionalidades" },
              { label: "Desenvolvedores", href: "/docs" },
              { label: "Suporte", href: "https://wa.me/5551996148568", external: true },
              { label: "Blog", href: "https://wa.me/5551996148568", external: true },
            ].map((l) => {
              const cls = `text-[13.5px] font-semibold px-4 py-2 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]`;
              return l.external ? (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {l.label}
                </a>
              ) : (
                <a key={l.label} href={l.href} className={cls}>
                  {l.label}
                </a>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-white/20 rounded-full px-3 py-1.5 bg-white dark:bg-transparent shadow-sm dark:shadow-none"
            >
              {isDark ? <Sun size={12} /> : <Moon size={12} />}
              <span>{isDark ? "CLARO" : "ESCURO"}</span>
            </button>
            <Link
              to="/login"
              className="text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-4 py-2 transition-colors"
            >
              Entrar
            </Link>
            <a
              href="https://wa.me/5551996148568"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-[13.5px] font-bold bg-[#1ea465] hover:bg-[#126b41] text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-px"
            >
              Fale com nossa equipe <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-white dark:bg-[#050709] pt-24 px-6 flex flex-col md:hidden"
          >
            <nav className="flex flex-col gap-1 mt-6">
              {[
                { label: "Checkout", href: "#checkout" },
                { label: "Funcionalidades", href: "#funcionalidades" },
                { label: "Desenvolvedores", href: "/docs" },
                { label: "Suporte", href: "https://wa.me/5551996148568", external: true },
                { label: "Blog", href: "https://wa.me/5551996148568", external: true },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.external ? "_blank" : undefined}
                  rel={l.external ? "noopener noreferrer" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className="py-3.5 px-4 rounded-2xl text-[15px] font-semibold text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto pb-10 flex flex-col gap-3">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 py-3.5 text-[12px] font-bold text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-transparent shadow-sm"
              >
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                {isDark ? "Mudar para Claro" : "Mudar para Escuro"}
              </button>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center py-3.5 text-[14px] font-semibold text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-transparent shadow-sm"
              >
                Entrar
              </Link>
              <a
                href="https://wa.me/5551996148568"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center py-4 text-[14px] font-bold bg-[#1ea465] text-white rounded-2xl shadow-xl shadow-emerald-500/25"
              >
                Fale com nossa equipe
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-36 pb-24 px-5 overflow-hidden">
        <Meteors count={8} color="#1ea465" />
        
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-7 rounded-full border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] backdrop-blur px-3.5 py-1.5 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              Bem-vindo a DiretoPay <ChevronRight size={11} />
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[44px] sm:text-[62px] lg:text-[76px] font-black tracking-[-0.03em] leading-[0.92] mb-6 text-slate-900 dark:text-white max-w-4xl">
            <BlurText text="A melhor plataforma" className="block justify-center" delay={0.03} />
            <span className="block mt-1">
              <GradientText from="#1ea465" to="#34d399">para quem vende online</GradientText>
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-[16px] sm:text-[18px] text-slate-500 dark:text-slate-400 leading-relaxed mb-9 max-w-2xl">
            Simplifique cobranças, crie e personalize seu checkout e link de pagamento. Ou integre nosso Pix via API, e venda seus infoprodutos e produtos físicos com mais conversão e controle.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-16 w-full sm:w-auto">
            <RippleButton
              color="rgba(30,164,101,0.4)"
              onClick={() => (window.location.href = "/register")}
              className="group flex items-center justify-center gap-2 bg-[#1ea465] hover:bg-[#126b41] text-white font-bold px-8 py-4 rounded-2xl transition-all text-[16px] shadow-[0_12px_45px_rgba(30,164,101,0.35)] hover:-translate-y-0.5"
            >
              <ShinyText speed={2.5}>Crie sua conta grátis</ShinyText>
              <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </RippleButton>
          </div>

          {/* Interactive Mockup Container */}
          <Reveal delay={0.1} className="w-full max-w-[960px] relative mt-4">
            <div className="rounded-3xl border border-slate-200 dark:border-white/[0.1] shadow-2xl dark:shadow-[0_50px_100px_rgba(0,0,0,0.65)] overflow-hidden relative bg-slate-900/5 dark:bg-black/40 backdrop-blur-sm">
              <BorderBeam colorFrom="#1ea465" colorTo="#22c55e" duration={8} />
              
              {/* Mockup Header bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-white/[0.08] bg-slate-100/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="text-[11px] text-slate-500 font-semibold bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-lg px-6 py-1 shrink-0 select-none">
                  diretopay.site/dashboard
                </div>
                <div className="w-14" />
              </div>

              {/* Mockup dashboard inner layout */}
              <div className="grid grid-cols-6 h-[480px] text-left">
                {/* Mockup sidebar */}
                <div className="col-span-1 border-r border-slate-200 dark:border-white/[0.06] p-4 bg-slate-50 dark:bg-black/20 hidden sm:flex flex-col gap-6 justify-between select-none">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-[#1ea465] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        DP
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">DiretoPay</span>
                    </div>
                    {["Início", "Vendas", "Checkouts", "Assinaturas", "Relatórios"].map((item, idx) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-bold transition-all ${
                          idx === 0
                            ? "bg-emerald-500/10 text-[#1ea465]"
                            : "text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? "bg-[#1ea465]" : "bg-transparent"}`} />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="text-[9px] font-semibold text-slate-400 truncate">
                    u/diretopay_seller
                  </div>
                </div>

                {/* Mockup main area */}
                <div className="col-span-6 sm:col-span-5 p-5 sm:p-6 bg-white dark:bg-[#08080a] flex flex-col gap-5 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.05] pb-3 select-none">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Visão Geral</h3>
                    <div className="text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1">
                      Últimos 30 dias
                    </div>
                  </div>

                  {/* Grid cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
                    {[
                      { label: "Vendas", val: "R$ 142.385,42", note: "+2,5% vs ant.", color: "text-[#1ea465]" },
                      { label: "Ticket Médio", val: "R$ 120", note: "-2,5% vs ant.", color: "text-red-400" },
                      { label: "Pix Pagos", val: "685", note: "+2,5% vs ant.", color: "text-[#1ea465]" },
                      { label: "Vendas Hoje", val: "39", note: "+3,5% vs hoje", color: "text-[#1ea465]" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] rounded-xl p-3"
                      >
                        <p className="text-[10px] text-slate-500 mb-1 font-semibold">{item.label}</p>
                        <p className="text-[14px] sm:text-[16px] font-black text-slate-900 dark:text-white truncate">
                          {item.val}
                        </p>
                        <p className={`text-[9px] font-bold mt-1 ${item.color}`}>{item.note}</p>
                      </div>
                    ))}
                  </div>

                  {/* Graph row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0 select-none">
                    {/* SVG Chart mockup */}
                    <div className="md:col-span-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 font-bold">
                        <span>Atualização em tempo real</span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Este mês
                        </span>
                      </div>
                      <div className="flex-1 flex items-end">
                        <svg className="w-full h-24" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#1ea465" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#1ea465" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Grid lines */}
                          <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(16,185,129,0.05)" strokeWidth="1" />
                          <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(16,185,129,0.05)" strokeWidth="1" />
                          <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(16,185,129,0.05)" strokeWidth="1" />
                          {/* Path fill */}
                          <path
                            d="M0,80 Q30,70 60,85 T120,60 T180,45 T240,65 T300,35 L300,100 L0,100 Z"
                            fill="url(#chartGlow)"
                          />
                          {/* Line */}
                          <path
                            d="M0,80 Q30,70 60,85 T120,60 T180,45 T240,65 T300,35"
                            fill="none"
                            stroke="#1ea465"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Donut chart mockup */}
                    <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] rounded-2xl p-4 flex flex-col justify-between items-center text-center">
                      <p className="text-[11px] text-slate-500 font-bold self-start">Taxa de conversão</p>
                      
                      <div className="flex items-center justify-center gap-6 my-2">
                        {/* Circle 1 */}
                        <div className="relative flex items-center justify-center">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="26" stroke="rgba(16,185,129,0.08)" strokeWidth="5" fill="transparent" />
                            <circle cx="32" cy="32" r="26" stroke="#1ea465" strokeWidth="5" fill="transparent"
                              strokeDasharray="163" strokeDashoffset="75" strokeLinecap="round" />
                          </svg>
                          <div className="absolute flex flex-col leading-none">
                            <span className="text-[12px] font-black text-slate-900 dark:text-white">54%</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Pix</span>
                          </div>
                        </div>
                        {/* Circle 2 */}
                        <div className="relative flex items-center justify-center">
                          <svg className="w-16 h-16 transform -rotate-90">
                            <circle cx="32" cy="32" r="26" stroke="rgba(99,102,241,0.08)" strokeWidth="5" fill="transparent" />
                            <circle cx="32" cy="32" r="26" stroke="#6366f1" strokeWidth="5" fill="transparent"
                              strokeDasharray="163" strokeDashoffset="88" strokeLinecap="round" />
                          </svg>
                          <div className="absolute flex flex-col leading-none">
                            <span className="text-[12px] font-black text-slate-900 dark:text-white">46%</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Cartão</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                        98% das transações concluídas em menos de 3s
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Live Ticker Notification */}
              <AnimatePresence mode="wait">
                {tickerVisible && (
                  <motion.div
                    key={tickerIdx}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.95 }}
                    transition={{ duration: 0.35 }}
                    className="absolute bottom-5 left-5 flex items-center gap-3 border border-slate-200 dark:border-white/[0.1] rounded-2xl px-4 py-3 backdrop-blur-xl shadow-2xl z-20 select-none"
                    style={{
                      background: isDark ? "rgba(10,10,12,0.96)" : "rgba(255,255,255,0.98)",
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle size={15} className="text-[#1ea465]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 font-semibold leading-tight">
                        Venda realizada no Pix!
                      </p>
                      <p className="text-[13px] font-black text-slate-900 dark:text-white mt-0.5">
                        {ticker.name} faturou <span className="text-[#1ea465]">{ticker.value}</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PARTNERS / LOGOS ── */}
      <section className="relative z-10 border-y border-slate-200/60 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.015] py-9 sm:py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[10.5px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-7">
            A escolha de quem escala com tecnologia
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-65 dark:opacity-50">
            {PARTNERS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.name}
                  className="flex items-center gap-2 text-slate-900 dark:text-white hover:opacity-100 transition-all duration-300 cursor-default group"
                >
                  <Icon size={16} className="text-[#1ea465] group-hover:scale-115 transition-transform duration-200" />
                  <span className="text-[16px] font-black tracking-tight uppercase">{p.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION: LINK DE PAGAMENTO ── */}
      <section id="checkout" className="relative z-10 py-24 px-5 overflow-hidden">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          
          {/* Left Column: Form Mockup */}
          <Reveal delay={0.05} className="flex justify-center order-last lg:order-first">
            <div className="w-full max-w-[380px] rounded-3xl border border-slate-200 dark:border-white/[0.08] p-5 shadow-2xl dark:shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden bg-white/95 dark:bg-[#0d0d12]/95 backdrop-blur-md">
              <BorderBeam colorFrom="#1ea465" colorTo="#34d399" duration={6} />
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.05] mb-5">
                <span className="text-xs font-bold text-slate-500 uppercase">Link de Pagamento</span>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 rounded-full px-2 py-0.5">SEGURO</span>
              </div>

              {/* Form body */}
              <div className="flex flex-col gap-4 text-left">
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">
                    E-mail
                  </label>
                  <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] px-3 py-2.5 bg-slate-50/50 dark:bg-white/[0.03] text-xs font-medium text-slate-700 dark:text-gray-300">
                    matheus@diretopay.com.br
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">
                    Telefone
                  </label>
                  <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] px-3 py-2.5 bg-slate-50/50 dark:bg-white/[0.03] text-xs font-medium text-slate-700 dark:text-gray-300">
                    (47) 99763-2216
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">
                    CPF
                  </label>
                  <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] px-3 py-2.5 bg-slate-50/50 dark:bg-white/[0.03] text-xs font-medium text-slate-700 dark:text-gray-300">
                    152.264.711-22
                  </div>
                </div>

                {/* Method selector */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-2">
                    Método de pagamento
                  </label>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "pix", label: "PIX", sub: "Transferência instantânea, direto da sua conta" },
                      { id: "card", label: "Cartão de Crédito", sub: "Pague à vista ou em até 12x" },
                      { id: "boleto", label: "Boleto", sub: "Gera o boleto para pagamento em lotérica ou app" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`flex items-start gap-3 border rounded-xl p-3 text-left transition-all ${
                          selectedMethod === m.id
                            ? "border-[#1ea465] bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02]"
                            : "border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.01]"
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                          {selectedMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-[#1ea465]" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{m.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{m.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pay button */}
                <button
                  type="button"
                  className="w-full py-3 bg-[#1ea465] hover:bg-[#126b41] text-white font-bold text-[13.5px] rounded-xl mt-2 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  Pagar R$ 499,90 com {selectedMethod.toUpperCase()}
                </button>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Text */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-5 text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign size={22} className="text-[#1ea465]" />
            </div>
            
            <h2 className="text-[36px] sm:text-[46px] font-black tracking-[-0.03em] leading-[0.96] text-slate-900 dark:text-white">
              Link de pagamento
              <br />
              <GradientText from="#1ea465" to="#34d399">para o seu negócio</GradientText>
            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed max-w-md">
              Crie cobranças em segundos via Pix. Customize valores, vencimentos, métodos de pagamento e branding em poucos cliques.
            </p>

            <div className="mt-2">
              <RippleButton
                color="rgba(30,164,101,0.4)"
                onClick={() => (window.location.href = "/register")}
                className="group flex items-center justify-center gap-2 bg-[#1ea465] hover:bg-[#126b41] text-white font-bold px-6 py-3.5 rounded-xl transition-all text-[14px] shadow-lg shadow-emerald-500/20 hover:-translate-y-px"
              >
                <ShinyText speed={2.5}>Crie seu link agora</ShinyText>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </RippleButton>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── SECTION: CHECKOUT TRANSPARENTE ── */}
      <section id="funcionalidades" className="relative z-10 py-20 px-5 border-t border-slate-200/60 dark:border-white/[0.06] overflow-hidden">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          
          {/* Left Column: Text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-5 text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Zap size={22} className="text-[#1ea465]" />
            </div>

            <h2 className="text-[36px] sm:text-[46px] font-black tracking-[-0.03em] leading-[0.96] text-slate-900 dark:text-white">
              Checkout transparente
              <br />
              <GradientText from="#1ea465" to="#34d399">e personalizável</GradientText>
            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed max-w-md">
              Customize cada detalhe e aproveite diversos modelos prontos para elevar ainda mais a sua conversão!
            </p>

            <div className="mt-2">
              <RippleButton
                color="rgba(30,164,101,0.4)"
                onClick={() => (window.location.href = "/register")}
                className="group flex items-center justify-center gap-2 bg-[#1ea465] hover:bg-[#126b41] text-white font-bold px-6 py-3.5 rounded-xl transition-all text-[14px] shadow-lg shadow-emerald-500/20 hover:-translate-y-px"
              >
                <ShinyText speed={2.5}>Ver personalização</ShinyText>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </RippleButton>
            </div>
          </motion.div>

          {/* Right Column: Checkout Builder Mockup */}
          <Reveal delay={0.05} className="flex justify-center">
            <div className="w-full max-w-[460px] rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-2xl dark:shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden relative bg-slate-950 dark:bg-[#0c0c0f] select-none text-left">
              <BorderBeam colorFrom="#1ea465" colorTo="#34d399" duration={7} />
              
              <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/[0.08] bg-slate-900/50 dark:bg-black/20 flex items-center justify-between">
                <span className="text-[11px] font-bold text-white uppercase">Novo checkout</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              {/* Builder body */}
              <div className="grid grid-cols-5 h-[280px]">
                {/* Editor side */}
                <div className="col-span-2 border-r border-slate-200/50 dark:border-white/[0.06] p-3 flex flex-col gap-2 bg-slate-900/10 dark:bg-black/10 text-[9px] font-bold text-slate-500 dark:text-gray-400">
                  {[
                    "Cabeçalho",
                    "Barra de avisos",
                    "Banner",
                    "Conteúdo",
                    "Cupom",
                    "Order Bump",
                    "Escassez",
                    "Rodapé",
                  ].map((opt, idx) => (
                    <div
                      key={opt}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all ${
                        idx === 5
                          ? "border-emerald-500/30 bg-emerald-500/10 text-[#1ea465]"
                          : "border-transparent hover:bg-slate-800/20 dark:hover:bg-white/5"
                      }`}
                    >
                      <span>{opt}</span>
                      <ChevronRight size={10} className={idx === 5 ? "text-[#1ea465]" : "opacity-40"} />
                    </div>
                  ))}
                </div>

                {/* Preview side */}
                <div className="col-span-3 p-4 flex flex-col gap-3 justify-center bg-slate-900/30 dark:bg-black/30">
                  <div className="border border-slate-200/60 dark:border-white/[0.08] rounded-xl p-3 bg-white dark:bg-[#0d0d12]">
                    <div className="w-20 h-2 bg-slate-200 dark:bg-white/10 rounded mb-2.5" />
                    <div className="flex flex-col gap-2">
                      <div className="h-6 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg" />
                      <div className="h-6 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-lg" />
                      <div className="h-8 bg-[#1ea465]/10 border border-[#1ea465]/35 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#1ea465]">
                        Visualização Live
                      </div>
                    </div>
                  </div>
                  <div className="border border-emerald-500/20 rounded-xl p-2.5 bg-emerald-500/[0.02] flex items-center justify-between text-[8px] font-bold text-slate-400 dark:text-gray-500">
                    <span>Order Bump Ativo</span>
                    <span className="text-[#1ea465]">+ R$ 47,00</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── SECTION: CONFIANÇA / METRICS ── */}
      <section className="relative z-10 py-24 px-5 border-t border-slate-200/60 dark:border-white/[0.06] overflow-hidden">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          
          <Reveal delay={0.05} className="mb-14">
            <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.03em] leading-[1.0] text-slate-900 dark:text-white mb-4">
              Confiança que escala com você
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] sm:text-[16px] max-w-xl">
              Infraestrutura robusta, números que comprovam resultados reais.
            </p>
          </Reveal>

          {/* Cards grid */}
          <div className="grid sm:grid-cols-3 gap-6 w-full">
            {[
              {
                id: "card-1",
                val: 240,
                prefix: "+",
                suffix: "M",
                label: "Reais processados por ano",
                desc: "Escalabilidade comprovada para operações de alto volume.",
                color: "#1ea465",
              },
              {
                id: "card-2",
                val: 1.2,
                prefix: "+",
                suffix: "M",
                decimals: 1,
                label: "Transações mensais",
                desc: "Robustez e estabilidade para escalar sem limites.",
                color: "#6366f1",
              },
              {
                id: "card-3",
                val: 5,
                prefix: "+",
                suffix: "K",
                label: "Empresas ativas",
                desc: "Plataforma validada por sellers, fintechs e SaaS de todo porte.",
                color: "#f59e0b",
              },
            ].map((c) => (
              <GlowCard key={c.id} glowColor={c.color} intensity={0.15} className="h-full rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] p-6 text-left shadow-sm">
                <SpotlightCard color={`${c.color}08`} className="h-full flex flex-col gap-4">
                  <div>
                    <span className="text-[44px] font-black tracking-tight text-slate-900 dark:text-white leading-none block mb-1">
                      <NumberTicker value={c.val} prefix={c.prefix} suffix={c.suffix} decimals={c.decimals || 0} duration={1.8} />
                    </span>
                    <span className="text-xs font-black text-slate-800 dark:text-gray-200 uppercase tracking-wide block mb-3">
                      {c.label}
                    </span>
                    <p className="text-[13px] text-slate-500 dark:text-gray-400 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </SpotlightCard>
              </GlowCard>
            ))}
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-white/[0.06] py-16 px-5 bg-white dark:bg-[#040406]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12 text-left">
            <div className="col-span-2 sm:col-span-1">
              <img
                src="/logo-diretopay.webp"
                alt="DiretoPay"
                className="h-8 w-auto opacity-80 hover:opacity-100 logo-theme-adaptive transition-all mb-4"
              />
              <p className="text-[12.5px] text-slate-500 dark:text-gray-500 leading-relaxed mb-5">
                Plataforma de pagamentos PIX e checkout de alta conversão para vendedores digitais.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://instagram.com/diretopay_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-500 hover:text-[#1ea465] transition-colors px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.06] hover:border-[#1ea465]/35 hover:bg-slate-50 dark:hover:bg-transparent"
                >
                  <Instagram size={11} /> @diretopay_
                </a>
                <a
                  href="https://wa.me/5551996148568"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-500 hover:text-[#1ea465] transition-colors px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.06] hover:border-[#1ea465]/35 hover:bg-slate-50 dark:hover:bg-transparent"
                >
                  <MessageCircle size={11} /> Suporte
                </a>
              </div>
            </div>

            <div>
              <p className="text-[12px] font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider mb-4">
                Atalhos
              </p>
              {[
                ["Criar conta", "/register"],
                ["Login", "/login"],
                ["API & Docs", "/docs"],
                ["Dashboard", "/dashboard"],
              ].map(([l, h]) => (
                <Link
                  key={l}
                  to={h}
                  className="block text-[13px] text-slate-500 dark:text-gray-550 hover:text-[#1ea465] transition-colors mb-2.5"
                >
                  {l}
                </Link>
              ))}
            </div>

            <div>
              <p className="text-[12px] font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider mb-4">
                Legal
              </p>
              {[
                ["Termos de Uso", "/termos"],
                ["Privacidade", "/privacidade"],
                ["Sobre nós", "/sobre"],
              ].map(([l, h]) => (
                <a
                  key={l}
                  href={h}
                  className="block text-[13px] text-slate-500 dark:text-gray-550 hover:text-[#1ea465] transition-colors mb-2.5"
                >
                  {l}
                </a>
              ))}
            </div>

            <div>
              <p className="text-[12px] font-bold text-slate-800 dark:text-gray-300 uppercase tracking-wider mb-4">
                Contato
              </p>
              <a
                href="https://wa.me/5551996148568"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[13px] text-slate-500 dark:text-gray-550 hover:text-[#1ea465] transition-colors mb-2.5"
              >
                WhatsApp Suporte
              </a>
              <a
                href="https://instagram.com/diretopay_"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[13px] text-slate-500 dark:text-gray-550 hover:text-[#1ea465] transition-colors mb-2.5"
              >
                Instagram
              </a>
              <a
                href="mailto:suporte@diretopay.site"
                className="block text-[13px] text-slate-500 dark:text-gray-550 hover:text-[#1ea465] transition-colors"
              >
                E-mail
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100 dark:border-white/[0.05]">
            <p className="text-[11px] text-slate-500 dark:text-gray-600">
              © {new Date().getFullYear()} DiretoPay. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-600">
              <MapPin size={11} />
              Av. Paulista, 1374 — Bela Vista, São Paulo - SP
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
