'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api-client';
import styles from './streak-counter.module.css';

interface StreakInfo {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string;
}

export default function StreakCounter() {
    const t = useTranslations('Gamification');
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
                    <div className={styles.label}>{t('studyStreak')}</div>
                    <div className={styles.streakValue}>
                        {streakInfo.currentStreak} {t('days')}
                    </div>
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t('longestStreak')}</span>
                    <span className={styles.statValue}>{streakInfo.longestStreak} {t('days')}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t('todayStatus')}</span>
                    <span className={`${styles.statusBadge} ${studiedToday ? styles.completed : styles.pending}`}>
                        {studiedToday ? t('studiedToday') : t('pendingStudy')}
                    </span>
                </div>
            </div>

            {!studiedToday && streakInfo.currentStreak > 0 && (
                <div className={styles.warning}>
                    {t('streakWarning')}
                </div>
            )}
        </div>
    );
}
