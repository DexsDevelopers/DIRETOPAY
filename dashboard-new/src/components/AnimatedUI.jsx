/**
 * AnimatedUI — Reusable animated components inspired by:
 *   • React Bits (reactbits.dev): Particles, Aurora, SplitText, Glow
 *   • Hover.dev: ShimmerButton, GlowCard, GridPattern
 *   • Pagedone: StatCard, FeatureCard
 *   • Awwwards: CustomCursor, NoiseOverlay, ClipReveal, CountUp, Marquee, MagneticButton, PageLoader
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView, animate } from 'framer-motion';

/* ─── Custom Cursor (Awwwards #1 signature) ──────────────────────────────── */
export function CustomCursor() {
    const dot   = useRef(null);
    const ring  = useRef(null);
    const mouse = useRef({ x: 0, y: 0 });
    const pos   = useRef({ x: 0, y: 0 });
    const raf   = useRef(null);
    const [visible, setVisible] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const onMove = (e) => {
            mouse.current = { x: e.clientX, y: e.clientY };
            if (!visible) setVisible(true);
        };
        const onLeave = () => setVisible(false);
        const onEnter = () => setVisible(true);
        const onHoverIn  = (e) => { if (e.target.closest('a,button,[data-cursor="hover"]')) setHovered(true); };
        const onHoverOut = (e) => { if (e.target.closest('a,button,[data-cursor="hover"]')) setHovered(false); };

        window.addEventListener('mousemove', onMove);
        document.addEventListener('mouseleave', onLeave);
        document.addEventListener('mouseenter', onEnter);
        document.addEventListener('mouseover', onHoverIn);
        document.addEventListener('mouseout', onHoverOut);

        const loop = () => {
            pos.current.x += (mouse.current.x - pos.current.x) * 0.12;
            pos.current.y += (mouse.current.y - pos.current.y) * 0.12;
            if (ring.current) {
                ring.current.style.transform = `translate(${pos.current.x - 20}px, ${pos.current.y - 20}px)`;
            }
            if (dot.current) {
                dot.current.style.transform = `translate(${mouse.current.x - 4}px, ${mouse.current.y - 4}px)`;
            }
            raf.current = requestAnimationFrame(loop);
        };
        raf.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseleave', onLeave);
            document.removeEventListener('mouseenter', onEnter);
            document.removeEventListener('mouseover', onHoverIn);
            document.removeEventListener('mouseout', onHoverOut);
            cancelAnimationFrame(raf.current);
        };
    }, []);

    if (typeof window === 'undefined') return null;

    return (
        <>
            <style>{`* { cursor: none !important; }`}</style>
            {/* Trailing ring */}
            <div ref={ring} className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform transition-[width,height,opacity,border-color] duration-200"
                style={{
                    width: hovered ? 48 : 40, height: hovered ? 48 : 40,
                    borderRadius: '50%',
                    border: `1.5px solid ${hovered ? 'var(--cursor-hover)' : 'var(--cursor-ring)'}`,
                    opacity: visible ? 1 : 0,
                    marginTop: hovered ? -4 : 0, marginLeft: hovered ? -4 : 0,
                }} />
            {/* Dot */}
            <div ref={dot} className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
                style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: hovered ? 'var(--cursor-hover)' : 'var(--cursor-dot)',
                    opacity: visible ? 1 : 0,
                    transition: 'background 0.15s, opacity 0.2s',
                }} />
        </>
    );
}

/* ─── Noise / Grain Overlay (Awwwards texture) ───────────────────────────── */
export function NoiseOverlay({ opacity = 0.035 }) {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9990]"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '180px 180px',
                opacity,
                mixBlendMode: 'overlay',
            }}
        />
    );
}

/* ─── Clip-Path Text Reveal (Awwwards hero text) ─────────────────────────── */
export function ClipReveal({ children, className = '', delay = 0, duration = 0.75, once = true }) {
    return (
        <div className={`overflow-hidden ${className}`}>
            <motion.div
                initial={{ y: '105%', opacity: 0 }}
                whileInView={{ y: '0%', opacity: 1 }}
                viewport={{ once }}
                transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}>
                {children}
            </motion.div>
        </div>
    );
}

/* ─── Line Reveal (word by word) ─────────────────────────────────────────── */
export function LineReveal({ text, className = '', delay = 0, stagger = 0.08, once = true }) {
    const words = text.split(' ');
    return (
        <span className={className}>
            {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-[0.28em]">
                    <motion.span className="inline-block"
                        initial={{ y: '110%' }}
                        whileInView={{ y: '0%' }}
                        viewport={{ once }}
                        transition={{ duration: 0.65, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}>
                        {word}
                    </motion.span>
                </span>
            ))}
        </span>
    );
}

/* ─── Count-Up Number (Awwwards stats) ───────────────────────────────────── */
export function CountUp({ from = 0, to, duration = 1.8, prefix = '', suffix = '', decimals = 0, className = '' }) {
    const ref    = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const [val, setVal] = useState(from);

    useEffect(() => {
        if (!inView) return;
        const controls = animate(from, to, {
            duration,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (v) => setVal(parseFloat(v.toFixed(decimals))),
        });
        return () => controls.stop();
    }, [inView, from, to, duration, decimals]);

    return (
        <span ref={ref} className={className}>
            {prefix}{typeof val === 'number' ? val.toLocaleString('pt-BR') : val}{suffix}
        </span>
    );
}

/* ─── Infinite Marquee (Awwwards scrolling ticker) ───────────────────────── */
export function Marquee({ items, speed = 30, reverse = false, separator = '·', className = '' }) {
    const [duration, setDuration] = useState(speed);
    const trackRef = useRef(null);

    useEffect(() => {
        if (trackRef.current) {
            const w = trackRef.current.scrollWidth / 2;
            setDuration(w / speed);
        }
    }, [items, speed]);

    const content = [...items, ...items];

    return (
        <div className={`overflow-hidden whitespace-nowrap ${className}`}
            style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent,black 10%,black 90%,transparent)' }}>
            <div ref={trackRef} className="inline-flex"
                style={{
                    animation: `marquee-scroll ${duration}s linear infinite ${reverse ? 'reverse' : 'normal'}`,
                }}>
                {content.map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-4 px-4 text-[13px] font-semibold text-gray-500 uppercase tracking-widest">
                        {item} <span className="text-emerald-500/60">{separator}</span>
                    </span>
                ))}
            </div>
            <style>{`
                @keyframes marquee-scroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}

/* ─── Magnetic Button (Awwwards CTA) ─────────────────────────────────────── */
export function MagneticButton({ children, className = '', strength = 0.35, onClick, type = 'button', disabled = false }) {
    const ref   = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const handleMove = useCallback((e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        setPos({ x: (e.clientX - cx) * strength, y: (e.clientY - cy) * strength });
    }, [strength]);

    const handleLeave = useCallback(() => {
        setPos({ x: 0, y: 0 });
    }, []);

    return (
        <motion.button ref={ref} type={type} onClick={onClick} disabled={disabled}
            onMouseMove={handleMove} onMouseLeave={handleLeave}
            animate={{ x: pos.x, y: pos.y }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`relative overflow-hidden ${className}`}>
            <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
            {children}
        </motion.button>
    );
}

/* ─── Page Loader (Awwwards intro screen) ────────────────────────────────── */
export function PageLoader({ onDone, label = 'DiretoPay' }) {
    const [progress, setProgress] = useState(0);
    const [done, setDone]         = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const iv = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) { clearInterval(iv); setTimeout(() => { setDone(true); onDone?.(); }, 300); return 100; }
                    return p + Math.random() * 18 + 4;
                });
            }, 60);
            return () => clearInterval(iv);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div initial={{ opacity: 1 }} animate={{ opacity: done ? 0 : 1 }}
            transition={{ duration: 0.5 }} onAnimationComplete={() => done && onDone?.()}
            className="fixed inset-0 z-[9998] bg-[#050709] flex flex-col items-center justify-center pointer-events-none">
            <DotGrid />
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="text-center">
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-[0.4em] mb-6">{label}</p>
                <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
                    <motion.div className="absolute inset-y-0 left-0 bg-emerald-500"
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.15, ease: 'linear' }} />
                </div>
                <p className="text-[11px] text-gray-600 mt-3 tabular-nums">
                    {Math.min(Math.round(progress), 100)}%
                </p>
            </motion.div>
        </motion.div>
    );
}

/* ─── Section Number Label (Awwwards 01 / 02 style) ─────────────────────── */
export function SectionLabel({ number, label, color = '#10b981' }) {
    return (
        <ClipReveal>
            <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black tabular-nums" style={{ color }}>{number}</span>
                <div className="h-px w-8" style={{ background: color, opacity: 0.4 }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">{label}</span>
            </div>
        </ClipReveal>
    );
}

/* ─── Scroll Reveal Wrapper ──────────────────────────────────────────────── */
export function Reveal({ children, delay = 0, y = 24, once = true, className = '' }) {
    return (
        <motion.div className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, margin: '-40px' }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}>
            {children}
        </motion.div>
    );
}

/* ─── Aurora Background ──────────────────────────────────────────────────── */
export function AuroraBg({ className = '' }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            <div className="absolute inset-0 opacity-30 aurora-bg-animation"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 60% at 20% -10%, rgba(16,185,129,0.35) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 50% at 80% 110%, rgba(99,102,241,0.25) 0%, transparent 55%),
                        radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 60%)
                    `
                }}
            />
            <style>{`
                @media (min-width: 768px) {
                    .aurora-bg-animation {
                        animation: aurora 16s ease-in-out infinite alternate;
                    }
                }
                @keyframes aurora {
                    0%   { transform: scale(1) rotate(0deg); opacity: 0.22; }
                    50%  { transform: scale(1.05) rotate(1.5deg); opacity: 0.32; }
                    100% { transform: scale(0.98) rotate(-1deg); opacity: 0.26; }
                }
            `}</style>
        </div>
    );
}

/* ─── Dot Grid Pattern (Hover.dev style) ─────────────────────────────────── */
export function DotGrid({ className = '', color = 'var(--dot-grid-color)' }) {
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
                backgroundImage: `linear-gradient(var(--line-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--line-grid-color) 1px, transparent 1px)`,
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

export function GlowInput({ icon: Icon, type = 'text', placeholder, value, onChange, required, className = '' }) {
    const [focused, setFocused] = useState(false);
    return (
        <div className={`relative transition-all duration-200 ${className}`}
            style={{ filter: focused ? 'drop-shadow(0 0 8px rgba(16,185,129,0.25))' : undefined }}>
            {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: focused ? '#10b981' : '#64748b' }} />}
            <input type={type} placeholder={placeholder} value={value} onChange={onChange}
                required={required}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full rounded-xl py-3 pr-4 text-[14px] outline-none transition-all duration-200 border text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] focus:border-emerald-500/50 dark:focus:border-emerald-500/50 focus:bg-white dark:focus:bg-emerald-500/5"
                style={{
                    paddingLeft: Icon ? '2.75rem' : '1rem',
                }}
            />
        </div>
    );
}
