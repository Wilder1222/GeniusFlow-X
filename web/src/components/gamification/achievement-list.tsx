'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import AchievementCard from './achievement-card';
import styles from './achievement-list.module.css';

interface Achievement {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    xp_reward: number;
    unlocked: boolean;
    unlockedAt?: string | null;
}

export default function AchievementList() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const data = await apiClient.get('/api/achievements');
            if (data.success) {
                setAchievements(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>Achievements</h2>
                <div className={styles.loading}>Loading achievements...</div>
            </div>
        );
    }

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Achievements</h2>
                <span className={styles.progress}>
                    {unlockedCount} / {achievements.length} unlocked
                </span>
            </div>

            <div className={styles.grid}>
                {achievements.map(achievement => (
                    <AchievementCard
                        key={achievement.id}
                        code={achievement.code}
                        name={achievement.name}
                        description={achievement.description}
                        icon={achievement.icon}
                        xpReward={achievement.xp_reward}
                        unlocked={achievement.unlocked}
                        unlockedAt={achievement.unlockedAt}
                    />
                ))}
            </div>
        </div>
    );
}
