'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { apiClient } from '@/lib/api-client';
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
    const [data, setData] = useState<RetentionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await apiClient.get<{ success: boolean; data: RetentionData }>('/api/stats/retention');
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to load retention data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>加载中...</div>
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

    // Landing Page Gradient Theme Colors
    const LANDING_COLORS = {
        coral: '#ff6b6b',      // Coral (Card 1)
        pink: '#f06595',       // Pink (Card 2)
        purple: '#cc5de8',     // Purple (Card 3)
        lavender: '#a18cd1'    // Lavender (Card 4)
    };

    const CHART_COLOR = LANDING_COLORS.purple; // Purple for retention trend

    const DIFFICULTY_COLORS = {
        again: LANDING_COLORS.coral,     // 再来 - Coral
        hard: LANDING_COLORS.pink,       // 困难 - Pink
        good: LANDING_COLORS.purple,     // 良好 - Purple
        easy: LANDING_COLORS.lavender    // 简单 - Lavender
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
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>📊 留存率分析</h2>

            {/* 关键指标 */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>24小时留存</div>
                    <div className={styles.metricValue} style={{ color: LANDING_COLORS.coral }}>{data.retention24h}%</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>7天留存</div>
                    <div className={styles.metricValue} style={{ color: LANDING_COLORS.pink }}>{data.retention7d}%</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>30天留存</div>
                    <div className={styles.metricValue} style={{ color: LANDING_COLORS.purple }}>{data.retention30d}%</div>
                </div>
            </div>

            {/* 留存率趋势图 */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>30天留存率趋势</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={data.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-color, rgba(0,0,0,0.05))" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                            domain={[0, 100]}
                            label={{ value: '留存率 (%)', angle: -90, position: 'insideLeft', fill: 'var(--color-text-secondary)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ stroke: 'rgba(129, 236, 236, 0.2)', strokeWidth: 2 }}
                            contentStyle={{
                                background: 'var(--tooltip-bg, rgba(255, 255, 255, 0.95))',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '8px 12px',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                            }}
                            formatter={(value: any, name: any) => {
                                if (name === '留存率') return `${value}%`;
                                return value;
                            }}
                        />
                        <Legend content={<CustomLegend />} />
                        <Area
                            type="monotone"
                            dataKey="rate"
                            fill={CHART_COLOR}
                            fillOpacity={0.15}
                            stroke="none"
                            legendType="none"
                            animationBegin={0}
                            animationDuration={1500}
                        />
                        <Line
                            type="monotone"
                            dataKey="rate"
                            stroke={CHART_COLOR}
                            strokeWidth={6}
                            dot={{ r: 5, fill: CHART_COLOR, strokeWidth: 3, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0, fill: CHART_COLOR }}
                            name="留存率"
                            animationBegin={0}
                            animationDuration={1500}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* 按难度分类 */}
            <div className={styles.difficultySection}>
                <h3 className={styles.chartTitle}>按评分分类</h3>
                <div className={styles.difficultyGrid}>
                    {Object.entries(data.byDifficulty).map(([key, value]) => {
                        const labels: Record<string, string> = {
                            again: '再来一次',
                            hard: '困难',
                            good: '良好',
                            easy: '简单'
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
