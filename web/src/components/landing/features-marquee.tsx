'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
    LuBrain,
    LuChartBar,
    LuCloud,
    LuGamepad2,
    LuShield,
    LuZap,
    LuGlobe,
    LuSparkles
} from 'react-icons/lu';
import styles from './features-marquee.module.css';

interface Feature {
    icon: React.ReactNode;
    key: string;
    gradient: string;
}

function FeatureCard({ feature, t }: { feature: Feature; t: (key: string) => string }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardGlow} style={{ background: feature.gradient }} />
            <div className={styles.cardContent}>
                <div className={styles.iconWrapper} style={{ background: feature.gradient }}>
                    {feature.icon}
                </div>
                <h3 className={styles.cardTitle}>{t(`items.${feature.key}.title`)}</h3>
                <p className={styles.cardDescription}>{t(`items.${feature.key}.desc`)}</p>
            </div>
        </div>
    );
}

export function FeaturesMarquee() {
    const t = useTranslations('Landing.FeaturesMarquee');
    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);

    const featuresRow1: Feature[] = [
        {
            icon: <LuBrain size={28} />,
            key: 'srs',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
            icon: <LuChartBar size={28} />,
            key: 'analytics',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        {
            icon: <LuCloud size={28} />,
            key: 'sync',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        {
            icon: <LuGamepad2 size={28} />,
            key: 'gamification',
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        },
    ];

    const featuresRow2: Feature[] = [
        {
            icon: <LuZap size={28} />,
            key: 'media',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        },
        {
            icon: <LuSparkles size={28} />,
            key: 'focus',
            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        },
        {
            icon: <LuShield size={28} />,
            key: 'privacy',
            gradient: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
        },
        {
            icon: <LuGlobe size={28} />,
            key: 'community',
            gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
        },
    ];

    useEffect(() => {
        // Pause animation on hover
        const handleMouseEnter = (ref: React.RefObject<HTMLDivElement | null>) => {
            if (ref.current) {
                ref.current.style.animationPlayState = 'paused';
            }
        };

        const handleMouseLeave = (ref: React.RefObject<HTMLDivElement | null>) => {
            if (ref.current) {
                ref.current.style.animationPlayState = 'running';
            }
        };

        const row1 = row1Ref.current;
        const row2 = row2Ref.current;

        if (row1) {
            row1.addEventListener('mouseenter', () => handleMouseEnter(row1Ref));
            row1.addEventListener('mouseleave', () => handleMouseLeave(row1Ref));
        }
        if (row2) {
            row2.addEventListener('mouseenter', () => handleMouseEnter(row2Ref));
            row2.addEventListener('mouseleave', () => handleMouseLeave(row2Ref));
        }

        return () => {
            if (row1) {
                row1.removeEventListener('mouseenter', () => handleMouseEnter(row1Ref));
                row1.removeEventListener('mouseleave', () => handleMouseLeave(row1Ref));
            }
            if (row2) {
                row2.removeEventListener('mouseenter', () => handleMouseEnter(row2Ref));
                row2.removeEventListener('mouseleave', () => handleMouseLeave(row2Ref));
            }
        };
    }, []);

    // Double the items for seamless looping
    const row1Items = [...featuresRow1, ...featuresRow1, ...featuresRow1, ...featuresRow1];
    const row2Items = [...featuresRow2, ...featuresRow2, ...featuresRow2, ...featuresRow2];

    return (
        <section id="features" className={styles.section}>
            <div className={styles.header}>
                <span className={styles.badge}><span>{t('badge')}</span></span>
                <h2 className={styles.title}>{t('title')}</h2>
                <p className={styles.subtitle}>
                    {t('subtitle')}
                </p>
            </div>

            <div className={styles.marqueeContainer}>
                {/* Gradient overlays */}
                <div className={styles.gradientLeft} />
                <div className={styles.gradientRight} />

                {/* Row 1 - Right to Left */}
                <div className={styles.marqueeWrapper}>
                    <div ref={row1Ref} className={`${styles.marqueeTrack} ${styles.row1}`}>
                        {row1Items.map((feature, index) => (
                            <FeatureCard key={`row1-${index}`} feature={feature} t={t} />
                        ))}
                    </div>
                </div>

                {/* Row 2 - Left to Right */}
                <div className={styles.marqueeWrapper}>
                    <div ref={row2Ref} className={`${styles.marqueeTrack} ${styles.row2}`}>
                        {row2Items.map((feature, index) => (
                            <FeatureCard key={`row2-${index}`} feature={feature} t={t} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FeaturesMarquee;
