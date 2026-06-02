import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Code2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const NAV_LINKS = [
    { label: 'Início',     to: '/' },
    { label: 'Benefícios', to: '/beneficios' },
    { label: 'Premiações', to: '/premiacoes' },
    { label: 'API Docs',   to: '/docs', icon: Code2 },
    { label: 'FAQ',        to: '/faq' },
    { label: 'Contato',    href: 'https://wa.me/5551996148568', external: true },
];

export default function PublicLayout({ children }) {
    const { isDark, toggleTheme } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <div className="min-h-screen bg-[#050709] text-white font-sans antialiased overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
                backgroundSize: '64px 64px',
            }} />
            <div className="fixed inset-0 pointer-events-none z-0"
                style={{ background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(16,185,129,0.10) 0%, transparent 65%)' }} />

            {/* NAV */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#050709]/90 backdrop-blur-2xl border-b border-white/[0.07] shadow-xl shadow-black/30' : ''}`}>
                <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                    <Link to="/"><img src="/logo-diretopay.webp" alt="DiretoPay" className="h-8 sm:h-9 w-auto" /></Link>

                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(l => {
                            const Ico = l.icon;
                            const isActive = l.to && location.pathname === l.to;
                            const inner = <>{Ico && <Ico size={12} className="inline mr-1 opacity-70" />}{l.label}</>;
                            const cls = `text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors ${isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}`;
                            if (l.external) return <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>;
                            return <Link key={l.label} to={l.to} className={cls}>{inner}</Link>;
                        })}
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <button onClick={toggleTheme}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-gray-300 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-3 py-1.5 transition-all">
                            {isDark ? <Sun size={12} /> : <Moon size={12} />}
                            <span>{isDark ? 'CLARO' : 'ESCURO'}</span>
                        </button>
                        <Link to="/login" className="text-[13px] font-medium text-gray-400 hover:text-white px-4 py-2 transition-colors">Login</Link>
                        <Link to="/register" className="text-[13px] font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-px">Cadastre-se</Link>
                    </div>

                    <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-[#050709]/98 backdrop-blur-2xl flex flex-col pt-20 px-6 pb-10 md:hidden">
                        <nav className="flex flex-col gap-1 mt-4">
                            {NAV_LINKS.map(l => {
                                const Ico = l.icon;
                                const inner = <>{Ico && <Ico size={14} className="opacity-60 inline mr-2" />}{l.label}</>;
                                if (l.external) return (
                                    <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex items-center py-3.5 px-4 rounded-2xl text-[14px] font-medium text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">{inner}</a>
                                );
                                return (
                                    <Link key={l.label} to={l.to} onClick={() => setMenuOpen(false)}
                                        className="flex items-center py-3.5 px-4 rounded-2xl text-[14px] font-medium text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">{inner}</Link>
                                );
                            })}
                        </nav>
                        <div className="mt-auto flex flex-col gap-3">
                            <button onClick={toggleTheme}
                                className="flex items-center justify-center gap-2 py-3 text-[12px] font-bold text-gray-300 border border-white/10 rounded-2xl hover:border-white/20 transition-colors">
                                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                                {isDark ? 'Mudar para Claro' : 'Mudar para Escuro'}
                            </button>
                            <Link to="/login" onClick={() => setMenuOpen(false)}
                                className="text-center py-3 text-[13px] font-medium text-gray-300 border border-white/10 rounded-2xl hover:border-white/20 transition-colors">Login</Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)}
                                className="text-center py-4 text-[13px] font-semibold bg-emerald-500 text-white rounded-2xl hover:bg-emerald-400 transition-colors shadow-xl shadow-emerald-500/30">Cadastre-se</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 pt-16">{children}</div>
        </div>
    );
}
