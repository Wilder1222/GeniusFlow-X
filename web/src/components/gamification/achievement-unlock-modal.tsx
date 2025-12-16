'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import styles from './achievement-unlock-modal.module.css';

interface Achievement {
    key: string;
    name: string;
    description: string;
    icon: string;
    xp_reward: number;
}

interface Props {
    achievement: Achievement | null;
    onClose: () => void;
}

export default function AchievementUnlockModal({ achievement, onClose }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setIsVisible(true);
            triggerConfetti();

            // Auto close after 5 seconds
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [achievement]);

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

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

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!achievement) return null;

    return (
        <div className={`${styles.overlay} ${isVisible ? styles.visible : ''}`} onClick={handleClose}>
            <div className={`${styles.modal} ${isVisible ? styles.visible : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.badge}>🏆</div>
                    <h2 className={styles.title}>成就解锁！</h2>
                </div>

                <div className={styles.content}>
                    <div className={styles.icon}>{achievement.icon}</div>
                    <h3 className={styles.achievementName}>{achievement.name}</h3>
                    <p className={styles.description}>{achievement.description}</p>

                    <div className={styles.reward}>
                        <span className={styles.rewardLabel}>奖励</span>
                        <span className={styles.rewardValue}>+{achievement.xp_reward} XP</span>
                    </div>
                </div>

                <button className={styles.closeButton} onClick={handleClose}>
                    太棒了！
                </button>
            </div>
        </div>
    );
}
