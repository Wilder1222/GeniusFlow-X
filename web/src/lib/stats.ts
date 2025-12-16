/**
 * Stats API - 学习统计
 */

import { supabase } from './supabase';

export interface StudyStats {
    id: string;
    userId: string;
    totalCardsReviewed: number;
    totalStudyTimeMinutes: number;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string | null;
    updatedAt: string;
}

interface StudyStatsRow {
    id: number;
    // uuid removed
    user_id: string;
    total_cards_reviewed: number;
    total_study_time_minutes: number;
    current_streak: number;
    longest_streak: number;
    last_study_date: string | null;
    updated_at: string;
}

function statsFromRow(row: StudyStatsRow): StudyStats {
    return {
        id: row.id.toString(),
        userId: row.user_id,
        totalCardsReviewed: row.total_cards_reviewed,
        totalStudyTimeMinutes: row.total_study_time_minutes,
        currentStreak: row.current_streak,
        longestStreak: row.longest_streak,
        lastStudyDate: row.last_study_date,
        updatedAt: row.updated_at,
    };
}

/**
 * 获取当前用户的学习统计
 */
export async function getStudyStats(): Promise<StudyStats | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('study_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        // PGRST116 表示没有找到记录，尝试创建一条初始记录
        if (error.code === 'PGRST116') {
            const { data: newData, error: insertError } = await supabase
                .from('study_stats')
                .insert({
                    user_id: user.id,
                    total_cards_reviewed: 0,
                    total_study_time_minutes: 0,
                    current_streak: 0,
                    longest_streak: 0,
                    last_study_date: null,
                })
                .select('*')
                .single();

            if (insertError) {
                console.error('创建学习统计失败:', insertError);
                return null;
            }

            return statsFromRow(newData as StudyStatsRow);
        }

        console.error('获取学习统计失败:', error);
        return null;
    }

    return statsFromRow(data as StudyStatsRow);
}

/**
 * 更新学习统计（用于学习完成后）
 */
export async function updateStudyStats(update: {
    cardsReviewed?: number;
    studyTimeMinutes?: number;
}): Promise<StudyStats | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('未登录');

    // 先获取当前统计
    const currentStats = await getStudyStats();
    if (!currentStats) return null;

    const today = new Date().toISOString().split('T')[0];
    const lastStudyDate = currentStats.lastStudyDate;

    // 计算连续学习天数
    let currentStreak = currentStats.currentStreak;
    let longestStreak = currentStats.longestStreak;

    if (lastStudyDate !== today) {
        // 检查是否是连续学习
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastStudyDate === yesterdayStr) {
            // 连续学习
            currentStreak += 1;
        } else {
            // 断了，重新开始
            currentStreak = 1;
        }

        longestStreak = Math.max(longestStreak, currentStreak);
    }

    const updateData: Record<string, unknown> = {
        last_study_date: today,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        updated_at: new Date().toISOString(),
    };

    if (update.cardsReviewed) {
        updateData.total_cards_reviewed = currentStats.totalCardsReviewed + update.cardsReviewed;
    }
    if (update.studyTimeMinutes) {
        updateData.total_study_time_minutes = currentStats.totalStudyTimeMinutes + update.studyTimeMinutes;
    }

    const { data, error } = await supabase
        .from('study_stats')
        .update(updateData)
        .eq('user_id', user.id)
        .select('*')
        .single();

    if (error) throw error;
    return statsFromRow(data as StudyStatsRow);
}

/**
 * 格式化学习时间（分钟转小时）
 */
export function formatStudyTime(minutes: number): string {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}小时`;
    return `${hours}小时${remainingMinutes}分钟`;
}
