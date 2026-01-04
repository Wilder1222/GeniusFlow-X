/**
 * 统计数据服务层
 */

import { supabase } from '../lib/supabase';
import type { StatsResponse, HeatmapData, RetentionData } from '../types/stats';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const statsService = {
    /**
     * 获取学习统计数据
     * 调用多个API端点并组合数据
     */
    async getStudyStats(userId: string, timeRange: '7d' | '30d' | '90d' = '7d'): Promise<{ data: StatsResponse | null; error: string | null }> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                return { data: null, error: '未登录' };
            }

            const headers = {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
            };

            // 并行请求多个API
            const [studyRes, chartsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/stats/study`, { headers }),
                fetch(`${API_BASE_URL}/api/stats/charts?range=${timeRange}`, { headers }),
            ]);

            if (!studyRes.ok || !chartsRes.ok) {
                return { data: null, error: '获取统计数据失败' };
            }

            const studyData = await studyRes.json();
            const chartsData = await chartsRes.json();

            // 组合数据
            const statsResponse: StatsResponse = {
                studyStats: {
                    totalCards: studyData.data?.total_cards_reviewed || 0,
                    reviewedToday: chartsData.data?.reviewedToday || 0,
                    streak: studyData.data?.current_streak || 0,
                    accuracy: chartsData.data?.accuracy || 0,
                    timeRange,
                },
                trendData: chartsData.data?.trendData || [],
                ratingDistribution: chartsData.data?.ratingDistribution || [],
                heatmapData: [],
                retentionData: [],
                skillRadarData: [],
            };

            return { data: statsResponse, error: null };
        } catch (error) {
            console.error('获取统计数据失败:', error);
            return { data: null, error: error instanceof Error ? error.message : '网络错误' };
        }
    },

    /**
     * 获取热力图数据
     */
    async getHeatmapData(userId: string): Promise<{ data: HeatmapData[] | null; error: string | null }> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                return { data: null, error: '未登录' };
            }

            const response = await fetch(`${API_BASE_URL}/api/stats/heatmap`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { data: null, error: errorData.message || '获取热力图数据失败' };
            }

            const result = await response.json();

            // 转换数据格式为HeatmapData
            const heatmapData: HeatmapData[] = (result.data || []).map((item: any) => ({
                date: item.date,
                count: item.count,
                level: Math.min(4, Math.floor(item.count / 5)), // 0-4级别
            }));

            return { data: heatmapData, error: null };
        } catch (error) {
            console.error('获取热力图数据失败:', error);
            return { data: null, error: error instanceof Error ? error.message : '网络错误' };
        }
    },

    /**
     * 获取保留率数据
     */
    async getRetentionData(userId: string): Promise<{ data: RetentionData[] | null; error: string | null }> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                return { data: null, error: '未登录' };
            }

            const response = await fetch(`${API_BASE_URL}/api/stats/retention`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { data: null, error: errorData.message || '获取保留率数据失败' };
            }

            const result = await response.json();

            // 转换数据格式为RetentionData
            const retentionData: RetentionData[] = [];
            const byDifficulty = result.data?.byDifficulty || {};

            // 将难度数据转换为时间间隔数据
            Object.entries(byDifficulty).forEach(([key, value]: [string, any], index) => {
                const ratingMap: Record<string, 1 | 2 | 3 | 4> = {
                    'again': 1,
                    'hard': 2,
                    'good': 3,
                    'easy': 4,
                };

                retentionData.push({
                    interval: `${index + 1}天`,
                    rating: ratingMap[key] || 1,
                    retention: value.rate || 0,
                });
            });

            return { data: retentionData, error: null };
        } catch (error) {
            console.error('获取保留率数据失败:', error);
            return { data: null, error: error instanceof Error ? error.message : '网络错误' };
        }
    },

    /**
     * 获取用户摘要统计数据 (首页使用)
     */
    async getUserStats(userId: string): Promise<{
        reviewed_today: number;
        focus_time_today: number;
        accuracy: number;
        total_xp?: number;
    } | null> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;

            const response = await fetch(`${API_BASE_URL}/api/stats/summary`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) return null;
            const result = await response.json();

            return {
                reviewed_today: result.data?.reviewed_today || 0,
                focus_time_today: result.data?.focus_time_today || 0,
                accuracy: result.data?.accuracy || 0,
                total_xp: result.data?.total_xp || 0
            };
        } catch (error) {
            console.error('获取用户摘要统计失败:', error);
            return null;
        }
    },

    /**
     * 获取能力雷达数据 (暂未实现Web端API)
     */
    async getSkillRadarData(userId: string): Promise<{ data: any[] | null; error: string | null }> {
        // TODO: 等待Web端实现API
        return { data: [], error: null };
    },
};

