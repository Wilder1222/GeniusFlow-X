import React from 'react';
import styles from './welcome-banner.module.css';

interface WelcomeBannerProps {
    userName?: string;
    cardsDue?: number;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
    userName = 'User',
    cardsDue = 0,
}) => {
    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <h2 className={styles.title}>
                    Welcome back! 👋
                </h2>
                <p className={styles.subtitle}>
                    You have {cardsDue} cards ready to review today
                </p>
            </div>
        </div>
    );
};
