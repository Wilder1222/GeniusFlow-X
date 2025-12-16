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

    // 准备饼图数据
    const pieData = Object.entries(data.ratingDistribution).map(([key, value]) => ({
        name: key,
        value,
        label: { again: '再来', hard: '困难', good: '良好', easy: '简单' }[key]
    }));

    const totalReviews = Object.values(data.ratingDistribution).reduce((a, b) => a + b, 0);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>📈 学习趋势分析</h2>

            {/* 每日复习数量 */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>每日复习数量</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.dailyReviews}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '12px'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#2196f3" name="总复习数" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="correct" fill="#4caf50" name="正确数" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 正确率趋势 */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>正确率变化趋势</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.accuracyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            domain={[0, 100]}
                            label={{ value: '正确率 (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '12px'
                            }}
                            formatter={(value: any) => `${value}%`}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#4caf50"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            name="正确率"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 评分分布 */}
            <div className={styles.distributionSection}>
                <h3 className={styles.chartTitle}>评分分布</h3>
                <div className={styles.distributionContent}>
                    <div className={styles.pieChartWrapper}>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.distributionStats}>
                        {pieData.map((item) => (
                            <div key={item.name} className={styles.statItem}>
                                <div
                                    className={styles.statColor}
                                    style={{ background: COLORS[item.name as keyof typeof COLORS] }}
                                />
                                <div className={styles.statLabel}>{item.label}</div>
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
