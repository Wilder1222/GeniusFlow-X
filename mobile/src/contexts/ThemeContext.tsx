/**
 * Theme Context - 主题上下文
 * 
 * 提供全局主题状态管理和切换功能
 * 支持系统主题跟随
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ThemeMode, Theme, getTheme } from '../config/theme';
import { STORAGE_KEYS } from '../config/constants';

interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode | 'system';
    setThemeMode: (mode: ThemeMode | 'system') => Promise<void>;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode | 'system'>('system');
    const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
        Appearance.getColorScheme()
    );

    // 监听系统主题变化
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemColorScheme(colorScheme);
        });

        return () => subscription.remove();
    }, []);

    // 初始化主题
    useEffect(() => {
        loadThemePreference();
    }, []);

    // 从存储加载主题偏好
    const loadThemePreference = async () => {
        try {
            const savedTheme = await SecureStore.getItemAsync(STORAGE_KEYS.THEME);
            if (savedTheme) {
                setThemeModeState(savedTheme as ThemeMode | 'system');
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    };

    // 设置主题模式
    const setThemeMode = async (mode: ThemeMode | 'system') => {
        try {
            await SecureStore.setItemAsync(STORAGE_KEYS.THEME, mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    // 计算实际主题
    const getActualTheme = (): ThemeMode => {
        if (themeMode === 'system') {
            return systemColorScheme === 'dark' ? 'dark' : 'light';
        }
        return themeMode;
    };

    const actualThemeMode = getActualTheme();
    const theme = getTheme(actualThemeMode);
    const isDark = actualThemeMode === 'dark' || actualThemeMode === 'classic-dark';

    return (
        <ThemeContext.Provider
            value={{
                theme,
                themeMode,
                setThemeMode,
                isDark,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

// useTheme Hook
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
