import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import {
  AuroraBg,
  DotGrid,
  Particles,
  ShimmerButton,
  GlowCard,
  GradientText,
  PulseBadge,
  StatCard,
  FeatureCard,
  ClipReveal,
  LineReveal,
  CountUp,
  Marquee,
  MagneticButton,
  SectionLabel,
  Reveal,
  BorderBeam,
  MorphingText,
  ScrollProgress,
  Meteors,
  SpotlightCard,
  BlurText,
  GlareCard,
  HyperText,
  RetroGrid,
  ShinyText,
  RippleButton,
  NumberTicker,
} from "../components/AnimatedUI";
import DisplayCards from "../components/DisplayCards";
import { ExpandableTabs } from "../components/ExpandableTabs";
import {
  Zap,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  CheckCircle,
  QrCode,
  Webhook,
  Globe,
  TrendingUp,
  ChevronDown,
  Menu,
  X,
  DollarSign,
  RefreshCw,
  Lock,
  Instagram,
  MessageCircle,
  MapPin,
  Users,
  Trophy,
  Award,
  Gem,
  Crown,
  Flame,
  Star,
  Sun,
  Moon,
  Code2,
  Play,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Benefícios", href: "/beneficios" },
  { label: "Premiações", href: "/premiacoes" },
  { label: "API Docs", href: "/docs", icon: Code2 },
  { label: "FAQ", href: "/faq" },
  { label: "Contato", href: "https://wa.me/5551996148568", external: true },
  {
    label: "Canal",
    href: "https://whatsapp.com/channel/0029Vb7xewz7z4kaRdHkhO1e",
    external: true,
  },
];

const STATS = [
  {
    to: 12,
    prefix: "R$ ",
    suffix: "M+",
    label: "Processado",
    note: "volume total na plataforma",
    decimals: 0,
  },
  {
    to: 4200,
    prefix: "",
    suffix: "+",
    label: "Vendedores",
    note: "ativos todos os dias",
    decimals: 0,
  },
  {
    to: 99.97,
    prefix: "",
    suffix: "%",
    label: "Uptime",
    note: "SLA mensal garantido",
    decimals: 2,
  },
  {
    to: 200,
    prefix: "~",
    suffix: "ms",
    label: "PIX gerado",
    note: "tempo médio de criação",
    decimals: 0,
  },
];

const MARQUEE_ITEMS = [
  "PIX Instantâneo",
  "Sem Mensalidade",
  "D+0 Saque",
  "Antifraude",
  "Checkout Próprio",
  "Webhooks",
  "API REST",
  "99.97% Uptime",
  "Sem CNPJ",
];

const TICKER = [
  { name: "Lucas M.", value: "R$ 297,00" },
  { name: "Amanda C.", value: "R$ 89,90" },
  { name: "Rafael T.", value: "R$ 497,00" },
  { name: "Bianca F.", value: "R$ 147,00" },
  { name: "Thiago S.", value: "R$ 997,00" },
];

const BENEFITS = [
  {
    icon: Zap,
    color: "#10b981",
    title: "Aprovação Instantânea",
    desc: "Produtos aprovados na hora. Sem esperar 2 a 3 dias.",
  },
  {
    icon: DollarSign,
    color: "#6366f1",
    title: "Saque Direto no PIX",
    desc: "Liquidação imediata na sua chave PIX cadastrada.",
  },
  {
    icon: ShieldCheck,
    color: "#f59e0b",
    title: "Anti-fraude Nativo",
    desc: "Proteção multicamada contra chargebacks e MED.",
  },
];

const FEATURES = [
  {
    icon: Zap,
    color: "#10b981",
    title: "PIX Instantâneo",
    desc: "Cobranças em menos de 200ms com QR Code e copia-e-cola.",
  },
  {
    icon: Webhook,
    color: "#6366f1",
    title: "Webhooks em Tempo Real",
    desc: "Notificações automáticas ao seu sistema quando o PIX confirmar.",
  },
  {
    icon: BarChart3,
    color: "#f59e0b",
    title: "Dashboard Completo",
    desc: "Relatórios, gráficos e métricas de venda em tempo real.",
  },
  {
    icon: ShieldCheck,
    color: "#0ea5e9",
    title: "Antifraude Nativo",
    desc: "Proteção multicamada contra chargebacks e acessos suspeitos.",
  },
  {
    icon: Globe,
    color: "#ec4899",
    title: "Checkout Personalizado",
    desc: "Páginas de venda com sua marca sem precisar programar.",
  },
  {
    icon: RefreshCw,
    color: "#a855f7",
    title: "Cobranças Recorrentes",
    desc: "Assinaturas e planos mensais gerenciados automaticamente.",
  },
];

const PLATES = [
  {
    amount: "10K",
    full: "R$ 10.000",
    desc: "Primeira prova de que o jogo é real. Você saiu do zero.",
  },
  {
    amount: "50K",
    full: "R$ 50.000",
    desc: "Você mostrou consistência. O mercado te responde.",
  },
  {
    amount: "100K",
    full: "R$ 100.000",
    desc: "Seis dígitos. Você é parte de um grupo seleto de sellers.",
  },
  {
    amount: "500K",
    full: "R$ 500.000",
    desc: "Meio milhão. Sua operação virou uma verdadeira máquina.",
  },
  {
    amount: "1M",
    full: "R$ 1.000.000",
    desc: "O clube do milhão. Performance e consistência de elite.",
  },
];

const TESTIMONIALS = [
  {
    initials: "CR",
    name: "Carlos R.",
    role: "Info-produtor",
    revenue: "R$ 45K/mês",
    stars: 5,
    text: "Abri minha conta em 2 minutos e já estava vendendo no mesmo dia. Sem burocracia, sem CNPJ, sem dor de cabeça.",
  },
  {
    initials: "BF",
    name: "Beatriz F.",
    role: "Afiliada",
    revenue: "R$ 12K/mês",
    stars: 5,
    text: "Saque na hora, toda vez. Já testei outras plataformas e a DiretoPay é a única que realmente entrega.",
  },
  {
    initials: "TV",
    name: "Thiago V.",
    role: "Lançador",
    revenue: "R$ 180K/mês",
    stars: 5,
    text: "Uso a API para integrar no meu funil e funciona perfeitamente. Documentação clara e suporte rápido.",
  },
];

const RANKING = [
  {
    initials: "MR",
    name: "Marcos R.",
    sales: 1247,
    amount: "R$ 89.420,00",
    pos: 1,
  },
  {
    initials: "AL",
    name: "Ana L.",
    sales: 982,
    amount: "R$ 67.890,00",
    pos: 2,
  },
  {
    initials: "JS",
    name: "João S.",
    sales: 756,
    amount: "R$ 54.230,00",
    pos: 3,
  },
  {
    initials: "CF",
    name: "Carla F.",
    sales: 634,
    amount: "R$ 45.120,00",
    pos: 4,
  },
  {
    initials: "RP",
    name: "Rafael P.",
    sales: 523,
    amount: "R$ 38.450,00",
    pos: 5,
  },
];

const POS_COLORS = [
  "#fbbf24",
  "#cbd5e1",
  "#f97316",
  "rgba(255,255,255,0.25)",
  "rgba(255,255,255,0.25)",
];

const COMPARISON = [
  {
    feature: "Exposição de dados (CPF/CNPJ)",
    bad: "Alta — Exposto no checkout",
    good: "Zero — 100% oculto",
  },
  {
    feature: "Aprovação de produtos",
    bad: "2–3 dias úteis",
    good: "Instantânea",
  },
  {
    feature: "Velocidade de saque",
    bad: "D+15 ou D+30",
    good: "Imediata via PIX",
  },
  {
    feature: "Documentos exigidos",
    bad: "CPF, RG, comprovante",
    good: "Apenas e-mail",
  },
  {
    feature: "Suporte especializado",
    bad: "Tickets lentos",
    good: "WhatsApp 24/7",
  },
];

const FAQ = [
  {
    q: "Preciso enviar documentos?",
    a: "Não. Apenas nome, e-mail e chave PIX. Zero burocracia.",
  },
  {
    q: "Qual a taxa por transação?",
    a: "Taxa fixa e transparente. Sem mensalidade, sem cobranças escondidas.",
  },
  {
    q: "Como recebo meu dinheiro?",
    a: "O saldo cai na sua conta DiretoPay em segundos. Saque quando quiser.",
  },
  {
    q: "Preciso de CNPJ?",
    a: "Não. Pessoa física com CPF pode criar conta e vender imediatamente.",
  },
  {
    q: "Posso integrar via API?",
    a: "Sim. API REST completa com documentação interativa, SDKs e webhooks.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-[15px] font-semibold text-slate-900 dark:text-white">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-slate-400 dark:text-gray-400 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[14px] text-slate-600 dark:text-gray-400 pb-5 leading-relaxed overflow-hidden"
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(2348);
  const [activePlate, setActivePlate] = useState(0);
  const [calcValue, setCalcValue] = useState(1000);

  const FEE = 0.0499;
  const fmtBRL = (n) =>
    n.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const directoReceives = calcValue * (1 - FEE);
  const kiwifyReceives = calcValue * (1 - 0.0899) - 2.49;
  const hotmartReceives = calcValue * (1 - 0.099) - 1;
  const extraVsKiwify = directoReceives - kiwifyReceives;

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050709] text-slate-800 dark:text-white font-sans antialiased overflow-x-hidden transition-colors duration-300">
      <ScrollProgress color="#10b981" />
      {/* Background: Aurora + Grid + Particles */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`
            : `linear-gradient(rgba(30,164,101,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30,164,101,0.04) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-0">
        <AuroraBg className={isDark ? "opacity-100" : "opacity-30"} />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0 hidden md:block">
        <Particles count={10} color="#10b981" className={isDark ? "opacity-20" : "opacity-10"} />
      </div>
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(16,185,129,0.12) 0%, transparent 65%)"
            : "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(30,164,101,0.06) 0%, transparent 65%)",
        }}
      />

      {/* ── NAV ── */}
      <motion.nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 dark:bg-[#050709]/90 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.07] shadow-lg shadow-slate-100/50 dark:shadow-xl dark:shadow-black/30" : ""}`}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/">
            <img
              src="/logo-diretopay.webp"
              alt="DiretoPay"
              className="h-8 sm:h-9 w-auto logo-theme-adaptive"
            />
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              const Ico = l.icon;
              const inner = (
                <>
                  {Ico && <Ico size={12} className="inline mr-1 opacity-70" />}
                  {l.label}
                </>
              );
              const cls = `text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]`;
              return l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cls}
                >
                  {inner}
                </a>
              ) : (
                <a key={l.label} href={l.href} className={cls}>
                  {inner}
                </a>
              );
            })}
          </div>

          {/* Right: theme + auth */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle — like LunarPay's ☀ CLARO chip */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-white/20 hover:border-slate-300 dark:hover:border-white/40 rounded-full px-3 py-1.5 transition-all bg-white dark:bg-transparent shadow-sm dark:shadow-none"
            >
              {isDark ? <Sun size={12} /> : <Moon size={12} />}
              <span>{isDark ? "CLARO" : "ESCURO"}</span>
            </button>
            <Link
              to="/login"
              className="text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-[13px] font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-px"
            >
              Cadastre-se
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-white dark:bg-[#050709] flex flex-col pt-20 px-6 pb-10 md:hidden"
          >
            <nav className="flex flex-col gap-1 mt-4">
              {NAV_LINKS.map((l) => {
                const Ico = l.icon;
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.external ? "_blank" : undefined}
                    rel={l.external ? "noopener noreferrer" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 py-3.5 px-4 rounded-2xl text-[14px] font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
                  >
                    {Ico && <Ico size={14} className="opacity-60" />}
                    {l.label}
                  </a>
                );
              })}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              {/* Theme toggle mobile */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 py-3 text-[12px] font-bold text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-slate-300 dark:hover:border-white/20 transition-colors bg-white dark:bg-transparent shadow-sm dark:shadow-none"
              >
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                {isDark ? "Mudar para Claro" : "Mudar para Escuro"}
              </button>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center py-3 text-[13px] font-medium text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-slate-300 dark:hover:border-white/20 transition-colors bg-white dark:bg-transparent shadow-sm dark:shadow-none"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="text-center py-4 text-[13px] font-semibold bg-emerald-500 text-white rounded-2xl hover:bg-emerald-400 transition-colors shadow-xl shadow-emerald-500/30"
              >
                Cadastre-se
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ANNOUNCEMENT PILL (consolidado: canal + prova social) ── */}
      <div className="relative z-10 flex justify-center pt-28 pb-2 px-5">
        <motion.a
          href="https://wa.me/5551996148568"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          className="group flex items-center gap-2.5 bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.09] rounded-full pl-2 pr-4 py-1.5 backdrop-blur-xl shadow-sm dark:shadow-lg dark:shadow-black/30 transition-all"
        >
          <div className="flex -space-x-2">
            {["#10b981", "#6366f1", "#f59e0b"].map((c, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white dark:border-[#050709] flex items-center justify-center text-[8px] font-bold text-white"
                style={{ background: c }}
              >
                {["MR", "AL", "JS"][i]}
              </div>
            ))}
          </div>
          <span className="text-[12.5px] font-semibold text-slate-700 dark:text-gray-300">
            <span className="text-emerald-500 dark:text-emerald-400 font-bold">{onlineUsers.toLocaleString("pt-BR")}</span> vendedores ativos agora
          </span>
          <span className="h-3.5 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
          <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 group-hover:text-emerald-500 transition-colors items-center gap-1 hidden sm:flex">
            Canal oficial <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </motion.a>
      </div>

      {/* ── HERO ── */}
      <section
        id="sistema"
        className="relative z-10 pt-12 pb-20 px-5 overflow-hidden"
      >
        <Meteors count={10} color="#10b981" />
        <div
          className="absolute -top-32 -left-48 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #10b981, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 mb-7 rounded-full border border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] backdrop-blur px-3.5 py-1.5 shadow-sm dark:shadow-none">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                  Gateway PIX para
                </span>
                <MorphingText
                  texts={["infoprodutores", "afiliados", "e-commerces", "criadores"]}
                  className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              {/* Headline — bold, oversized, layered */}
              <h1 className="text-[42px] sm:text-[58px] lg:text-[68px] font-black tracking-[-0.03em] leading-[0.95] mb-6 text-slate-900 dark:text-white">
                <BlurText text="Receba por PIX" className="block" delay={0.04} />
                <span className="block">
                  <GradientText from="#10b981" to="#34d399">na hora.</GradientText>
                  <span className="text-slate-300 dark:text-slate-700"> Sem fricção.</span>
                </span>
              </h1>

              {/* Subheadline — one concise line */}
              <p className="text-[17px] sm:text-[18px] text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-md">
                Aprovação instantânea, saque direto na sua chave e antifraude nativo. Comece a vender em <strong className="text-slate-900 dark:text-white font-bold">2 minutos</strong> — sem CNPJ, sem burocracia.
              </p>

              {/* Single primary CTA + ghost link */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
                <RippleButton
                  color="rgba(16,185,129,0.5)"
                  onClick={() => (window.location.href = "/register")}
                  className="group flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-2xl transition-all text-[16px] shadow-[0_12px_40px_rgba(16,185,129,0.35)] hover:-translate-y-0.5"
                >
                  <ShinyText speed={2.5}>Criar conta grátis</ShinyText>
                  <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                </RippleButton>
                <a
                  href="#recursos"
                  className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold px-4 py-4 transition-colors text-[15px]"
                >
                  <span className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/15 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                    <Play size={11} className="text-emerald-500 ml-0.5" fill="currentColor" />
                  </span>
                  Ver como funciona
                </a>
              </div>

              {/* Trust metric strip — strongest social proof (volume) */}
              <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-8">
                {[
                  { value: 12, prefix: "R$ ", suffix: "M+", label: "processados" },
                  { value: 4200, prefix: "", suffix: "+", label: "vendedores" },
                  { value: 99.97, prefix: "", suffix: "%", label: "uptime", decimals: 2 },
                ].map((m, i) => (
                  <div
                    key={m.label}
                    className={
                      i > 0
                        ? "sm:pl-8 sm:border-l border-slate-200 dark:border-white/10"
                        : ""
                    }
                  >
                    <p className="text-[19px] sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums leading-none">
                      <NumberTicker value={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals || 0} />
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider mt-1">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: floating 3D dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative hidden lg:block"
            >
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div
                  style={{
                    transform:
                      "perspective(1000px) rotateY(-5deg) rotateX(5deg)",
                  }}
                  className="relative"
                >
                  <div
                    className="rounded-3xl border border-slate-200 dark:border-white/[0.1] p-6 shadow-2xl dark:shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
                    style={{
                      background: isDark
                        ? "linear-gradient(145deg, rgba(20,20,25,0.98), rgba(10,10,15,0.99))"
                        : "linear-gradient(145deg, #ffffff, #f8fafc)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, #10b981, #6366f1)",
                          }}
                        >
                          D
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-500">
                            Bem-vindo,
                          </p>
                          <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                            DiretoPay Seller 👋
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
                        Online
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] rounded-2xl p-4">
                        <p className="text-[10px] text-slate-500 mb-1">
                          Faturamento Hoje
                        </p>
                        <p className="text-[20px] font-black text-emerald-400 tabular-nums">
                          <NumberTicker value={12450} prefix="R$ " duration={1.6} />
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] rounded-2xl p-4">
                        <p className="text-[10px] text-slate-500 mb-1">Vendas</p>
                        <p className="text-[20px] font-black text-slate-900 dark:text-white tabular-nums">
                          <NumberTicker value={847} duration={1.6} />
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-100/50 dark:bg-white/[0.02] rounded-xl p-4 h-20 flex items-end gap-1.5">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
                          className="flex-1 rounded-sm"
                          style={{
                            background:
                              i >= 5
                                ? "linear-gradient(to top, #10b981, #34d399)"
                                : "rgba(16,185,129,0.2)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Live ticker */}
                  <AnimatePresence mode="wait">
                    {tickerVisible && (
                      <motion.div
                        key={tickerIdx}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="absolute -bottom-5 -left-6 flex items-center gap-3 border border-slate-200 dark:border-white/[0.1] rounded-2xl px-4 py-3 backdrop-blur-xl shadow-xl dark:shadow-2xl z-10"
                        style={{ background: isDark ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.98)" }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #10b981, #22c55e)",
                          }}
                        >
                          <CheckCircle size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-500 dark:text-gray-400">
                            Venda realizada no Pix!
                          </p>
                          <p className="text-[14px] font-bold text-slate-900 dark:text-white">
                            Comissão: {ticker.value}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <section className="relative z-10 border-y border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.015] overflow-hidden py-5">
        <p className="text-center text-[10px] font-bold text-slate-500 dark:text-gray-600 uppercase tracking-widest mb-4">
          Compatível com os maiores sistemas
        </p>
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{
              background: isDark
                ? "linear-gradient(to right, #050709, transparent)"
                : "linear-gradient(to right, #f8fafc, transparent)",
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{
              background: isDark
                ? "linear-gradient(to left, #050709, transparent)"
                : "linear-gradient(to left, #f8fafc, transparent)",
            }}
          />
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-10 w-max"
          >
            {[
              "Hotmart",
              "Kiwify",
              "Eduzz",
              "Monetizze",
              "Braip",
              "Shopify",
              "WooCommerce",
              "Lastlink",
              "Ticto",
              "PerfectPay",
              "Guru",
              "Pepper",
              "Hotmart",
              "Kiwify",
              "Eduzz",
              "Monetizze",
              "Braip",
              "Shopify",
              "WooCommerce",
              "Lastlink",
              "Ticto",
              "PerfectPay",
              "Guru",
              "Pepper",
            ].map((name, i) => (
              <span
                key={i}
                className="text-[13px] font-black text-slate-500 dark:text-gray-500 whitespace-nowrap tracking-tight opacity-40 hover:opacity-80 transition-opacity cursor-default"
              >
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-5 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ to, prefix, suffix, label, note, decimals }, i) => (
            <Reveal key={label} delay={i * 0.08} className="text-center">
              <p
                className="text-[30px] sm:text-[40px] md:text-[48px] font-black tracking-tight tabular-nums bg-clip-text text-transparent"
                style={{
                  backgroundImage: isDark
                    ? "linear-gradient(135deg, #fff 30%, #10b981)"
                    : "linear-gradient(135deg, #0f172a 30%, #1ea465)",
                }}
              >
                <CountUp
                  from={0}
                  to={to}
                  prefix={prefix}
                  suffix={suffix}
                  decimals={decimals}
                  duration={2}
                />
              </p>
              <p className="text-[13px] font-bold text-slate-800 dark:text-gray-300 mt-1.5 uppercase tracking-wider">
                {label}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-gray-600 mt-0.5">{note}</p>
            </Reveal>
          ))}
        </div>
        {/* Awwwards marquee belt */}
        <div className="border-t border-slate-100 dark:border-white/[0.04] py-4">
          <Marquee items={MARQUEE_ITEMS} speed={60} />
        </div>
      </section>

      {/* ── BENEFÍCIOS (DisplayCards 21st.dev) ── */}
      <section className="relative z-10 py-12 sm:py-20 px-5 border-t border-slate-200 dark:border-white/[0.06] overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-5">
              <ShieldCheck size={13} /> Por que DiretoPay
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-[-0.02em] leading-[1] mb-4 text-slate-900 dark:text-white">
              Feito para você{" "}
              <GradientText from="#10b981" to="#34d399">receber mais</GradientText>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] max-w-md mb-6">
              Aprovação na hora, dinheiro direto na sua chave PIX e proteção
              antifraude nativa. Passe o mouse sobre os cards.
            </p>
            <div className="flex flex-col gap-3">
              {BENEFITS.map(({ icon: Icon, color, title }) => (
                <div key={title} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                  >
                    <Icon size={15} style={{ color }} />
                  </div>
                  <span className="text-[14px] font-semibold text-slate-700 dark:text-gray-300">
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* DisplayCards empilhados */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="hidden sm:flex justify-center lg:justify-end min-h-[300px] items-center"
          >
            <DisplayCards
              cards={[
                {
                  icon: <Zap className="size-4 text-emerald-300" />,
                  title: "Aprovação Instantânea",
                  description: "Produtos aprovados na hora",
                  date: "Sem espera de 2-3 dias",
                  titleClassName: "text-emerald-500",
                  className:
                    "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-slate-200 dark:before:outline-white/10 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 dark:before:bg-[#050709]/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
                },
                {
                  icon: <DollarSign className="size-4 text-emerald-300" />,
                  title: "Saque Direto no PIX",
                  description: "Liquidação imediata",
                  date: "Na sua chave cadastrada",
                  titleClassName: "text-emerald-500",
                  className:
                    "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-slate-200 dark:before:outline-white/10 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 dark:before:bg-[#050709]/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
                },
                {
                  icon: <ShieldCheck className="size-4 text-emerald-300" />,
                  title: "Antifraude Nativo",
                  description: "Proteção multicamada",
                  date: "Contra chargebacks e MED",
                  titleClassName: "text-emerald-500",
                  className:
                    "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
                },
              ]}
            />
          </motion.div>
        </div>
      </section>

      {/* ── CONQUISTAS / PLACAS ── */}
      <section className="relative z-10 py-12 sm:py-20 px-5 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12">
            <SectionLabel number="02" label="Conquistas" />
            <ClipReveal delay={0.05}>
              <h2 className="text-[34px] sm:text-[48px] font-black tracking-[-0.02em] leading-[1] mb-3 text-slate-900 dark:text-white">
                Celebre suas{" "}
                <GradientText from="#f59e0b" to="#fbbf24">
                  conquistas
                </GradientText>
              </h2>
            </ClipReveal>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] max-w-sm mx-auto">
              Placas exclusivas a cada marco de faturamento.
            </p>
          </div>

          {/* Carousel */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p
                className={`text-[12px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500 mb-3`}
              >
                Ao você faturar
              </p>

              {/* Amount box */}
              <div
                className="inline-flex items-center justify-center border-2 border-emerald-500 rounded-2xl px-6 py-3 mb-6 bg-emerald-50/50 dark:bg-emerald-500/10"
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activePlate}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-[32px] font-black text-emerald-400 leading-none"
                  >
                    {PLATES[activePlate].amount}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Description */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`desc-${activePlate}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-3 mb-8"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Trophy size={14} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                      Você recebe:
                    </p>
                    <p className="text-[14px] text-slate-700 dark:text-gray-300 leading-relaxed">
                      {PLATES[activePlate].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {PLATES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePlate(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === activePlate
                        ? "w-7 h-2.5 bg-emerald-500"
                        : "w-2.5 h-2.5 bg-slate-300 dark:bg-white/15 hover:bg-slate-400 dark:hover:bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Right: plate card */}
            <div className="flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePlate}
                  initial={{ opacity: 0, scale: 0.88, rotateY: -12 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.88, rotateY: 12 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-[240px] sm:w-[270px] rounded-3xl overflow-hidden shadow-2xl dark:shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                  style={{
                    aspectRatio: "3/4",
                    background: isDark
                      ? "linear-gradient(145deg, #0c2d1a 0%, #061510 60%, #030c08 100%)"
                      : "linear-gradient(145deg, #e6f7ef 0%, #dcf1e6 60%, #cfebe0 100%)",
                  }}
                >
                  {/* Hex grid bg */}
                  <div
                    className="absolute inset-0 opacity-[0.15] dark:opacity-[0.07] pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='60' viewBox='0 0 52 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='26,2 50,15 50,45 26,58 2,45 2,15' fill='none' stroke='%2310b981' stroke-width='1.5'/%3E%3C/svg%3E")`,
                      backgroundSize: "52px 60px",
                    }}
                  />

                  {/* Radial glow */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: isDark
                        ? "radial-gradient(circle at 50% 38%, rgba(16,185,129,0.30) 0%, transparent 58%)"
                        : "radial-gradient(circle at 50% 38%, rgba(30,164,101,0.15) 0%, transparent 58%)",
                    }}
                  />

                  {/* Top shimmer */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent" />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center gap-0">
                    {/* Trophy icon */}
                    <div className="w-14 h-14 rounded-2xl border border-emerald-500/20 dark:border-emerald-400/20 bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-5">
                      <Trophy size={26} className="text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <p className="text-[9px] font-black text-emerald-700/60 dark:text-emerald-300/50 tracking-[0.38em] uppercase mb-3">
                      PARABÉNS
                    </p>

                    <p className="text-[62px] font-black text-emerald-950 dark:text-white leading-none tracking-tight mb-1">
                      {PLATES[activePlate].amount}
                    </p>

                    <p className="text-[9px] font-black text-emerald-700/60 dark:text-emerald-300/50 tracking-[0.38em] uppercase">
                      FATURADOS
                    </p>

                    {/* Logo */}
                    <div className="mt-auto pt-10">
                      <img
                        src="/logo-diretopay.webp"
                        alt="DiretoPay"
                        className="h-4 opacity-75 dark:opacity-25 logo-theme-adaptive mx-auto"
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center"
          >
            <p className="text-[13px] text-slate-500 dark:text-gray-500">
              <Trophy size={12} className="inline mr-1 text-emerald-400" />
              Mais de{" "}
              <span className="text-emerald-400 font-bold">500 peças</span> já
              entregues para nossos sellers!
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── RECURSOS ── */}
      <section id="recursos" className="relative z-10 py-12 sm:py-20 px-5 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-5">
              <Zap size={12} /> Tudo que você precisa
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-[-0.02em] leading-[1] mb-3 text-slate-900 dark:text-white">
              <BlurText text="Tudo para" className="justify-center" delay={0.03} />{" "}
              <GradientText from="#10b981" to="#6366f1">vender mais</GradientText>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] max-w-md mx-auto">
              Ferramentas profissionais desde o primeiro acesso.
            </p>
          </motion.div>
          <div className="flex justify-center mb-10">
            <ExpandableTabs
              tabs={[
                { title: "Recursos", icon: Zap },
                { title: "Simulador", icon: TrendingUp },
                { type: "separator" },
                { title: "Dúvidas", icon: MessageCircle },
              ]}
              onChange={(i) => {
                const targets = ["recursos", "simulador", null, "faq"];
                const t = i == null ? null : targets[i];
                if (t)
                  document
                    .getElementById(t)
                    ?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, color, title, desc }, i) => {
              const isLarge = i === 0 || i === 3;
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className={isLarge ? "sm:col-span-2 lg:col-span-2" : ""}
                >
                  <GlareCard className="h-full rounded-2xl">
                  <SpotlightCard
                    color={`${color}18`}
                    className="h-full rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-5 hover:border-slate-300 dark:hover:border-white/[0.14] transition-all cursor-default shadow-sm hover:shadow-md dark:shadow-none group"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                      style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                    >
                      <Icon size={isLarge ? 22 : 18} style={{ color }} />
                    </div>
                    <h3 className={`${isLarge ? "text-[16px]" : "text-[14px]"} font-bold text-slate-900 dark:text-white mb-1.5`}>{title}</h3>
                    <p className={`${isLarge ? "text-[13px] max-w-sm" : "text-[12px]"} text-slate-500 dark:text-gray-500 leading-relaxed`}>{desc}</p>
                    {isLarge && (
                      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold" style={{ color }}>
                        <CheckCircle size={12} />
                        <span>Disponível desde o primeiro acesso</span>
                      </div>
                    )}
                  </SpotlightCard>
                  </GlareCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section
        className="relative z-10 py-12 sm:py-20 px-5 border-t border-slate-200 dark:border-white/[0.06]"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-5">
              <Star size={12} fill="currentColor" /> +4.200 sellers
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-[-0.02em] leading-[1] mb-3 text-slate-900 dark:text-white">
              <BlurText text="Resultados reais" className="justify-center" delay={0.03} />
            </h2>
            <p className="text-gray-500 text-[15px]">
              Sellers de todo o Brasil já faturam com a DiretoPay.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(
              ({ initials, name, role, revenue, stars, text }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <GlareCard className="h-full rounded-2xl">
                  <SpotlightCard
                    color="rgba(16,185,129,0.08)"
                    className="relative rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-6 flex flex-col gap-4 cursor-default hover:border-slate-300 dark:hover:border-white/[0.16] transition-all shadow-sm hover:shadow-md dark:shadow-none h-full"
                  >
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: stars }).map((_, si) => (
                      <Star
                        key={si}
                        size={12}
                        className="text-yellow-400"
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-[14px] text-slate-700 dark:text-gray-300 leading-relaxed flex-1">
                    "{text}"
                  </p>
                  {/* Footer */}
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #10b981, #6366f1)",
                      }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-slate-900 dark:text-white">{name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-500">{role}</p>
                    </div>
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-1 rounded-lg shrink-0">
                      {revenue}
                    </span>
                  </div>
                  </SpotlightCard>
                  </GlareCard>
                </motion.div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="relative z-10 py-12 sm:py-20 px-5 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-4">
              <ShieldCheck size={13} /> Comparativo
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-[-0.02em] leading-[1] text-slate-900 dark:text-white">
              Por que a <GradientText from="#10b981" to="#34d399">DiretoPay?</GradientText>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {/* Desktop: tabela */}
            <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-white/[0.08] overflow-hidden shadow-sm dark:shadow-none">
              <div className="grid grid-cols-3 bg-slate-100/50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/[0.08] px-5 py-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Recurso
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Outras plataformas
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-center">
                  DiretoPay
                </span>
              </div>
              {COMPARISON.map(({ feature, bad, good }, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 px-5 py-4 border-b border-slate-100 dark:border-white/[0.05] last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-gray-300 self-center">
                    {feature}
                  </span>
                  <span className="text-[12px] text-red-600 dark:text-red-400 text-center self-center">
                    {bad}
                  </span>
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle
                      size={12}
                      className="text-emerald-400 shrink-0"
                    />
                    <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                      {good}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Mobile: cards */}
            <div className="sm:hidden flex flex-col gap-3">
              {COMPARISON.map(({ feature, bad, good }, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] p-4 shadow-sm dark:shadow-none"
                >
                  <p className="text-[13px] font-bold text-slate-800 dark:text-gray-200 mb-3">
                    {feature}
                  </p>
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                      Outras
                    </span>
                    <span className="text-[12px] text-red-600 dark:text-red-400">{bad}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                      DiretoPay
                    </span>
                    <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                      {good}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CALCULADORA COMPARATIVA (estilo MisticPay) ── */}
      <section id="simulador" className="relative z-10 py-12 sm:py-20 px-5 border-t border-slate-200 dark:border-white/[0.06] overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #10b981, transparent 70%)" }}
        />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-5">
              <TrendingUp size={13} /> Simulador
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-[-0.02em] leading-[1] text-slate-900 dark:text-white">
              Quanto você <GradientText from="#10b981" to="#34d399">recebe?</GradientText>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] mt-3 max-w-md mx-auto">
              Arraste e compare. Com a DiretoPay você fica com mais do seu dinheiro.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-6 sm:p-10 shadow-xl dark:shadow-[0_40px_80px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            <BorderBeam colorFrom="#10b981" colorTo="#6366f1" duration={9} />

            {/* Você vende */}
            <div className="text-center mb-8">
              <p className="text-[12px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest mb-2">
                Você vende
              </p>
              <p className="text-[44px] sm:text-[60px] font-black tracking-tight text-slate-900 dark:text-white leading-none tabular-nums">
                {fmtBRL(calcValue)}
              </p>
              <input
                type="range"
                min={50}
                max={10000}
                step={50}
                value={calcValue}
                onChange={(e) => setCalcValue(Number(e.target.value))}
                className="dp-range w-full max-w-lg mx-auto mt-6 block"
              />
              <div className="flex justify-between max-w-lg mx-auto mt-2 text-[11px] font-semibold text-slate-400 dark:text-gray-600">
                <span>R$ 50</span>
                <span>R$ 10.000</span>
              </div>
            </div>

            {/* Comparativo */}
            <div className="grid sm:grid-cols-3 gap-4">
              {/* DiretoPay — destaque */}
              <div className="sm:col-span-1 order-first sm:order-none rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 p-5 relative">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest whitespace-nowrap">
                  VOCÊ RECEBE
                </div>
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <img src="/logo-diretopay.webp" alt="DiretoPay" className="h-4 logo-theme-adaptive" />
                </div>
                <p className="text-[26px] sm:text-[28px] font-black text-emerald-500 dark:text-emerald-400 tabular-nums leading-none">
                  <NumberTicker value={directoReceives} prefix="R$ " decimals={2} duration={0.8} />
                </p>
                <p className="text-[11px] font-bold text-emerald-600/70 dark:text-emerald-400/60 mt-2">
                  taxa única de 4,99%
                </p>
              </div>

              {/* Concorrentes */}
              {[
                { name: "Kiwify", fee: "8,99% + R$2,49", value: kiwifyReceives },
                { name: "Hotmart", fee: "9,9% + R$1,00", value: hotmartReceives },
              ].map((c) => (
                <div
                  key={c.name}
                  className="rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.02] p-5"
                >
                  <p className="text-[13px] font-bold text-slate-600 dark:text-gray-400 mb-3 mt-1">
                    {c.name}
                  </p>
                  <p className="text-[22px] sm:text-[24px] font-black text-slate-400 dark:text-gray-500 tabular-nums leading-none line-through decoration-red-400/50">
                    {fmtBRL(c.value)}
                  </p>
                  <p className="text-[11px] font-semibold text-red-500/70 dark:text-red-400/60 mt-2">
                    {c.fee}
                  </p>
                </div>
              ))}
            </div>

            {/* Economia destacada */}
            <div className="mt-7 flex items-center justify-center gap-2 text-center flex-wrap">
              <span className="text-[14px] text-slate-600 dark:text-gray-400">
                Você ganha
              </span>
              <span className="text-[18px] font-black text-emerald-500 dark:text-emerald-400 tabular-nums">
                +{fmtBRL(Math.max(0, extraVsKiwify))}
              </span>
              <span className="text-[14px] text-slate-600 dark:text-gray-400">
                a mais que na Kiwify por venda.
              </span>
            </div>

            <RippleButton
              color="rgba(16,185,129,0.5)"
              onClick={() => (window.location.href = "/register")}
              className="group mt-7 mx-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3.5 rounded-2xl transition-all text-[15px] shadow-[0_12px_40px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
            >
              <ShinyText speed={2.5}>Começar a receber mais</ShinyText>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </RippleButton>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING / TAXA ── */}
      <section className="relative z-10 py-12 sm:py-20 px-5 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-4">
              <DollarSign size={12} /> Preço transparente
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-[-0.02em] leading-[1] text-slate-900 dark:text-white">
              Simples assim.{" "}
              <GradientText from="#10b981" to="#34d399">Sem pegadinha.</GradientText>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] mt-3">
              Uma taxa. Tudo incluso. Você só paga quando vender.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-5 items-start"
          >
            <div className="md:col-span-2 rounded-2xl border-2 border-emerald-500 bg-white dark:bg-white/[0.03] p-6 sm:p-8 shadow-xl shadow-emerald-500/10 relative overflow-hidden">
              <BorderBeam colorFrom="#10b981" colorTo="#6366f1" duration={8} />
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-widest">
                MAIS POPULAR
              </div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-[17px] font-black text-slate-900 dark:text-white">Plano Seller</h3>
                  <p className="text-[13px] text-slate-500 dark:text-gray-400">Para quem quer vender de imediato</p>
                </div>
              </div>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-[13px] font-bold text-slate-500 dark:text-gray-400 mb-1">taxa de</span>
                <span className="text-[52px] font-black text-emerald-400 leading-none">4,99%</span>
                <span className="text-[13px] font-bold text-slate-500 dark:text-gray-400 mb-1">por venda</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 mb-7">
                {[
                  "Sem mensalidade",
                  "Sem taxa de cadastro",
                  "Saque ilimitado via PIX",
                  "Checkout personalizado",
                  "API REST + Webhooks",
                  "Dashboard em tempo real",
                  "Antifraude nativo",
                  "Suporte WhatsApp 24/7",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                    <span className="text-[13px] text-slate-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3.5 rounded-xl transition-all text-[14px] shadow-lg shadow-emerald-500/25 hover:-translate-y-px w-full"
              >
                Criar conta grátis <ArrowRight size={15} />
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { icon: ShieldCheck, color: "#10b981", title: "Sem surpresas", desc: "Você só paga quando receber. Taxa única, sem letra miúda." },
                { icon: Zap, color: "#6366f1", title: "Ativo imediatamente", desc: "Cadastro em 2 min. Sua conta está operacional para vender já." },
                { icon: TrendingUp, color: "#f59e0b", title: "Volume alto?", desc: "Negocie condições especiais. Fale com nosso time no WhatsApp." },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-4 shadow-sm dark:shadow-none">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                    >
                      <Icon size={15} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-0.5">{title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 py-12 sm:py-20 px-5 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3">
              Como funciona
            </p>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-[-0.02em] leading-[1] text-slate-900 dark:text-white">
              Comece em <GradientText from="#10b981" to="#34d399">4 passos</GradientText>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                n: "01",
                icon: Lock,
                t: "Crie sua conta",
                d: "Cadastro gratuito em 2 minutos. Sem documentos.",
              },
              {
                n: "02",
                icon: QrCode,
                t: "Cadastre seu produto",
                d: "Aprovação instantânea. Sem burocracia.",
              },
              {
                n: "03",
                icon: TrendingUp,
                t: "Comece a vender",
                d: "Compartilhe o link do checkout e venda agora.",
              },
              {
                n: "04",
                icon: DollarSign,
                t: "Saque na hora",
                d: "Saldo disponível a qualquer momento no seu PIX.",
              },
            ].map(({ n, icon: Icon, t, d }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-6 group hover:border-slate-300 dark:hover:border-white/[0.14] transition-all cursor-default shadow-sm hover:shadow-md dark:shadow-none"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 group-hover:border-emerald-400 dark:group-hover:border-emerald-500/40 transition-all duration-300">
                    <Icon size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#050709] border border-emerald-200 dark:border-emerald-500/30 rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {n}
                  </span>
                </div>
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-2">{t}</h3>
                <p className="text-[12px] text-slate-500 dark:text-gray-500 leading-relaxed">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RANKING ── */}
      <section
        className="relative z-10 py-12 sm:py-20 px-5 border-t border-slate-200 dark:border-white/[0.06]"
        style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(16,185,129,0.02), transparent)"
            : "linear-gradient(180deg, rgba(30,164,101,0.02), transparent)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold px-4 py-2 rounded-full mb-4">
              <Flame size={13} /> Competição Mensal
            </div>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-[-0.02em] leading-[1] text-slate-900 dark:text-white">
              Sua <GradientText from="#f59e0b" to="#fbbf24">performance</GradientText> importa
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#0d1117]/80 backdrop-blur-xl p-6 shadow-md dark:shadow-none"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trophy size={22} className="text-yellow-500 dark:text-yellow-400" />
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">
                  Top Sellers — Junho 2025
                </h3>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-500/15 border border-yellow-200 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-[11px] font-bold px-3 py-1.5 rounded-full">
                Prêmios mensais
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {RANKING.map(({ initials, name, sales, amount, pos }, i) => (
                <motion.div
                  key={pos}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-2 sm:gap-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] rounded-2xl px-3 sm:px-5 py-3 sm:py-4 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-default"
                >
                  <div
                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-[12px] sm:text-[14px] shrink-0"
                    style={{
                      background: `${POS_COLORS[i]}22`,
                      color: POS_COLORS[i],
                    }}
                  >
                    {pos}
                  </div>
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-[11px] sm:text-[12px] shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #10b981, #6366f1)",
                    }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] sm:text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                      {name}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-gray-500">
                      {sales.toLocaleString("pt-BR")} vendas
                    </p>
                  </div>
                  <p className="text-[12px] sm:text-[14px] font-black text-emerald-400 shrink-0 tabular-nums">
                    {amount}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        className="relative z-10 py-12 sm:py-20 px-5 border-t border-slate-200 dark:border-white/[0.06]"
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3">
              FAQ
            </p>
            <h2 className="text-[34px] sm:text-[48px] font-black tracking-[-0.02em] leading-[1] text-slate-900 dark:text-white">
              Perguntas <GradientText from="#10b981" to="#34d399">frequentes</GradientText>
            </h2>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.025] backdrop-blur-sm px-6 overflow-hidden shadow-sm">
            {FAQ.map((item) => (
              <FaqItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE ── */}
      <section
        id="sobre"
        className="relative z-10 py-10 sm:py-16 px-5 border-t border-slate-200 dark:border-white/[0.06]"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.025] p-8 sm:p-12 text-center shadow-sm dark:shadow-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <Users size={22} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3">
              Sobre nós
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-slate-900 dark:text-white">
              Feito por vendedores, para vendedores.
            </h2>
            <p className="text-slate-600 dark:text-gray-400 text-[15px] leading-relaxed max-w-xl mx-auto mb-7">
              A DiretoPay é uma plataforma de pagamentos PIX focada em{" "}
              <strong className="text-slate-900 dark:text-gray-200">
                vendedores digitais brasileiros
              </strong>
              . Zero burocracia, aprovação imediata e saque na hora.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://instagram.com/diretopay_"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[12px] font-bold text-slate-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors border border-slate-200 dark:border-white/10 hover:border-pink-500/30 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-transparent"
              >
                <Instagram size={13} /> @diretopay_
              </a>
              <a
                href="https://wa.me/5551996148568"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[12px] font-bold text-slate-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-transparent"
              >
                <MessageCircle size={13} /> WhatsApp Suporte
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="relative z-10 py-8 px-5 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-[10px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-widest mb-5">
            Segurança e confiança
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: ShieldCheck, label: "SSL 256-bit" },
              { icon: Lock, label: "Criptografia ponta-a-ponta" },
              { icon: Zap, label: "99,97% Uptime" },
              { icon: Users, label: "+4.200 sellers ativos" },
              { icon: Star, label: "Suporte 24/7" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-500 dark:text-gray-500">
                <Icon size={14} className="text-emerald-500 shrink-0" />
                <span className="text-[12px] font-semibold whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative z-10 py-14 sm:py-24 px-5 border-t border-slate-200 dark:border-white/[0.06] overflow-hidden">
        <RetroGrid color="#10b981" opacity={0.18} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(16,185,129,0.10), transparent)"
              : "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(30,164,101,0.05), transparent)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center relative"
        >
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center mx-auto mb-7 shadow-2xl shadow-emerald-500/40">
            <Zap size={28} className="text-white" fill="white" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">
            Comece a vender
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: isDark
                  ? "linear-gradient(135deg, #10b981, #34d399)"
                  : "linear-gradient(135deg, #1ea465, #126b41)",
              }}
            >
              hoje mesmo.
            </span>
          </h2>
          <p className="text-slate-600 dark:text-gray-400 text-[16px] mb-9 max-w-md mx-auto">
            Sem documentos. Sem burocracia. Ativo em menos de 2 minutos.
          </p>
          <RippleButton color="rgba(16,185,129,0.5)" className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-2xl transition-all text-[16px] shadow-2xl shadow-emerald-500/35 hover:-translate-y-0.5" onClick={() => window.location.href='/register'}>
            <ShinyText speed={2.5}>Criar minha conta grátis</ShinyText> <ArrowRight size={18} />
          </RippleButton>
          <p className="text-[12px] text-slate-500 dark:text-gray-600 mt-5">
            Taxa fixa · Saque a qualquer hora · Sem CNPJ
          </p>
        </motion.div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
          >
            <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.12] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">Comece a vender hoje</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-500">Sem CNPJ · Sem documentos · Grátis</p>
              </div>
              <Link
                to="/register"
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/30 shrink-0 whitespace-nowrap"
              >
                Criar conta <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-white/[0.06] py-12 px-5 bg-white dark:bg-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <img
                src="/logo-diretopay.webp"
                alt="DiretoPay"
                className="h-7 w-auto opacity-70 hover:opacity-100 logo-theme-adaptive transition-opacity mb-3"
              />
              <p className="text-[12px] text-slate-500 dark:text-gray-500 leading-relaxed mb-4">
                Plataforma de pagamentos PIX para vendedores digitais.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://instagram.com/diretopay_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.06] hover:border-pink-500/25 hover:bg-slate-50 dark:hover:bg-transparent"
                >
                  <Instagram size={11} /> @diretopay_
                </a>
                <a
                  href="https://wa.me/5551996148568"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/[0.06] hover:border-emerald-500/25 hover:bg-slate-50 dark:hover:bg-transparent"
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
                  className="block text-[13px] text-slate-500 dark:text-gray-550 hover:text-slate-800 dark:hover:text-gray-200 transition-colors mb-2"
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
                  className="block text-[13px] text-slate-500 dark:text-gray-550 hover:text-slate-800 dark:hover:text-gray-200 transition-colors mb-2"
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
                className="block text-[13px] text-slate-500 dark:text-gray-550 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-2"
              >
                WhatsApp Suporte
              </a>
              <a
                href="https://instagram.com/diretopay_"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[13px] text-slate-500 dark:text-gray-550 hover:text-pink-600 dark:hover:text-pink-400 transition-colors mb-2"
              >
                Instagram
              </a>
              <a
                href="mailto:suporte@diretopay.site"
                className="block text-[13px] text-slate-500 dark:text-gray-550 hover:text-slate-800 dark:hover:text-gray-200 transition-colors"
              >
                E-mail
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100 dark:border-white/[0.05]">
            <p className="text-[11px] text-slate-500 dark:text-gray-600">
              © {new Date().getFullYear()} DiretoPay. Todos os direitos
              reservados.
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
