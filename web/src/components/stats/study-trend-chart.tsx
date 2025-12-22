'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiClient } from '@/lib/api-client';
import styles from './study-trend-chart.module.css';

interface ChartData {
    dailyReviews: Array<{ date: string; count: number; correct: number }>;
    accuracyTrend: Array<{ date: string; accuracy: number; count: number }>;
    ratingDistribution: {
        again: number;
        hard: number;
        good: number;
        easy: number;
    };
}

const COLORS = {
    again: '#f44336',
    hard: '#ff9800',
    good: '#4caf50',
    easy: '#2196f3'
}

// Get CSS variable colors from the document
const getCSSColor = (varName: string) => {
    if (typeof window !== 'undefined') {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }
    return '#000';
};

export default function StudyTrendChart() {
    const [data, setData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await apiClient.get<{ success: boolean; data: ChartData }>('/api/stats/charts');
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to load chart data:', error);
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

    const DISTRIBUTION_COLORS = {
        again: LANDING_COLORS.coral,     // 再来 - Coral
        hard: LANDING_COLORS.pink,       // 困难 - Pink
        good: LANDING_COLORS.purple,     // 良好 - Purple
        easy: LANDING_COLORS.lavender    // 简单 - Lavender
    };

    // 准备饼图数据
    const pieData = Object.entries(data.ratingDistribution).map(([key, value]) => ({
        name: key,
        value,
        label: { again: '再来', hard: '困难', good: '良好', easy: '简单' }[key]
    }));

    const totalReviews = Object.values(data.ratingDistribution).reduce((a, b) => a + b, 0);

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
            <h2 className={styles.title}>📈 学习趋势分析</h2>

            {/* 每日复习数量 */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>每日复习数量</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.dailyReviews} barGap={4}>
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
                            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                background: 'var(--tooltip-bg, rgba(255, 255, 255, 0.95))',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '8px 12px',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                            }}
                        />
                        <Legend content={<CustomLegend />} />
                        <Bar
                            dataKey="count"
                            fill={LANDING_COLORS.coral}
                            name="总复习"
                            radius={[8, 8, 8, 8]}
                            barSize={18}
                            animationBegin={0}
                            animationDuration={1200}
                        />
                        <Bar
                            dataKey="correct"
                            fill={LANDING_COLORS.pink}
                            name="正确"
                            radius={[8, 8, 8, 8]}
                            barSize={18}
                            animationBegin={200}
                            animationDuration={1200}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 正确率趋势 */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>正确率变化趋势</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data.accuracyTrend}>
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
                            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--tooltip-bg, rgba(255, 255, 255, 0.95))',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '8px 12px',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                            }}
                            formatter={(value: any) => `${value}%`}
                        />
                        <Legend content={<CustomLegend />} />
                        <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke={LANDING_COLORS.purple}
                            strokeWidth={6}
                            dot={{ r: 5, fill: LANDING_COLORS.purple, strokeWidth: 3, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0, fill: LANDING_COLORS.purple }}
                            name="正确率"
                            animationBegin={0}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 评分分布 */}
            <div className={styles.distributionSection}>
                <h3 className={styles.chartTitle}>评分分布</h3>
                <div className={styles.distributionContent}>
                    <div className={styles.pieChartWrapper}>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={6}
                                    dataKey="value"
                                    cornerRadius={6}
                                    animationBegin={0}
                                    animationDuration={1200}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={DISTRIBUTION_COLORS[entry.name as keyof typeof DISTRIBUTION_COLORS]}
                                            stroke="none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--tooltip-bg, rgba(255, 255, 255, 0.95))',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.distributionStats}>
                        {pieData.map((item) => (
                            <div key={item.name} className={styles.statItem}>
                                <div
                                    className={styles.statColor}
                                    style={{ background: DISTRIBUTION_COLORS[item.name as keyof typeof DISTRIBUTION_COLORS] }}
                                />
                                <div
                                    className={styles.statLabel}
                                    style={{ color: DISTRIBUTION_COLORS[item.name as keyof typeof DISTRIBUTION_COLORS] }}
                                >
                                    {item.label}
                                </div>
                                <div className={styles.statValue}>
                                    {item.value} ({totalReviews > 0 ? Math.round((item.value / totalReviews) * 100) : 0}%)
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
