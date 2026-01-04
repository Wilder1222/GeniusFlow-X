/**
 * 统计数据类型定义
 */

export interface StudyStats {
    totalCards: number;
    reviewedToday: number;
    streak: number;
    accuracy: number;
    timeRange: '7d' | '30d' | '90d';
}

export interface StudyTrendData {
    date: string;
    reviewed: number;
    new: number;
    learning: number;
    relearning: number;
}

export interface RatingDistribution {
    rating: 1 | 2 | 3 | 4;
    count: number;
    percentage: number;
    label: string;
}

export interface HeatmapData {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4; // 0-4 表示活跃度等级
}

export interface RetentionData {
    interval: string;
    retention: number;
    rating: 1 | 2 | 3 | 4;
}

export interface SkillRadarData {
    skill: string;
    value: number;
    maxValue: number;
}

export interface StatsResponse {
    studyStats: StudyStats;
    trendData: StudyTrendData[];
    ratingDistribution: RatingDistribution[];
    heatmapData: HeatmapData[];
    retentionData: RetentionData[];
    skillRadarData: SkillRadarData[];
}
