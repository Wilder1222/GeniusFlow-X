'use client';

import { useEffect, useState, useMemo } from 'react';
import { useStats } from '@/lib/contexts/stats-context';
import { motion } from 'framer-motion';
import {
    LuActivity,
    LuZap,
    LuTarget,
    LuFlame,
    LuTrophy,
    LuClock,
    LuRefreshCw,
    LuBrain
} from 'react-icons/lu';
import styles from './stats-dashboard.module.css';

// Counter component for numeric values
const Counter = ({ value, duration = 1 }: { value: number | string; duration?: number }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    const suffix = typeof value === 'string' ? value.replace(/[0-9.]/g, '') : '';

    useEffect(() => {
        let start = 0;
        const end = numericValue;
        if (start === end) return;

        let totalMiliseconds = duration * 1000;
        let incrementTime = (totalMiliseconds / end) > 10 ? (totalMiliseconds / end) : 10;

        let timer = setInterval(() => {
            start += Math.ceil(end / (totalMiliseconds / incrementTime));
            if (start >= end) {
                setDisplayValue(end);
                clearInterval(timer);
            } else {
                setDisplayValue(start);
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [numericValue, duration]);

    return <span>{displayValue}{suffix}</span>;
};

// Embedded Heatmap component
interface HeatmapData {
    date: string;
    count: number;
}

interface StatsDashboardProps {
    isStatsPage?: boolean;
}

function EmbeddedHeatmap({ isStatsPage }: { isStatsPage?: boolean }) {
    const { heatmap: data, loading } = useStats();

    const generateDays = () => {
        const days: { date: string; count: number }[] = [];
        const today = new Date();

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = data.find(d => d.date === dateStr);
            days.push({ date: dateStr, count: dayData?.count || 0 });
        }
        return days;
    };

    const getColor = (count: number): string => {
        if (count === 0) return 'var(--heatmap-empty)';
        if (count < 5) return 'var(--heatmap-low)';
        if (count < 10) return 'var(--heatmap-medium)';
        if (count < 20) return 'var(--heatmap-high)';
        return 'var(--heatmap-very-high)';
    };

    const groupByWeeks = (days: { date: string; count: number }[]) => {
        const weeks: { date: string; count: number }[][] = [];
        let currentWeek: { date: string; count: number }[] = [];

        if (days.length > 0) {
            const firstDate = new Date(days[0].date);
            const firstDayOfWeek = firstDate.getDay();
            for (let i = 0; i < firstDayOfWeek; i++) {
                currentWeek.push({ date: '', count: -1 });
            }
        }

        days.forEach((day, index) => {
            const date = new Date(day.date);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 && currentWeek.length > 0) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            currentWeek.push(day);
            if (index === days.length - 1) {
                weeks.push(currentWeek);
            }
        });
        return weeks;
    };

    const getMonthLabels = useMemo(() => {
        const days = generateDays();
        const weeks = groupByWeeks(days);
        const monthLabels: { month: string; weekIndex: number }[] = [];
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        let lastYearMonth = '';

        weeks.forEach((week, weekIndex) => {
            for (const day of week) {
                if (day.count === -1 || !day.date) continue;
                const date = new Date(day.date);
                const year = date.getFullYear();
                const month = date.getMonth();
                const yearMonth = `${year}-${month}`;

                if (yearMonth !== lastYearMonth) {
                    monthLabels.push({ month: monthNames[month], weekIndex });
                    lastYearMonth = yearMonth;
                }
                break;
            }
        });

        const displayLabels = (monthLabels.length > 0 && monthLabels[0].month === '12月')
            ? monthLabels.slice(1)
            : monthLabels;

        return { monthLabels: displayLabels, totalWeeks: weeks.length };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    if (loading) {
        return <div className={styles.heatmapLoading}>加载活跃度数据...</div>;
    }

    const days = generateDays();
    const weeks = groupByWeeks(days);
    const totalActivity = data.reduce((sum, d) => sum + d.count, 0);
    const { monthLabels, totalWeeks } = getMonthLabels;

    const heatmapWidth = totalWeeks * 12;

    return (
        <div className={styles.heatmapContainer}>
            <div className={styles.heatmapHeader}>
                <span className={styles.heatmapTitle}>学习活跃度</span>
                <span className={styles.heatmapSummary}>过去一年 {totalActivity} 次复习</span>
            </div>
            <div className={styles.heatmapContent}>
                <div
                    className={styles.heatmapMonths}
                    style={isStatsPage ? { width: '100%' } : { minWidth: `${heatmapWidth}px`, width: `${heatmapWidth}px` }}
                >
                    {monthLabels.map((label, i) => (
                        <span
                            key={i}
                            style={{
                                position: 'absolute',
                                left: isStatsPage
                                    ? `${(label.weekIndex / totalWeeks) * 100}%`
                                    : `${label.weekIndex * 12}px`,
                            }}
                        >
                            {label.month}
                        </span>
                    ))}
                </div>
                <div
                    className={styles.heatmapGrid}
                    style={isStatsPage ? { width: '100%', justifyContent: 'space-between' } : {}}
                >
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className={styles.heatmapWeek} style={isStatsPage ? { flex: 1 } : {}}>
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className={styles.heatmapDay}
                                    style={{
                                        backgroundColor: day.count === -1 ? 'transparent' : getColor(day.count),
                                        visibility: day.count === -1 ? 'hidden' : 'visible',
                                        width: isStatsPage ? '100%' : undefined,
                                        height: isStatsPage ? 'auto' : undefined,
                                        aspectRatio: isStatsPage ? '1' : undefined
                                    }}
                                    title={day.date ? `${day.date}: ${day.count} 次复习` : ''}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                <div className={styles.heatmapLegend}>
                    <span>少</span>
                    <div className={styles.legendColors}>
                        <div style={{ backgroundColor: 'var(--heatmap-empty)' }} />
                        <div style={{ backgroundColor: 'var(--heatmap-low)' }} />
                        <div style={{ backgroundColor: 'var(--heatmap-medium)' }} />
                        <div style={{ backgroundColor: 'var(--heatmap-high)' }} />
                        <div style={{ backgroundColor: 'var(--heatmap-very-high)' }} />
                    </div>
                    <span>多</span>
                </div>
            </div>
        </div>
    );
}

export default function StatsDashboard({ isStatsPage }: StatsDashboardProps) {
    const { summary, streak, learning, activity, loading, refresh } = useStats();

    // Landing page inspired colors
    const indicators = [
        {
            label: '今天复习',
            value: activity?.today || 0,
            target: 50,
            icon: <LuActivity />,
            color: '#ff6b6b', // Coral
            unit: '张'
        },
        {
            label: '专注时长',
            value: summary?.studyTime || 0,
            target: 60,
            icon: <LuClock />,
            color: '#f06595', // Pink
            unit: 'm'
        },
        {
            label: '正确率',
            value: learning?.averageAccuracy || 0,
            target: 100,
            icon: <LuTarget />,
            color: '#cc5de8', // Purple
            unit: '%'
        }
    ];

    const secondaryStats = [
        {
            label: '当前连胜',
            value: streak?.currentStreak || 0,
            icon: <LuFlame />,
            color: '#ff6b6b',
            unit: '天'
        },
        {
            label: '最高纪录',
            value: streak?.longestStreak || 0,
            icon: <LuTrophy />,
            color: '#f06595',
            unit: '天'
        },
        {
            label: '总卡片数',
            value: summary?.totalCards || 0,
            icon: <LuBrain />,
            color: '#cc5de8',
            unit: '张'
        }
    ];

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <LuZap className={styles.zapIcon} />
                        <h2 className={styles.title}>今日动力</h2>
                    </div>
                    <button className={styles.refreshBtn} disabled>
                        <LuRefreshCw className={styles.refreshIcon} />
                        同步
                    </button>
                </div>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>正在同步学习数据...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <LuZap className={styles.zapIcon} />
                    </motion.div>
                    <h2 className={styles.title}>今日动力</h2>
                </div>
                <motion.button
                    onClick={refresh}
                    className={styles.refreshBtn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <LuRefreshCw className={styles.refreshIcon} />
                    同步
                </motion.button>
            </div>

            {/* New Layout: Left 2/3 (Rings + Heatmap) | Right 1/3 (Secondary Stats) */}
            <div className={styles.mainLayout}>
                {/* Left Section: Ring Cards + Heatmap */}
                <div className={styles.leftSection}>
                    {/* Ring Cards */}
                    <div className={styles.ringGrid}>
                        {indicators.map((item, index) => {
                            const progress = Math.min(item.value / item.target, 1);
                            const circumference = 2 * Math.PI * 34;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        delay: index * 0.15,
                                        duration: 0.5,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    whileHover={{
                                        scale: 1.05,
                                        y: -5,
                                        transition: { duration: 0.2 }
                                    }}
                                    className={styles.indicatorCard}
                                    style={{ '--accent-color': item.color } as React.CSSProperties}
                                >
                                    <div className={styles.ringContainer}>
                                        <svg className={styles.svg} viewBox="0 0 80 80">
                                            <circle
                                                className={styles.ringTrack}
                                                cx="40"
                                                cy="40"
                                                r="34"
                                            />
                                            <motion.circle
                                                className={styles.ringFill}
                                                cx="40"
                                                cy="40"
                                                r="34"
                                                initial={{ strokeDashoffset: circumference }}
                                                animate={{
                                                    strokeDashoffset: circumference - (circumference * progress)
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    ease: "easeOut",
                                                    delay: index * 0.2 + 0.3
                                                }}
                                                style={{
                                                    strokeDasharray: circumference,
                                                    stroke: item.color
                                                }}
                                            />
                                        </svg>
                                        <motion.div
                                            className={styles.ringIcon}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                                delay: index * 0.15 + 0.4,
                                                type: "spring",
                                                stiffness: 200
                                            }}
                                            style={{ color: item.color }}
                                        >
                                            {item.icon}
                                        </motion.div>
                                    </div>
                                    <div className={styles.indicatorInfo}>
                                        <div className={styles.indicatorLabel}>{item.label}</div>
                                        <div className={styles.indicatorValue}>
                                            <Counter value={item.value} duration={1.5} />
                                            <span className={styles.unit}>{item.unit}</span>
                                        </div>
                                        <div className={styles.progressText}>
                                            {Math.round(progress * 100)}% 完成
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Embedded Heatmap */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <EmbeddedHeatmap isStatsPage={isStatsPage} />
                    </motion.div>
                </div>

                {/* Right Section: Secondary Stats (Stacked Vertically) */}
                <div className={styles.rightSection}>
                    {secondaryStats.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className={styles.statCard}
                            whileHover={{
                                scale: 1.02,
                                transition: { duration: 0.2 }
                            }}
                            style={{ '--accent-color': item.color } as React.CSSProperties}
                        >
                            <div className={styles.statIcon} style={{ color: item.color }}>
                                {item.icon}
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statValue}>
                                    <Counter value={item.value} duration={1.2} />
                                    <span className={styles.statUnit}>{item.unit}</span>
                                </div>
                                <div className={styles.statLabel}>{item.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
