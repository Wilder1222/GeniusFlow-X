'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useGamification } from '@/lib/contexts/gamification-context';
import styles from './level-progress.module.css';

export default function LevelProgress() {
    const { levelInfo, loading } = useGamification();
    const t = useTranslations('LevelProgress');

    if (loading || !levelInfo) {
        return (
            <div className={styles.container}>
                <div className={styles.skeleton}></div>
            </div>
        );
    }

    const { xp, level, nextLevelXp, currentLevelXp, progress } = levelInfo;
    const xpInCurrentLevel = xp - currentLevelXp;
    const xpNeededForNextLevel = nextLevelXp - currentLevelXp;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.levelBadge}>
                    <span className={styles.levelLabel}>{t('level')}</span>
                    <span className={styles.levelNumber}>{level}</span>
                </div>
                <div className={styles.xpInfo}>
                    <div className={styles.xpRow}>
                        <span className={styles.currentXP}>{xpInCurrentLevel.toLocaleString()}</span>
                        <span className={styles.xpTotal}>{t('xpProgress', { total: xpNeededForNextLevel.toLocaleString() })}</span>
                    </div>
                    <span className={styles.nextLevel}>
                        {t('nextLevel', { level: level + 1, xp: (nextLevelXp - xp).toLocaleString() })}
                    </span>
                </div>
            </div>

            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                >
                    <div className={styles.shimmer}></div>
                </div>
            </div>

            <div className={styles.footer}>
                <span className={styles.totalXpLabel}>{t('totalXp', { xp: xp.toLocaleString() })}</span>
            </div>
        </div>
    );
}
