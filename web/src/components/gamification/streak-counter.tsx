'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import styles from './streak-counter.module.css';

interface StreakInfo {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string;
}

export default function StreakCounter() {
    const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStreakInfo();
    }, []);

    const loadStreakInfo = async () => {
        try {
            // Get from profile
            const result = await apiClient.get<{ success: boolean; data: any }>('/api/profile');
            if (result.success && result.data) {
                setStreakInfo({
                    currentStreak: result.data.current_streak || 0,
                    longestStreak: result.data.longest_streak || 0,
                    lastStudyDate: result.data.last_study_date || ''
                });
            }
        } catch (error) {
            console.error('Failed to load streak info:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !streakInfo) {
        return null;
    }

    const isActive = streakInfo.currentStreak > 0;
    const today = new Date().toISOString().split('T')[0];
    const studiedToday = streakInfo.lastStudyDate === today;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={`${styles.fireIcon} ${isActive ? styles.active : ''}`}>
                    🔥
                </div>
                <div className={styles.info}>
                    <div className={styles.label}>学习连胜</div>
                    <div className={styles.streakValue}>
                        {streakInfo.currentStreak} 天
                    </div>
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>最长记录</span>
                    <span className={styles.statValue}>{streakInfo.longestStreak} 天</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>今日状态</span>
                    <span className={`${styles.statusBadge} ${studiedToday ? styles.completed : styles.pending}`}>
                        {studiedToday ? '✅ 已完成' : '⏳ 待学习'}
                    </span>
                </div>
            </div>

            {!studiedToday && streakInfo.currentStreak > 0 && (
                <div className={styles.warning}>
                    ⚠️ 今天还没学习，连胜即将中断！
                </div>
            )}
        </div>
    );
}
