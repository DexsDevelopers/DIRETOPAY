import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ChevronLeft, KeyRound, Check, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [userName, setUserName] = useState('');
    const [tokenError, setTokenError] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const res = await fetch(`/auth/reset_password_token.php?token=${token}`);
            const data = await res.json();
            if (data.valid) {
                setTokenValid(true);
                setUserName(data.name || '');
            } else {
                setTokenError(data.error || 'Link inválido.');
            }
        } catch {
            setTokenError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
        if (newPassword !== confirmPassword) { setError('As senhas não conferem.'); return; }
        setSaving(true);
        setError('');

        try {
            const res = await fetch('/auth/reset_password_token.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: newPassword })
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.error || 'Erro ao redefinir senha.');
            }
        } catch {
            setError('Erro de conexão.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-['Outfit'] flex flex-col relative overflow-hidden">
            <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-gradient-to-bl from-purple-100 to-violet-50 rounded-full blur-[100px] -z-10 opacity-70" />
            <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-gradient-to-tr from-purple-50 to-transparent rounded-full blur-[80px] -z-10 opacity-50" />

            <div className="p-8">
                <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Voltar ao Login</span>
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <RefreshCw className="animate-spin text-primary" size={32} />
                        </div>
                    ) : !tokenValid ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
                                <AlertTriangle className="text-red-500" size={32} />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900">{tokenError}</h1>
                            <p className="text-gray-500 text-sm">Solicite um novo link de redefinição de senha.</p>
                            <Link
                                to="/forgot-password"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-8 py-4 rounded-full font-black hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_40px_rgba(124,58,237,0.3)]"
                            >
                                Solicitar Novo Link <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : success ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                                <Check className="text-emerald-500" size={32} />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900">Senha Atualizada!</h1>
                            <p className="text-gray-500 text-sm">Redirecionando para o login...</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                    <KeyRound className="text-primary" size={32} />
                                </div>
                                <h1 className="text-4xl font-black mb-2 tracking-tight text-gray-900">Nova <span className="text-primary italic">Senha</span></h1>
                                {userName && <p className="text-gray-500 font-medium text-sm">Olá, {userName}! Crie sua nova senha abaixo.</p>}
                            </div>

                            <div className="bg-white border border-purple-100 shadow-[0_20px_60px_rgba(124,58,237,0.1)] p-8 md:p-10 rounded-[48px] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[50px] -z-10" />

                                <form onSubmit={handleSubmit} className="space-y-6">
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
                                        disabled={saving}
                                        className="w-full h-16 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_40px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Salvando...' : 'Salvar Nova Senha'} <ArrowRight size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            <footer className="p-8 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">GHOST PIX v2.0 • Security FIRST</p>
            </footer>
        </div>
    );
}
