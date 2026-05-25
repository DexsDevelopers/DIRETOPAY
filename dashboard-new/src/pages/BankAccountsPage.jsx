import React, { useState } from 'react';
import { Building2, CheckCircle2, ChevronRight, Info, Zap, TrendingUp, Clock, Percent, BadgeCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

const accounts = [
    {
        id: 'nominal1',
        name: 'Nominal 1',
        subtitle: 'Nominal Estável',
        badge: 'Recomendado',
        badgeColor: 'bg-primary/10 text-primary',
        description: 'A conta nominal mais estável da plataforma, com a maior taxa de conversão — acima de 70%. Ideal para quem busca consistência no recebimento com saque disponível de forma instantânea.',
        fees: [
            { icon: <Percent size={12} />,     label: '8% + R$0,99 por transação' },
            { icon: <Zap size={12} />,          label: 'Saque instantâneo' },
            { icon: <TrendingUp size={12} />,   label: '+70% de conversão' },
            { icon: <BadgeCheck size={12} />,   label: 'Alta estabilidade' },
        ],
        highlight: true,
    },
    {
        id: 'nominal2',
        name: 'Nominal 2',
        subtitle: '',
        badge: 'Disponível',
        badgeColor: 'bg-green-100 text-green-700',
        description: 'Em breve...',
        fees: [],
        highlight: false,
    },
    {
        id: 'nominal3',
        name: 'Nominal 3',
        subtitle: '',
        badge: 'Disponível',
        badgeColor: 'bg-green-100 text-green-700',
        description: 'Em breve...',
        fees: [],
        highlight: false,
    },
];

export default function BankAccountsPage() {
    const { isDark } = useTheme();
    const [selected, setSelected] = useState(null);
    const [saved, setSaved] = useState(false);

    const handleSelect = (id) => {
        setSelected(id);
        setSaved(false);
    };

    const handleSave = () => {
        if (!selected) return;
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className={cn("text-2xl font-black tracking-tight", isDark ? 'text-white' : 'text-gray-900')}>
                        Contas Bancárias
                    </h1>
                    <p className={cn("text-sm font-medium mt-1", isDark ? 'text-gray-400' : 'text-gray-500')}>
                        Selecione a conta nominal para recebimento dos seus pagamentos
                    </p>
                </div>
                <div className={cn(
                    "flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold",
                    isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-50 border border-gray-200 text-gray-500'
                )}>
                    <Building2 size={15} />
                    {accounts.length} contas disponíveis
                </div>
            </div>

            {/* Info Banner */}
            <div className={cn(
                "flex gap-3 p-4 rounded-2xl border text-sm",
                isDark
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                    : 'bg-blue-50 border-blue-100 text-blue-700'
            )}>
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>As contas abaixo são identificadas nominalmente por segurança. Escolha aquela que melhor atende às suas necessidades com base nas taxas e condições descritas.</p>
            </div>

            {/* Cards */}
            <div className="space-y-4">
                {accounts.map((acc) => {
                    const isSelected = selected === acc.id;
                    return (
                        <button
                            key={acc.id}
                            onClick={() => handleSelect(acc.id)}
                            className={cn(
                                "w-full text-left rounded-2xl border p-5 transition-all duration-200",
                                isSelected
                                    ? 'border-primary bg-primary/5 shadow-[0_0_0_2px_rgba(192,0,106,0.3)]'
                                    : acc.highlight && !isSelected
                                        ? isDark
                                            ? 'border-primary/30 bg-white/[0.04] hover:border-primary/50 hover:bg-white/[0.07]'
                                            : 'border-primary/20 bg-white hover:border-primary/40 hover:shadow-sm'
                                        : isDark
                                            ? 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'
                                            : 'border-gray-200 bg-white hover:border-primary/30 hover:shadow-sm'
                            )}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={cn(
                                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                                    isSelected
                                        ? 'bg-primary text-white'
                                        : isDark
                                            ? 'bg-white/10 text-gray-400'
                                            : 'bg-gray-100 text-gray-500'
                                )}>
                                    <Building2 size={20} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                        <span className={cn("text-base font-bold", isDark ? 'text-white' : 'text-gray-900')}>
                                            {acc.name}
                                        </span>
                                        {acc.subtitle && (
                                            <span className={cn("text-xs font-medium", isDark ? 'text-gray-400' : 'text-gray-500')}>
                                                — {acc.subtitle}
                                            </span>
                                        )}
                                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", acc.badgeColor)}>
                                            {acc.badge}
                                        </span>
                                    </div>

                                    <p className={cn("text-sm leading-relaxed", isDark ? 'text-gray-400' : 'text-gray-500')}>
                                        {acc.description}
                                    </p>

                                    {/* Fees */}
                                    {acc.fees.length > 0 && (
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            {acc.fees.map((fee, i) => (
                                                <div key={i} className={cn(
                                                    "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg",
                                                    isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                )}>
                                                    {fee.icon}
                                                    {fee.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Select indicator */}
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                                    isSelected
                                        ? 'border-primary bg-primary'
                                        : isDark ? 'border-gray-600' : 'border-gray-300'
                                )}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Save Button */}
            {selected && (
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all",
                            saved
                                ? 'bg-green-500 text-white'
                                : 'bg-primary text-white hover:bg-primary/90 shadow-[0_4px_14px_rgba(192,0,106,0.35)]'
                        )}
                    >
                        {saved ? (
                            <><CheckCircle2 size={16} /> Conta selecionada!</>
                        ) : (
                            <><ChevronRight size={16} /> Confirmar seleção</>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
