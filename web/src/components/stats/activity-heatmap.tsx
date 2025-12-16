'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import styles from './activity-heatmap.module.css';

interface HeatmapData {
    date: string;
    count: number;
}

export default function ActivityHeatmap() {
    const [data, setData] = useState<HeatmapData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHeatmapData();
    }, []);

    const fetchHeatmapData = async () => {
        try {
            const result = await apiClient.get('/api/stats/heatmap');
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch heatmap data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate last 365 days
    const generateDays = () => {
        const days: { date: string; count: number }[] = [];
        const today = new Date();

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayData = data.find(d => d.date === dateStr);
            days.push({
                date: dateStr,
                count: dayData?.count || 0
            });
        }

        return days;
    };

    // Get color intensity based on count
    const getColor = (count: number): string => {
        if (count === 0) return 'var(--heatmap-empty)';
        if (count < 5) return 'var(--heatmap-low)';
        if (count < 10) return 'var(--heatmap-medium)';
        if (count < 20) return 'var(--heatmap-high)';
        return 'var(--heatmap-very-high)';
    };

    // Group days by week
    const groupByWeeks = (days: { date: string; count: number }[]) => {
        const weeks: { date: string; count: number }[][] = [];
        let currentWeek: { date: string; count: number }[] = [];

        days.forEach((day, index) => {
            const date = new Date(day.date);
            const dayOfWeek = date.getDay();

            // Start new week on Sunday
            if (dayOfWeek === 0 && currentWeek.length > 0) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            currentWeek.push(day);

            // Last day
            if (index === days.length - 1) {
                weeks.push(currentWeek);
            }
        });

        return weeks;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>Activity</h3>
                <div className={styles.loading}>Loading activity data...</div>
            </div>
        );
    }

    const days = generateDays();
    const weeks = groupByWeeks(days);
    const totalActivity = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Activity</h3>
                <span className={styles.summary}>{totalActivity} reviews in the last year</span>
            </div>

            <div className={styles.heatmap}>
                <div className={styles.months}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                        <span key={i} className={styles.month}>{month}</span>
                    ))}
                </div>

                <div className={styles.grid}>
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className={styles.week}>
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className={styles.day}
                                    style={{ backgroundColor: getColor(day.count) }}
                                    title={`${day.date}: ${day.count} reviews`}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <div className={styles.legend}>
                    <span>Less</span>
                    <div className={styles.legendColors}>
                        <div className={styles.legendColor} style={{ backgroundColor: 'var(--heatmap-empty)' }} />
                        <div className={styles.legendColor} style={{ backgroundColor: 'var(--heatmap-low)' }} />
                        <div className={styles.legendColor} style={{ backgroundColor: 'var(--heatmap-medium)' }} />
                        <div className={styles.legendColor} style={{ backgroundColor: 'var(--heatmap-high)' }} />
                        <div className={styles.legendColor} style={{ backgroundColor: 'var(--heatmap-very-high)' }} />
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}
