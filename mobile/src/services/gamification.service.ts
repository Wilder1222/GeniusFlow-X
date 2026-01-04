/**
 * Gamification Service - 游戏化服务
 * 
 * 处理XP、等级等游戏化功能
 */

import { supabase } from '../lib/supabase';
import { ERROR_MESSAGES } from '../config/constants';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface UserLevel {
    currentLevel: number;
    currentXP: number;
    xpForNextLevel: number;
    xpProgress: number; // 0-100
    totalXP: number;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

/**
 * 获取认证token
 */
async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

/**
 * 通用API请求函数
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * 计算等级所需XP
 */
function calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * 根据总XP计算当前等级
 */
function calculateLevelFromXP(totalXP: number): UserLevel {
    let currentLevel = 1;
    let xpForCurrentLevel = 0;

    while (true) {
        const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
        if (xpForCurrentLevel + xpForNextLevel > totalXP) {
            break;
        }
        xpForCurrentLevel += xpForNextLevel;
        currentLevel++;
    }

    const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
    const currentXP = totalXP - xpForCurrentLevel;
    const xpProgress = (currentXP / xpForNextLevel) * 100;

    return {
        currentLevel,
        currentXP,
        xpForNextLevel,
        xpProgress,
        totalXP
    };
}

export const gamificationService = {
    /**
     * 添加XP
     */
    async addXP(amount: number, source: string = 'review'): Promise<{
        xpAdded: number;
        leveledUp: boolean;
        newLevel?: number;
        userLevel: UserLevel;
    }> {
        try {
            const response = await apiRequest<ApiResponse<{
                xpAdded: number;
                totalXP: number;
                leveledUp: boolean;
                newLevel?: number;
            }>>('/api/gamification/xp', {
                method: 'POST',
                body: JSON.stringify({ amount, source }),
            });

            if (response.success && response.data) {
                const userLevel = calculateLevelFromXP(response.data.totalXP);
                return {
                    xpAdded: response.data.xpAdded,
                    leveledUp: response.data.leveledUp,
                    newLevel: response.data.newLevel,
                    userLevel
                };
            }

            throw new Error(response.error?.message || 'Failed to add XP');
        } catch (error: any) {
            console.error('Gamification Service - Add XP Error:', error);
            throw new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
        }
    },

    /**
     * 获取用户等级信息
     */
    async getUserLevel(): Promise<UserLevel> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return {
                    currentLevel: 1,
                    currentXP: 0,
                    xpForNextLevel: 100,
                    xpProgress: 0,
                    totalXP: 0
                };
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('total_xp')
                .eq('id', user.id)
                .single();

            const totalXP = profile?.total_xp || 0;
            return calculateLevelFromXP(totalXP);
        } catch (error: any) {
            console.error('Gamification Service - Get User Level Error:', error);
            return {
                currentLevel: 1,
                currentXP: 0,
                xpForNextLevel: 100,
                xpProgress: 0,
                totalXP: 0
            };
        }
    },

    /**
     * 获取等级要求
     */
    getLevelRequirements(level: number): number {
        return calculateXPForLevel(level);
    }
};
