/**
 * AnimatedUI — Reusable animated components inspired by:
 *   • React Bits (reactbits.dev): Particles, Aurora, SplitText, Glow
 *   • Hover.dev: ShimmerButton, GlowCard, GridPattern
 *   • Pagedone: StatCard, FeatureCard
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/* ─── Aurora Background ──────────────────────────────────────────────────── */
export function AuroraBg({ className = '' }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            <div className="absolute inset-0 opacity-30"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 60% at 20% -10%, rgba(16,185,129,0.35) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 50% at 80% 110%, rgba(99,102,241,0.25) 0%, transparent 55%),
                        radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 60%)
                    `,
                    animation: 'aurora 12s ease-in-out infinite alternate',
                }}
            />
            <style>{`
                @keyframes aurora {
                    0%   { transform: scale(1) rotate(0deg); opacity: 0.25; }
                    50%  { transform: scale(1.1) rotate(2deg); opacity: 0.35; }
                    100% { transform: scale(0.95) rotate(-1deg); opacity: 0.28; }
                }
            `}</style>
        </div>
    );
}

/* ─── Dot Grid Pattern (Hover.dev style) ─────────────────────────────────── */
export function DotGrid({ className = '', color = 'rgba(255,255,255,0.06)' }) {
    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`}
            style={{
                backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
                backgroundSize: '28px 28px',
            }}
        />
    );
}

/* ─── Line Grid Pattern ──────────────────────────────────────────────────── */
export function LineGrid({ className = '' }) {
    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`}
            style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
            }}
        />
    );
}

/* ─── Particles (React Bits style) ──────────────────────────────────────── */
export function Particles({ count = 30, color = '#10b981', className = '' }) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.4 + 0.1,
    }));

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {particles.map(p => (
                <motion.div key={p.id}
                    className="absolute rounded-full"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: color, opacity: p.opacity }}
                    animate={{ y: [0, -40, 0], x: [0, 15, -10, 0], opacity: [p.opacity, p.opacity * 1.8, p.opacity] }}
                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}

/* ─── Shimmer Button (Hover.dev style) ───────────────────────────────────── */
export function ShimmerButton({ children, className = '', onClick, type = 'button', disabled = false }) {
    return (
        <button type={type} onClick={onClick} disabled={disabled}
            className={`relative overflow-hidden group ${className}`}
            style={{ isolation: 'isolate' }}>
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
            {children}
        </button>
    );
}

/* ─── Glow Card (Hover.dev + React Bits) ─────────────────────────────────── */
export function GlowCard({ children, className = '', glowColor = '#10b981', intensity = 0.3 }) {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);
    const ref = useRef(null);

    const handleMouseMove = useCallback((e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, []);

    return (
        <div ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`relative overflow-hidden transition-all duration-300 ${className}`}
            style={{
                boxShadow: hovered ? `0 0 40px ${glowColor}${Math.round(intensity * 255).toString(16).padStart(2, '0')}` : undefined,
            }}>
            {hovered && (
                <div className="absolute pointer-events-none transition-opacity duration-300"
                    style={{
                        width: 200, height: 200,
                        top: pos.y - 100, left: pos.x - 100,
                        background: `radial-gradient(circle, ${glowColor}25, transparent 70%)`,
                        borderRadius: '50%',
                    }}
                />
            )}
            {children}
        </div>
    );
}

/* ─── Shine Border Card (React Bits) ─────────────────────────────────────── */
export function ShineBorder({ children, className = '', color = '#10b981', borderWidth = 1 }) {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none"
                style={{
                    padding: borderWidth,
                    background: `conic-gradient(from 0deg, transparent 0%, ${color} 25%, transparent 50%, ${color}40 75%, transparent 100%)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    animation: 'shine-rotate 4s linear infinite',
                }}
            />
            <style>{`
                @keyframes shine-rotate { to { --angle: 360deg; } }
            `}</style>
            {children}
        </div>
    );
}

/* ─── Split Text (React Bits) ────────────────────────────────────────────── */
export function SplitText({ text, className = '', delay = 0, staggerDelay = 0.04, once = true }) {
    const words = text.split(' ');
    return (
        <span className={className} aria-label={text}>
            {words.map((word, wi) => (
                <span key={wi} className="inline-block whitespace-nowrap mr-[0.25em]">
                    {word.split('').map((char, ci) => (
                        <motion.span key={ci} className="inline-block"
                            initial={{ opacity: 0, y: 20, rotateX: -30 }}
                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                            viewport={{ once }}
                            transition={{ duration: 0.4, delay: delay + (wi * 4 + ci) * staggerDelay, ease: [0.22, 1, 0.36, 1] }}>
                            {char}
                        </motion.span>
                    ))}
                </span>
            ))}
        </span>
    );
}

/* ─── Stat Card (Pagedone style) ─────────────────────────────────────────── */
export function StatCard({ icon: Icon, label, value, sub, color = '#10b981', bg, delay = 0 }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 overflow-hidden backdrop-blur-sm cursor-default">
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}15, transparent 70%)` }} />
            <div className="flex items-start justify-between gap-3 relative">
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-[22px] font-black text-white leading-none">{value}</p>
                    {sub && <p className="text-[11px] mt-1.5 font-medium" style={{ color }}>{sub}</p>}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: bg || `${color}18`, border: `1px solid ${color}25` }}>
                    <Icon size={16} style={{ color }} />
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Feature Card (Pagedone + Hover.dev) ────────────────────────────────── */
export function FeatureCard({ icon: Icon, color, title, desc, delay = 0 }) {
    return (
        <GlowCard glowColor={color}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 hover:border-white/[0.14] transition-colors cursor-default">
            <motion.div initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={18} style={{ color }} />
                </div>
                <h3 className="text-[14px] font-bold text-white mb-2">{title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
        </GlowCard>
    );
}

/* ─── Gradient Text ──────────────────────────────────────────────────────── */
export function GradientText({ children, from = '#10b981', to = '#6ee7b7', className = '' }) {
    return (
        <span className={className}
            style={{ background: `linear-gradient(135deg, ${from}, ${to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {children}
        </span>
    );
}

/* ─── Animated Badge ─────────────────────────────────────────────────────── */
export function PulseBadge({ children, color = '#10b981' }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 border rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-widest"
            style={{ color, borderColor: `${color}40`, background: `${color}15` }}>
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
            </span>
            {children}
        </motion.div>
    );
}

/* ─── Glowing Input ──────────────────────────────────────────────────────── */
export function GlowInput({ icon: Icon, type = 'text', placeholder, value, onChange, required, className = '' }) {
    const [focused, setFocused] = useState(false);
    return (
        <div className={`relative transition-all duration-200 ${className}`}
            style={{ filter: focused ? 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' : undefined }}>
            {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: focused ? '#10b981' : '#4b5563' }} />}
            <input type={type} placeholder={placeholder} value={value} onChange={onChange}
                required={required}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full rounded-xl py-3 pr-4 text-[14px] outline-none transition-all duration-200 bg-white/[0.05] text-white placeholder:text-gray-600"
                style={{
                    paddingLeft: Icon ? '2.75rem' : '1rem',
                    border: `1px solid ${focused ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: focused ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.04)',
                }}
            />
        </div>
    );
}
