import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ShieldAlert, ChevronLeft, Check, HelpCircle, Briefcase, Zap, PiggyBank } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pixKey, setPixKey] = useState('');
    const [password, setPassword] = useState('');
    const [preferredNominal, setPreferredNominal] = useState('nominal1');
    const [withdrawPreference, setWithdrawPreference] = useState('accumulate');
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

    const handleSelectNominal = (val) => {
        setPreferredNominal(val);
        if (val === 'nominal3') {
            setWithdrawPreference('auto_direct');
        } else {
            setWithdrawPreference('accumulate');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const emailDomain = email.split('@')[1]?.toLowerCase();
        if (!emailDomain || !allowedDomains.includes(emailDomain)) {
            setError('Use um e-mail de provedor confiável (Gmail, Outlook, Hotmail, Yahoo, iCloud, etc). E-mails temporários não são permitidos.');
            setLoading(false);
            setStep(1);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('full_name', name);
            formData.append('email', email);
            formData.append('pix_key', pixKey);
            formData.append('password', password);
            formData.append('preferred_nominal', preferredNominal);
            formData.append('withdraw_preference', withdrawPreference);
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
            <div className="absolute top-[-5%] right-[-5%] w-[50%] h-[50%] bg-gradient-to-bl from-pink-100 to-rose-50 rounded-full blur-[120px] -z-10 opacity-60" />
            <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-tr from-pink-50 to-transparent rounded-full blur-[100px] -z-10 opacity-40" />

            <div className="p-8">
                {step === 1 ? (
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Voltar</span>
                    </Link>
                ) : (
                    <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group bg-transparent border-none outline-none cursor-pointer">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Informações Básicas</span>
                    </button>
                )}
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
                        <h1 className="text-5xl font-black mb-3 tracking-tighter text-gray-900">
                            {step === 1 ? <>Crie seu <span className="text-primary italic">Império.</span></> : <>Configure sua <span className="text-primary italic">Operação.</span></>}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {step === 1 ? 'Junte-se a milhares de DiretoPayVendors hoje.' : 'Defina os fluxos adequados de acordo com sua operação.'}
                        </p>
                    </div>

                    <div className="bg-white border border-pink-100 shadow-[0_20px_60px_rgba(30,164,101,0.1)] p-10 rounded-[56px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -z-10" />
                        
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        setError('');
                                        const emailDomain = email.split('@')[1]?.toLowerCase();
                                        if (!emailDomain || !allowedDomains.includes(emailDomain)) {
                                            setError('Use um e-mail de provedor confiável (Gmail, Outlook, Hotmail, Yahoo, iCloud, etc). E-mails temporários não são permitidos.');
                                            return;
                                        }
                                        setStep(2);
                                    }} className="space-y-6">
                                        {error && (
                                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-2xl text-center">
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

                                        <div className="bg-pink-50 p-6 rounded-3xl border border-pink-100 flex gap-4">
                                            <ShieldAlert className="text-primary/40 shrink-0" size={24} />
                                            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Ao criar sua conta, você concorda com nossos <span className="text-gray-900 font-bold">Termos de Uso</span> e nossa <span className="text-gray-900 font-bold">Política de Privacidade Blindada</span>.</p>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full h-16 bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-full font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_40px_rgba(30,164,101,0.35)]"
                                        >
                                            Configurar Operação <ArrowRight size={24} />
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <form onSubmit={handleRegister} className="space-y-8">
                                        {error && (
                                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-2xl text-center">
                                                {error}
                                            </div>
                                        )}

                                        {/* Pergunta 1: Tipo de Operação */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <HelpCircle className="text-primary shrink-0" size={20} />
                                                <h3 className="text-base font-black text-gray-900">1. Qual tipo de operação você planeja rodar?</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {/* Nominal 1 */}
                                                <div
                                                    onClick={() => handleSelectNominal('nominal1')}
                                                    className={cn(
                                                        "cursor-pointer p-5 rounded-3xl border-2 transition-all flex items-start gap-4 select-none",
                                                        preferredNominal === 'nominal1'
                                                            ? "bg-pink-500/5 border-pink-500 shadow-[0_10px_25px_rgba(236,72,153,0.12)]"
                                                            : "bg-gray-50 border-gray-100 hover:border-gray-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "p-3 rounded-2xl shrink-0 transition-colors",
                                                        preferredNominal === 'nominal1' ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-500"
                                                    )}>
                                                        <ShieldAlert size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <span className="font-bold text-gray-900 text-sm">Operações de Alto Risco / Sensíveis</span>
                                                            <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 px-2.5 py-0.5 rounded-full font-black shrink-0 uppercase tracking-wider">Nominal 1</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                                            Recomendado para nichos de alto risco ou com alta taxa de reembolso/chargeback.
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="text-[11px] bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-2.5 py-0.5 rounded-full font-bold">
                                                                Saque mínimo: R$ 25,00
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Nominal 2 */}
                                                <div
                                                    onClick={() => handleSelectNominal('nominal2')}
                                                    className={cn(
                                                        "cursor-pointer p-5 rounded-3xl border-2 transition-all flex items-start gap-4 select-none",
                                                        preferredNominal === 'nominal2'
                                                            ? "bg-emerald-500/5 border-emerald-500 shadow-[0_10px_25px_rgba(16,185,129,0.12)]"
                                                            : "bg-gray-50 border-gray-100 hover:border-gray-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "p-3 rounded-2xl shrink-0 transition-colors",
                                                        preferredNominal === 'nominal2' ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                                                    )}>
                                                        <Briefcase size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <span className="font-bold text-gray-900 text-sm">Ticket Baixo / Sem Reembolso</span>
                                                            <span className="text-[10px] bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-black shrink-0 uppercase tracking-wider">Nominal 2</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                                            Recomendado para produtos de valor baixo e sem risco de estorno (ex: infoprodutos baratos).
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                                                                Saque mínimo: R$ 5,00
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Nominal 3 */}
                                                <div
                                                    onClick={() => handleSelectNominal('nominal3')}
                                                    className={cn(
                                                        "cursor-pointer p-5 rounded-3xl border-2 transition-all flex items-start gap-4 select-none",
                                                        preferredNominal === 'nominal3'
                                                            ? "bg-blue-500/5 border-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.12)]"
                                                            : "bg-gray-50 border-gray-100 hover:border-gray-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "p-3 rounded-2xl shrink-0 transition-colors",
                                                        preferredNominal === 'nominal3' ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                                                    )}>
                                                        <Zap size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <span className="font-bold text-gray-900 text-sm">Ticket Médio / Saque Automático</span>
                                                            <span className="text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-black shrink-0 uppercase tracking-wider">Nominal 3</span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                                            Vendas de ticket intermediário com baixo estorno. Repasses automáticos direto para sua conta.
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="text-[11px] bg-blue-500/10 text-blue-600 dark:text-blue-500/20 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-bold">
                                                                Saque mínimo: R$ 10,00
                                                            </span>
                                                            <span className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-500/20 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-bold">
                                                                Saque Automático Ativo
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pergunta 2: Preferência de Saque */}
                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <HelpCircle className="text-primary shrink-0" size={20} />
                                                <h3 className="text-base font-black text-gray-900">2. Como deseja gerenciar os saques das suas vendas?</h3>
                                            </div>

                                            {preferredNominal === 'nominal3' ? (
                                                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-3xl p-5 flex gap-4 items-center">
                                                    <Zap className="text-blue-500 shrink-0 animate-pulse" size={24} />
                                                    <p className="text-xs font-bold leading-relaxed">
                                                        Para a Rota Nominal 3, os saques automáticos já vêm ativos por padrão! Cada venda aprovada será repassada de forma instantânea para sua chave Pix.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Acumular */}
                                                    <div
                                                        onClick={() => setWithdrawPreference('accumulate')}
                                                        className={cn(
                                                            "cursor-pointer p-5 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-3 select-none",
                                                            withdrawPreference === 'accumulate'
                                                                ? "bg-purple-500/5 border-purple-500 shadow-[0_10px_20px_rgba(30,164,101,0.12)]"
                                                                : "bg-gray-50 border-gray-100 hover:border-gray-200"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "p-2.5 rounded-full transition-colors",
                                                            withdrawPreference === 'accumulate' ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-500"
                                                        )}>
                                                            <PiggyBank size={18} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="font-bold text-gray-900 text-sm">Acumular Saldo</h4>
                                                            <p className="text-xs text-gray-500 leading-normal font-medium">Acumule as vendas na plataforma e solicite saques manuais quando desejar.</p>
                                                        </div>
                                                    </div>

                                                    {/* Sacar a cada venda */}
                                                    <div
                                                        onClick={() => setWithdrawPreference('auto_direct')}
                                                        className={cn(
                                                            "cursor-pointer p-5 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-3 select-none",
                                                            withdrawPreference === 'auto_direct'
                                                                ? "bg-emerald-500/5 border-emerald-500 shadow-[0_10px_20px_rgba(16,185,129,0.12)]"
                                                                : "bg-gray-50 border-gray-100 hover:border-gray-200"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "p-2.5 rounded-full transition-colors",
                                                            withdrawPreference === 'auto_direct' ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                                                        )}>
                                                            <Zap size={18} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="font-bold text-gray-900 text-sm">Saque por Venda</h4>
                                                            <p className="text-xs text-gray-500 leading-normal font-medium">A cada venda que cair na plataforma, um saque Pix correspondente será feito automaticamente.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Ações do Step 2 */}
                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="flex-1 h-16 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-black text-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                                            >
                                                <ChevronLeft size={20} /> Voltar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-[2] h-16 bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-full font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_12px_40px_rgba(30,164,101,0.35)] disabled:opacity-50"
                                            >
                                                {loading ? 'Finalizando...' : 'Finalizar Cadastro'} <ArrowRight size={24} />
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
