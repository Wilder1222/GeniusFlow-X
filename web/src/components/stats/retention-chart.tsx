'use client';

import React from 'react';
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { useTranslations } from 'next-intl';
import { useStats } from '@/lib/contexts/stats-context';
import styles from './retention-chart.module.css';

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

export default function RetentionChart() {
    const { retention: data, loading } = useStats();
    const t = useTranslations('StatsCharts');

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>{t('loading')}</div>
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

    // Landing Page Gradient Theme Colors
    const LANDING_COLORS = {
        coral: '#ff6b6b',      // Coral (Card 1)
        pink: '#f06595',       // Pink (Card 2)
        purple: '#cc5de8',     // Purple (Card 3)
        lavender: '#a18cd1'    // Lavender (Card 4)
    };

    const CHART_COLOR = LANDING_COLORS.purple; // Purple for retention trend

    // Rating Colors based on Study Card design
    const DIFFICULTY_COLORS = {
        again: '#ff6b6b',     // 忘记 - Red
        hard: '#ffc93c',      // 困难 - Orange/Yellow
        good: '#5eb5ef',      // 一般 - Blue
        easy: '#4ecdc4'       // 简单 - Green/Teal
    };

    const CustomLegend = (props: any) => {
        const { payload } = props;
        return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
                {payload.map((entry: any, index: number) => (
                    <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: entry.color
                        }}></div>
                        <span style={{ fontSize: '12px', color: 'var(--chart-text-secondary)', fontWeight: 500 }}>{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{t('retentionAnalysis')}</h2>

            {/* 关键指标 */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>{t('retention24h')}</div>
                    <div className={styles.metricValue} style={{ color: LANDING_COLORS.coral }}>{data.retention24h}%</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>{t('retention7d')}</div>
                    <div className={styles.metricValue} style={{ color: LANDING_COLORS.pink }}>{data.retention7d}%</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>{t('retention30d')}</div>
                    <div className={styles.metricValue} style={{ color: LANDING_COLORS.purple }}>{data.retention30d}%</div>
                </div>
            </div>

            {/* 留存率趋势图 */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>{t('retentionTrend')}</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data.chartData}>
                        <defs>
                            <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLOR} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: 'var(--chart-text-secondary)' }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: 'var(--chart-text-secondary)' }}
                            domain={[0, 100]}
                            label={{ value: t('retentionRate'), angle: -90, position: 'insideLeft', fill: 'var(--chart-text-secondary)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--chart-tooltip-bg)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '8px 12px',
                                boxShadow: 'var(--chart-tooltip-shadow)'
                            }}
                            formatter={(value: any) => `${value}%`}
                        />
                        <Legend content={<CustomLegend />} />
                        <Area
                            type="monotone"
                            dataKey="rate"
                            stroke={CHART_COLOR}
                            strokeWidth={3}
                            fill="url(#colorRetention)"
                            name={t('retentionOnly')}
                            animationBegin={0}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* 按难度分类 */}
            <div className={styles.difficultySection}>
                <h3 className={styles.chartTitle}>{t('ratingClassification')}</h3>
                <div className={styles.difficultyGrid}>
                    {Object.entries(data.byDifficulty).map(([key, value]) => {
                        const labels: Record<string, string> = {
                            again: t('again'),
                            hard: t('hard'),
                            good: t('good'),
                            easy: t('easy')
                        };
                        return (
                            <div key={key} className={styles.difficultyCard}>
                                <div className={styles.difficultyLabel} style={{ color: DIFFICULTY_COLORS[key as keyof typeof DIFFICULTY_COLORS] }}>
                                    {labels[key]}
                                </div>
                                <div className={styles.difficultyRate}>{value.rate}%</div>
                                <div className={styles.difficultyCount}>
                                    {value.retained} / {value.total}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
