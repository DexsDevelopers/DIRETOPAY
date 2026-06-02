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

    const inp = 'w-full rounded-xl py-3 pl-10 pr-4 text-[13px] border outline-none transition-all bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50';
    const lbl = 'text-[11px] font-medium text-gray-400 block mb-1.5';

    const NOMINALS = [
        { key: 'nominal1', label: 'Alto Risco', tag: 'N1', tagColor: 'bg-red-500/15 text-red-400',   desc: 'Nichos sensíveis ou com alta taxa de chargeback.', min: 'R$ 25,00', icon: ShieldAlert },
        { key: 'nominal2', label: 'Ticket Baixo', tag: 'N2', tagColor: 'bg-emerald-500/15 text-emerald-400', desc: 'Produtos baratos sem risco de estorno.', min: 'R$ 5,00', icon: Briefcase },
        { key: 'nominal3', label: 'Auto-saque', tag: 'N3', tagColor: 'bg-blue-500/15 text-blue-400', desc: 'Ticket médio com repasse automático.', min: 'R$ 10,00', icon: Zap },
    ];

    return (
        <div className="min-h-screen bg-[#080a0e] text-white flex items-center justify-center p-5">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10"
                    style={{ background: 'radial-gradient(ellipse, #10b981 0%, transparent 70%)' }} />
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="w-full max-w-lg relative z-10">

                {/* Logo */}
                <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <Zap size={14} className="text-white" fill="white" />
                        </div>
                        <span className="text-[15px] font-black">Direto<span className="text-emerald-500">Pay</span></span>
                    </Link>
                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step >= 1 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-500'}`}>1</div>
                        <div className={`w-8 h-px ${step >= 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step >= 2 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-500'}`}>2</div>
                    </div>
                </div>

                <div className="mb-6">
                    <h1 className="text-[22px] font-bold tracking-tight">
                        {step === 1 ? 'Criar conta' : 'Configurar operação'}
                    </h1>
                    <p className="text-[13px] text-gray-400 mt-1">
                        {step === 1 ? 'Preencha seus dados para começar.' : 'Escolha o perfil que melhor se encaixa no seu negócio.'}
                    </p>
                </div>

                <div className={`rounded-2xl border p-6 bg-white/[0.02] border-white/[0.07]`}>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form key="s1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                                onSubmit={(e) => {
                                    e.preventDefault(); setError('');
                                    const domain = email.split('@')[1]?.toLowerCase();
                                    if (!domain || !allowedDomains.includes(domain)) {
                                        setError('Use um e-mail de provedor confiável (Gmail, Outlook, Yahoo, iCloud, etc).');
                                        return;
                                    }
                                    setStep(2);
                                }} className="space-y-4">
                                {error && <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={lbl}>Nome</label>
                                        <div className="relative"><User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input required type="text" placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} className={inp} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={lbl}>E-mail</label>
                                        <div className="relative"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input required type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className={inp} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Chave PIX</label>
                                    <div className="relative"><Check size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input required type="text" placeholder="E-mail, CPF, Telefone ou Aleatória" value={pixKey} onChange={e => setPixKey(e.target.value)} className={inp} />
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Senha</label>
                                    <div className="relative"><Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input required type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} className={inp} />
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500">Ao criar sua conta, você concorda com os Termos de Uso e a Política de Privacidade.</p>
                                <button type="submit"
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-3 font-semibold text-[14px] flex items-center justify-center gap-2 transition-all">
                                    Próximo <ArrowRight size={15} />
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                                onSubmit={handleRegister} className="space-y-5">
                                {error && <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>}

                                <div>
                                    <p className="text-[11px] font-medium text-gray-400 mb-3">Tipo de operação</p>
                                    <div className="space-y-2">
                                        {NOMINALS.map(({ key, label, tag, tagColor, desc, min, icon: Icon }) => (
                                            <div key={key} onClick={() => handleSelectNominal(key)}
                                                className={`cursor-pointer rounded-xl border p-4 flex items-start gap-3 transition-all select-none ${
                                                    preferredNominal === key
                                                        ? 'border-emerald-500/40 bg-emerald-500/5'
                                                        : 'border-white/[0.07] hover:border-white/[0.14] bg-white/[0.02]'
                                                }`}>
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${preferredNominal === key ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                                                    <Icon size={13} className={preferredNominal === key ? 'text-emerald-400' : 'text-gray-500'} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[13px] font-semibold text-white">{label}</span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${tagColor}`}>{tag}</span>
                                                    </div>
                                                    <p className="text-[11px] text-gray-500">{desc} Saque mín: <span className="text-gray-400">{min}</span></p>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-1 transition-all ${preferredNominal === key ? 'border-emerald-500 bg-emerald-500' : 'border-gray-600'}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {preferredNominal !== 'nominal3' && (
                                    <div>
                                        <p className="text-[11px] font-medium text-gray-400 mb-3">Preferência de saque</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { key: 'accumulate',  label: 'Acumular saldo', icon: PiggyBank, desc: 'Saque manual quando quiser' },
                                                { key: 'auto_direct', label: 'Por venda',       icon: Zap,       desc: 'PIX automático a cada venda' },
                                            ].map(({ key, label, icon: Icon, desc }) => (
                                                <div key={key} onClick={() => setWithdrawPreference(key)}
                                                    className={`cursor-pointer rounded-xl border p-3 text-center transition-all select-none ${
                                                        withdrawPreference === key
                                                            ? 'border-emerald-500/40 bg-emerald-500/5'
                                                            : 'border-white/[0.07] hover:border-white/[0.14] bg-white/[0.02]'
                                                    }`}>
                                                    <Icon size={16} className={`mx-auto mb-1.5 ${withdrawPreference === key ? 'text-emerald-400' : 'text-gray-500'}`} />
                                                    <p className="text-[12px] font-semibold text-white">{label}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {preferredNominal === 'nominal3' && (
                                    <div className="bg-blue-500/5 border border-blue-500/20 text-blue-400 rounded-xl p-3 flex gap-2 items-center text-[12px]">
                                        <Zap size={14} className="shrink-0" /> Rota N3: saque automático já ativo por padrão.
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(1)}
                                        className="flex-1 border border-white/10 hover:border-white/20 text-gray-300 rounded-xl py-3 font-medium text-[13px] flex items-center justify-center gap-1.5 transition-all">
                                        <ChevronLeft size={14} /> Voltar
                                    </button>
                                    <button type="submit" disabled={loading}
                                        className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-3 font-semibold text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                        {loading ? 'Criando...' : 'Finalizar cadastro'} <ArrowRight size={15} />
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-center mt-5 text-[12px] text-gray-500">
                    Já tem conta?{' '}
                    <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors">Fazer login</Link>
                </p>
            </motion.div>
        </div>
    );
}
