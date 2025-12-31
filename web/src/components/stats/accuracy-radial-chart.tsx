'use client';

import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { useTranslations } from 'next-intl';
import { useStats } from '@/lib/contexts/stats-context';
import styles from './accuracy-radial-chart.module.css';

interface RadialData {
    accuracy: number;
    retention24h: number;
    retention7d: number;
}

export default function AccuracyRadialChart() {
    const { learning, retention, loading } = useStats();
    const t = useTranslations('StatsCharts');

    // Compute data from context
    const data: RadialData | null = (learning && retention) ? {
        accuracy: learning.averageAccuracy || 0,
        retention24h: retention.retention24h || 0,
        retention7d: retention.retention7d || 0
    } : null;

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>{t('loading')}</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>{t('noData')}</div>
            </div>
        );
    }

    // 准备径向图数据 - 从外到内
    const chartData = [
        {
            name: t('overallAccuracy'),
            value: data.accuracy,
            fill: '#4ecdc4', // Cyan
        },
        {
            name: t('retention7d'),
            value: data.retention7d,
            fill: '#ff6b6b', // Coral
        },
        {
            name: t('retention24h'),
            value: data.retention24h,
            fill: '#a55eea', // Purple
        },
    ];

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{t('learningAchievement')}</h2>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="20%"
                        outerRadius="100%"
                        barSize={20}
                        data={chartData}
                        startAngle={90}
                        endAngle={-270}
                    >
                        <RadialBar
                            background={{ fill: 'var(--radial-track-bg, rgba(0,0,0,0.05))' }}
                            dataKey="value"
                            cornerRadius={10}
                            animationBegin={0}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                        {/* Legend removed as requested */}
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                    <div className={styles.statValue} style={{ color: '#4ecdc4' }}>
                        {data.accuracy.toFixed(1)}%
                    </div>
                    <div className={styles.statLabel}>{t('overallAccuracy')}</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue} style={{ color: '#ff6b6b' }}>
                        {data.retention7d.toFixed(1)}%
                    </div>
                    <div className={styles.statLabel}>{t('retention7d')}</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue} style={{ color: '#a55eea' }}>
                        {data.retention24h.toFixed(1)}%
                    </div>
                    <div className={styles.statLabel}>{t('retention24h')}</div>
                </div>
            </div>
        </div>
    );
}
