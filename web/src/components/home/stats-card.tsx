import React from 'react';
import styles from './stats-card.module.css';

interface StatsCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    icon?: React.ReactNode;
    progress?: number; // 0-100
}

export const StatsCard: React.FC<StatsCardProps> = ({
    label,
    value,
    subtext,
    icon,
    progress,
}) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span>{label}</span>
                {icon && <span className={styles.icon}>{icon}</span>}
            </div>
            <div className={styles.value}>{value}</div>
            {progress !== undefined && (
                <div className={styles.progressContainer}>
                    <div
                        className={styles.progressBar}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
            {subtext && <div className={styles.footer}>{subtext}</div>}
        </div>
    );
};
