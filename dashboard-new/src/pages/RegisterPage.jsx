import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ShieldAlert, ChevronLeft, Check } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pixKey, setPixKey] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const allowedDomains = [
        'gmail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
        'yahoo.com', 'yahoo.com.br', 'icloud.com', 'me.com', 'mac.com',
        'protonmail.com', 'proton.me', 'aol.com',
        'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br', 'globo.com', 'globomail.com',
        'zoho.com', 'yandex.com', 'mail.com', 'gmx.com', 'gmx.net'
    ];

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const emailDomain = email.split('@')[1]?.toLowerCase();
        if (!emailDomain || !allowedDomains.includes(emailDomain)) {
            setError('Use um e-mail de provedor confiável (Gmail, Outlook, Hotmail, Yahoo, iCloud, etc). E-mails temporários não são permitidos.');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('full_name', name);
            formData.append('email', email);
            formData.append('pix_key', pixKey);
            formData.append('password', password);
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            formData.append('csrf_token', csrfToken);

            const res = await fetch('/auth/register.php', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                navigate('/login');
            } else {
                setError(data.error || 'Erro ao criar conta.');
            }
        } catch (err) {
            setError('Erro de conexão.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-['Outfit'] flex flex-col relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-gradient-to-bl from-purple-100 to-violet-50 rounded-full blur-[120px] -z-10 opacity-60" />
            <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-tr from-purple-50 to-transparent rounded-full blur-[100px] -z-10 opacity-40" />

            <div className="p-8">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Voltar</span>
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-xl"
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                            <Check size={12} /> Acesso Instantâneo Ativado
                        </div>
                        <h1 className="text-5xl font-black mb-3 tracking-tighter text-gray-900">Crie seu <span className="text-primary italic">Império.</span></h1>
                        <p className="text-gray-500 font-medium">Junte-se a milhares de Ghost Vendors hoje.</p>
                    </div>

                    <div className="bg-white border border-purple-100 shadow-[0_20px_60px_rgba(124,58,237,0.1)] p-10 rounded-[56px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -z-10" />
                        <form onSubmit={handleRegister} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-2xl text-center animate-in fade-in zoom-in duration-300">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Seu Nome</label>
                                    <div className="relative group">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Nome Completo"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Seu E-mail</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="E-mail"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Chave PIX (Qualquer Tipo)</label>
                                <div className="relative group">
                                    <Check className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="E-mail, CPF, Telefone ou Aleatória"
                                        value={pixKey}
                                        onChange={e => setPixKey(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Defina uma Senha Segura</label>
                                <div className="relative group">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        required
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-primary/50 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 flex gap-4">
                                <ShieldAlert className="text-primary/40 shrink-0" size={24} />
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Ao criar sua conta, você concorda com nossos <span className="text-gray-900 font-bold">Termos de Uso</span> e nossa <span className="text-gray-900 font-bold">Política de Privacidade Blindada</span>.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_40px_rgba(124,58,237,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Criando Conta...' : 'Começar Gratuitamente'} <ArrowRight size={24} />
                            </button>
                        </form>
                    </div>

                    <p className="text-center mt-10 text-gray-500 text-sm font-medium">
                        Já faz parte da elite? {' '}
                        <Link to="/login" className="text-primary font-black hover:text-secondary transition-colors px-2">Fazer Login</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
