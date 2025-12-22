'use client';

import { motion } from 'framer-motion';
import styles from './achievement-card.module.css';

// Apple-inspired gradient color palette for achievements
const ACHIEVEMENT_COLORS = [
    { gradient: 'linear-gradient(135deg, #ff2d55 0%, #ff6b8a 100%)', glow: 'rgba(255, 45, 85, 0.4)' },    // Pink/Red
    { gradient: 'linear-gradient(135deg, #ff9500 0%, #ffcc00 100%)', glow: 'rgba(255, 149, 0, 0.4)' },     // Orange/Yellow
    { gradient: 'linear-gradient(135deg, #30d158 0%, #34c759 100%)', glow: 'rgba(48, 209, 88, 0.4)' },     // Green
    { gradient: 'linear-gradient(135deg, #00c7be 0%, #64d2ff 100%)', glow: 'rgba(0, 199, 190, 0.4)' },     // Teal/Cyan
    { gradient: 'linear-gradient(135deg, #5856d6 0%, #af52de 100%)', glow: 'rgba(88, 86, 214, 0.4)' },     // Purple
    { gradient: 'linear-gradient(135deg, #007aff 0%, #5ac8fa 100%)', glow: 'rgba(0, 122, 255, 0.4)' },     // Blue
    { gradient: 'linear-gradient(135deg, #ff375f 0%, #ff6b6b 100%)', glow: 'rgba(255, 55, 95, 0.4)' },     // Coral
    { gradient: 'linear-gradient(135deg, #bf5af2 0%, #da8fff 100%)', glow: 'rgba(191, 90, 242, 0.4)' },    // Violet
];

interface AchievementCardProps {
    code: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    unlocked: boolean;
    unlockedAt?: string | null;
    index?: number;
}

export default function AchievementCard({
    code,
    name,
    description,
    icon,
    xpReward,
    unlocked,
    unlockedAt,
    index = 0
}: AchievementCardProps) {
    const colorIndex = index % ACHIEVEMENT_COLORS.length;
    const colors = ACHIEVEMENT_COLORS[colorIndex];

    return (
        <motion.div
            className={`${styles.card} ${unlocked ? styles.unlocked : styles.locked}`}
            whileHover={unlocked ? {
                scale: 1.03,
                y: -5,
                transition: { duration: 0.2 }
            } : undefined}
            style={{
                '--card-gradient': colors.gradient,
                '--card-glow': colors.glow,
            } as React.CSSProperties}
        >
            <div className={styles.iconContainer}>
                <span className={styles.icon}>{icon}</span>
                {unlocked && (
                    <motion.div
                        className={styles.unlockedBadge}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                    >
                        ✓
                    </motion.div>
                )}
            </div>

            <div className={styles.content}>
                <h3 className={styles.name}>{name}</h3>
                <p className={styles.description}>{description}</p>

                <div className={styles.footer}>
                    <span className={styles.xp}>+{xpReward} XP</span>
                    {unlocked && unlockedAt && (
                        <span className={styles.unlockedDate}>
                            {new Date(unlockedAt).toLocaleDateString('zh-CN')}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
