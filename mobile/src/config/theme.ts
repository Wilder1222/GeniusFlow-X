/**
 * Theme Configuration - 主题系统配置
 * 
 * 移植自Web端的三种主题：Light、Dark、Classic Dark
 * 使用React Native的Appearance API实现系统主题跟随
 */

export type ThemeMode = 'light' | 'dark' | 'classic-dark';

export interface Theme {
    // 主色调
    colors: {
        // 背景色
        background: {
            primary: string;
            secondary: string;
            tertiary: string;
        };
        // 文字颜色
        text: {
            primary: string;
            secondary: string;
            tertiary: string;
            inverse: string;
        };
        // 交互元素
        interactive: {
            primary: string;
            primaryHover: string;
            secondary: string;
            secondaryHover: string;
            accent: string;
            accentHover: string;
        };
        // 状态色
        status: {
            success: string;
            warning: string;
            error: string;
            info: string;
        };
        // 分界线
        border: {
            primary: string;
            secondary: string;
            accent: string;
        };
        // 卡片状态色（FSRS）
        card: {
            new: string;
            learning: string;
            review: string;
            relearning: string;
        };
        // 渐变色（用于统计图表等）
        gradients: {
            coral: string[];
            pink: string[];
            purple: string[];
            blue: string[];
            green: string[];
        };
    };
    // 阴影
    shadows: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    // 模糊效果（Glassmorphism）
    blur: {
        light: number;
        medium: number;
        strong: number;
    };
    // 圆角
    radius: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
        full: number;
    };
    // 间距
    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
    };
}

// Light Theme（浅色主题）
export const lightTheme: Theme = {
    colors: {
        background: {
            primary: '#FFFFFF',
            secondary: '#F8F9FA',
            tertiary: '#E9ECEF',
        },
        text: {
            primary: '#212529',
            secondary: '#6C757D',
            tertiary: '#ADB5BD',
            inverse: '#FFFFFF',
        },
        interactive: {
            primary: '#FF6B9D',
            primaryHover: '#FF4583',
            secondary: '#A78BFA',
            secondaryHover: '#8B5CF6',
            accent: '#3B82F6',
            accentHover: '#2563EB',
        },
        status: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
        },
        border: {
            primary: '#DEE2E6',
            secondary: '#CED4DA',
            accent: '#FF6B9D',
        },
        card: {
            new: '#3B82F6',       // 蓝色
            learning: '#F59E0B',  // 橙色
            review: '#10B981',    // 绿色
            relearning: '#EF4444', // 红色
        },
        gradients: {
            coral: ['#FF6B9D', '#FFA07A'],
            pink: ['#FF6B9D', '#C084FC'],
            purple: ['#A78BFA', '#C084FC'],
            blue: ['#3B82F6', '#60A5FA'],
            green: ['#10B981', '#34D399'],
        },
    },
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    },
    blur: {
        light: 20,
        medium: 40,
        strong: 80,
    },
    radius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
};

// Dark Theme（深色主题）
export const darkTheme: Theme = {
    colors: {
        background: {
            primary: '#0F172A',
            secondary: '#1E293B',
            tertiary: '#334155',
        },
        text: {
            primary: '#F8FAFC',
            secondary: '#CBD5E1',
            tertiary: '#94A3B8',
            inverse: '#0F172A',
        },
        interactive: {
            primary: '#FF6B9D',
            primaryHover: '#FF8CB4',
            secondary: '#A78BFA',
            secondaryHover: '#C4B5FD',
            accent: '#60A5FA',
            accentHover: '#93C5FD',
        },
        status: {
            success: '#34D399',
            warning: '#FBBF24',
            error: '#F87171',
            info: '#60A5FA',
        },
        border: {
            primary: '#334155',
            secondary: '#475569',
            accent: '#FF6B9D',
        },
        card: {
            new: '#60A5FA',
            learning: '#FBBF24',
            review: '#34D399',
            relearning: '#F87171',
        },
        gradients: {
            coral: ['#FF6B9D', '#FFA07A'],
            pink: ['#FF6B9D', '#C084FC'],
            purple: ['#A78BFA', '#C084FC'],
            blue: ['#60A5FA', '#93C5FD'],
            green: ['#34D399', '#6EE7B7'],
        },
    },
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px rgba(0, 0, 0, 0.4)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
    },
    blur: {
        light: 20,
        medium: 40,
        strong: 80,
    },
    radius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
};

// Classic Dark Theme（经典深色）
export const classicDarkTheme: Theme = {
    colors: {
        background: {
            primary: '#1A1A1A',
            secondary: '#2D2D2D',
            tertiary: '#3F3F3F',
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#B0B0B0',
            tertiary: '#808080',
            inverse: '#1A1A1A',
        },
        interactive: {
            primary: '#FF6B9D',
            primaryHover: '#FF8CB4',
            secondary: '#A78BFA',
            secondaryHover: '#C4B5FD',
            accent: '#60A5FA',
            accentHover: '#93C5FD',
        },
        status: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
        },
        border: {
            primary: '#404040',
            secondary: '#525252',
            accent: '#FF6B9D',
        },
        card: {
            new: '#3B82F6',
            learning: '#F59E0B',
            review: '#10B981',
            relearning: '#EF4444',
        },
        gradients: {
            coral: ['#FF6B9D', '#FFA07A'],
            pink: ['#FF6B9D', '#C084FC'],
            purple: ['#A78BFA', '#C084FC'],
            blue: ['#3B82F6', '#60A5FA'],
            green: ['#10B981', '#34D399'],
        },
    },
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
        md: '0 4px 6px rgba(0, 0, 0, 0.6)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.7)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.8)',
    },
    blur: {
        light: 20,
        medium: 40,
        strong: 80,
    },
    radius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
};

// 主题映射
export const themes: Record<ThemeMode, Theme> = {
    light: lightTheme,
    dark: darkTheme,
    'classic-dark': classicDarkTheme,
};

// 获取主题
export const getTheme = (mode: ThemeMode): Theme => {
    return themes[mode];
};
