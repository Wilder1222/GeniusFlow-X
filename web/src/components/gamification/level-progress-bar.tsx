'use client';

import React from 'react';
import confetti from 'canvas-confetti';
import { useGamification } from '@/lib/contexts/gamification-context';
import styles from './level-progress-bar.module.css';

export default function LevelProgressBar() {
    const { levelInfo, loading } = useGamification();

    const triggerLevelUpAnimation = () => {
        // 五彩纸屑动画
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    if (loading || !levelInfo) {
        return (
            <div className={styles.container}>
                <div className={styles.skeleton}></div>
            </div>
        );
    }

    const xpInCurrentLevel = levelInfo.xp - levelInfo.currentLevelXp;
    const xpNeededForNextLevel = levelInfo.nextLevelXp - levelInfo.currentLevelXp;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.levelBadge}>
                    <span className={styles.levelLabel}>等级</span>
                    <span className={styles.levelNumber}>{levelInfo.level}</span>
                </div>
                <div className={styles.xpInfo}>
                    <span className={styles.xpCurrent}>{xpInCurrentLevel.toLocaleString()}</span>
                    <span className={styles.xpSeparator}>/</span>
                    <span className={styles.xpTarget}>{xpNeededForNextLevel.toLocaleString()} XP</span>
                </div>
            </div>

            <div className={styles.progressBarContainer}>
                <div
                    className={styles.progressBarFill}
                    style={{ width: `${levelInfo.progress}%` }}
                >
                    <div className={styles.progressBarGlow}></div>
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.nextLevelInfo}>
                    距离下一级还需 {levelInfo.nextLevelXp - levelInfo.xp} XP
                </div>
                <div className={styles.totalXp}>
                    总计 {levelInfo.xp.toLocaleString()} XP
                </div>
            </div>

            {/* 测试按钮 - 生产环境应移除 */}
            {process.env.NODE_ENV === 'development' && (
                <button
                    onClick={triggerLevelUpAnimation}
                    className={styles.testButton}
                >
                    ✨
                </button>
            )}
        </div>
    );
}
