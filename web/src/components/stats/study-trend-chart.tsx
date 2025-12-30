'use client';

import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useStats } from '@/lib/contexts/stats-context';
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
    const { charts: data, loading } = useStats();

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

    // Rating Colors based on Study Card design
    const RATING_COLORS = {
        again: '#ff6b6b',     // 忘记 - Red
        hard: '#ffc93c',      // 困难 - Orange/Yellow
        good: '#5eb5ef',      // 一般 - Blue
        easy: '#4ecdc4'       // 简单 - Green/Teal
    };

    const DISTRIBUTION_COLORS = RATING_COLORS;

    // 准备饼图数据
    const pieData = Object.entries(data.ratingDistribution).map(([key, value]) => ({
        name: key,
        value,
        label: { again: '再来', hard: '困难', good: '良好', easy: '简单' }[key]
    }));

    const totalReviews = Object.values(data.ratingDistribution).reduce((a, b) => a + b, 0);

    const CustomLegend = (props: { payload?: Array<{ value: string; color: string }> }) => {
        const { payload } = props;
        if (!payload) return null;
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
            <h2 className={styles.title}>📈 学习趋势分析</h2>

            {/* 每日复习数量 */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>每日复习数量</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data.dailyReviews}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={LANDING_COLORS.coral} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={LANDING_COLORS.coral} stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={LANDING_COLORS.pink} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={LANDING_COLORS.pink} stopOpacity={0.05} />
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
                        />
                        <Legend content={<CustomLegend />} />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke={LANDING_COLORS.coral}
                            strokeWidth={3}
                            fill="url(#colorCount)"
                            name="总复习"
                            animationBegin={0}
                            animationDuration={1200}
                        />
                        <Area
                            type="monotone"
                            dataKey="correct"
                            stroke={LANDING_COLORS.pink}
                            strokeWidth={3}
                            fill="url(#colorCorrect)"
                            name="正确"
                            animationBegin={200}
                            animationDuration={1200}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* 正确率趋势 */}
            <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>正确率变化趋势</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data.accuracyTrend}>
                        <defs>
                            <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={LANDING_COLORS.purple} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={LANDING_COLORS.purple} stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: 'var(--chart-text-secondary)' }}
                            tickFormatter={(value: string) => {
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
                            dataKey="accuracy"
                            stroke={LANDING_COLORS.purple}
                            strokeWidth={3}
                            fill="url(#colorAccuracy)"
                            name="正确率"
                            animationBegin={0}
                            animationDuration={1500}
                        />
                    </AreaChart>
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
                                        background: 'var(--chart-tooltip-bg, rgba(26, 26, 62, 0.95))',
                                        border: '1px solid var(--chart-tooltip-border, rgba(255, 255, 255, 0.1))',
                                        borderRadius: '14px',
                                        padding: '12px 16px',
                                        boxShadow: 'var(--chart-tooltip-shadow, 0 8px 32px rgba(0, 0, 0, 0.3))',
                                        backdropFilter: 'blur(12px)',
                                    }}
                                    itemStyle={{
                                        color: 'var(--chart-text, #f5f5f7)',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                    }}
                                    formatter={(value: any, name: any, props: any) => {
                                        const labels: Record<string, string> = { again: '忘记', hard: '困难', good: '良好', easy: '简单' };
                                        const color = DISTRIBUTION_COLORS[props.payload.name as keyof typeof DISTRIBUTION_COLORS];
                                        return [
                                            <span key="v" style={{ color, fontWeight: 700, fontSize: '16px' }}>{value}</span>,
                                            labels[props.payload.name] || props.payload.name
                                        ];
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
