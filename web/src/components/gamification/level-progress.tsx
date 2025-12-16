'use client';

import { useEffect, useState } from 'react';
import styles from './level-progress.module.css';

interface LevelProgressProps {
    xp: number;
    level: number;
}

// Calculate XP needed for next level
function getXPForLevel(level: number): number {
    return level * level * 100;
}

export default function LevelProgress({ xp, level }: LevelProgressProps) {
    const currentLevelXP = getXPForLevel(level);
    const nextLevelXP = getXPForLevel(level + 1);
    const xpInCurrentLevel = xp - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
    const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.levelBadge}>
                    <span className={styles.levelLabel}>Level</span>
                    <span className={styles.levelNumber}>{level}</span>
                </div>
                <div className={styles.xpInfo}>
                    <span className={styles.currentXP}>{xp.toLocaleString()} XP</span>
                    <span className={styles.nextLevel}>
                        {(nextLevelXP - xp).toLocaleString()} to Level {level + 1}
                    </span>
                </div>
            </div>

            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
        </div>
    );
}
