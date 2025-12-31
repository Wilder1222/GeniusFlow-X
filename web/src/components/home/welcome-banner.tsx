import React from 'react';
import { useTranslations } from 'next-intl';
import styles from './welcome-banner.module.css';

interface WelcomeBannerProps {
    userName?: string;
    cardsDue?: number;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
    userName = 'User',
    cardsDue = 0,
}) => {
    const t = useTranslations('Home');

    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <h2 className={styles.title}>
                    {t('welcomeBack')} 👋
                </h2>
                <p className={styles.subtitle}>
                    {t('cardsReviewCount', { count: cardsDue })}
                </p>
            </div>
        </div>
    );
};
