import React, { useState, useEffect } from 'react';
import { Trophy, Lock, CheckCircle2, ExternalLink, Loader2, Star, Gift, Zap, ChevronRight, MessageCircle } from 'lucide-react';

const SUPPORT_WHATSAPP = '5511988627674';

const AWARDS = [
    {
        id: 'pulseira_10k',
        title: 'Pulseira de 10K',
        description: 'Exclusiva para quem faturou R$ 10.000 na plataforma. Um símbolo do seu sucesso.',
        goal: 10000,
        goalLabel: 'R$ 10.000',
        emoji: '⌚',
        color: 'amber',
        perks: ['Pulseira premium personalizada', 'Entrega no endereço cadastrado', 'Certificado digital exclusivo'],
    },
];

const colorMap = {
    amber: {
        ring:    'ring-amber-400/40',
        glow:    'shadow-amber-500/20',
        badge:   'bg-amber-500/10 text-amber-500 border-amber-500/20',
        bar:     'bg-amber-400',
        barBg:   'bg-amber-500/10',
        btn:     'bg-amber-500 hover:bg-amber-400 text-black',
        icon:    'text-amber-400',
        border:  'border-amber-500/30',
        tag:     'bg-amber-500/10 text-amber-400 border-amber-400/20',
    },
};

function ProgressBar({ value, max, color }) {
    const pct = Math.min(100, (value / max) * 100);
    const c = colorMap[color];
    return (
        <div className={`w-full h-3 rounded-full ${c.barBg} overflow-hidden`}>
            <div
                className={`h-full rounded-full transition-all duration-1000 ${c.bar} ${pct >= 100 ? 'animate-pulse' : ''}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

function AwardCard({ award, totalPaid, status, onClaim, claiming }) {
    const c = colorMap[award.color];
    const pct = Math.min(100, (totalPaid / award.goal) * 100);
    const unlocked = totalPaid >= award.goal;
    const claimed  = status?.claimed;

    const handleClaim = async () => {
        if (!unlocked || claimed || claiming) return;
        const res = await onClaim(award.id);
        if (res?.success) {
            const msg = encodeURIComponent(
                `Olá! Gostaria de reivindicar meu prêmio: *${award.title}* 🎁\n\n` +
                `✉️ E-mail: ${res.email}\n` +
                `💰 Faturamento atual: R$ ${res.total_paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n` +
                `Obrigado!`
            );
            window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${msg}`, '_blank');
        }
    };

    return (
        <div className={`relative rounded-3xl border bg-white overflow-hidden shadow-lg ${unlocked ? `${c.border} ${c.glow} shadow-xl` : 'border-gray-200'}`}>

            {/* Header glowing strip */}
            {unlocked && (
                <div className={`h-1 w-full ${c.bar}`} />
            )}

            <div className="p-7 space-y-6">
                {/* Top row */}
                <div className="flex items-start gap-5">
                    {/* Trophy emoji / icon */}
                    <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-2 shrink-0
                        ${unlocked ? `${c.border} bg-gray-50 ring-4 ${c.ring}` : 'border-gray-200 bg-gray-100 grayscale opacity-50'}`}>
                        {award.emoji}
                        {unlocked && !claimed && (
                            <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full ${c.bar} flex items-center justify-center`}>
                                <Star size={11} className="text-black fill-black" />
                            </span>
                        )}
                        {claimed && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <CheckCircle2 size={11} className="text-white" />
                            </span>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-xl font-black text-gray-900">{award.title}</h3>
                            {claimed ? (
                                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                                    <CheckCircle2 size={10} /> Reivindicado
                                </span>
                            ) : unlocked ? (
                                <span className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${c.badge}`}>
                                    <Zap size={10} /> Desbloqueado!
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                                    <Lock size={10} /> Bloqueado
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">{award.description}</p>
                    </div>
                </div>

                {/* Perks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {award.perks.map((p, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border ${unlocked ? c.tag : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                            <Gift size={12} className="shrink-0" />
                            {p}
                        </div>
                    ))}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progresso</span>
                        <span className={`text-xs font-black ${unlocked ? c.icon : 'text-gray-400'}`}>
                            R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {award.goalLabel}
                        </span>
                    </div>
                    <ProgressBar value={totalPaid} max={award.goal} color={award.color} />
                    <p className="text-[10px] text-gray-400 text-right">{pct.toFixed(1)}% concluído</p>
                </div>

                {/* CTA */}
                {claimed ? (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                        <div>
                            <p className="text-sm font-black text-emerald-700">Prêmio reivindicado!</p>
                            <p className="text-xs text-emerald-600 mt-0.5">Nossa equipe entrará em contato para a entrega.</p>
                        </div>
                    </div>
                ) : unlocked ? (
                    <button
                        onClick={handleClaim}
                        disabled={claiming}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-60 ${c.btn}`}
                    >
                        {claiming ? (
                            <><Loader2 size={16} className="animate-spin" /> Processando...</>
                        ) : (
                            <><MessageCircle size={16} /> Reivindicar via WhatsApp</>
                        )}
                    </button>
                ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                        <Lock size={18} className="text-gray-300 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-gray-400">Faltam R$ {Math.max(0, award.goal - totalPaid).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para desbloquear</p>
                            <p className="text-xs text-gray-400 mt-0.5">Continue vendendo para atingir a meta!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PremiacoesPage({ dashboardData }) {
    const [statuses, setStatuses]   = useState({});
    const [totalPaid, setTotalPaid] = useState(0);
    const [loading, setLoading]     = useState(true);
    const [claiming, setClaiming]   = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    useEffect(() => {
        if (dashboardData?.stats?.total_paid_raw != null) {
            setTotalPaid(dashboardData.stats.total_paid_raw);
        }
    }, [dashboardData]);

    const fetchStatus = async () => {
        setLoading(true);
        try {
            const res  = await fetch('/claim_award.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'status' }),
            });
            const data = await res.json();
            if (data.success) {
                setStatuses(data.statuses);
                setTotalPaid(prev => data.total_paid > 0 ? data.total_paid : prev);
            }
        } catch {}
        finally { setLoading(false); }
    };

    const handleClaim = async (awardId) => {
        setClaiming(true);
        try {
            const res  = await fetch('/claim_award.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'claim', award_id: awardId }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchStatus();
                return data;
            } else {
                alert(data.error || 'Erro ao reivindicar');
            }
        } catch { alert('Erro de conexão'); }
        finally { setClaiming(false); }
        return null;
    };

    const unlockedCount = AWARDS.filter(a => totalPaid >= a.goal).length;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
                        <Trophy className="text-amber-500" size={32} />
                        Hall da <span className="text-amber-500 italic">Fama</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Conquiste prêmios exclusivos ao bater suas metas de faturamento.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desbloqueados</p>
                        <p className="text-2xl font-black text-gray-900">{unlockedCount}<span className="text-gray-300 text-lg">/{AWARDS.length}</span></p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Trophy size={24} className="text-amber-500" />
                    </div>
                </div>
            </div>

            {/* Banner faturamento */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Zap size={24} className="text-amber-400" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Seu faturamento total</p>
                    {loading ? (
                        <div className="h-10 w-48 bg-gray-800 rounded-xl animate-pulse" />
                    ) : (
                        <p className="text-4xl font-black text-white">
                            R$ <span className="text-amber-400">{totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </p>
                    )}
                    <p className="text-xs text-white/30 mt-1">Soma de todas as vendas aprovadas na plataforma.</p>
                </div>
                <div className="flex flex-col items-center sm:items-end gap-1">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Próxima meta</p>
                    <p className="text-lg font-black text-white">
                        {AWARDS.find(a => totalPaid < a.goal)?.goalLabel ?? '🏆 Todas desbloqueadas!'}
                    </p>
                </div>
            </div>

            {/* Cards de prêmios */}
            {loading ? (
                <div className="space-y-4">
                    {[1,2].map(i => (
                        <div key={i} className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {AWARDS.map(award => (
                        <AwardCard
                            key={award.id}
                            award={award}
                            totalPaid={totalPaid}
                            status={statuses[award.id]}
                            onClaim={handleClaim}
                            claiming={claiming}
                        />
                    ))}
                </div>
            )}

            {/* Rodapé */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
                <MessageCircle size={20} className="text-gray-400 shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-bold text-gray-500">Dúvidas sobre os prêmios?</p>
                    <p className="text-xs text-gray-400">Fale com nosso suporte pelo WhatsApp.</p>
                </div>
                <a
                    href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap"
                >
                    <ExternalLink size={13} /> Suporte
                </a>
            </div>
        </div>
    );
}
