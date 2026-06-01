import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Shield, ChevronLeft, KeyRound, Check, Zap, CreditCard, Package, Users, Wallet, Bell, BarChart3, Activity, Globe, MessageCircle, QrCode, ShieldCheck, Webhook } from 'lucide-react';

const LEFT_PILLS = [
    { Icon: Zap,          label: 'PIX Instantâneo', top: '13%', left: '4%',  delay: 0.1, float: -7 },
    { Icon: CreditCard,   label: 'Checkout',         top: '26%', left: '9%',  delay: 0.3, float: 8  },
    { Icon: Package,      label: 'Produtos',          top: '41%', left: '3%',  delay: 0.5, float: -6 },
    { Icon: Users,        label: 'Afiliados',         top: '56%', left: '7%',  delay: 0.7, float: 9  },
    { Icon: Wallet,       label: 'Saques',            top: '70%', left: '4%',  delay: 0.9, float: -8 },
    { Icon: Bell,         label: 'Notificações',      top: '82%', left: '10%', delay: 1.1, float: 7  },
];

const RIGHT_PILLS = [
    { Icon: ShieldCheck,  label: 'Anti-fraude',    top: '11%', right: '5%',  delay: 0.2, float: 8  },
    { Icon: BarChart3,    label: 'Relatórios',     top: '24%', right: '9%',  delay: 0.4, float: -7 },
    { Icon: QrCode,       label: 'QR Code PIX',    top: '38%', right: '3%',  delay: 0.6, float: 9  },
    { Icon: Globe,        label: 'Multi-domínio',  top: '52%', right: '7%',  delay: 0.8, float: -6 },
    { Icon: Activity,     label: 'Tempo Real',     top: '65%', right: '4%',  delay: 1.0, float: 8  },
    { Icon: MessageCircle,label: 'Chat Suporte',   top: '78%', right: '8%',  delay: 1.2, float: -9 },
];

function FloatingPill({ Icon, label, delay, float: floatY }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5, ease: 'easeOut' }}
        >
            <motion.div
                animate={{ y: [0, floatY, 0] }}
                transition={{ delay: delay + 0.5, duration: 3.5 + delay * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-2.5 bg-white border border-emerald-100 hover:border-primary/30 rounded-full px-4 py-2.5 shadow-[0_4px_20px_rgba(30,164,101,0.08)] hover:shadow-[0_4px_28px_rgba(30,164,101,0.16)] transition-all whitespace-nowrap"
            >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={12} className="text-primary" />
                </div>
                <span className="text-gray-500 text-xs font-bold">{label}</span>
            </motion.div>
        </motion.div>
    );
}

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

    return (
        <div className="min-h-screen bg-white text-gray-900 font-['Outfit'] flex flex-col relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-gradient-to-bl from-emerald-100 to-green-50 rounded-full blur-[100px] -z-10 opacity-70" />
            <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-gradient-to-tr from-emerald-50 to-transparent rounded-full blur-[80px] -z-10 opacity-50" />

            {/* Floating Pills — left side (hidden on small screens) */}
            <div className="hidden lg:block pointer-events-none">
                {LEFT_PILLS.map((pill, i) => (
                    <div key={i} className="absolute" style={{ top: pill.top, left: pill.left }}>
                        <FloatingPill {...pill} />
                    </div>
                ))}
            </div>

            {/* Floating Pills — right side (hidden on small screens) */}
            <div className="hidden lg:block pointer-events-none">
                {RIGHT_PILLS.map((pill, i) => (
                    <div key={i} className="absolute" style={{ top: pill.top, right: pill.right }}>
                        <FloatingPill {...pill} />
                    </div>
                ))}
            </div>

            {/* Decorative SVG lines */}
            <svg className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(30,164,101)" stopOpacity="0" />
                        <stop offset="50%" stopColor="rgb(30,164,101)" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="rgb(30,164,101)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <line x1="18%" y1="13%" x2="50%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
                <line x1="20%" y1="26%" x2="50%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
                <line x1="16%" y1="41%" x2="50%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
                <line x1="19%" y1="56%" x2="50%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
                <line x1="17%" y1="70%" x2="50%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
                <line x1="82%" y1="11%" x2="50%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
                <line x1="80%" y1="24%" x2="50%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
                <line x1="84%" y1="38%" x2="50%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
                <line x1="81%" y1="52%" x2="50%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
                <line x1="83%" y1="65%" x2="50%" y2="50%" stroke="url(#lineGrad)" strokeWidth="0.8" />
            </svg>

            {/* Header / Back Button */}
            <div className="p-8">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Voltar para Home</span>
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-600/10 to-green-700/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_8px_30px_rgba(30,164,101,0.15)]">
                            <Shield className="text-primary" size={32} />
                        </div>
                        <h1 className="text-4xl font-black mb-2 tracking-tight text-gray-900">Bem-vindo de <span className="text-primary italic">Volta</span></h1>
                        <p className="text-gray-500 font-medium text-sm px-4">Acesse sua central de comando blindada DiretoPay.</p>
                    </div>

                    <div className="bg-white border border-emerald-100 shadow-[0_20px_60px_rgba(30,164,101,0.1)] p-8 md:p-10 rounded-[48px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[50px] -z-10" />

                        {resetSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold p-4 rounded-2xl text-center mb-6 animate-in fade-in zoom-in duration-300 flex items-center justify-center gap-2">
                                <Check size={14} /> Senha atualizada! Faça login com sua nova senha.
                            </div>
                        )}

                        {mustResetPassword ? (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="text-center mb-2">
                                    <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <KeyRound className="text-amber-500" size={28} />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900">Crie uma Nova Senha</h2>
                                    <p className="text-gray-400 text-xs mt-1">Sua senha foi resetada pelo administrador.</p>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-2xl text-center animate-in fade-in zoom-in duration-300">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nova Senha</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            required
                                            type="password"
                                            placeholder="Mínimo 6 caracteres"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Confirmar Nova Senha</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            required
                                            type="password"
                                            placeholder="Repita a senha"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_40px_rgba(30,164,101,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Salvando...' : 'Definir Nova Senha'} <ArrowRight size={20} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setMustResetPassword(false); setError(''); }}
                                    className="w-full text-center text-gray-400 text-xs font-bold hover:text-gray-700 transition-colors"
                                >
                                    Voltar ao Login
                                </button>
                            </form>
                        ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-2xl text-center animate-in fade-in zoom-in duration-300">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Endereço de E-mail</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        required
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Senha de Acesso</label>
                                    <Link to="/forgot-password" className="text-[10px] font-black text-primary/70 uppercase tracking-widest hover:text-primary transition-colors">Esqueci a senha</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_40px_rgba(30,164,101,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Autenticando...' : 'Entrar no Painel'} <ArrowRight size={20} />
                            </button>
                        </form>
                        )}
                    </div>

                    <p className="text-center mt-8 text-gray-500 text-sm font-medium">
                        Não tem uma conta ainda? {' '}
                        <Link to="/register" className="text-primary font-black hover:text-secondary transition-colors">Criar Conta Blindada</Link>
                    </p>
                </motion.div>
            </div>

            <footer className="p-8 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">GHOST PIX v2.0 • Security FIRST</p>
            </footer>
        </div>
    );
}
