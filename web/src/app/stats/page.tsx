'use client';

import { MainLayout } from '@/components';
import StatsDashboard from '@/components/stats/stats-dashboard';
import ActivityHeatmap from '@/components/stats/activity-heatmap';
import AchievementList from '@/components/gamification/achievement-list';
import styles from './stats.module.css';

export default function StatsPage() {
    return (
        <MainLayout>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>📊 学习统计与分析</h1>

                <div className={styles.dashboardSection}>
                    <StatsDashboard />
                </div>

                <div className={styles.heatmapSection}>
                    <ActivityHeatmap />
                </div>

                <div className={styles.achievementsSection}>
                    <AchievementList />
                </div>
            </div>
        </MainLayout>
    );
}
