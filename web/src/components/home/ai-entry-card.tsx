'use client';

import { LuSparkles, LuBrain, LuArrowRight } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import styles from './ai-entry-card.module.css';

interface AIEntryCardProps {
    onStart: () => void;
}

export default function AIEntryCard({ onStart }: AIEntryCardProps) {
    const t = useTranslations('Home');

    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <LuSparkles size={24} className={styles.icon} />
                </div>
                <div className={styles.text}>
                    <h2 className={styles.title}>
                        {t('aiTitle')}
                        <span className={styles.badge}>BETA</span>
                    </h2>
                    <p className={styles.description}>
                        {t('aiDescription')}
                    </p>
                </div>
                <button onClick={onStart} className={styles.actionButton}>
                    <span>{t('tryNow')}</span>
                    <LuArrowRight size={18} />
                </button>
            </div>

            {/* Background decoration */}
            <div className={styles.decoration}>
                <LuBrain size={120} className={styles.bgIcon} />
                <div className={styles.glow} />
            </div>
        </div>
    );
}
