'use client';

import React, { useState, useEffect } from 'react';
import { getStudyStats, formatStudyTime, type StudyStats } from '@/lib/stats';
import styles from './stats-display.module.css';

export interface StatsDisplayProps {
    initialStats?: StudyStats | null;
}

export function StatsDisplay({ initialStats }: StatsDisplayProps) {
    const [stats, setStats] = useState<StudyStats | null>(initialStats || null);
    const [loading, setLoading] = useState(!initialStats);

    useEffect(() => {
        if (!initialStats) {
            loadStats();
        }
    }, [initialStats]);

    const loadStats = async () => {
        try {
            const data = await getStudyStats();
            if (data) {
                setStats(data);
            } else {
                // 如果没有数据，显示默认的0值
                setStats({
                    id: '',
                    userId: '',
                    totalCardsReviewed: 0,
                    totalStudyTimeMinutes: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    lastStudyDate: null,
                    updatedAt: '',
                });
            }
        } catch (err) {
            console.error('加载统计失败:', err);
            // 出错时也显示默认的0值
            setStats({
                id: '',
                userId: '',
                totalCardsReviewed: 0,
                totalStudyTimeMinutes: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null,
                updatedAt: '',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>加载中...</div>;
    }

    // 总是显示统计，即使是0值
    const displayStats = stats || {
        totalCardsReviewed: 0,
        totalStudyTimeMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>学习统计</h3>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📚</span>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{displayStats.totalCardsReviewed}</span>
                        <span className={styles.statLabel}>已复习卡片</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statIcon}>⏱️</span>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{formatStudyTime(displayStats.totalStudyTimeMinutes)}</span>
                        <span className={styles.statLabel}>总学习时长</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🔥</span>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{displayStats.currentStreak}天</span>
                        <span className={styles.statLabel}>当前连续</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🏆</span>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{displayStats.longestStreak}天</span>
                        <span className={styles.statLabel}>最长连续</span>
                    </div>
                </div>
            </div>

            {displayStats.lastStudyDate && (
                <p className={styles.lastStudy}>
                    上次学习: {new Date(displayStats.lastStudyDate).toLocaleDateString('zh-CN')}
                </p>
            )}
        </div>
    );
}

