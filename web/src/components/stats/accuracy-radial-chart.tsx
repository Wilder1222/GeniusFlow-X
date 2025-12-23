'use client';

import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { useStats } from '@/lib/contexts/stats-context';
import styles from './accuracy-radial-chart.module.css';

interface RadialData {
    accuracy: number;
    retention24h: number;
    retention7d: number;
}

export default function AccuracyRadialChart() {
    const { learning, retention, loading } = useStats();

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
                    <span>加载中...</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>暂无数据</div>
            </div>
        );
    }

    // 准备径向图数据 - 从外到内
    const chartData = [
        {
            name: '总体正确率',
            value: data.accuracy,
            fill: '#4ecdc4', // Cyan
        },
        {
            name: '7天留存',
            value: data.retention7d,
            fill: '#ff6b6b', // Coral
        },
        {
            name: '24h留存',
            value: data.retention24h,
            fill: '#a55eea', // Purple
        },
    ];

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>🎯 学习成就</h2>

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
                    <div className={styles.statLabel}>总体正确率</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue} style={{ color: '#ff6b6b' }}>
                        {data.retention7d.toFixed(1)}%
                    </div>
                    <div className={styles.statLabel}>7天留存</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue} style={{ color: '#a55eea' }}>
                        {data.retention24h.toFixed(1)}%
                    </div>
                    <div className={styles.statLabel}>24h留存</div>
                </div>
            </div>
        </div>
    );
}
