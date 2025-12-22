'use client';

import React, { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Customized } from 'recharts';
import { apiClient } from '@/lib/api-client';
import styles from './skill-radar-chart.module.css';

interface SkillData {
    memory: number;      // 记忆力
    focus: number;       // 专注力
    persistence: number; // 坚持力
    efficiency: number;  // 效率
    accuracy: number;    // 正确率
    studyTime: number;   // 学习时长
}

// Ability colors - Premium palette
const ABILITY_COLORS = {
    memory: '#4ecdc4',      // Cyan
    focus: '#ff6b6b',       // Coral
    persistence: '#ffe66d', // Yellow
    efficiency: '#1a535c',  // Deep Teal
    accuracy: '#ff9f43',    // Orange
    studyTime: '#a55eea'    // Purple
};

export default function SkillRadarChart() {
    const [skills, setSkills] = useState<SkillData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [streakRes, learningRes, summaryRes, retentionRes] = await Promise.all([
                apiClient.get('/api/stats/streak'),
                apiClient.get('/api/stats/learning'),
                apiClient.get('/api/stats/summary'),
                apiClient.get('/api/stats/retention')
            ]);

            if (streakRes.success && learningRes.success && summaryRes.success && retentionRes.success) {
                const streak = streakRes.data;
                const learning = learningRes.data;
                const summary = summaryRes.data;
                const retention = retentionRes.data;

                const memory = Math.min(100, (retention.retention7d || 0));
                const focus = Math.min(100, (streak.currentStreak || 0) * 5);
                const persistence = Math.min(100, (summary.studyTime || 0) / 10);
                const efficiency = Math.min(100, ((summary.totalReviews || 0) / Math.max(1, summary.studyTime || 1)) * 5);
                const accuracy = Math.min(100, learning.averageAccuracy || 0);
                const studyTime = Math.min(100, (summary.studyTime || 0) / 5);

                setSkills({
                    memory,
                    focus,
                    persistence,
                    efficiency,
                    accuracy,
                    studyTime
                });
            }
        } catch (error) {
            console.error('Failed to load skill radar data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>加载中...</span>
                </div>
            </div>
        );
    }

    if (!skills) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>暂无数据</div>
            </div>
        );
    }

    const radarData = [
        { subject: '记忆力', value: skills.memory, fullMark: 100, color: ABILITY_COLORS.memory },
        { subject: '专注力', value: skills.focus, fullMark: 100, color: ABILITY_COLORS.focus },
        { subject: '坚持力', value: skills.persistence, fullMark: 100, color: ABILITY_COLORS.persistence },
        { subject: '效率', value: skills.efficiency, fullMark: 100, color: ABILITY_COLORS.efficiency },
        { subject: '正确率', value: skills.accuracy, fullMark: 100, color: ABILITY_COLORS.accuracy },
        { subject: '学习时长', value: skills.studyTime, fullMark: 100, color: ABILITY_COLORS.studyTime },
    ];

    const totalScore = Object.values(skills).reduce((sum, val) => sum + val, 0) / 6;

    // Custom Dot Component to render multiple colors
    const CustomDot = (props: any) => {
        const { cx, cy, index } = props;
        return (
            <circle
                cx={cx}
                cy={cy}
                r={6}
                stroke="#fff"
                strokeWidth={2}
                fill={radarData[index].color}
            />
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>⚡ 能力雷达图</h2>
                <div className={styles.overallScore}>
                    <span className={styles.scoreLabel}>综合评分</span>
                    <span className={styles.scoreValue}>{totalScore.toFixed(1)}</span>
                </div>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                        <PolarGrid
                            stroke="var(--radar-grid, #e0e0e0)"
                            strokeWidth={1.5}
                            gridType="polygon"
                        />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{
                                fill: 'var(--color-text-primary)',
                                fontSize: 13,
                                fontWeight: 500
                            }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="能力值"
                            dataKey="value"
                            stroke="var(--primary-color)"
                            strokeWidth={2}
                            fill="var(--primary-color)"
                            fillOpacity={0.2}
                            dot={<CustomDot />}
                            isAnimationActive={true}
                            animationDuration={1500}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--tooltip-bg, rgba(255, 255, 255, 0.95))',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '12px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}
                            cursor={false} // clean look
                            formatter={(value: any) => [`${value.toFixed(1)}`, '能力值']}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className={styles.skillsGrid}>
                {radarData.map((item, index) => (
                    <div key={index} className={styles.skillItem}>
                        <div className={styles.skillHeader}>
                            <div className={styles.skillDot} style={{ backgroundColor: item.color }}></div>
                            <div className={styles.skillName}>{item.subject}</div>
                        </div>
                        <div className={styles.skillBar}>
                            <div
                                className={styles.skillBarFill}
                                style={{
                                    width: `${item.value}%`,
                                    backgroundColor: item.color,
                                    animationDelay: `${index * 0.1}s`
                                }}
                            ></div>
                        </div>
                        <div className={styles.skillValue} style={{ color: item.color }}>{item.value.toFixed(1)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
