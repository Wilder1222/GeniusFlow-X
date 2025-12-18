'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Achievement {
    id: string;
    name: string;
    icon: string;
    xp_reward: number;
}

interface AchievementContextType {
    showAchievement: (achievement: Achievement) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
    const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

    const showAchievement = useCallback((achievement: Achievement) => {
        setCurrentAchievement(achievement);
    }, []);

    const closeAchievement = useCallback(() => {
        setCurrentAchievement(null);
    }, []);

    return (
        <AchievementContext.Provider value={{ showAchievement }}>
            {children}
            {currentAchievement && (
                <AchievementToast
                    achievement={currentAchievement}
                    onClose={closeAchievement}
                />
            )}
        </AchievementContext.Provider>
    );
}

export function useAchievements() {
    const context = useContext(AchievementContext);
    if (context === undefined) {
        throw new Error('useAchievements must be used within an AchievementProvider');
    }
    return context;
}

// Internal Toast Component
import styles from './achievement-toast.module.css';
import { useEffect } from 'react';

function AchievementToast({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    // Handle click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const toast = document.getElementById('achievement-toast');
            if (toast && !toast.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    return (
        <div className={styles.overlay}>
            <div id="achievement-toast" className={styles.toast} onClick={() => onClose()}>
                <div className={styles.iconWrapper}>
                    <span className={styles.icon}>{achievement.icon}</span>
                </div>
                <div className={styles.content}>
                    <div className={styles.label}>🏆 达成成就！</div>
                    <div className={styles.name}>{achievement.name}</div>
                    <div className={styles.reward}>+{achievement.xp_reward} XP</div>
                </div>
            </div>
        </div>
    );
}
