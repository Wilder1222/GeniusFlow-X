'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '@/lib/auth-context';
import { getSettings, updateSettings } from '@/lib/settings';

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
    const authContext = useContext(AuthContext);
    const user = authContext?.user;
    const authLoading = authContext?.loading;
    const [isSyncing, setIsSyncing] = useState(false);
    const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

    // Sync state with localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as Theme | null;
            if (savedTheme && savedTheme !== theme) {
                setTheme(savedTheme);
            }
            setIsLoaded(true);
        }
    }, []);

    // Fetch theme from database when user logs in
    useEffect(() => {
        const fetchRemoteTheme = async () => {
            if (user && !authLoading) {
                try {
                    console.log('[Theme] Syncing theme from database...');
                    const settings = await getSettings();
                    if (settings?.theme) {
                        const remoteTheme = settings.theme as Theme;
                        if (remoteTheme !== theme) {
                            console.log('[Theme] Applying remote theme:', remoteTheme);
                            setTheme(remoteTheme);
                            localStorage.setItem('theme', remoteTheme);
                        }
                    }
                } catch (err) {
                    console.error('[Theme] Failed to fetch remote theme:', err);
                } finally {
                    setIsInitialSyncDone(true);
                }
            }
        };

        if (user && isLoaded) {
            fetchRemoteTheme();
        } else if (!user) {
            // Reset sync state on logout
            setIsInitialSyncDone(false);
        }
    }, [user, authLoading, isLoaded]);

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

        // Save to database if user is logged in and initial sync is complete
        const syncToDb = async () => {
            if (user && isInitialSyncDone && !isSyncing) {
                try {
                    setIsSyncing(true);
                    await updateSettings({ theme: theme as any });
                    console.log('[Theme] Saved theme to database:', theme);
                } catch (err) {
                    console.error('[Theme] Failed to save theme to database:', err);
                    // Log more details if it's a Supabase error
                    if (typeof err === 'object' && err !== null) {
                        console.error('[Theme] Error details:', JSON.stringify(err, null, 2));
                    }
                } finally {
                    setIsSyncing(false);
                }
            }
        };

        if (isLoaded) {
            syncToDb();
        }
    }, [theme, user, isLoaded]);

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
