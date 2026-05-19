import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QrCode, SendHorizonal, Zap, CheckCircle, Loader2, AlertCircle,
    Phone, Mail, Hash, User, CreditCard, ArrowRight, Clock,
    ChevronDown, RefreshCw, Check, X
} from 'lucide-react';
import PixModal from '../components/PixModal';

const KEY_TYPES = [
    { value: 'cpf',    label: 'CPF',       icon: User        },
    { value: 'cnpj',   label: 'CNPJ',      icon: CreditCard  },
    { value: 'email',  label: 'E-mail',    icon: Mail        },
    { value: 'phone',  label: 'Celular',   icon: Phone       },
    { value: 'random', label: 'Aleatória', icon: Hash        },
];

function fmtBRL(v) {
    return parseFloat(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatusBadge({ status }) {
    const map = {
        approved: { label: 'Pago',       cls: 'bg-emerald-50 text-emerald-600' },
        paid:     { label: 'Pago',       cls: 'bg-emerald-50 text-emerald-600' },
        pending:  { label: 'Pendente',   cls: 'bg-amber-50 text-amber-600'     },
        expired:  { label: 'Expirado',   cls: 'bg-gray-100 text-gray-400'      },
        rejected: { label: 'Rejeitado',  cls: 'bg-red-50 text-red-500'         },
        sent:     { label: 'Enviado',    cls: 'bg-blue-50 text-blue-600'       },
    };
    const s = map[status] || map.pending;
    return <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

export default function PixPage({ handleManualPix, activePix, setActivePix, balance }) {
    const [tab, setTab]               = useState('cobrar');

    /* ── Cobrar ── */
    const [amount, setAmount]         = useState('');
    const [genLoading, setGenLoading] = useState(false);

    /* ── Enviar ── */
    const [keyType, setKeyType]       = useState('cpf');
    const [pixKey, setPixKey]         = useState('');
    const [sendAmt, setSendAmt]       = useState('');
    const [sendDesc, setSendDesc]     = useState('');
    const [sendStep, setSendStep]     = useState(1); // 1 form | 2 confirm | 3 success
    const [sendLoading, setSendLoading] = useState(false);
    const [sendError, setSendError]   = useState('');
    const [showKeys, setShowKeys]     = useState(false);
    const [chargeRecipient, setChargeRecipient] = useState(false);

    /* ── History ── */
    const [txList, setTxList]         = useState([]);
    const [txLoading, setTxLoading]   = useState(true);

    useEffect(() => {
        fetch('/get_transactions.php?limit=15')
            .then(r => r.json())
            .then(d => setTxList(d.transactions || d || []))
            .catch(() => {})
            .finally(() => setTxLoading(false));
    }, []);

    /* ── Gerar PIX ── */
    const handleGerar = async () => {
        const val = amount.toString().replace(',', '.');
        if (!val || parseFloat(val) < 2) { alert('Valor mínimo: R$ 2,00'); return; }
        setGenLoading(true);
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res  = await fetch('/api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
                body: JSON.stringify({ amount: val }),
            });
            const data = await res.json();
            if (data.error) { alert('Erro: ' + (data.message || data.error)); return; }
            const pi = data.data || data;
            const pixResult = {
                id:     pi.pix_id     || pi.payment_id || '',
                amount: pi.amount     || val,
                code:   pi.pix_code   || pi.qr_code    || pi.payload || '',
                image:  pi.qr_image   || pi.qr_image_url || '',
            };
            if (pixResult.id) setActivePix(pixResult);
            else alert('Erro ao gerar PIX. Tente novamente.');
        } catch { alert('Falha de conexão.'); }
        finally  { setGenLoading(false); }
    };

    /* ── Enviar PIX ── */
    const handleEnviar = async () => {
        if (sendStep === 1) {
            if (!pixKey.trim() || !sendAmt) { setSendError('Preencha a chave e o valor.'); return; }
            if (parseFloat(sendAmt) < 0.01) { setSendError('Valor inválido.'); return; }
            setSendError('');
            setSendStep(2);
            return;
        }
        setSendLoading(true);
        setSendError('');
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res  = await fetch('/send_pix.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
                body: JSON.stringify({ key_type: keyType, key: pixKey, amount: sendAmt, description: sendDesc, charge_recipient: chargeRecipient }),
            });
            const rawText = await res.text();
            let data;
            try { data = JSON.parse(rawText); }
            catch { setSendError('Servidor: ' + rawText.replace(/<[^>]+>/g,'').trim().slice(0, 150)); setSendStep(1); setSendLoading(false); return; }
            if (data.success) { setSendStep(3); }
            else { setSendError(data.message || 'Erro ao enviar PIX.'); setSendStep(1); }
        } catch (e) { setSendError('Falha: ' + (e?.message || 'conexão')); setSendStep(1); }
        finally  { setSendLoading(false); }
    };

    const resetEnviar = () => { setPixKey(''); setSendAmt(''); setSendDesc(''); setSendStep(1); setSendError(''); };

    const SelectedKey = KEY_TYPES.find(k => k.value === keyType);

    return (
        <div className="space-y-5 animate-in fade-in duration-500 pb-10">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <QrCode size={21} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900">PIX</h1>
                        <p className="text-xs text-gray-400 font-medium">Transferências e cobranças instantâneas</p>
                    </div>
                </div>
                {balance && (
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo disponível</span>
                        <span className="text-lg font-black text-gray-900">R$ {balance}</span>
                    </div>
                )}
            </div>

            {/* ── TABS ── */}
            <div className="grid grid-cols-2 gap-3">
                {[
                    { id: 'cobrar', icon: QrCode,           label: 'Cobrar',      sub: 'Gerar QR Code' },
                    { id: 'enviar', icon: SendHorizonal,    label: 'Enviar',      sub: 'Transferir PIX' },
                ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                            tab === t.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tab === t.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <t.icon size={18} />
                        </div>
                        <div>
                            <p className={`font-black text-sm ${tab === t.id ? 'text-primary' : 'text-gray-700'}`}>{t.label}</p>
                            <p className="text-[11px] text-gray-400 font-medium">{t.sub}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* ── MAIN GRID (form + history) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* FORM — 2/5 */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">

                        {/* ═══ COBRAR ═══ */}
                        {tab === 'cobrar' && (
                            <motion.div key="cobrar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
                                <h2 className="font-black text-gray-900 text-base">Gerar cobrança PIX</h2>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                                        <input
                                            type="number" min="2" step="0.01"
                                            value={amount} onChange={e => setAmount(e.target.value)}
                                            placeholder="0,00"
                                            className="w-full bg-gray-50 border border-gray-300 rounded-xl py-4 pl-10 pr-4 font-black text-2xl text-gray-900 focus:outline-none focus:border-primary/50 focus:bg-white transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 px-1">Mínimo: R$ 2,00</p>
                                </div>

                                <button onClick={handleGerar} disabled={genLoading || !amount}
                                    className="w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_8px_24px_rgba(192,0,106,0.3)]"
                                    style={{ background: 'linear-gradient(135deg, #C0006A, #8B0045)' }}
                                >
                                    {genLoading
                                        ? <><Loader2 size={18} className="animate-spin" /> Gerando...</>
                                        : <><Zap size={18} fill="currentColor" /> Gerar PIX</>
                                    }
                                </button>

                                <div className="flex items-center gap-2 justify-center text-gray-300">
                                    <CheckCircle size={13} />
                                    <span className="text-[11px] font-medium">Crédito imediato após confirmação</span>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ ENVIAR ═══ */}
                        {tab === 'enviar' && (
                            <motion.div key="enviar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">

                                <AnimatePresence mode="wait">

                                    {/* Step 3: success */}
                                    {sendStep === 3 && (
                                        <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-8 space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <Check size={28} className="text-emerald-600" />
                                            </div>
                                            <h3 className="font-black text-gray-900 text-lg">PIX enviado!</h3>
                                            <p className="text-gray-400 text-sm">Transferência realizada com sucesso.</p>
                                            <button onClick={resetEnviar} className="mt-2 text-primary font-black text-sm flex items-center gap-1 hover:opacity-70 transition-opacity">
                                                <RefreshCw size={14} /> Nova transferência
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* Step 2: confirm */}
                                    {sendStep === 2 && (
                                        <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setSendStep(1)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                                    <X size={15} className="text-gray-500" />
                                                </button>
                                                <h2 className="font-black text-gray-900 text-base">Confirmar envio</h2>
                                            </div>

                                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400 font-medium">Tipo de chave</span>
                                                    <span className="font-black text-gray-900">{SelectedKey?.label}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400 font-medium">Chave PIX</span>
                                                    <span className="font-black text-gray-900 break-all max-w-[60%] text-right">{pixKey}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400 font-medium">Valor</span>
                                                    <span className="font-black text-primary text-base">R$ {fmtBRL(sendAmt)}</span>
                                                </div>
                                                {sendDesc && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-400 font-medium">Descrição</span>
                                                        <span className="font-black text-gray-900">{sendDesc}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400 font-medium">Taxa</span>
                                                    <span className={`font-black text-sm ${chargeRecipient ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                        {chargeRecipient ? 'Cobrada do destinatário' : 'Paga por mim'}
                                                    </span>
                                                </div>
                                            </div>

                                            {sendError && (
                                                <div className="flex items-center gap-2 text-red-500 text-xs font-black bg-red-50 p-3 rounded-xl">
                                                    <AlertCircle size={14} /> {sendError}
                                                </div>
                                            )}

                                            <button onClick={handleEnviar} disabled={sendLoading}
                                                className="w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                                                style={{ background: 'linear-gradient(135deg, #C0006A, #8B0045)', boxShadow: '0 8px 24px rgba(192,0,106,0.3)' }}>
                                                {sendLoading
                                                    ? <><Loader2 size={18} className="animate-spin" /> Enviando...</>
                                                    : <><SendHorizonal size={18} /> Confirmar envio</>
                                                }
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* Step 1: form */}
                                    {sendStep === 1 && (
                                        <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                            <h2 className="font-black text-gray-900 text-base">Enviar PIX</h2>

                                            {/* Key type selector */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de chave</label>
                                                <div className="relative">
                                                    <button onClick={() => setShowKeys(v => !v)}
                                                        className="w-full flex items-center justify-between bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 transition-all hover:border-gray-400">
                                                        <div className="flex items-center gap-2">
                                                            <SelectedKey.icon size={16} className="text-primary" />
                                                            <span className="font-black text-gray-900 text-sm">{SelectedKey.label}</span>
                                                        </div>
                                                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${showKeys ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {showKeys && (
                                                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden">
                                                                {KEY_TYPES.map(k => (
                                                                    <button key={k.value} onClick={() => { setKeyType(k.value); setPixKey(''); setShowKeys(false); }}
                                                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${keyType === k.value ? 'bg-primary/5' : ''}`}>
                                                                        <k.icon size={15} className={keyType === k.value ? 'text-primary' : 'text-gray-400'} />
                                                                        <span className={`text-sm font-black ${keyType === k.value ? 'text-primary' : 'text-gray-700'}`}>{k.label}</span>
                                                                        {keyType === k.value && <Check size={14} className="text-primary ml-auto" />}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* PIX key input */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chave PIX</label>
                                                <input type={keyType === 'email' ? 'email' : 'text'}
                                                    placeholder={{ cpf: '000.000.000-00', cnpj: '00.000.000/0000-00', email: 'exemplo@email.com', phone: '(11) 9 0000-0000', random: 'Chave aleatória (UUID)' }[keyType]}
                                                    value={pixKey} onChange={e => setPixKey(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-bold text-sm text-gray-900 focus:outline-none focus:border-primary/50 focus:bg-white transition-all placeholder:text-gray-400" />
                                            </div>

                                            {/* Amount */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                                                    <input type="number" min="0.01" step="0.01"
                                                        value={sendAmt} onChange={e => setSendAmt(e.target.value)}
                                                        placeholder="0,00"
                                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-10 pr-4 font-black text-xl text-gray-900 focus:outline-none focus:border-primary/50 focus:bg-white transition-all placeholder:text-gray-400" />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição <span className="normal-case font-medium">(opcional)</span></label>
                                                <input type="text" placeholder="Ex: pagamento serviço"
                                                    value={sendDesc} onChange={e => setSendDesc(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-bold text-sm text-gray-900 focus:outline-none focus:border-primary/50 focus:bg-white transition-all placeholder:text-gray-400" />
                                            </div>

                                            {/* Cobrar taxa do destinatário */}
                                            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                                                <div onClick={() => setChargeRecipient(v => !v)}
                                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                                        chargeRecipient
                                                            ? 'border-primary bg-primary'
                                                            : 'border-gray-400 dark:border-gray-600 bg-transparent'
                                                    }`}>
                                                    {chargeRecipient && <Check size={10} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                                    Cobrar taxa do destinatário
                                                </span>
                                            </label>

                                            {/* Aviso chave incorreta */}
                                            <div className="flex items-start gap-2.5 rounded-xl p-3 border"
                                                style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.35)' }}>
                                                <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                <p className="text-[11px] font-medium leading-relaxed text-amber-700 dark:text-yellow-300">
                                                    <span className="font-black">Atenção:</span> certifique-se de que a chave está correta antes de continuar. Transferências para chaves incorretas <span className="font-black">não serão reembolsadas.</span>
                                                </p>
                                            </div>

                                            {sendError && (
                                                <div className="flex items-center gap-2 text-red-500 text-xs font-black bg-red-50 p-3 rounded-xl">
                                                    <AlertCircle size={14} /> {sendError}
                                                </div>
                                            )}

                                            <button onClick={handleEnviar}
                                                className="w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_8px_24px_rgba(192,0,106,0.3)]"
                                                style={{ background: 'linear-gradient(135deg, #C0006A, #8B0045)' }}>
                                                <ArrowRight size={18} /> Continuar
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* HISTORY — 3/5 */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
                        <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <Clock size={15} className="text-primary" /> Histórico PIX
                        </h2>
                    </div>

                    {txLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={22} className="animate-spin text-gray-300" />
                        </div>
                    ) : txList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                            <QrCode size={36} className="mb-3 opacity-40" />
                            <p className="text-sm font-black">Nenhuma transação ainda</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {txList.map((tx, i) => (
                                <div key={tx.id || i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.badge === 'approved' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                        {tx.badge === 'approved'
                                            ? <CheckCircle size={16} className="text-emerald-600" />
                                            : <Clock size={16} className="text-gray-400" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-gray-900 text-sm truncate">{tx.customer_name || 'Cobrança PIX'}</p>
                                        <p className="text-[11px] text-gray-400 font-medium">{tx.date || '—'}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className={`font-black text-sm ${tx.badge === 'approved' ? 'text-emerald-600' : 'text-gray-500'}`}>
                                            R$ {tx.amount_brl}
                                        </span>
                                        <StatusBadge status={tx.badge} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* PIX Modal */}
            {activePix && (
                <PixModal
                    pixData={activePix}
                    onClose={() => setActivePix(null)}
                    statusEndpoint="/check_pix_status.php"
                    onPaymentSuccess={() => setActivePix(null)}
                />
            )}
        </div>
    );
}
