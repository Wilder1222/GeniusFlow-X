'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslations } from 'next-intl';
import { useStats } from '@/lib/contexts/stats-context';
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
    const { forecast: data, loading } = useStats();
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

    // 准备堆叠柱状图数据
    const chartData = data.forecast.map(day => ({
        date: day.date,
        [t('newLong')]: day.byState.new,
        [t('learningLong')]: day.byState.learning,
        [t('reviewLong')]: day.byState.review,
        [t('relearningLong')]: day.byState.relearning,
        total: day.count
    }));

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{t('loadForecast')}</h2>

            {/* 关键指标 */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>📚</div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>{t('dueNext7Days')}</div>
                        <div className={styles.metricValue}>{data.totalDue} {t('cards')}</div>
                    </div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>⏱️</div>
                    <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>{t('estimatedTime')}</div>
                        <div className={styles.metricValue}>
                            {data.estimatedMinutes < 60
                                ? `${data.estimatedMinutes} ${t('minutes')}`
                                : `${Math.floor(data.estimatedMinutes / 60)} ${t('hour')} ${data.estimatedMinutes % 60} ${t('minutes')}`
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* 每日负荷预测图 */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>{t('dailyForecast')}</h3>
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

                                if (value === today.toISOString().split('T')[0]) return t('today');
                                if (value === tomorrow.toISOString().split('T')[0]) return t('tomorrow');
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
                        <Bar dataKey={t('newLong')} stackId="a" fill="#2196f3" radius={[0, 0, 0, 0]} />
                        <Bar dataKey={t('learningLong')} stackId="a" fill="#ff9800" radius={[0, 0, 0, 0]} />
                        <Bar dataKey={t('reviewLong')} stackId="a" fill="#4caf50" radius={[0, 0, 0, 0]} />
                        <Bar dataKey={t('relearningLong')} stackId="a" fill="#f44336" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 每日详情列表 */}
            <div className={styles.detailsList}>
                <h3 className={styles.chartTitle}>{t('dailyDetails')}</h3>
                {data.forecast.map((day, index) => {
                    const date = new Date(day.date);
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    let dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
                    if (day.date === today.toISOString().split('T')[0]) dateLabel = t('today');
                    else if (day.date === tomorrow.toISOString().split('T')[0]) dateLabel = t('tomorrow');

                    return (
                        <div key={day.date} className={styles.detailItem}>
                            <div className={styles.detailDate}>{dateLabel}</div>
                            <div className={styles.detailCount}>{day.count} {t('cards')}</div>
                            <div className={styles.detailBreakdown}>
                                {day.byState.new > 0 && <span className={styles.badge} style={{ background: '#2196f3' }}>{t('newShort')} {day.byState.new}</span>}
                                {day.byState.learning > 0 && <span className={styles.badge} style={{ background: '#ff9800' }}>{t('learningShort')} {day.byState.learning}</span>}
                                {day.byState.review > 0 && <span className={styles.badge} style={{ background: '#4caf50' }}>{t('reviewShort')} {day.byState.review}</span>}
                                {day.byState.relearning > 0 && <span className={styles.badge} style={{ background: '#f44336' }}>{t('relearningShort')} {day.byState.relearning}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
