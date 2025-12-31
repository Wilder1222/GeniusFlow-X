'use client';

import React from 'react';
import LevelProgressBar from '@/components/gamification/level-progress-bar';
import StreakCounter from '@/components/gamification/streak-counter';
import DailyTasksPanel from '@/components/gamification/daily-tasks-panel';
import AchievementList from '@/components/gamification/achievement-list';
import styles from './gamification.module.css';

export default function GamificationPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>🎮 游戏化中心</h1>

            <div className={styles.grid}>
                {/* Left Column */}
                <div className={styles.leftColumn}>
                    <LevelProgressBar />
                    <StreakCounter />
                    <DailyTasksPanel />
                </div>

                {/* Right Column */}
                <div className={styles.rightColumn}>
                    <AchievementList />
                </div>
            </div>
        </div>
    );
}
