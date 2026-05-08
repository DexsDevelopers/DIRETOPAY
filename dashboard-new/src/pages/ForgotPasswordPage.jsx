import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ChevronLeft, KeyRound, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('email', email);
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            formData.append('csrf_token', csrfToken);

            const res = await fetch('/auth/forgot_password.php', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                setSent(true);
            } else {
                setError(data.error || 'Erro ao processar solicitação.');
            }
        } catch {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
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
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <KeyRound className="text-amber-500" size={32} />
                        </div>
                        <h1 className="text-4xl font-black mb-2 tracking-tight text-gray-900">Esqueceu a <span className="text-primary italic">Senha?</span></h1>
                        <p className="text-gray-500 font-medium text-sm px-4">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
                    </div>

                    <div className="bg-white border border-purple-100 shadow-[0_20px_60px_rgba(124,58,237,0.1)] p-8 md:p-10 rounded-[48px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[50px] -z-10" />

                        {sent ? (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <Check className="text-emerald-500" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black mb-2 text-gray-900">E-mail Enviado!</h2>
                                    <p className="text-gray-500 text-sm">Se o e-mail <span className="text-gray-900 font-bold">{email}</span> estiver cadastrado, você receberá um link para redefinir sua senha.</p>
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                                    <p className="text-amber-500 text-xs font-bold">⚠️ Verifique também a pasta de SPAM / Lixo Eletrônico</p>
                                </div>
                                <Link
                                    to="/login"
                                    className="block w-full h-14 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-black text-base flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_40px_rgba(124,58,237,0.3)]"
                                >
                                    Voltar ao Login <ArrowRight size={18} />
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-2xl text-center animate-in fade-in zoom-in duration-300">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Seu E-mail Cadastrado</label>
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

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_40px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Link de Reset'} <ArrowRight size={20} />
                                </button>
                            </form>
                        )}
                    </div>

                    <p className="text-center mt-8 text-gray-500 text-sm font-medium">
                        Lembrou a senha? {' '}
                        <Link to="/login" className="text-primary font-black hover:text-secondary transition-colors">Fazer Login</Link>
                    </p>
                </motion.div>
            </div>

            <footer className="p-8 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">GHOST PIX v2.0 • Security FIRST</p>
            </footer>
        </div>
    );
}
