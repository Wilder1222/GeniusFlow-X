'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'classic-dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        // Try to get from localStorage during state initialization (client-side only)
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as Theme) || 'light';
        }
        return 'light';
    });
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
    const [isLoaded, setIsLoaded] = useState(false);

    // Sync state with localStorage on mount (secondary check for safety)
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme && savedTheme !== theme) {
            setTheme(savedTheme);
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        // Calculate effective theme
        let effective: 'light' | 'dark' = 'light';

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            effective = prefersDark ? 'dark' : 'light';
        } else if (theme === 'dark' || theme === 'classic-dark') {
            effective = 'dark';
        } else {
            effective = 'light';
        }

        setEffectiveTheme(effective);

        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(effective);

        // Save to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Listen for system theme changes when in system mode
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const prefersDark = mediaQuery.matches;
            setEffectiveTheme(prefersDark ? 'dark' : 'light');
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
