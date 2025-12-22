'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { motion } from 'framer-motion';
import { LuTrophy, LuSparkles } from 'react-icons/lu';
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
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <LuTrophy className={styles.titleIcon} />
                        <h2 className={styles.title}>成就徽章</h2>
                    </div>
                </div>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>加载成就中...</span>
                </div>
            </div>
        );
    }

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <LuTrophy className={styles.titleIcon} />
                    </motion.div>
                    <h2 className={styles.title}>成就徽章</h2>
                </div>
                <div className={styles.progressBadge}>
                    <LuSparkles className={styles.sparkleIcon} />
                    <span>{unlockedCount} / {achievements.length} 已解锁</span>
                </div>
            </div>

            <motion.div
                className={styles.grid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {achievements.map((achievement, index) => (
                    <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            delay: index * 0.1,
                            duration: 0.4,
                            type: "spring",
                            stiffness: 100
                        }}
                    >
                        <AchievementCard
                            code={achievement.code}
                            name={achievement.name}
                            description={achievement.description}
                            icon={achievement.icon}
                            xpReward={achievement.xp_reward}
                            unlocked={achievement.unlocked}
                            unlockedAt={achievement.unlockedAt}
                            index={index}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
