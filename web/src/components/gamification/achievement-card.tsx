'use client';

import styles from './achievement-card.module.css';

interface AchievementCardProps {
    code: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    unlocked: boolean;
    unlockedAt?: string | null;
}

export default function AchievementCard({
    code,
    name,
    description,
    icon,
    xpReward,
    unlocked,
    unlockedAt
}: AchievementCardProps) {
    return (
        <div className={`${styles.card} ${unlocked ? styles.unlocked : styles.locked}`}>
            <div className={styles.iconContainer}>
                <span className={styles.icon}>{icon}</span>
                {unlocked && <div className={styles.unlockedBadge}>✓</div>}
            </div>

            <div className={styles.content}>
                <h3 className={styles.name}>{name}</h3>
                <p className={styles.description}>{description}</p>

                <div className={styles.footer}>
                    <span className={styles.xp}>+{xpReward} XP</span>
                    {unlocked && unlockedAt && (
                        <span className={styles.unlockedDate}>
                            Unlocked {new Date(unlockedAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
