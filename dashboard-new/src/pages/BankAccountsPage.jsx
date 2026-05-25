import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, ChevronRight, Info, Zap, TrendingUp, Percent, BadgeCheck, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

const accounts = [
    {
        id: 'nominal1',
        num: '01',
        name: 'Nominal 1',
        subtitle: 'Nominal Estável',
        badge: '⭐ Recomendado',
        badgeDark: 'bg-primary/20 text-primary border border-primary/30',
        badgeLight: 'bg-primary/10 text-primary border border-primary/20',
        accentDark: 'from-primary/20 via-primary/5 to-transparent',
        accentLight: 'from-primary/8 via-primary/3 to-transparent',
        iconBgDark: 'bg-primary/20 text-primary',
        iconBgLight: 'bg-primary/10 text-primary',
        description: 'A conta nominal mais estável da plataforma, com a maior taxa de conversão — acima de 70%. Ideal para quem busca consistência no recebimento com saque disponível de forma instantânea.',
        fees: [
            { icon: <Percent size={11} />, label: '8% + R$0,99 / transação', color: 'dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/20 bg-violet-50 text-violet-700 border-violet-200' },
            { icon: <Zap size={11} />,      label: 'Saque instantâneo',       color: 'dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/20 bg-green-50 text-green-700 border-green-200' },
            { icon: <TrendingUp size={11} />, label: '+70% conversão',         color: 'dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20 bg-blue-50 text-blue-700 border-blue-200' },
            { icon: <ShieldCheck size={11} />, label: 'Alta estabilidade',     color: 'dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20 bg-emerald-50 text-emerald-700 border-emerald-200' },
        ],
    },
    {
        id: 'nominal2',
        num: '02',
        name: 'Nominal 2',
        subtitle: 'Em Testes',
        badge: '🧪 Beta',
        badgeDark: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
        badgeLight: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        accentDark: 'from-yellow-500/10 via-yellow-500/3 to-transparent',
        accentLight: 'from-yellow-50 via-yellow-50/30 to-transparent',
        iconBgDark: 'bg-yellow-500/15 text-yellow-400',
        iconBgLight: 'bg-yellow-100 text-yellow-600',
        description: 'Conta nominal em fase de testes com taxa mais competitiva. Risco elevado de reembolso e MED (Mecanismo Especial de Devolução) durante o período de homologação.',
        warning: 'Risco de reembolso e MED ativo durante os testes. Use com cautela.',
        fees: [
            { icon: <Percent size={11} />, label: '2,99% + R$1,00 / transação', color: 'dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/20 bg-violet-50 text-violet-700 border-violet-200' },
            { icon: <Zap size={11} />,      label: 'Saque disponível',           color: 'dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/20 bg-green-50 text-green-700 border-green-200' },
        ],
    },
];

export default function BankAccountsPage() {
    const { isDark } = useTheme();
    const [selected, setSelected] = useState('nominal1');
    const [saved, setSaved]       = useState(false);
    const [saving, setSaving]     = useState(false);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        fetch('/get_dashboard_data.php')
            .then(r => r.json())
            .then(d => { setSelected(d?.user?.preferred_nominal || 'nominal1'); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSelect = (id) => { setSelected(id); setSaved(false); };

    const handleSave = async () => {
        if (!selected || saving) return;
        setSaving(true);
        try {
            const res = await fetch('/save_nominal.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nominal: selected }),
            });
            const data = await res.json();
            if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
        } catch {}
        setSaving(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

            {/* Header */}
            <div>
                <h1 className={cn("text-2xl font-black tracking-tight", isDark ? 'text-white' : 'text-gray-900')}>
                    Contas Bancárias
                </h1>
                <p className={cn("text-sm font-medium mt-1", isDark ? 'text-gray-500' : 'text-gray-400')}>
                    Escolha a conta nominal para recebimento dos seus pagamentos
                </p>
            </div>

            {/* Info strip */}
            <div className={cn(
                "flex items-start gap-3 px-4 py-3 rounded-xl text-xs font-medium border",
                isDark ? 'bg-white/[0.04] border-white/[0.08] text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
            )}>
                <Info size={14} className="shrink-0 mt-0.5 opacity-60" />
                <span>Contas identificadas nominalmente por segurança. A taxa cobrada muda conforme a conta selecionada.</span>
            </div>

            {/* Cards */}
            <div className="space-y-3">
                {accounts.map((acc) => {
                    const isSelected = selected === acc.id;
                    return (
                        <button
                            key={acc.id}
                            onClick={() => handleSelect(acc.id)}
                            className={cn(
                                "w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden",
                                isSelected
                                    ? isDark
                                        ? 'border-primary/60 shadow-[0_0_0_1px_rgba(192,0,106,0.4),0_0_30px_rgba(192,0,106,0.12)] bg-[#1a0d14]'
                                        : 'border-primary/40 shadow-[0_0_0_1px_rgba(192,0,106,0.2),0_4px_20px_rgba(192,0,106,0.1)] bg-white'
                                    : isDark
                                        ? 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05]'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            )}
                        >
                            {/* Gradient top accent */}
                            {isSelected && (
                                <div className={cn(
                                    "h-0.5 w-full bg-gradient-to-r",
                                    'from-transparent via-primary to-transparent'
                                )} />
                            )}

                            <div className="p-5">
                                <div className="flex items-start gap-4">

                                    {/* Number + Icon */}
                                    <div className="shrink-0 flex flex-col items-center gap-1.5">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                            isSelected
                                                ? 'bg-primary shadow-[0_4px_14px_rgba(192,0,106,0.4)] text-white'
                                                : isDark ? acc.iconBgDark : acc.iconBgLight
                                        )}>
                                            <Building2 size={22} />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black tracking-widest",
                                            isSelected ? 'text-primary' : isDark ? 'text-gray-600' : 'text-gray-400'
                                        )}>
                                            {acc.num}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">

                                        {/* Title row */}
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={cn("text-[15px] font-bold", isDark ? 'text-white' : 'text-gray-900')}>
                                                    {acc.name}
                                                </span>
                                                {acc.subtitle && (
                                                    <span className={cn(
                                                        "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                                                        isDark ? acc.badgeDark : acc.badgeLight
                                                    )}>
                                                        {acc.badge}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Radio */}
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200",
                                                isSelected
                                                    ? 'border-primary bg-primary shadow-[0_0_8px_rgba(192,0,106,0.5)]'
                                                    : isDark ? 'border-gray-600 bg-transparent' : 'border-gray-300 bg-transparent'
                                            )}>
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                        </div>

                                        {/* Subtitle text */}
                                        <p className={cn(
                                            "text-[13px] leading-relaxed mb-3",
                                            isDark ? 'text-gray-400' : 'text-gray-500'
                                        )}>
                                            {acc.description}
                                        </p>

                                        {/* Warning */}
                                        {acc.warning && (
                                            <div className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold mb-3 border",
                                                isDark
                                                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                                    : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                            )}>
                                                <AlertTriangle size={13} className="shrink-0" />
                                                {acc.warning}
                                            </div>
                                        )}

                                        {/* Fee pills */}
                                        {acc.fees.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {acc.fees.map((fee, i) => (
                                                    <span key={i} className={cn(
                                                        "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border",
                                                        fee.color
                                                    )}>
                                                        {fee.icon}
                                                        {fee.label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-1">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={cn(
                        "flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all duration-200",
                        saved
                            ? 'bg-green-500 text-white shadow-[0_4px_14px_rgba(34,197,94,0.35)]'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-[0_4px_18px_rgba(192,0,106,0.4)] disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {saving ? (
                        <><Loader2 size={15} className="animate-spin" /> Salvando...</>
                    ) : saved ? (
                        <><CheckCircle2 size={15} /> Conta confirmada!</>
                    ) : (
                        <><ChevronRight size={15} /> Confirmar seleção</>
                    )}
                </button>
            </div>
        </div>
    );
}
