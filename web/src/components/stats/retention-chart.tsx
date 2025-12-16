'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>📊 留存率分析</h2>

            {/* 关键指标 */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>24小时留存</div>
                    <div className={styles.metricValue}>{data.retention24h}%</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>7天留存</div>
                    <div className={styles.metricValue}>{data.retention7d}%</div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>30天留存</div>
                    <div className={styles.metricValue}>{data.retention30d}%</div>
                </div>
            </div>

            {/* 留存率趋势图 */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>30天留存率趋势</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.chartData}>
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
                            label={{ value: '留存率 (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '12px'
                            }}
                            formatter={(value: any, name: any) => {
                                if (name === 'rate') return [`${value}%`, '留存率'];
                                return [value, '复习数'];
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="rate"
                            stroke="#2196f3"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                            name="留存率"
                        />
                    </LineChart>
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
                        const colors: Record<string, string> = {
                            again: '#f44336',
                            hard: '#ff9800',
                            good: '#4caf50',
                            easy: '#2196f3'
                        };
                        return (
                            <div key={key} className={styles.difficultyCard}>
                                <div className={styles.difficultyLabel} style={{ color: colors[key] }}>
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
