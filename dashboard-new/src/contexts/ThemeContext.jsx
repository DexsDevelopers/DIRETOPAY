import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {}, setIsDark: () => {} });

// Rotas que NUNCA recebem dark mode (checkout/entrega têm branding fixo do vendedor)
const isPublicPath = (pathname) =>
    pathname.startsWith('/entrega') ||
    pathname.startsWith('/p/') ||
    (pathname.startsWith('/chat/') && pathname.length > 6);

export function ThemeProvider({ children }) {
    const location = useLocation();
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('Lunar_theme');
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
        localStorage.setItem('Lunar_theme', isDark ? 'dark' : 'light');
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
