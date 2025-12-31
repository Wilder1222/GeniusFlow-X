import React from 'react';
import { useTranslations } from 'next-intl';
import styles from './deck-card.module.css';

interface DeckCardProps {
    title: string;
    description: string;
    icon: string;
    dueCount: number;
    totalCount: number;
    gradient?: string; // Optional override
}

export const DeckCard: React.FC<DeckCardProps> = ({
    title,
    description,
    icon,
    dueCount,
    totalCount,
    gradient,
}) => {
    const t = useTranslations('Home');

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.iconContainer}>
                    {icon}
                </div>
                <div className={styles.info}>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.description}>{description}</p>
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.count}>
                    <span className={styles.dueCount}>{dueCount}</span>
                    <span className={styles.totalCount}>{t('dueCards')}</span>
                </div>
                <div className={styles.count} style={{ textAlign: 'right' }}>
                    <span className={styles.totalCount}>{t('totalCards', { count: totalCount })}</span>
                </div>
            </div>

            <button
                className={styles.studyButton}
                style={gradient ? { background: gradient } : undefined}
            >
                <span>⚡</span> {t('studyNow')}
            </button>
        </div>
    );
};
