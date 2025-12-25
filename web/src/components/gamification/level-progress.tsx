'use client';

import React from 'react';
import { useGamification } from '@/lib/contexts/gamification-context';
import styles from './level-progress.module.css';

export default function LevelProgress() {
    const { levelInfo, loading } = useGamification();

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
                    <span className={styles.levelLabel}>等级</span>
                    <span className={styles.levelNumber}>{level}</span>
                </div>
                <div className={styles.xpInfo}>
                    <div className={styles.xpRow}>
                        <span className={styles.currentXP}>{xpInCurrentLevel.toLocaleString()}</span>
                        <span className={styles.xpTotal}>/ {xpNeededForNextLevel.toLocaleString()} XP</span>
                    </div>
                    <span className={styles.nextLevel}>
                        距离 Lv.{level + 1} 还差 {(nextLevelXp - xp).toLocaleString()} XP
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
                <span className={styles.totalXpLabel}>总经验值: {xp.toLocaleString()} XP</span>
            </div>
        </div>
    );
}
