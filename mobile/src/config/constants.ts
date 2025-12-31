/**
 * Global Constants - 全局常量配置
 * 
 * 定义应用级别的常量、配置和环境变量
 */

// API端点配置
export const API_CONFIG = {
    // Supabase配置
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',

    // API基础路径（如果使用自定义API）
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',

    // 超时配置
    TIMEOUT: 30000, // 30秒
};

// 会员限额配置
export const MEMBERSHIP_CONFIG = {
    FREE: {
        AI_GENERATION_LIMIT: 10, // 每天10次
        DAILY_RESET_HOUR: 0, // UTC 0点重置
    },
    PRO: {
        AI_GENERATION_LIMIT: -1, // 无限制（-1表示无限）
    },
};

// FSRS算法参数（与Web端保持一致）
export const FSRS_CONFIG = {
    // 默认参数（ts-fsrs库）
    w: [
        0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
        0.34, 1.26, 0.29, 2.61,
    ],
    // 请求保留率
    request_retention: 0.9,
    // 最大间隔天数
    maximum_interval: 36500,
    // 简单难度边界
    easy_bonus: 1.3,
    // 困难惩罚
    hard_interval: 1.2,
};

// 学习卡片评级
export const CARD_RATING = {
    AGAIN: 1,
    HARD: 2,
    GOOD: 3,
    EASY: 4,
} as const;

// 卡片状态
export const CARD_STATE = {
    NEW: 'new',
    LEARNING: 'learning',
    REVIEW: 'review',
    RELEARNING: 'relearning',
} as const;

// 每日任务配置
export const DAILY_TASKS = {
    DAILY_LOGIN: {
        id: 'daily_login',
        exp: 10,
    },
    REVIEW_CARDS: {
        id: 'review_cards',
        target: 10,
        exp: 20,
    },
    STUDY_TIME: {
        id: 'study_time',
        target: 15, // 分钟
        exp: 30,
    },
    CREATE_DECK: {
        id: 'create_deck',
        exp: 15,
    },
    AI_GENERATE: {
        id: 'ai_generate',
        exp: 25,
    },
} as const;

// 成就系统
export const ACHIEVEMENTS = {
    // 学习里程碑
    FIRST_REVIEW: { id: 'first_review', exp: 50 },
    REVIEW_10: { id: 'review_10', exp: 100 },
    REVIEW_100: { id: 'review_100', exp: 500 },
    REVIEW_1000: { id: 'review_1000', exp: 2000 },

    // 连续学习
    STREAK_7: { id: 'streak_7', exp: 200 },
    STREAK_30: { id: 'streak_30', exp: 1000 },
    STREAK_100: { id: 'streak_100', exp: 5000 },

    // 卡组创建
    FIRST_DECK: { id: 'first_deck', exp: 50 },
    DECK_10: { id: 'deck_10', exp: 300 },

    // AI使用
    FIRST_AI_GEN: { id: 'first_ai_gen', exp: 100 },
    AI_GEN_10: { id: 'ai_gen_10', exp: 500 },
} as const;

// 等级系统（经验值要求）
export const LEVEL_SYSTEM = {
    MAX_LEVEL: 100,
    // 每级所需经验值计算公式：baseExp * level^1.5
    BASE_EXP: 100,
    EXPONENT: 1.5,
};

// 计算升级所需经验值
export const getExpForLevel = (level: number): number => {
    if (level <= 1) return 0;
    return Math.floor(LEVEL_SYSTEM.BASE_EXP * Math.pow(level, LEVEL_SYSTEM.EXPONENT));
};

// 根据经验值计算等级
export const getLevelFromExp = (exp: number): { level: number; currentExp: number; nextLevelExp: number } => {
    let level = 1;
    let totalExp = 0;

    while (level < LEVEL_SYSTEM.MAX_LEVEL) {
        const nextLevelExp = getExpForLevel(level + 1);
        if (totalExp + nextLevelExp > exp) {
            return {
                level,
                currentExp: exp - totalExp,
                nextLevelExp,
            };
        }
        totalExp += nextLevelExp;
        level++;
    }

    return {
        level: LEVEL_SYSTEM.MAX_LEVEL,
        currentExp: 0,
        nextLevelExp: 0,
    };
};

// 存储键（本地缓存）
export const STORAGE_KEYS = {
    // 认证
    AUTH_TOKEN: '@auth_token',
    USER_ID: '@user_id',

    // 用户偏好
    THEME: '@theme',
    LANGUAGE: '@language',

    // 离线数据
    OFFLINE_QUEUE: '@offline_queue',
    CACHED_DECKS: '@cached_decks',
    CACHED_CARDS: '@cached_cards',

    // 其他
    ONBOARDING_COMPLETED: '@onboarding_completed',
    LAST_SYNC_TIME: '@last_sync_time',
} as const;

// 应用配置
export const APP_CONFIG = {
    // 应用名称
    APP_NAME: 'GeniusFlow-X',

    // 应用版本（从package.json读取）
    VERSION: '1.0.0',

    // 最小支持版本
    MIN_IOS_VERSION: '13.0',
    MIN_ANDROID_VERSION: '23', // Android 6.0

    // 调试模式
    DEBUG: __DEV__,

    // 特性开关
    FEATURES: {
        OFFLINE_MODE: true,
        AI_GENERATION: true,
        GAMIFICATION: true,
        SOCIAL: false, // 社交功能暂未实现
        TTS: true,
        IMPORT_EXPORT: true,
    },
};

// 动画配置
export const ANIMATION_CONFIG = {
    // 标准动画时长
    DURATION: {
        FAST: 200,
        NORMAL: 300,
        SLOW: 500,
    },

    // 缓动函数（用于Reanimated）
    EASING: {
        EASE_IN_OUT: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        EASE_OUT: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        EASE_IN: 'cubic-bezier(0.4, 0.0, 1, 1)',
    },
};

// 分页配置
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    LOAD_MORE_THRESHOLD: 0.5, // 滚动到50%时触发加载更多
};

// 错误消息
export const ERROR_MESSAGES = {
    NETWORK_ERROR: '网络连接失败，请检查您的网络设置',
    AUTH_ERROR: '认证失败，请重新登录',
    SESSION_EXPIRED: '登录已过期，请重新登录',
    UNKNOWN_ERROR: '发生未知错误，请稍后重试',
    AI_LIMIT_EXCEEDED: '您已达到今日AI生成限额',
    INVALID_INPUT: '输入内容无效，请检查后重试',
};

// 成功消息
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: '登录成功',
    LOGOUT_SUCCESS: '退出成功',
    DECK_CREATED: '卡组创建成功',
    DECK_UPDATED: '卡组更新成功',
    DECK_DELETED: '卡组删除成功',
    CARD_CREATED: '卡片创建成功',
    CARD_UPDATED: '卡片更新成功',
    CARD_DELETED: '卡片删除成功',
    PROFILE_UPDATED: '资料更新成功',
    SETTINGS_SAVED: '设置已保存',
};

// 正则表达式
export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    PASSWORD: /^.{8,}$/, // 至少8位
    URL: /^https?:\/\/.+/,
};

// 验证规则
export const VALIDATION = {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    PASSWORD_MIN_LENGTH: 8,
    DECK_TITLE_MAX_LENGTH: 100,
    DECK_DESC_MAX_LENGTH: 500,
    CARD_CONTENT_MAX_LENGTH: 10000,
    BIO_MAX_LENGTH: 200,
};
