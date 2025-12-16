'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import RetentionChart from './retention-chart';
import StudyTrendChart from './study-trend-chart';
import ForecastPanel from './forecast-panel';
import styles from './stats-dashboard.module.css';

interface StatsData {
    totalCards: number;
    totalReviews: number;
    studyTime: number;
    currentStreak: number;
    longestStreak: number;
    averageAccuracy: number;
    cardsReviewed: {
        today: number;
        thisWeek: number;
        thisMonth: number;
    };
}

export default function StatsDashboard() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await apiClient.get('/api/stats/overview');
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading stats...</div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const statCards = [
        { label: 'Total Cards', value: stats.totalCards, icon: '📚' },
        { label: 'Total Reviews', value: stats.totalReviews, icon: '✅' },
        { label: 'Study Time', value: `${stats.studyTime}m`, icon: '⏱️' },
        { label: 'Current Streak', value: `${stats.currentStreak}d`, icon: '🔥' },
        { label: 'Longest Streak', value: `${stats.longestStreak}d`, icon: '🏆' },
        { label: 'Accuracy', value: `${stats.averageAccuracy}%`, icon: '🎯' },
    ];

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Your Statistics</h2>

            <div className={styles.grid}>
                {statCards.map((card, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.icon}>{card.icon}</div>
                        <div className={styles.value}>{card.value}</div>
                        <div className={styles.label}>{card.label}</div>
                    </div>
                ))}
            </div>

            <div className={styles.recentActivity}>
                <h3>Recent Activity</h3>
                <div className={styles.activityGrid}>
                    <div className={styles.activityItem}>
                        <span className={styles.activityLabel}>Today</span>
                        <span className={styles.activityValue}>{stats.cardsReviewed.today} cards</span>
                    </div>
                    <div className={styles.activityItem}>
                        <span className={styles.activityLabel}>This Week</span>
                        <span className={styles.activityValue}>{stats.cardsReviewed.thisWeek} cards</span>
                    </div>
                    <div className={styles.activityItem}>
                        <span className={styles.activityLabel}>This Month</span>
                        <span className={styles.activityValue}>{stats.cardsReviewed.thisMonth} cards</span>
                    </div>
                </div>
            </div>

            {/* 新增图表组件 */}
            <div className={styles.chartsSection}>
                <RetentionChart />
                <StudyTrendChart />
                <ForecastPanel />
            </div>
        </div>
    );
}
