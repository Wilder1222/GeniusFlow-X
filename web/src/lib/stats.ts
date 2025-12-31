/**
 * Stats API - 学习统计
 */

import { apiClient } from '@/lib/api-client';

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
    try {
        const response = await apiClient.get<{ success: boolean; data: StudyStatsRow }>('/api/stats/study');
        return statsFromRow(response.data);
    } catch (error) {
        console.error('获取学习统计失败:', error);
        return null;
    }
}

/**
 * 更新学习统计（用于学习完成后）
 */
export async function updateStudyStats(update: {
    cardsReviewed?: number;
    studyTimeMinutes?: number;
}): Promise<StudyStats | null> {
    try {
        const response = await apiClient.post<{ success: boolean; data: StudyStatsRow }>('/api/stats/study', update);
        return statsFromRow(response.data);
    } catch (error) {
        console.error('更新学习统计失败:', error);
        return null; // Or throw depending on desired behavior
    }
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
