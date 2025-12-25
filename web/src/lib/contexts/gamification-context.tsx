'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { useAchievements } from './achievement-context';

interface LevelInfo {
    xp: number;
    level: number;
    nextLevelXp: number;
    currentLevelXp: number;
    progress: number;
}

interface GamificationContextType {
    levelInfo: LevelInfo | null;
    loading: boolean;
    refreshLevelInfo: () => Promise<void>;
    awardXPLocally: (amount: number) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { showAchievement } = useAchievements();
    const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const loadLevelInfo = useCallback(async () => {
        if (!user) {
            setLevelInfo(null);
            setLoading(false);
            return;
        }

        try {
            const result = await apiClient.get<any>('/api/gamification/xp');
            if (result.success && result.data) {
                setLevelInfo(result.data);
            }
        } catch (error) {
            console.error('[GamificationContext] Failed to load level info:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadLevelInfo();
    }, [loadLevelInfo]);

    // Check for achievements periodically or after XP gain
    const checkAchievements = useCallback(async () => {
        if (!user) return;
        try {
            const result = await apiClient.post<any>('/api/achievements/check', {});
            if (result.success && result.data.newlyUnlocked?.length > 0) {
                result.data.newlyUnlocked.forEach((achievement: any) => {
                    showAchievement({
                        id: achievement.id,
                        name: achievement.name,
                        icon: achievement.icon || '🏆',
                        xp_reward: achievement.xp_reward
                    });
                });
                // Reload level info if achievements awarded XP
                loadLevelInfo();
            }
        } catch (error) {
            console.error('[GamificationContext] Achievement check failed:', error);
        }
    }, [user, showAchievement, loadLevelInfo]);

    const awardXPLocally = useCallback((amount: number) => {
        if (!levelInfo) return;

        setLevelInfo(prev => {
            if (!prev) return null;
            const newXp = prev.xp + amount;

            // Formula sync with backend: level = floor(sqrt(xp / 100)) + 1
            const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
            const currentLevelXp = (newLevel - 1) * (newLevel - 1) * 100;
            const nextLevelXp = newLevel * newLevel * 100;
            const progress = ((newXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

            return {
                xp: newXp,
                level: newLevel,
                currentLevelXp,
                nextLevelXp,
                progress: Math.max(0, Math.min(100, progress))
            };
        });

        // Trigger real check after a short delay to sync with DB
        setTimeout(checkAchievements, 2000);
    }, [levelInfo, checkAchievements]);

    return (
        <GamificationContext.Provider value={{
            levelInfo,
            loading,
            refreshLevelInfo: loadLevelInfo,
            awardXPLocally
        }}>
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
}
