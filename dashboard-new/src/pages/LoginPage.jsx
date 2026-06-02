import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Zap, KeyRound, Check, ShieldCheck, BarChart3, QrCode, Webhook } from 'lucide-react';

const FEATURES = [
    { icon: Zap,        label: 'PIX em 200ms',        desc: 'Cobranças geradas instantaneamente' },
    { icon: ShieldCheck,label: 'Antifraude nativo',   desc: 'Proteção multicamada automática' },
    { icon: BarChart3,  label: 'Dashboard completo',  desc: 'Relatórios e métricas em tempo real' },
    { icon: QrCode,     label: 'Checkout próprio',    desc: 'Página de pagamento personalizada' },
    { icon: Webhook,    label: 'Webhooks',            desc: 'Notificações automáticas no backend' },
];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mustResetPassword, setMustResetPassword] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            formData.append('csrf_token', csrfToken);

            const res = await fetch('/auth/login.php', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                navigate('/dashboard');
                window.location.reload();
            } else if (data.must_reset_password) {
                setMustResetPassword(true);
                setResetToken(data.reset_token);
                setError('');
            } else {
                setError(data.error || 'Email ou senha inválidos.');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
        if (newPassword !== confirmPassword) { setError('As senhas não conferem.'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/force_reset_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset_token: resetToken, new_password: newPassword })
            });
            const data = await res.json();
            if (data.success) {
                setResetSuccess(true);
                setMustResetPassword(false);
                setNewPassword('');
                setConfirmPassword('');
                setPassword('');
                setTimeout(() => setResetSuccess(false), 5000);
            } else {
                setError(data.error || 'Erro ao redefinir senha.');
            }
        } catch { setError('Erro de conexão.'); }
        finally { setLoading(false); }
    };

    const inp = 'w-full rounded-xl py-3 pl-10 pr-4 text-[14px] border outline-none transition-all bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:bg-white/8';
    const lbl = 'text-[11px] font-medium text-gray-400 block mb-1.5';

    return (
        <div className="min-h-screen bg-[#080a0e] text-white flex">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 border-r border-white/[0.06] relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
                        style={{ background: 'radial-gradient(ellipse, #10b981 0%, transparent 70%)' }} />
                </div>
                <Link to="/" className="flex items-center gap-2.5 relative z-10">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <Zap size={14} className="text-white" fill="white" />
                    </div>
                    <span className="text-[16px] font-black">Direto<span className="text-emerald-500">Pay</span></span>
                </Link>

                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-[32px] font-black tracking-tight leading-tight">
                            Sua plataforma<br />de pagamentos<br /><span className="text-emerald-500">PIX.</span>
                        </h2>
                        <p className="text-gray-400 text-[14px] mt-3 max-w-sm leading-relaxed">
                            Receba, gerencie e saque seus pagamentos com segurança e velocidade.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {FEATURES.map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Icon size={14} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-white">{label}</p>
                                    <p className="text-[11px] text-gray-500">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-[11px] text-gray-600 relative z-10">© {new Date().getFullYear()} DiretoPay</p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="w-full max-w-sm">

                    <div className="mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                            <Zap size={18} className="text-emerald-500" />
                        </div>
                        <h1 className="text-[22px] font-bold tracking-tight">Entrar na conta</h1>
                        <p className="text-[13px] text-gray-400 mt-1">Acesse seu painel DiretoPay</p>
                    </div>

                    {resetSuccess && (
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-medium p-3 rounded-xl mb-5">
                            <Check size={13} /> Senha atualizada! Faça login com a nova senha.
                        </div>
                    )}

                    {mustResetPassword ? (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[12px] p-3 rounded-xl mb-2">
                                <KeyRound size={13} /> Crie uma nova senha para continuar.
                            </div>
                            {error && <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
                            <div>
                                <label className={lbl}>Nova senha</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input required type="password" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inp} />
                                </div>
                            </div>
                            <div>
                                <label className={lbl}>Confirmar senha</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input required type="password" placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inp} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-3 font-semibold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                {loading ? 'Salvando...' : 'Definir senha'} <ArrowRight size={15} />
                            </button>
                            <button type="button" onClick={() => { setMustResetPassword(false); setError(''); }}
                                className="w-full text-center text-[12px] text-gray-500 hover:text-gray-300 transition-colors">
                                Voltar ao login
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
                            <div>
                                <label className={lbl}>E-mail</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input required type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className={inp} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className={lbl.replace('block mb-1.5', '')}>Senha</label>
                                    <Link to="/forgot-password" className="text-[11px] text-emerald-500 hover:text-emerald-400 transition-colors">Esqueci a senha</Link>
                                </div>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input required type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className={inp} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-3 font-semibold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2">
                                {loading ? 'Autenticando...' : 'Entrar'} <ArrowRight size={15} />
                            </button>
                        </form>
                    )}

                    <p className="text-center mt-6 text-[12px] text-gray-500">
                        Não tem conta?{' '}
                        <Link to="/register" className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors">Criar conta grátis</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
