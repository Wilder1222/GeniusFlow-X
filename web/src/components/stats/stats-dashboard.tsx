'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import RetentionChart from './retention-chart';
import StudyTrendChart from './study-trend-chart';
import ForecastPanel from './forecast-panel';
import styles from './stats-dashboard.module.css';
import { LuBook, LuCheck, LuClock, LuFlame, LuTrophy, LuTarget } from 'react-icons/lu';

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
}

interface LearningData {
    averageAccuracy: number;
    totalReviews: number;
}

interface ActivityData {
    today: number;
    thisWeek: number;
    thisMonth: number;
}

interface StatsDashboardProps {
    simplified?: boolean;
}

export default function StatsDashboard({ simplified = false }: StatsDashboardProps) {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [learning, setLearning] = useState<LearningData | null>(null);
    const [activity, setActivity] = useState<ActivityData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        setLoading(true);
        try {
            const [summaryRes, streakRes, learningRes, activityRes] = await Promise.all([
                apiClient.get('/api/stats/summary'),
                apiClient.get('/api/stats/streak'),
                apiClient.get('/api/stats/learning'),
                apiClient.get('/api/stats/activity')
            ]);

            if (summaryRes.success) setSummary(summaryRes.data);
            if (streakRes.success) setStreak(streakRes.data);
            if (learningRes.success) setLearning(learningRes.data);
            if (activityRes.success) setActivity(activityRes.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`${styles.container} ${simplified ? styles.simplified : ''}`}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>加载统计数据中...</span>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: '总卡片数', value: summary?.totalCards || 0, icon: <LuBook />, color: '#4F46E5' },
        { label: '复习次数', value: summary?.totalReviews || 0, icon: <LuCheck />, color: '#10B981' },
        { label: '学习时长', value: `${summary?.studyTime || 0}m`, icon: <LuClock />, color: '#F59E0B' },
        { label: '当前连胜', value: `${streak?.currentStreak || 0}d`, icon: <LuFlame />, color: '#EF4444' },
        { label: '最高纪录', value: `${streak?.longestStreak || 0}d`, icon: <LuTrophy />, color: '#8B5CF6' },
        { label: '正确率', value: `${learning?.averageAccuracy || 0}%`, icon: <LuTarget />, color: '#EC4899' },
    ];

    return (
        <div className={`${styles.container} ${simplified ? styles.simplified : ''}`}>
            <div className={styles.header}>
                <h2 className={styles.title}>{simplified ? '今日概览' : '学习成就仪表盘'}</h2>
                <button onClick={fetchAllStats} className={styles.refreshBtn}>刷新</button>
            </div>

            <div className={styles.grid}>
                {statCards.slice(0, simplified ? 4 : 6).map((card, index) => (
                    <div key={index} className={styles.statCard} style={{ '--accent-color': card.color } as any}>
                        <div className={styles.iconWrapper}>
                            {card.icon}
                        </div>
                        <div className={styles.statInfo}>
                            <div className={styles.value}>{card.value}</div>
                            <div className={styles.label}>{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.recentActivity}>
                <h3>近期活跃度</h3>
                <div className={styles.activityGrid}>
                    <div className={styles.activityItem}>
                        <span className={styles.activityLabel}>今天</span>
                        <div className={styles.activityProgress}>
                            <div className={styles.activityValue}>{activity?.today || 0} 张</div>
                            <div className={styles.miniBar}>
                                <div className={styles.miniFill} style={{ width: `${Math.min((activity?.today || 0) / 50 * 100, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                    {/* Weekly and Monthly only in non-simplified or small on simplified? Keep them but maybe smaller? */}
                    <div className={styles.activityItem}>
                        <span className={styles.activityLabel}>本周</span>
                        <div className={styles.activityProgress}>
                            <div className={styles.activityValue}>{activity?.thisWeek || 0} 张</div>
                            <div className={styles.miniBar}>
                                <div className={styles.miniFill} style={{ width: `${Math.min((activity?.thisWeek || 0) / 300 * 100, 100)}%`, background: '#8B5CF6' }}></div>
                            </div>
                        </div>
                    </div>
                    {!simplified && (
                        <div className={styles.activityItem}>
                            <span className={styles.activityLabel}>本月</span>
                            <div className={styles.activityProgress}>
                                <div className={styles.activityValue}>{activity?.thisMonth || 0} 张</div>
                                <div className={styles.miniBar}>
                                    <div className={styles.miniFill} style={{ width: `${Math.min((activity?.thisMonth || 0) / 1000 * 100, 100)}%`, background: '#EC4899' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!simplified && (
                <div className={styles.chartsSection}>
                    <RetentionChart />
                    <StudyTrendChart />
                    <ForecastPanel />
                </div>
            )}
        </div>
    );
}
