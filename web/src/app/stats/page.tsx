'use client';

import { MainLayout } from '@/components';
import StatsDashboard from '@/components/stats/stats-dashboard';
import ActivityHeatmap from '@/components/stats/activity-heatmap';
import styles from './stats.module.css';

export default function StatsPage() {
    return (
        <MainLayout>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>📊 Statistics & Analytics</h1>

                <StatsDashboard />

                <ActivityHeatmap />

                <div className={styles.comingSoon}>
                    <h3>📈 More Analytics Coming Soon</h3>
                    <p>Retention charts, performance trends, and detailed insights are on the way!</p>
                </div>
            </div>
        </MainLayout>
    );
}
