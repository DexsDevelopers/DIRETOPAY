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
  ChevronDown,
  Sparkles,
  BookOpen,
  Users,
  Smartphone,
  Monitor,
  HelpCircle,
  Award,
  Clock,
  Globe,
  CreditCard,
  BarChart3,
  Shield,
  Quote,
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

const TESTIMONIALS = [
  {
    name: "Lucas Mendonça",
    role: "CEO, Escola Digital Pro",
    text: "Desde que migramos pra DiretoPay, nossa conversão no checkout subiu 34%. O Pix cai na hora e o suporte é absurdo de rápido.",
    avatar: "LM",
    rating: 5,
  },
  {
    name: "Amanda Costa",
    role: "Infoprodutora",
    text: "Finalmente uma plataforma que entende o vendedor digital. Zero retenções, saque automático e dashboard que mostra tudo em tempo real.",
    avatar: "AC",
    rating: 5,
  },
  {
    name: "Rafael Torres",
    role: "Fundador, TorresSaaS",
    text: "A API é limpa e bem documentada. Integrei em menos de 2 horas. Melhor custo-benefício do mercado para quem precisa de Pix via API.",
    avatar: "RT",
    rating: 5,
  },
  {
    name: "Bianca Ferreira",
    role: "Mentora de Negócios",
    text: "Uso a DiretoPay pra todas as minhas mentorias e cursos. O checkout personalizável faz toda a diferença na experiência do cliente.",
    avatar: "BF",
    rating: 5,
  },
];

const FAQ_DATA = [
  {
    q: "Como funciona o Pix na DiretoPay?",
    a: "Você gera cobranças Pix em segundos, diretamente pelo dashboard ou via API. O pagamento é confirmado instantaneamente e o valor fica disponível para saque imediato, sem retenções.",
  },
  {
    q: "Quanto custa usar a plataforma?",
    a: "A criação de conta é 100% gratuita. Cobramos apenas uma taxa competitiva por transação aprovada. Sem mensalidades, sem taxas de setup e sem surpresas.",
  },
  {
    q: "Posso personalizar o checkout?",
    a: "Sim! Nosso Checkout Builder permite customizar cores, banners, order bumps, cupons, barra de avisos, rodapé e muito mais. Temos diversos templates prontos para acelerar sua conversão.",
  },
  {
    q: "Existe retenção ou reserva de valores?",
    a: "Não. Na DiretoPay, você tem acesso total ao seu dinheiro. Sem reservas, sem bloqueios e sem necessidade de aprovação para sacar. Liberdade financeira de verdade.",
  },
  {
    q: "A DiretoPay tem API para desenvolvedores?",
    a: "Sim! Oferecemos uma API RESTful completa com documentação detalhada. Você pode gerar cobranças Pix, consultar transações, receber webhooks e integrar com qualquer sistema.",
  },
  {
    q: "Quanto tempo leva para o dinheiro cair na minha conta?",
    a: "O saque é automático e instantâneo via Pix. Você solicita e o dinheiro cai na sua conta em segundos, 24 horas por dia, 7 dias por semana.",
  },
];

const MILESTONE_PLATES = [
  {
    id: "10k",
    amount: "10K",
    title: "Ao você faturar",
    badge: "10k",
    desc: "Primeira prova de que o jogo é real. Você saiu do zero.",
    subdesc: "Ao faturar R$ 10.000 na DiretoPay, você garante a nossa primeira placa física exclusiva para marcar o início da sua jornada.",
    image: "/assets/placa-10k-D-keX8kW.webp"
  },
  {
    id: "100k",
    amount: "100K",
    title: "Ao você faturar",
    badge: "100k",
    desc: "A consistência gera escala. Você provou que seu método funciona.",
    subdesc: "O marco dos seis dígitos faturados. Uma placa de metal premium para consolidar o crescimento do seu negócio.",
    image: "/assets/placa-100k-L8htTMxu.webp"
  },
  {
    id: "250k",
    amount: "250K",
    title: "Ao você faturar",
    badge: "250k",
    desc: "O caminho da consolidação. Seu negócio atinge o profissionalismo.",
    subdesc: "Bater R$ 250.000 faturados te coloca em um patamar de alto nível. Receba a placa de acrílico premium na sua casa.",
    image: "/assets/placa-250k-p9cuG3oH.webp"
  },
  {
    id: "500k",
    amount: "500K",
    title: "Ao você faturar",
    badge: "500k",
    desc: "Meio caminho para o milhão. Um feito para quem joga grande.",
    subdesc: "Meio milhão de reais faturados na DiretoPay. Você garante nossa placa de luxo exclusiva e mentoria direta com os fundadores.",
    image: "/assets/placa-500k-Dywjx6p8.webp"
  },
  {
    id: "1m",
    amount: "1M",
    title: "Ao você faturar",
    badge: "1M",
    desc: "O topo absoluto. O clube dos sete dígitos é o seu lugar.",
    subdesc: "Um milhão de reais faturados! O troféu Black definitivo para eternizar sua conquista no topo do mercado digital.",
    image: "/assets/placa-1milhao-D7KkbHhg.webp"
  }
];

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const [activePlate, setActivePlate] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(2348);
  const [selectedMethod, setSelectedMethod] = useState("pix");
  const [activeTab, setActiveTab] = useState("curso");
  const [openFaq, setOpenFaq] = useState(null);

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
        className={`sticky top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 dark:bg-[#050709]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07] shadow-lg shadow-slate-100/50 dark:shadow-xl dark:shadow-black/30 py-3"
            : "py-4 bg-transparent"
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
      <section className="relative z-10 pt-20 pb-24 px-5 overflow-hidden">
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

      {/* ── SECTION: SUPORTE REAL, CONFIANÇA TOTAL ── */}
      <section className="relative z-10 py-24 px-5 border-t border-slate-200/60 dark:border-white/[0.06] overflow-hidden">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] backdrop-blur px-3.5 py-1.5 shadow-sm">
              <span className="text-[11.5px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-widest">
                Suporte Completo
              </span>
            </div>
            <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.03em] leading-[1.0] text-slate-900 dark:text-white mb-4">
              Suporte real, <GradientText from="#1ea465" to="#34d399">confiança total</GradientText>
            </h2>
            <p className="text-slate-550 dark:text-slate-400 text-[15px] sm:text-[16px] max-w-2xl leading-relaxed">
              Conte com nosso time do início ao fim. Ajuda automatizada e atendimento humano prontos para escalar com sua operação.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Left Side: 3 smaller cards */}
            <div className="md:col-span-1 flex flex-col gap-6">
              {/* Card 1: Central de Ajuda */}
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col gap-4 text-left shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-[#1ea465]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1.5">
                    Central de Ajuda completa
                  </h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Dúvidas frequentes, tutoriais e passo a passo em um só lugar.
                  </p>
                </div>
              </div>

              {/* Card 2: Saque Automático */}
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col gap-4 text-left shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Zap size={18} className="text-[#1ea465]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1.5">
                    Saque Automático
                  </h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Seu saque é liberado na hora. Sem retenções, sem necessidade de aprovação.
                  </p>
                </div>
              </div>

              {/* Card 3: Zero Reservas */}
              <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col gap-4 text-left shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-[#1ea465]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1.5">
                    Zero Reservas
                  </h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Venda sem retenções nem bloqueios. Liberdade financeira começa com acesso total ao que é seu.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Big Card with Chat Mockup */}
            <div className="md:col-span-2 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between text-left shadow-sm relative overflow-hidden min-h-[420px]">
              <div className="flex flex-col gap-3 z-10 max-w-md mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <MessageCircle size={18} className="text-[#1ea465]" />
                </div>
                <h3 className="text-[20px] font-black text-slate-900 dark:text-white">
                  Suporte humano, 24h por dia
                </h3>
                <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Nosso time de especialistas está sempre pronto para ajudar você, a qualquer hora, todos os dias.
                </p>
              </div>

              {/* Chat UI Mockup Container */}
              <div className="w-full max-w-[420px] mx-auto md:mr-0 mt-auto bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl shadow-xl overflow-hidden relative">
                {/* Chat Header */}
                <div className="bg-[#1ea465] text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Mock Avatar */}
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      DP
                    </div>
                    <div>
                      <p className="text-xs font-black leading-tight">Suporte DiretoPay</p>
                      <p className="text-[9px] text-emerald-100 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                        Online
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 opacity-80">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded">24h</span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 flex flex-col gap-3 text-xs min-h-[220px] justify-end bg-slate-100/50 dark:bg-[#08080a]/80">
                  {/* User message (client) */}
                  <div className="self-end max-w-[85%] bg-white dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.08] text-slate-850 dark:text-slate-200 rounded-2xl rounded-tr-none px-3.5 py-2.5 shadow-sm text-left">
                    <p className="leading-relaxed">
                      Oi, pessoal! Queria saber como faço para antecipar os valores das minhas vendas.
                    </p>
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 block text-right font-medium">10:59</span>
                  </div>

                  {/* Agent message (support) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="self-start max-w-[85%] bg-[#1ea465] text-white rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-md text-left"
                  >
                    <p className="leading-relaxed font-medium">
                      Oi, tudo bem? Você já está habilitado para antecipação automática ou deseja fazer uma solicitação pontual?
                    </p>
                    <span className="text-[8px] text-emerald-100 mt-1 block text-right">11:00</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: PRA QUEM É A DIRETOPAY? ── */}
      <section className="relative z-10 py-24 px-5 border-t border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.005] overflow-hidden">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.03em] leading-[1.0] text-slate-900 dark:text-white mb-4">
              Pra quem é a <GradientText from="#1ea465" to="#34d399">DiretoPay?</GradientText>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] sm:text-[16px] max-w-xl">
              Uma infraestrutura de pagamentos adaptada para o seu modelo de negócio.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 items-center">
            {/* Left side: Vertical Tabs Selector */}
            <div className="lg:col-span-2 flex flex-col gap-3 text-left">
              {[
                {
                  id: "curso",
                  label: "Curso Online",
                  desc: "Venda cursos com checkout otimizado e receba da forma rápida, segura e escalável.",
                },
                {
                  id: "mentorias",
                  label: "Mentorias",
                  desc: "Automatize pagamentos das suas sessões, organize planos e receba com recorrência.",
                },
                {
                  id: "ebooks",
                  label: "E-books",
                  desc: "Crie sua loja de conteúdos e venda de forma simples, com controle total das transações.",
                },
                {
                  id: "comunidades",
                  label: "Comunidades",
                  desc: "Gerencie assinaturas, cobranças e acesso a conteúdos em um só lugar.",
                },
                {
                  id: "saas",
                  label: "SaaS",
                  desc: "Ofereça uma experiência de pagamento completa via API, do checkout à conciliação.",
                },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-5 rounded-2xl text-left border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "border-[#1ea465]/40 bg-white dark:bg-white/[0.04] shadow-md shadow-emerald-500/5"
                        : "border-transparent hover:bg-slate-100/50 dark:hover:bg-white/[0.01]"
                    }`}
                  >
                    <h3
                      className={`text-[15px] font-bold transition-colors ${
                        isActive ? "text-[#1ea465]" : "text-slate-850 dark:text-slate-200"
                      }`}
                    >
                      {tab.label}
                    </h3>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {tab.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right side: Dynamic Visual Mockup */}
            <div className="lg:col-span-3 flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-[500px]"
                >
                  {activeTab === "curso" && (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden bg-white dark:bg-[#0c0c0f] text-left">
                      {/* Top Bar */}
                      <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-black/10 flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>ÁREA DE MEMBROS</span>
                        <span className="text-emerald-500 flex items-center gap-1">
                          <CheckCircle size={10} /> 94% Completo
                        </span>
                      </div>
                      {/* Content */}
                      <div className="p-5 flex flex-col gap-4">
                        {/* Course Player Mockup */}
                        <div className="aspect-video rounded-xl bg-slate-900/10 dark:bg-black/30 border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center relative overflow-hidden group">
                          <div className="w-12 h-12 rounded-full bg-[#1ea465] text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <span className="ml-1 w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white" />
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg flex items-center justify-between text-[10px] text-white font-semibold">
                            <span>Aula 03: Escalando seu Checkout</span>
                            <span>12:45 / 24:10</span>
                          </div>
                        </div>
                        {/* Lessons List */}
                        <div className="flex flex-col gap-2">
                          {[
                            { title: "Introdução à Plataforma", duration: "5:30", done: true },
                            { title: "Configurando Chaves PIX", duration: "10:15", done: true },
                            { title: "Criando seu Primeiro Link", duration: "15:45", active: true },
                          ].map((lesson, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-[11.5px] font-bold ${
                                lesson.active
                                  ? "border-emerald-500/30 bg-emerald-500/5 text-[#1ea465]"
                                  : "border-slate-100 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.01]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${lesson.done || lesson.active ? "bg-[#1ea465]" : "bg-slate-350"}`} />
                                <span className={lesson.done ? "text-slate-400 dark:text-slate-505 line-through font-medium" : "text-slate-700 dark:text-slate-300"}>
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "mentorias" && (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden bg-white dark:bg-[#0c0c0f] text-left">
                      <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-black/10 flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>AGENDAMENTO DE SESSÕES</span>
                        <span className="text-indigo-400">1 Mentoria Ativa</span>
                      </div>
                      <div className="p-5 flex flex-col gap-4">
                        {/* Calendar Mockup */}
                        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400">
                          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                            <span key={i} className="py-1">{d}</span>
                          ))}
                          {Array.from({ length: 28 }).map((_, i) => {
                            const day = i + 1;
                            const isScheduled = day === 14;
                            return (
                              <span
                                key={i}
                                className={`py-2 rounded-lg flex items-center justify-center font-bold ${
                                  isScheduled
                                    ? "bg-indigo-550 text-white shadow-lg shadow-indigo-500/25 scale-105"
                                    : "bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                {day}
                              </span>
                            );
                          })}
                        </div>
                        {/* Scheduled Mentorship Details */}
                        <div className="border border-indigo-500/20 bg-indigo-500/[0.02] rounded-2xl p-4 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded">
                              Confirmada
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">14 de Junho, 14:00</span>
                          </div>
                          <div>
                            <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                              Mentoria de Escala Digital
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 font-medium">
                              Mentor: Lucas T. (DiretoPay Seller)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "ebooks" && (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden bg-white dark:bg-[#0c0c0f] text-left p-5 flex flex-col gap-4">
                      {/* Ebook Graphic Mockup */}
                      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/25 rounded-2xl p-6 flex items-center justify-center gap-6">
                        {/* Mock Cover */}
                        <div className="w-20 h-28 bg-[#1ea465] text-white font-bold rounded-lg shadow-lg shadow-emerald-950/20 flex flex-col justify-between p-3 select-none relative overflow-hidden shrink-0">
                          <div className="w-1.5 h-full bg-white/10 absolute left-0 top-0" />
                          <span className="text-[8px] tracking-widest uppercase opacity-60">e-Book</span>
                          <span className="text-[11px] leading-tight font-black">MÁQUINA DE PIX</span>
                          <span className="text-[7px] text-emerald-100 font-bold">DiretoPay</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <h4 className="text-[15px] font-black text-slate-900 dark:text-white leading-tight">
                            Máquina de Vendas no Pix
                          </h4>
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                            O guia definitivo para automatizar e otimizar conversões no checkout.
                          </p>
                          <span className="text-[14px] font-black text-[#1ea465] mt-1">R$ 29,90</span>
                        </div>
                      </div>
                      {/* Checkout payment option ebook */}
                      <div className="border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.01] rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#1ea465] font-bold">
                            PDF
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-850 dark:text-slate-200">maquina-pix.pdf</p>
                            <p className="text-[9px] text-slate-450 mt-0.5">4.8 MB • Pronto para ler</p>
                          </div>
                        </div>
                        <button className="bg-[#1ea465] text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg shadow-sm cursor-pointer">
                          Baixar
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "comunidades" && (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden bg-white dark:bg-[#0c0c0f] text-left">
                      <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-black/10 flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>GERENCIAR ASSINATURAS</span>
                        <span className="text-emerald-500 font-black">R$ 8.490/mês recorrente</span>
                      </div>
                      <div className="p-5 flex flex-col gap-3.5">
                        {[
                          { name: "Carlos Henrique", plan: "Plano Trimestral", status: "Ativo", date: "Renova em 24/06", color: "text-[#1ea465]" },
                          { name: "Mariana Costa", plan: "Plano Anual", status: "Ativo", date: "Renova em 12/08", color: "text-[#1ea465]" },
                          { name: "Rodrigo Santos", plan: "Plano Mensal", status: "Vencido", date: "Expirou em 05/06", color: "text-red-400" },
                        ].map((member, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 border border-slate-100 dark:border-white/[0.05] rounded-xl bg-slate-50 dark:bg-white/[0.01]"
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Avatar placeholder */}
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-[10px] text-[#1ea465]">
                                {member.name.split(" ").map(n => n[0]).join("")}
                              </div>
                              <div>
                                <p className="text-[11.5px] font-bold text-slate-850 dark:text-slate-200">{member.name}</p>
                                <p className="text-[9px] text-slate-450 font-medium">{member.plan}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-[10px] font-black ${member.color} block`}>{member.status}</span>
                              <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{member.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "saas" && (
                    <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden bg-slate-900/50 dark:bg-black/40 text-left">
                      <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-black/10 flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>API LOGS</span>
                        <span className="text-[#1ea465] font-mono">POST /v1/pix</span>
                      </div>
                      <div className="p-5">
                        <pre className="text-[10.5px] font-mono text-emerald-400 bg-slate-900 dark:bg-black/60 rounded-xl p-4 border border-slate-200/5 dark:border-white/[0.06] overflow-x-auto select-all leading-relaxed">
                          {`{
  "id": "pay_pix_932km10a",
  "status": "approved",
  "amount": 149.90,
  "client": {
    "name": "Matheus Silva",
    "email": "matheus@email.com"
  },
  "created_at": "2026-06-11T03:30:00Z"
}`}
                        </pre>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Team Photo Sub-banner */}
          <Reveal delay={0.15} className="mt-20">
            <div className="rounded-[32px] border border-slate-200/60 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.015] p-6 sm:p-8 grid md:grid-cols-12 gap-8 items-center text-left">
              <div className="md:col-span-7 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#1ea465]">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-[24px] font-black tracking-tight text-slate-905 dark:text-white leading-tight">
                  Construído por quem entende de escala
                </h3>
                <p className="text-[13.5px] text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
                  Somos um time apaixonado por performance. Desenvolvemos o DiretoPay com foco em uptime de 99.97% e processamento instantâneo. Venda de forma automatizada e tenha tranquilidade total para focar no crescimento da sua marca.
                </p>
              </div>
              <div className="md:col-span-5 relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/[0.06] aspect-video md:aspect-[4/3] bg-slate-100 dark:bg-black/30">
                <img
                  src="/team_diretopay.png"
                  alt="DiretoPay Team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── SECTION: AWARDS / RECOMPENSAS CAROUSEL ── */}
      <section className={`relative z-10 py-24 px-5 border-t border-slate-200/60 dark:border-white/[0.06] overflow-hidden ${isDark ? 'bg-[#0d0d14]' : 'bg-[#faf9ff]'}`}>
        {/* decorative glows */}
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-500/10'}`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-emerald-700/8' : 'bg-emerald-500/10'}`} />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-black mb-6">
              <Trophy size={16} /> Programa de Recompensas
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className={`text-[32px] sm:text-[48px] font-black tracking-[-0.03em] leading-[1.0] mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>A DiretoPay vibra a cada meta batida!</motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 text-[15px] sm:text-[16px] max-w-xl">Reconhecemos sua performance com prêmios exclusivos. Cada marco é uma conquista celebrada.</motion.p>
          </div>

          {/* Interactive Plate Carousel Block */}
          <div className={`grid lg:grid-cols-2 gap-12 items-center p-8 sm:p-12 rounded-[40px] border ${isDark ? 'bg-[#13131c]/60 border-white/5' : 'bg-white border-slate-200'} shadow-2xl relative`}>
            {/* Lado Esquerdo - Informacoes */}
            <div className="space-y-8 flex flex-col justify-center">
              <div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  {MILESTONE_PLATES[activePlate].title}
                </span>
                
                <div className="mt-3 flex items-center gap-3">
                  <motion.div 
                    key={activePlate}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-6 py-2 text-3xl sm:text-4xl font-[1000] rounded-2xl w-fit tracking-tight border ${
                      isDark 
                        ? 'bg-emerald-950/30 text-[#1ea465] border-emerald-500/30 shadow-[0_0_20px_rgba(30,164,101,0.15)]'
                        : 'bg-emerald-50 text-[#1ea465] border-emerald-200'
                    }`}
                  >
                    {MILESTONE_PLATES[activePlate].amount}
                  </motion.div>
                </div>
              </div>

              {/* Card com o premio */}
              <motion.div
                key={`perk-${activePlate}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={`p-6 rounded-3xl border flex gap-4 ${
                  isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-[#1ea465]/10 text-[#1ea465]' : 'bg-emerald-500/10 text-[#1ea465]'
                }`}>
                  <Trophy size={20} className="fill-current" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Você recebe</span>
                  <p className={`text-sm sm:text-base font-black leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {MILESTONE_PLATES[activePlate].desc}
                  </p>
                  <p className="text-xs text-slate-550 dark:text-slate-400 leading-normal mt-2 font-medium">
                    {MILESTONE_PLATES[activePlate].subdesc}
                  </p>
                </div>
              </motion.div>

              {/* Controles de Navegacao */}
              <div className="flex flex-col gap-4">
                {/* Tab list */}
                <div className="flex flex-wrap gap-2">
                  {MILESTONE_PLATES.map((plate, index) => (
                    <button
                      key={plate.id}
                      onClick={() => setActivePlate(index)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                        activePlate === index
                          ? 'bg-[#1ea465] text-white border-[#1ea465] shadow-[0_4px_12px_rgba(30,164,101,0.25)]'
                          : isDark
                            ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {plate.amount}
                    </button>
                  ))}
                </div>

                {/* Dots */}
                <div className="flex items-center gap-2 pt-2">
                  {MILESTONE_PLATES.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActivePlate(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        activePlate === index 
                          ? 'w-6 bg-[#1ea465]' 
                          : 'w-2.5 bg-gray-400/40 hover:bg-gray-400/70'
                      }`}
                      title={`Ver placa ${MILESTONE_PLATES[index].amount}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Lado Direito - Imagem da Placa */}
            <div className="flex flex-col items-center justify-center relative">
              {/* Ambient glow behind image */}
              <div className="absolute inset-0 bg-[#1ea465]/10 rounded-full blur-[80px] pointer-events-none" />

              <motion.div
                key={`image-${activePlate}`}
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="relative w-full max-w-[280px] aspect-[3/4] flex items-center justify-center"
              >
                <img
                  src={MILESTONE_PLATES[activePlate].image}
                  alt={`Placa de ${MILESTONE_PLATES[activePlate].amount} faturados DiretoPay`}
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none pointer-events-none"
                />
              </motion.div>

              {/* Entregas tag */}
              <div className="mt-8 flex items-center gap-2 text-[10px] sm:text-xs font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full uppercase tracking-wider">
                <Trophy size={14} className="fill-current" />
                Mais de 500 placas já entregues para nossos sellers!
              </div>
            </div>
          </div>
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

      {/* ── SECTION: SCREENSHOTS GALLERY ── */}
      <section className="relative z-10 py-24 px-5 border-t border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.005] overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <Reveal delay={0.05}>
            <div className="text-center mb-14 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] backdrop-blur px-3.5 py-1.5 shadow-sm">
                <Monitor size={13} className="text-[#1ea465]" />
                <span className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Plataforma Completa
                </span>
              </div>
              <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.03em] leading-[1.0] text-slate-900 dark:text-white mb-4">
                Tudo que você precisa, <GradientText from="#1ea465" to="#34d399">em um só lugar</GradientText>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-[15px] sm:text-[16px] max-w-xl">
                Dashboard completo, checkout personalizável, e uma experiência mobile impecável.
              </p>
            </div>
          </Reveal>

          {/* Screenshots Grid */}
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Dashboard Screenshot */}
            <Reveal delay={0.1} className="h-full">
              <div className="group rounded-3xl border border-slate-200 dark:border-white/[0.08] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white dark:bg-[#0c0c0f] h-full">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-black/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Dashboard DiretoPay</span>
                  <BarChart3 size={14} className="text-slate-400" />
                </div>
                <div className="overflow-hidden relative">
                  <img
                    src="/dashboard_screenshot.png"
                    alt="DiretoPay Dashboard - Painel de controle completo"
                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">Dashboard em Tempo Real</h4>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Monitore vendas, relatórios e métricas ao vivo</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1ea465] bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1ea465] animate-pulse" />
                    LIVE
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Checkout Mobile Screenshot */}
            <Reveal delay={0.15} className="h-full">
              <div className="group rounded-3xl border border-slate-200 dark:border-white/[0.08] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-white dark:bg-[#0c0c0f] h-full">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-black/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Checkout Mobile</span>
                  <Smartphone size={14} className="text-slate-400" />
                </div>
                <div className="overflow-hidden relative">
                  <img
                    src="/checkout_mobile.png"
                    alt="DiretoPay Checkout Mobile - Pagamento otimizado para mobile"
                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">Checkout Responsivo</h4>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Otimizado para mobile, tablet e desktop</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                    <CreditCard size={10} />
                    PIX • CARTÃO
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Feature mini-grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: Globe, label: "Disponível 24/7", desc: "Uptime de 99.97%" },
              { icon: Clock, label: "Pix Instantâneo", desc: "Confirmação em <3s" },
              { icon: Shield, label: "Segurança Total", desc: "Criptografia end-to-end" },
              { icon: Award, label: "Sem Limites", desc: "Escale sem restrições" },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.label}
                  className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 flex items-start gap-3 hover:border-[#1ea465]/30 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/15 transition-colors">
                    <Icon size={16} className="text-[#1ea465]" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">{feat.label}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION: TESTIMONIALS ── */}
      <section className="relative z-10 py-24 px-5 border-t border-slate-200/60 dark:border-white/[0.06] overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <Reveal delay={0.05}>
            <div className="text-center mb-14 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] backdrop-blur px-3.5 py-1.5 shadow-sm">
                <Users size={13} className="text-[#1ea465]" />
                <span className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Depoimentos
                </span>
              </div>
              <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.03em] leading-[1.0] text-slate-900 dark:text-white mb-4">
                Quem usa, <GradientText from="#1ea465" to="#34d399">recomenda</GradientText>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-[15px] sm:text-[16px] max-w-xl">
                Veja o que nossos clientes dizem sobre a experiência com a DiretoPay.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <Reveal key={t.name} delay={0.05 + idx * 0.08}>
                <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between text-left shadow-sm hover:shadow-lg hover:border-[#1ea465]/20 transition-all duration-300 h-full group">
                  {/* Quote icon */}
                  <div className="mb-4">
                    <Quote size={24} className="text-[#1ea465]/25 group-hover:text-[#1ea465]/40 transition-colors" />
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed mb-6 flex-1">
                    "{t.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1ea465] to-[#34d399] flex items-center justify-center text-white font-bold text-[11px] shadow-md shadow-emerald-500/20">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white">{t.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: FAQ ── */}
      <section className="relative z-10 py-24 px-5 border-t border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.005] overflow-hidden">
        <div className="max-w-3xl mx-auto">
          <Reveal delay={0.05}>
            <div className="text-center mb-14 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] backdrop-blur px-3.5 py-1.5 shadow-sm">
                <HelpCircle size={13} className="text-[#1ea465]" />
                <span className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  FAQ
                </span>
              </div>
              <h2 className="text-[38px] sm:text-[52px] font-black tracking-[-0.03em] leading-[1.0] text-slate-900 dark:text-white mb-4">
                Perguntas <GradientText from="#1ea465" to="#34d399">frequentes</GradientText>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-[15px] sm:text-[16px] max-w-lg">
                Tire suas dúvidas sobre a plataforma. Não encontrou sua resposta? Fale com nosso suporte.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-3">
            {FAQ_DATA.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <Reveal key={idx} delay={0.02 + idx * 0.04}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className={`w-full text-left bg-white dark:bg-white/[0.02] border rounded-2xl transition-all duration-300 overflow-hidden group ${
                      isOpen
                        ? "border-[#1ea465]/30 shadow-lg shadow-emerald-500/5"
                        : "border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.12] shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between px-6 py-5">
                      <span className={`text-[15px] font-bold transition-colors ${isOpen ? "text-[#1ea465]" : "text-slate-800 dark:text-slate-200"}`}>
                        {faq.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="shrink-0 ml-4"
                      >
                        <ChevronDown size={18} className={`transition-colors ${isOpen ? "text-[#1ea465]" : "text-slate-400"}`} />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-5 pt-0">
                            <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* Support CTA */}
          <div className="text-center mt-10">
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-3">
              Ainda tem dúvidas? Nossa equipe está pronta para ajudar.
            </p>
            <a
              href="https://wa.me/5551996148568"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-[#1ea465] hover:text-[#126b41] transition-colors"
            >
              <MessageCircle size={14} />
              Falar com suporte via WhatsApp
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* ── SECTION: FINAL CTA BANNER ── */}
      <section className="relative z-10 py-20 px-5 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <Reveal delay={0.05}>
            <div className="relative rounded-[32px] border border-[#1ea465]/20 bg-gradient-to-br from-[#1ea465]/[0.06] via-emerald-500/[0.03] to-transparent dark:from-[#1ea465]/[0.08] dark:via-emerald-500/[0.04] dark:to-transparent p-10 sm:p-14 text-center overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#1ea465]/[0.06] rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-emerald-400/[0.04] rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#1ea465]/15 border border-[#1ea465]/25 flex items-center justify-center mb-6">
                  <Zap size={26} className="text-[#1ea465]" />
                </div>

                <h2 className="text-[32px] sm:text-[44px] font-black tracking-[-0.03em] leading-[1.05] text-slate-900 dark:text-white mb-4 max-w-2xl">
                  Pronto para escalar suas <GradientText from="#1ea465" to="#34d399">vendas online?</GradientText>
                </h2>

                <p className="text-slate-500 dark:text-slate-400 text-[15px] sm:text-[16px] leading-relaxed mb-8 max-w-lg">
                  Crie sua conta gratuitamente e comece a receber pagamentos em menos de 5 minutos. Sem burocracia, sem taxas de adesão.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <RippleButton
                    color="rgba(30,164,101,0.4)"
                    onClick={() => (window.location.href = "/register")}
                    className="group flex items-center justify-center gap-2 bg-[#1ea465] hover:bg-[#126b41] text-white font-bold px-8 py-4 rounded-2xl transition-all text-[16px] shadow-[0_12px_45px_rgba(30,164,101,0.35)] hover:-translate-y-0.5"
                  >
                    <ShinyText speed={2.5}>Começar agora — é grátis</ShinyText>
                    <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                  </RippleButton>
                  <a
                    href="https://wa.me/5551996148568"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-[14px] font-bold text-slate-700 dark:text-slate-300 hover:text-[#1ea465] dark:hover:text-[#1ea465] border border-slate-200 dark:border-white/[0.1] px-6 py-3.5 rounded-2xl transition-all hover:border-[#1ea465]/30 bg-white/50 dark:bg-transparent"
                  >
                    <MessageCircle size={15} />
                    Fale com um especialista
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[12px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-[#1ea465]" />
                    Sem taxas de adesão
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-[#1ea465]" />
                    Saque instantâneo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-[#1ea465]" />
                    Suporte 24h
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
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
