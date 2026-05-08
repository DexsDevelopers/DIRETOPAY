import React, { useState, useEffect } from 'react';
import {
    Zap, ShoppingCart, Shield, Eye, EyeOff, RefreshCw,
    CheckCircle, XCircle, Link2, ChevronDown, ChevronUp,
    Wifi, WifiOff, AlertCircle, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = '../get_admin_data.php';
const ACTIONS = '../admin_actions.php';

function Toggle({ enabled, onChange, disabled }) {
    return (
        <button
            onClick={() => !disabled && onChange(!enabled)}
            disabled={disabled}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-40 ${
                enabled ? 'bg-primary' : 'bg-gray-200'
            }`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                enabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
        </button>
    );
}

function CopyBtn({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copy} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
        </button>
    );
}

function GatewayCard({ gateway }) {
    const [open, setOpen]       = useState(false);
    const [form, setForm]       = useState(gateway.initialForm || {});
    const [saving, setSaving]   = useState(false);
    const [toggling, setToggling] = useState(false);
    const [status, setStatus]   = useState(null);
    const [enabled, setEnabled] = useState(gateway.enabled);
    const [showSecrets, setShowSecrets] = useState({});

    const post = async (fd) => {
        const res = await fetch(ACTIONS, { method: 'POST', body: fd });
        return res.json();
    };

    const handleToggle = async (next) => {
        setToggling(true);
        try {
            const fd = new FormData();
            if (gateway.toggleAction) {
                fd.append('action', gateway.toggleAction);
                fd.append('enabled', next ? '1' : '0');
            } else {
                fd.append('action', gateway.saveAction);
                Object.entries(form).forEach(([k, v]) => fd.append(k, v));
                fd.append(gateway.enabledKey, next ? '1' : '0');
            }
            const d = await post(fd);
            if (d.success) setEnabled(next);
        } finally { setToggling(false); }
    };

    const handleSave = async () => {
        setSaving(true); setStatus(null);
        try {
            const fd = new FormData();
            fd.append('action', gateway.saveAction);
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            fd.append(gateway.enabledKey, enabled ? '1' : '0');
            const d = await post(fd);
            if (d.success) { setStatus({ ok: true }); if (!enabled) setEnabled(true); }
            else setStatus({ ok: false, msg: d.error || 'Erro ao salvar' });
        } catch (e) { setStatus({ ok: false, msg: e.message }); }
        finally { setSaving(false); }
    };

    return (
        <motion.div
            layout
            className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                enabled
                    ? `border-${gateway.color}-500/20 bg-${gateway.color}-500/[0.03]`
                    : 'border-gray-100 bg-white shadow-sm'
            }`}
        >
            {/* Header */}
            <div className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    enabled ? `bg-${gateway.color}-500/15` : 'bg-gray-50'
                }`}>
                    <gateway.Icon size={22} className={enabled ? `text-${gateway.color}-400` : 'text-gray-300'} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base">{gateway.name}</span>
                        <span className={`text-[10px] font-black rounded-full px-2.5 py-0.5 border ${
                            enabled
                                ? `bg-${gateway.color}-500/10 text-${gateway.color}-400 border-${gateway.color}-500/20`
                                : 'bg-gray-100 text-gray-400 border-gray-200'
                        }`}>
                            {enabled ? '● ATIVO' : '○ INATIVO'}
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">{gateway.description}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <Toggle enabled={enabled} onChange={handleToggle} disabled={toggling} />
                    {gateway.hasForm && (
                        <button
                            onClick={() => setOpen(o => !o)}
                            className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all text-gray-400"
                        >
                            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Webhook URL pill */}
            {gateway.webhookUrl && (
                <div className="px-5 pb-4">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-3 py-2 w-fit">
                        <Link2 size={11} className="text-gray-400 flex-shrink-0" />
                        <span className="text-[11px] text-gray-500 font-mono">{gateway.webhookUrl}</span>
                        <CopyBtn text={gateway.webhookUrl} />
                    </div>
                </div>
            )}

            {/* Expandable form */}
            <AnimatePresence>
                {open && gateway.hasForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className={`mx-5 mb-5 rounded-2xl border border-gray-100 bg-gray-50 p-4`}>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Credenciais</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {gateway.fields.map(field => (
                                    <div key={field.key} className="relative">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                                            {field.label}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                                                value={form[field.key] || ''}
                                                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                className={`w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-${gateway.color}-500/40 transition-all ${field.secret ? 'pr-10' : ''}`}
                                            />
                                            {field.secret && (
                                                <button
                                                    onClick={() => setShowSecrets(s => ({ ...s, [field.key]: !s[field.key] }))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
                                                >
                                                    {showSecrets[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`bg-${gateway.color}-500/10 border border-${gateway.color}-500/20 text-${gateway.color}-400 hover:bg-${gateway.color}-500/20 px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50`}
                                >
                                    {saving ? <RefreshCw size={13} className="animate-spin" /> : <Shield size={13} />}
                                    Salvar & Ativar
                                </button>
                                {status?.ok  && <span className="text-[11px] text-green-400 font-black flex items-center gap-1"><CheckCircle size={12} /> Salvo!</span>}
                                {status?.msg && <span className="text-[11px] text-red-400 font-black flex items-center gap-1"><AlertCircle size={12} /> {status.msg}</span>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function AdminGatewaysPage() {
    const [loading, setLoading] = useState(true);
    const [gateways, setGateways] = useState(null);

    useEffect(() => {
        fetch(API)
            .then(r => r.json())
            .then(d => { if (d.success) setGateways(d); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <RefreshCw size={24} className="animate-spin text-gray-300" />
        </div>
    );

    const pixgoEnabled  = gateways?.pixgo_enabled === 1;
    const sigiloEnabled = gateways?.sigilopay?.enabled === true;
    const caktoEnabled  = !!(gateways?.cakto?.webhook_id);
    const activeCount   = [pixgoEnabled, sigiloEnabled, caktoEnabled].filter(Boolean).length;

    const gatewayDefs = [
        {
            id: 'sigilopay',
            name: 'SigiloPay',
            description: 'Gateway PIX com saque D+0 automático e privacidade total',
            color: 'blue',
            Icon: Shield,
            enabled: sigiloEnabled,
            webhookUrl: 'pixLunar.site/sigilopay_webhook.php',
            hasForm: true,
            saveAction: 'save_sigilopay',
            enabledKey: 'sigilopay_enabled',
            initialForm: {
                sigilopay_public_key: gateways?.sigilopay?.public_key || '',
                sigilopay_secret_key: '',
            },
            fields: [
                { key: 'sigilopay_public_key', label: 'Public Key (Client ID)', placeholder: 'empresatokio_...', secret: false },
                { key: 'sigilopay_secret_key', label: 'Secret Key (Client Secret)', placeholder: '••••••••••••••••', secret: true },
            ],
        },
        {
            id: 'pixgo',
            name: 'PixGo',
            description: 'Gateway PIX original da plataforma',
            color: 'primary',
            Icon: Zap,
            enabled: pixgoEnabled,
            webhookUrl: 'pixLunar.site/webhook.php',
            hasForm: false,
            toggleAction: 'toggle_pixgo',
            saveAction: 'toggle_pixgo',
            enabledKey: 'enabled',
            initialForm: {},
            fields: [],
        },
        {
            id: 'cakto',
            name: 'Cakto',
            description: 'Marketplace externo — credita saldo ao receber purchase_approved',
            color: 'green',
            Icon: ShoppingCart,
            enabled: caktoEnabled,
            webhookUrl: 'pixLunar.site/cakto_webhook.php',
            hasForm: true,
            saveAction: 'setup_cakto_webhook',
            enabledKey: 'cakto_enabled',
            initialForm: {
                client_id: gateways?.cakto?.client_id || '',
                client_secret: '',
            },
            fields: [
                { key: 'client_id',     label: 'Client ID',     placeholder: 'GMNzed...', secret: false },
                { key: 'client_secret', label: 'Client Secret', placeholder: '••••••••••••••••', secret: true },
            ],
        },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">Gateways de Pagamento</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Configure e ative os gateways da plataforma</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5">
                    <Wifi size={15} className={activeCount > 0 ? 'text-green-500' : 'text-gray-300'} />
                    <span className="text-sm font-black">
                        <span className={activeCount > 0 ? 'text-green-500' : 'text-gray-400'}>{activeCount}</span>
                        <span className="text-gray-400"> / {gatewayDefs.length} ativos</span>
                    </span>
                </div>
            </div>

            {/* Info bar */}
            <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl px-4 py-3 flex items-start gap-3">
                <AlertCircle size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-blue-300/70 font-medium leading-relaxed">
                    Para gerar PIX: ative <strong>SigiloPay</strong> ou <strong>PixGo</strong> (SigiloPay tem prioridade quando ambos estão ativos e o PixGo está desativado).
                    A <strong>Cakto</strong> é um marketplace externo — não gera PIX, apenas notifica quando há venda.
                </p>
            </div>

            {/* Gateway cards */}
            <div className="space-y-4">
                {gatewayDefs.map(gw => (
                    <GatewayCard key={gw.id} gateway={gw} />
                ))}
            </div>

        </div>
    );
}
