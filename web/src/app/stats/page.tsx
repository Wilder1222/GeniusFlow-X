'use client';

import { MainLayout } from '@/components';
import { StatsProvider } from '@/lib/contexts/stats-context';
import StatsDashboard from '@/components/stats/stats-dashboard';
import StudyTrendChart from '@/components/stats/study-trend-chart';
import RetentionChart from '@/components/stats/retention-chart';
import SkillRadarChart from '@/components/stats/skill-radar-chart';
import AccuracyRadialChart from '@/components/stats/accuracy-radial-chart';
import AchievementList from '@/components/gamification/achievement-list';
import { motion } from 'framer-motion';
import styles from './stats.module.css';

export default function StatsPage() {
    return (
        <MainLayout>
            <StatsProvider>
                <div className={styles.container}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={styles.headerTitleContainer}
                    >
                        <h1 className={styles.pageTitle}>📊 学习数据中心</h1>
                        <p className={styles.subTitle}>追踪你的学习足迹，挑战自我极限</p>
                    </motion.div>

                    {/* StatsDashboard (now includes heatmap) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className={styles.dashboardSection}
                    >
                        <StatsDashboard isStatsPage={true} />
                    </motion.div>

                    {/* Radar Charts Section - directly below dashboard */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className={styles.chartsGrid}
                    >
                        <SkillRadarChart />
                        <AccuracyRadialChart />
                    </motion.div>

                    {/* Trend Charts Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className={styles.chartsGrid}
                    >
                        <StudyTrendChart />
                        <RetentionChart />
                    </motion.div>

                    {/* Achievements Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className={styles.achievementsSection}
                    >
                        <AchievementList />
                    </motion.div>
                </div>
            </StatsProvider>
        </MainLayout>
    );
}
