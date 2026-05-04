import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {}, setIsDark: () => {} });

// Rotas públicas que NUNCA recebem dark mode (têm design próprio)
const PUBLIC_PATHS = ['/', '/demo', '/docs', '/login', '/register', '/forgot-password'];
const isPublicPath = (pathname) =>
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/entrega') ||
    pathname.startsWith('/p/') ||
    (pathname.startsWith('/chat/') && pathname.length > 6);

export function ThemeProvider({ children }) {
    const location = useLocation();
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('ghost_theme');
        if (saved) return saved === 'dark';
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    });

    useEffect(() => {
        const html = document.documentElement;
        if (isDark && !isPublicPath(location.pathname)) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem('ghost_theme', isDark ? 'dark' : 'light');
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
