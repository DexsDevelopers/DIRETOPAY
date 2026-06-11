import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {}, setIsDark: () => {} });

// Rotas que NUNCA recebem dark mode (checkout/entrega têm branding fixo do vendedor)
const isPublicPath = (pathname) =>
    pathname.startsWith('/entrega') ||
    pathname.startsWith('/p/') ||
    (pathname.startsWith('/chat/') && pathname.length > 6);

function safeStorage(fn, fallback) {
    try { return fn(); } catch { return fallback; }
}

export function ThemeProvider({ children }) {
    const location = useLocation();
    const [isDark, setIsDark] = useState(() => {
        const saved = safeStorage(() => localStorage.getItem('direto_theme'), null);
        if (saved) return saved === 'dark';
        return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
    });

    useEffect(() => {
        const html = document.documentElement;
        if (isDark && !isPublicPath(location.pathname)) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        safeStorage(() => localStorage.setItem('direto_theme', isDark ? 'dark' : 'light'));
    }, [isDark, location.pathname]);

    const toggleTheme = () => setIsDark(d => !d);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, setIsDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
