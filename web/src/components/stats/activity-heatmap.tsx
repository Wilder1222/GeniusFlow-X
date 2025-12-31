'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useStats } from '@/lib/contexts/stats-context';
import styles from './activity-heatmap.module.css';

interface HeatmapData {
    date: string;
    count: number;
}

export default function ActivityHeatmap() {
    const { heatmap: data, loading } = useStats();
    const t = useTranslations('StatsCharts');

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

    // Group days by week (starting from Sunday)
    const groupByWeeks = (days: { date: string; count: number }[]) => {
        const weeks: { date: string; count: number }[][] = [];
        let currentWeek: { date: string; count: number }[] = [];

        // Pad the first week if it doesn't start on Sunday
        if (days.length > 0) {
            const firstDate = new Date(days[0].date);
            const firstDayOfWeek = firstDate.getDay();
            // Add empty placeholders for days before the first day
            for (let i = 0; i < firstDayOfWeek; i++) {
                currentWeek.push({ date: '', count: -1 }); // -1 indicates empty placeholder
            }
        }

        days.forEach((day, index) => {
            const date = new Date(day.date);
            const dayOfWeek = date.getDay();

            // Start new week on Sunday (but not for the first week with placeholders)
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

    // Calculate month labels with their positions
    const getMonthLabels = () => {
        const days = generateDays();
        const weeks = groupByWeeks(days);
        const monthLabels: { month: string; weekIndex: number }[] = [];
        const monthNames = t('monthLabels') as unknown as string[];
        let lastYearMonth = '';

        weeks.forEach((week, weekIndex) => {
            // Find the first valid day in the week (skip placeholders)
            for (const day of week) {
                if (day.count === -1 || !day.date) continue;

                const date = new Date(day.date);
                const year = date.getFullYear();
                const month = date.getMonth();
                const yearMonth = `${year}-${month}`;

                if (yearMonth !== lastYearMonth) {
                    monthLabels.push({
                        month: monthNames[month],
                        weekIndex: weekIndex,
                    });
                    lastYearMonth = yearMonth;
                }
                break;
            }
        });

        // Always skip the first month label to avoid showing partial month at the start
        // This also prevents showing duplicate month names (like 12月 at both ends)
        const displayLabels = (monthLabels.length > 0 && monthLabels[0].month === (t('monthLabels') as unknown as string[])[11])
            ? monthLabels.slice(1)
            : monthLabels;

        return { monthLabels: displayLabels, totalWeeks: weeks.length };
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>{t('activityHeatmap')}</h3>
                <div className={styles.loading}>{t('loadingActivity')}</div>
            </div>
        );
    }

    const days = generateDays();
    const weeks = groupByWeeks(days);
    const totalActivity = data.reduce((sum, d) => sum + d.count, 0);
    const { monthLabels, totalWeeks } = getMonthLabels();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('activityHeatmap')}</h2>
                <div className={styles.summary}>
                    {t('pastYearReviews', { count: totalActivity })}
                </div>
            </div>

            <div className={styles.heatmap}>
                {/* Dynamic month labels positioned based on actual weeks */}
                <div className={styles.months}>
                    {monthLabels.map((label, i) => (
                        <span
                            key={i}
                            className={styles.month}
                            style={{
                                position: 'absolute',
                                left: `${(label.weekIndex / totalWeeks) * 100}%`
                            }}
                        >
                            {label.month}
                        </span>
                    ))}
                </div>

                <div className={styles.grid}>
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className={styles.week}>
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className={styles.day}
                                    style={{
                                        backgroundColor: day.count === -1 ? 'transparent' : getColor(day.count),
                                        visibility: day.count === -1 ? 'hidden' : 'visible'
                                    }}
                                    title={day.date ? `${day.date}: ${day.count} ${t('reviews')}` : ''}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <div className={styles.legend}>
                    <span>{t('less')}</span>
                    <div className={styles.legendColors}>
                        <div style={{ backgroundColor: 'var(--heatmap-empty)' }} />
                        <div style={{ backgroundColor: 'var(--heatmap-low)' }} />
                        <div style={{ backgroundColor: 'var(--heatmap-medium)' }} />
                        <div style={{ backgroundColor: 'var(--heatmap-high)' }} />
                        <div style={{ backgroundColor: 'var(--heatmap-very-high)' }} />
                    </div>
                    <span>{t('more')}</span>
                </div>
            </div>
        </div>
    );
}
