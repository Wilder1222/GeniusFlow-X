/**
 * Achievement Service - 成就服务
 * 
 * 处理成就相关的API调用
 */

import { supabase } from '../lib/supabase';
import { ERROR_MESSAGES } from '../config/constants';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    requirement_type: string;
    requirement_value: number;
    xp_reward: number;
    created_at: string;
}

export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    unlocked_at: string;
    achievement?: Achievement;
}

export interface AchievementProgress {
    achievement: Achievement;
    current_value: number;
    is_unlocked: boolean;
    progress_percentage: number;
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

export const achievementService = {
    /**
     * 检查并解锁新成就
     */
    async checkAchievements(): Promise<{
        newlyUnlocked: Achievement[];
        totalUnlocked: number;
    }> {
        try {
            const response = await apiRequest<ApiResponse<{
                newlyUnlocked: Achievement[];
                totalUnlocked: number;
            }>>('/api/achievements/check', {
                method: 'POST',
            });

            if (response.success && response.data) {
                return response.data;
            }

            return { newlyUnlocked: [], totalUnlocked: 0 };
        } catch (error: any) {
            console.error('Achievement Service - Check Error:', error);
            return { newlyUnlocked: [], totalUnlocked: 0 };
        }
    },

    /**
     * 获取用户所有成就
     */
    async getUserAchievements(): Promise<UserAchievement[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('user_achievements')
                .select(`
                    *,
                    achievement:achievements(*)
                `)
                .eq('user_id', user.id)
                .order('unlocked_at', { ascending: false });

            if (error) throw error;
            return (data || []) as UserAchievement[];
        } catch (error: any) {
            console.error('Achievement Service - Get User Achievements Error:', error);
            return [];
        }
    },

    /**
     * 获取所有成就及进度
     */
    async getAllAchievementsWithProgress(): Promise<AchievementProgress[]> {
        try {
            // 获取所有成就
            const { data: achievements, error: achievementsError } = await supabase
                .from('achievements')
                .select('*')
                .order('category', { ascending: true });

            if (achievementsError) throw achievementsError;

            // 获取用户已解锁的成就
            const userAchievements = await this.getUserAchievements();
            const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));

            // 组合数据
            const progress: AchievementProgress[] = (achievements || []).map(achievement => ({
                achievement,
                current_value: 0, // 这里简化处理，实际需要从后端获取
                is_unlocked: unlockedIds.has(achievement.id),
                progress_percentage: unlockedIds.has(achievement.id) ? 100 : 0
            }));

            return progress;
        } catch (error: any) {
            console.error('Achievement Service - Get Progress Error:', error);
            return [];
        }
    }
};
