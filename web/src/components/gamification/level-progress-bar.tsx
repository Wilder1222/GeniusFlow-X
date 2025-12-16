'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { apiClient } from '@/lib/api-client';
import styles from './level-progress-bar.module.css';

interface LevelInfo {
    xp: number;
    level: number;
    nextLevelXp: number;
    currentLevelXp: number;
    progress: number;
}

export default function LevelProgressBar() {
    const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLevelInfo();
    }, []);

    const loadLevelInfo = async () => {
        try {
            const result = await apiClient.get<{ success: boolean; data: LevelInfo }>('/api/gamification/xp');
            if (result.success) {
                setLevelInfo(result.data);
            }
        } catch (error) {
            console.error('Failed to load level info:', error);
        } finally {
            setLoading(false);
        }
    };

    const triggerLevelUpAnimation = () => {
        // 五彩纸屑动画
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

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
        return null;
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
                    <span className={styles.xpCurrent}>{xpInCurrentLevel}</span>
                    <span className={styles.xpSeparator}>/</span>
                    <span className={styles.xpTarget}>{xpNeededForNextLevel} XP</span>
                </div>
            </div>

            <div className={styles.progressBarContainer}>
                <div
                    className={styles.progressBarFill}
                    style={{ width: `${Math.min(100, Math.max(0, levelInfo.progress))}%` }}
                >
                    <div className={styles.progressBarGlow}></div>
                </div>
            </div>

            <div className={styles.nextLevelInfo}>
                下一级需要 {levelInfo.nextLevelXp} XP
            </div>

            {/* 测试按钮 - 生产环境应移除 */}
            {process.env.NODE_ENV === 'development' && (
                <button
                    onClick={triggerLevelUpAnimation}
                    className={styles.testButton}
                >
                    测试升级动画
                </button>
            )}
        </div>
    );
}
