import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Zap, KeyRound, Check, ShieldCheck, TrendingUp, DollarSign, Users, Eye, EyeOff, Star } from 'lucide-react';
import { AuroraBg, DotGrid, Particles, ShimmerButton, StatCard, GradientText, PulseBadge, GlowInput } from '../components/AnimatedUI';

const STATS = [
    { icon: DollarSign, label: 'Volume hoje',     value: 'R$ 84.290', sub: '+12% vs ontem',  color: '#10b981', bg: 'rgba(16,185,129,0.12)', delay: 0.3  },
    { icon: TrendingUp, label: 'Conversão',        value: '94,2%',     sub: 'Acima da média', color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  delay: 0.45 },
    { icon: Users,      label: 'Sellers ativos',   value: '4.218',     sub: '+38 esta semana', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  delay: 0.6  },
    { icon: Zap,        label: 'PIX gerado',        value: '~200ms',    sub: 'Tempo médio',    color: '#ec4899', bg: 'rgba(236,72,153,0.12)',   delay: 0.75 },
];

const REVIEWS = [
    { name: 'Lucas M.',  text: 'Melhor plataforma que usei. Saque no mesmo dia!', stars: 5 },
    { name: 'Ana P.',    text: 'Integração via API muito fácil. Suporte top.',    stars: 5 },
    { name: 'Felipe R.', text: 'Aumentei minha conversão em 30% com o checkout.', stars: 5 },
];

export default function LoginPage() {
    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [showPass, setShowPass]     = useState(false);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');
    const [mustResetPassword, setMustResetPassword] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword]     = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetSuccess, setResetSuccess]   = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            formData.append('csrf_token', csrfToken);
            const res  = await fetch('/auth/login.php', { method: 'POST', headers: { Accept: 'application/json' }, body: formData });
            const data = await res.json();
            if (data.success) { navigate('/dashboard'); window.location.reload(); }
            else if (data.must_reset_password) { setMustResetPassword(true); setResetToken(data.reset_token); setError(''); }
            else { setError(data.error || 'Email ou senha inválidos.'); }
        } catch { setError('Erro ao conectar com o servidor.'); }
        finally { setLoading(false); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) { setError('Mínimo 6 caracteres.'); return; }
        if (newPassword !== confirmPassword) { setError('As senhas não conferem.'); return; }
        setLoading(true); setError('');
        try {
            const res  = await fetch('/force_reset_password.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }) });
            const data = await res.json();
            if (data.success) { setResetSuccess(true); setMustResetPassword(false); setNewPassword(''); setConfirmPassword(''); setPassword(''); setTimeout(() => setResetSuccess(false), 5000); }
            else { setError(data.error || 'Erro ao redefinir senha.'); }
        } catch { setError('Erro de conexão.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050709] text-white flex overflow-hidden">

            {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 border-r border-white/[0.06] relative overflow-hidden">
                {/* Backgrounds */}
                <DotGrid />
                <AuroraBg />
                <Particles count={25} color="#10b981" className="opacity-60" />

                {/* Top orbs */}
                <div className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 65%)' }} />
                <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, transparent 65%)' }} />

                {/* Logo */}
                <Link to="/" className="relative z-10">
                    <img src="/logo-diretopay.webp" alt="DiretoPay" className="h-9 w-auto" />
                </Link>

                {/* Main content */}
                <div className="relative z-10 space-y-10">
                    <PulseBadge color="#10b981">Sistema ativo</PulseBadge>

                    <div>
                        <h2 className="text-[42px] font-black tracking-tight leading-[1.05] mb-4">
                            Sua plataforma<br />de pagamentos<br />
                            <GradientText from="#10b981" to="#34d399">PIX.</GradientText>
                        </h2>
                        <p className="text-gray-400 text-[14px] max-w-sm leading-relaxed">
                            Receba, gerencie e saque com velocidade profissional.<br />Sem burocracia, sem surpresas.
                        </p>
                    </div>

                    {/* Stat cards 2x2 grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {STATS.map(s => <StatCard key={s.label} {...s} />)}
                    </div>

                    {/* Reviews */}
                    <div className="space-y-2.5">
                        {REVIEWS.map((r, i) => (
                            <motion.div key={r.name}
                                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9 + i * 0.12, duration: 0.45, ease: [0.22,1,0.36,1] }}
                                className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                                <div className="flex gap-0.5 shrink-0 mt-0.5">
                                    {Array.from({ length: r.stars }).map((_, j) => (
                                        <Star key={j} size={9} fill="#f59e0b" className="text-amber-400" />
                                    ))}
                                </div>
                                <div>
                                    <p className="text-[12px] text-gray-300 leading-snug">"{r.text}"</p>
                                    <p className="text-[10px] text-gray-600 mt-1 font-medium">{r.name}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <p className="text-[11px] text-gray-700 relative z-10">© {new Date().getFullYear()} DiretoPay · Todos os direitos reservados</p>
            </div>

            {/* ── RIGHT PANEL (FORM) ─────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />

                <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-sm relative z-10">

                    {/* Mobile logo */}
                    <div className="lg:hidden mb-8 flex justify-center">
                        <Link to="/"><img src="/logo-diretopay.webp" alt="DiretoPay" className="h-8 w-auto" /></Link>
                    </div>

                    {/* Card */}
                    <div className="rounded-3xl border border-white/[0.09] bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-black/40"
                        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(16,185,129,0.06)' }}>

                        <div className="mb-7">
                            <h1 className="text-[26px] font-black tracking-tight">
                                {mustResetPassword ? 'Criar nova senha' : 'Entrar na conta'}
                            </h1>
                            <p className="text-[13px] text-gray-500 mt-1.5">
                                {mustResetPassword ? 'Defina uma senha segura para continuar' : 'Acesse seu painel DiretoPay'}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {resetSuccess && (
                                <motion.div key="success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[12px] font-medium p-3.5 rounded-xl mb-5">
                                    <Check size={13} /> Senha atualizada! Faça login.
                                </motion.div>
                            )}

                            {mustResetPassword ? (
                                <motion.form key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[12px] p-3.5 rounded-xl">
                                        <KeyRound size={13} /> Crie uma nova senha para continuar.
                                    </div>
                                    {error && (
                                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                            className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl">
                                            {error}
                                        </motion.p>
                                    )}
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-400 block mb-1.5 uppercase tracking-wider">Nova senha</label>
                                        <GlowInput icon={Lock} type="password" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-400 block mb-1.5 uppercase tracking-wider">Confirmar</label>
                                        <GlowInput icon={Lock} type="password" placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                    </div>
                                    <ShimmerButton type="submit" disabled={loading}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-3.5 font-bold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2">
                                        {loading ? 'Salvando...' : 'Definir senha'} <ArrowRight size={15} />
                                    </ShimmerButton>
                                    <button type="button" onClick={() => { setMustResetPassword(false); setError(''); }}
                                        className="w-full text-center text-[12px] text-gray-500 hover:text-gray-300 transition-colors">
                                        Voltar ao login
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    onSubmit={handleLogin} className="space-y-4">
                                    {error && (
                                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                            className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />{error}
                                        </motion.p>
                                    )}
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-400 block mb-1.5 uppercase tracking-wider">E-mail</label>
                                        <GlowInput icon={Mail} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Senha</label>
                                            <Link to="/forgot-password" className="text-[11px] text-emerald-500 hover:text-emerald-400 transition-colors">Esqueci a senha</Link>
                                        </div>
                                        <div className="relative">
                                            <GlowInput icon={Lock} type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                                            <button type="button" onClick={() => setShowPass(v => !v)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    <ShimmerButton type="submit" disabled={loading}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white rounded-xl py-3.5 font-bold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-1 shadow-lg shadow-emerald-500/25">
                                        {loading ? (
                                            <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Autenticando...</>
                                        ) : (
                                            <>Entrar <ArrowRight size={15} /></>
                                        )}
                                    </ShimmerButton>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <p className="text-center mt-6 text-[12px] text-gray-600">
                            Não tem conta?{' '}
                            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Criar conta grátis →</Link>
                        </p>
                    </div>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-4 mt-5">
                        {[{ icon: ShieldCheck, text: 'SSL seguro' }, { icon: Zap, text: 'PIX instantâneo' }, { icon: Users, text: '4k+ sellers' }].map(({ icon: I, text }) => (
                            <div key={text} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                                <I size={11} className="text-emerald-500/60" />{text}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
