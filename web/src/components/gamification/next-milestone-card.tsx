'use client';

import React from 'react';
import { Target, Trophy, ArrowRight } from 'lucide-react';
import { useGamification } from '@/lib/contexts/gamification-context';
import styles from './next-milestone-card.module.css';

export default function NextMilestoneCard() {
    const { levelInfo, loading } = useGamification();

    if (loading || !levelInfo) return null;

    const xpToNextLevel = levelInfo.nextLevelXp - levelInfo.xp;

    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <Trophy className={styles.icon} />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>下一目标</h3>
                <p className={styles.description}>
                    距离达到 <span className={styles.highlight}>等级 {levelInfo.level + 1}</span> 还剩
                    <span className={styles.highlight}> {xpToNextLevel} XP</span>
                </p>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${levelInfo.progress}%` }}
                    />
                </div>
            </div>
            <div className={styles.action}>
                <ArrowRight className={styles.arrow} />
            </div>
        </div>
    );
}
