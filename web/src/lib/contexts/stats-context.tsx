'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';

// ============ Types ============

interface SummaryData {
    totalCards: number;
    totalReviews: number;
    studyTime: number;
}

interface StreakData {
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string | null;
}

interface LearningData {
    averageAccuracy: number;
    totalReviews: number;
    correctReviews: number;
}

interface ActivityData {
    today: number;
    thisWeek: number;
    thisMonth: number;
}

interface HeatmapDataPoint {
    date: string;
    count: number;
}

interface RetentionData {
    retention24h: number;
    retention7d: number;
    retention30d: number;
    byDifficulty: {
        again: { total: number; retained: number; rate: number };
        hard: { total: number; retained: number; rate: number };
        good: { total: number; retained: number; rate: number };
        easy: { total: number; retained: number; rate: number };
    };
    chartData: Array<{ date: string; rate: number; total: number }>;
}

interface ForecastData {
    forecast: Array<{
        date: string;
        count: number;
        byState: {
            new: number;
            learning: number;
            review: number;
            relearning: number;
        };
    }>;
    totalDue: number;
    estimatedMinutes: number;
}

interface ChartData {
    dailyReviews: Array<{ date: string; count: number; correct: number }>;
    accuracyTrend: Array<{ date: string; accuracy: number; count: number }>;
    ratingDistribution: {
        again: number;
        hard: number;
        good: number;
        easy: number;
    };
}

interface StatsContextType {
    // Data
    summary: SummaryData | null;
    streak: StreakData | null;
    learning: LearningData | null;
    activity: ActivityData | null;
    heatmap: HeatmapDataPoint[];
    retention: RetentionData | null;
    forecast: ForecastData | null;
    charts: ChartData | null;

    // State
    loading: boolean;
    error: string | null;

    // Actions
    refresh: () => Promise<void>;
}

// ============ Context ============

const StatsContext = createContext<StatsContextType | null>(null);

// ============ Provider ============

interface StatsProviderProps {
    children: ReactNode;
}

export function StatsProvider({ children }: StatsProviderProps) {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [learning, setLearning] = useState<LearningData | null>(null);
    const [activity, setActivity] = useState<ActivityData | null>(null);
    const [heatmap, setHeatmap] = useState<HeatmapDataPoint[]>([]);
    const [retention, setRetention] = useState<RetentionData | null>(null);
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [charts, setCharts] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isFetching = useRef(false);

    const fetchAllStats = useCallback(async () => {
        if (isFetching.current) return;
        isFetching.current = true;

        setLoading(true);
        setError(null);

        try {
            // Fetch ALL stats endpoints in a single parallel batch
            const [
                summaryRes,
                streakRes,
                learningRes,
                activityRes,
                heatmapRes,
                retentionRes,
                forecastRes,
                chartsRes
            ] = await Promise.all([
                apiClient.get('/api/stats/summary'),
                apiClient.get('/api/stats/streak'),
                apiClient.get('/api/stats/learning'),
                apiClient.get('/api/stats/activity'),
                apiClient.get('/api/stats/heatmap'),
                apiClient.get('/api/stats/retention'),
                apiClient.get('/api/stats/forecast'),
                apiClient.get('/api/stats/charts')
            ]);

            if (summaryRes.success) setSummary(summaryRes.data);
            if (streakRes.success) setStreak(streakRes.data);
            if (learningRes.success) setLearning(learningRes.data);
            if (activityRes.success) setActivity(activityRes.data);
            if (heatmapRes.success) setHeatmap(heatmapRes.data);
            if (retentionRes.success) setRetention(retentionRes.data);
            if (forecastRes.success) setForecast(forecastRes.data);
            if (chartsRes.success) setCharts(chartsRes.data);
        } catch (err: unknown) {
            console.error('Failed to fetch stats:', err);
            setError(err instanceof Error ? err.message : 'Failed to load stats');
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        fetchAllStats();
    }, [fetchAllStats]);

    const value: StatsContextType = useMemo(() => ({
        summary,
        streak,
        learning,
        activity,
        heatmap,
        retention,
        forecast,
        charts,
        loading,
        error,
        refresh: fetchAllStats
    }), [summary, streak, learning, activity, heatmap, retention, forecast, charts, loading, error, fetchAllStats]);

    return (
        <StatsContext.Provider value={value}>
            {children}
        </StatsContext.Provider>
    );
}

// ============ Hook ============

export function useStats(): StatsContextType {
    const context = useContext(StatsContext);
    if (!context) {
        throw new Error('useStats must be used within a StatsProvider');
    }
    return context;
}

// ============ Optional: Selective Hook for specific data ============

export function useStatsData<K extends keyof Omit<StatsContextType, 'loading' | 'error' | 'refresh'>>(
    keys: K[]
): Pick<StatsContextType, K | 'loading' | 'error' | 'refresh'> {
    const context = useStats();
    type ResultType = Pick<StatsContextType, K | 'loading' | 'error' | 'refresh'>;
    const result: ResultType = {
        loading: context.loading,
        error: context.error,
        refresh: context.refresh
    } as ResultType; // Type assertion for initial empty object
    keys.forEach(key => {
        result[key] = context[key] as ResultType[K]; // Type assertion for assignment
    });
    return result;
}
