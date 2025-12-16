'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from '@/lib/api-client';
import styles from './forecast-panel.module.css';

interface ForecastData {
    forecast: Array<{
        date: string;
        count: number;
        byState: {
            new: number;
            learning: number;
            review: number;
            relearning: number;
        };
    }>;
    totalDue: number;
    estimatedMinutes: number;
}

export default function ForecastPanel() {
    const [data, setData] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await apiClient.get<{ success: boolean; data: ForecastData }>('/api/stats/forecast');
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to load forecast data:', error);
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

    // 准备堆叠柱状图数据
    const chartData = data.forecast.map(day => ({
        date: day.date,
        新卡片: day.byState.new,
        学习中: day.byState.learning,
        复习中: day.byState.review,
        重学中: day.byState.relearning,
        total: day.count
    }));

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>🔮 学习负荷预测</h2>

            {/* 关键指标 */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>📚</div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>未来7天待复习</div>
                        <div className={styles.metricValue}>{data.totalDue} 张</div>
                    </div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>⏱️</div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>预计学习时长</div>
                        <div className={styles.metricValue}>
                            {data.estimatedMinutes < 60
                                ? `${data.estimatedMinutes} 分钟`
                                : `${Math.floor(data.estimatedMinutes / 60)} 小时 ${data.estimatedMinutes % 60} 分钟`
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* 每日负荷预测图 */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>每日待复习卡片预测</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                const today = new Date();
                                const tomorrow = new Date(today);
                                tomorrow.setDate(tomorrow.getDate() + 1);

                                if (value === today.toISOString().split('T')[0]) return '今天';
                                if (value === tomorrow.toISOString().split('T')[0]) return '明天';
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
                        <Bar dataKey="新卡片" stackId="a" fill="#2196f3" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="学习中" stackId="a" fill="#ff9800" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="复习中" stackId="a" fill="#4caf50" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="重学中" stackId="a" fill="#f44336" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 每日详情列表 */}
            <div className={styles.detailsList}>
                <h3 className={styles.chartTitle}>每日详情</h3>
                {data.forecast.map((day, index) => {
                    const date = new Date(day.date);
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    let dateLabel = `${date.getMonth() + 1}月${date.getDate()}日`;
                    if (day.date === today.toISOString().split('T')[0]) dateLabel = '今天';
                    else if (day.date === tomorrow.toISOString().split('T')[0]) dateLabel = '明天';

                    return (
                        <div key={day.date} className={styles.detailItem}>
                            <div className={styles.detailDate}>{dateLabel}</div>
                            <div className={styles.detailCount}>{day.count} 张</div>
                            <div className={styles.detailBreakdown}>
                                {day.byState.new > 0 && <span className={styles.badge} style={{ background: '#2196f3' }}>新 {day.byState.new}</span>}
                                {day.byState.learning > 0 && <span className={styles.badge} style={{ background: '#ff9800' }}>学 {day.byState.learning}</span>}
                                {day.byState.review > 0 && <span className={styles.badge} style={{ background: '#4caf50' }}>复 {day.byState.review}</span>}
                                {day.byState.relearning > 0 && <span className={styles.badge} style={{ background: '#f44336' }}>重 {day.byState.relearning}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
