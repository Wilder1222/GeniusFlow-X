/**
 * 统计数据 Zustand Store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
    StudyStats,
    StudyTrendData,
    RatingDistribution,
    HeatmapData,
    RetentionData,
    SkillRadarData,
} from '../types/stats';

interface StatsState {
    // 数据
    studyStats: StudyStats | null;
    trendData: StudyTrendData[];
    ratingDistribution: RatingDistribution[];
    heatmapData: HeatmapData[];
    retentionData: RetentionData[];
    skillRadarData: SkillRadarData[];

    // 加载状态
    loading: boolean;
    error: string | null;
    lastUpdated: number | null;

    // 时间范围
    timeRange: '7d' | '30d' | '90d';

    // Actions
    setStudyStats: (stats: StudyStats) => void;
    setTrendData: (data: StudyTrendData[]) => void;
    setRatingDistribution: (data: RatingDistribution[]) => void;
    setHeatmapData: (data: HeatmapData[]) => void;
    setRetentionData: (data: RetentionData[]) => void;
    setSkillRadarData: (data: SkillRadarData[]) => void;
    setTimeRange: (range: '7d' | '30d' | '90d') => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearStats: () => void;
}

export const useStatsStore = create<StatsState>()(
    persist(
        (set) => ({
            // 初始状态
            studyStats: null,
            trendData: [],
            ratingDistribution: [],
            heatmapData: [],
            retentionData: [],
            skillRadarData: [],
            loading: false,
            error: null,
            lastUpdated: null,
            timeRange: '7d',

            // Actions
            setStudyStats: (stats) => set({ studyStats: stats, lastUpdated: Date.now() }),
            setTrendData: (data) => set({ trendData: data }),
            setRatingDistribution: (data) => set({ ratingDistribution: data }),
            setHeatmapData: (data) => set({ heatmapData: data }),
            setRetentionData: (data) => set({ retentionData: data }),
            setSkillRadarData: (data) => set({ skillRadarData: data }),
            setTimeRange: (range) => set({ timeRange: range }),
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),
            clearStats: () => set({
                studyStats: null,
                trendData: [],
                ratingDistribution: [],
                heatmapData: [],
                retentionData: [],
                skillRadarData: [],
                error: null,
                lastUpdated: null,
            }),
        }),
        {
            name: 'stats-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // 只持久化数据,不持久化加载状态
            partialize: (state) => ({
                studyStats: state.studyStats,
                trendData: state.trendData,
                ratingDistribution: state.ratingDistribution,
                heatmapData: state.heatmapData,
                retentionData: state.retentionData,
                skillRadarData: state.skillRadarData,
                timeRange: state.timeRange,
                lastUpdated: state.lastUpdated,
            }),
        }
    )
);
