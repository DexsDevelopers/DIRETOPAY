import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { BorderBeam, SpotlightCard } from '../components/AnimatedUI';

const parceiros = [
    {
        id: '7kchat',
        name: '7K Community',
        tagline: 'Converse com quem já fatura alto',
        description: 'Comunidade exclusiva de BigPlayers que faturam R$50K, R$100K e R$500K/mês. Troque estratégias, bastidores e network real com quem já chegou lá. Não é curso. É acesso direto a quem já está no nível.',
        url: '/sso_redirect.php',
        sso: true,
        badge: 'SSO Ativo',
        badgeColor: 'emerald',
        logo: '💬',
        gradient: 'from-emerald-500/20 to-emerald-600/10',
        borderColor: 'border-emerald-500/20',
        accentColor: 'text-emerald-400',
    },
    {
        id: 'diretopay-docs',
        name: 'Documentação API',
        tagline: 'Integre a DiretoPay no seu sistema',
        description: 'Documentação completa da API de pagamentos DiretoPay para desenvolvedores e integradores.',
        url: '/api-docs',
        sso: false,
        badge: 'Interno',
        badgeColor: 'blue',
        logo: '📄',
        gradient: 'from-blue-500/20 to-cyan-600/10',
        borderColor: 'border-blue-500/20',
        accentColor: 'text-blue-400',
    },
];

function BadgePill({ text, color }) {
    const colors = {
        emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
        blue:    'bg-blue-500/15 text-blue-400 border-blue-500/25',
        amber:   'bg-amber-500/15 text-amberald-400 border-amber-500/25',
    };
    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border", colors[color] || colors.blue)}>
            {text}
        </span>
    );
}

function PartnerCard({ partner, isDark }) {
    const handleClick = () => {
        if (partner.sso) {
            window.location.href = partner.url;
        } else {
            window.location.href = partner.url;
        }
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "group w-full text-left rounded-2xl border p-6 transition-all duration-200 relative overflow-hidden",
                partner.borderColor,
                isDark
                    ? 'bg-white/[0.03] hover:bg-white/[0.06]'
                    : 'bg-white hover:bg-gray-50 shadow-sm hover:shadow-md'
            )}
        >
            <BorderBeam colorFrom="#10b981" colorTo="#6366f1" duration={14} />
            {/* Gradient bg */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", partner.gradient)} />

            <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl border",
                            partner.borderColor,
                            isDark ? 'bg-white/5' : 'bg-gray-50'
                        )}>
                            {partner.logo}
                        </div>
                        <div>
                            <h3 className={cn("text-[15px] font-bold", isDark ? 'text-white' : 'text-gray-900')}>
                                {partner.name}
                            </h3>
                            <p className={cn("text-[12px] font-medium mt-0.5", partner.accentColor)}>
                                {partner.tagline}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <BadgePill text={partner.badge} color={partner.badgeColor} />
                        <ArrowRight
                            size={16}
                            className={cn(
                                "transition-transform duration-200 group-hover:translate-x-1",
                                isDark ? 'text-gray-500' : 'text-gray-400'
                            )}
                        />
                    </div>
                </div>

                {/* Description */}
                <p className={cn("text-[13px] leading-relaxed", isDark ? 'text-gray-400' : 'text-gray-500')}>
                    {partner.description}
                </p>

                {/* Footer */}
                {partner.sso && (
                    <div className={cn(
                        "mt-4 pt-4 border-t flex items-center gap-2 text-[12px] font-medium",
                        isDark ? 'border-white/[0.06] text-gray-500' : 'border-gray-100 text-gray-400'
                    )}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                        Login automático com sua conta DiretoPay
                    </div>
                )}
            </div>
        </button>
    );
}

export default function ParceirosPage() {
    const { isDark } = useTheme();

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className={cn("text-2xl font-black tracking-tight", isDark ? 'text-white' : 'text-gray-900')}>
                    Parceiros
                </h1>
                <p className={cn("text-sm mt-1", isDark ? 'text-gray-400' : 'text-gray-500')}>
                    Ferramentas e plataformas integradas ao ecossistema DiretoPay.
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {parceiros.map(p => (
                    <PartnerCard key={p.id} partner={p} isDark={isDark} />
                ))}
            </div>

            {/* Em breve */}
            <div className={cn(
                "rounded-2xl border border-dashed p-6 text-center",
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-gray-50'
            )}>
                <p className={cn("text-[13px] font-medium", isDark ? 'text-gray-500' : 'text-gray-400')}>
                    Mais parceiros em breve · <span className="text-primary">Em expansão</span>
                </p>
            </div>
        </div>
    );
}
