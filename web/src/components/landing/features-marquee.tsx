'use client';

import { useEffect, useRef } from 'react';
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
    title: string;
    description: string;
    gradient: string;
}

const featuresRow1: Feature[] = [
    {
        icon: <LuBrain size={28} />,
        title: '间隔重复',
        description: '基于SM-2算法，在遗忘临界点复习，记忆效率提升300%',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
        icon: <LuChartBar size={28} />,
        title: '数据分析',
        description: '详细的学习统计和热力图，追踪进步，识别薄弱环节',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
        icon: <LuCloud size={28} />,
        title: '多端同步',
        description: '手机、平板、电脑学习进度实时同步，随时随地学习',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
        icon: <LuGamepad2 size={28} />,
        title: '游戏化激励',
        description: '升级、徽章、连胜纪录，让学习像游戏一样有趣',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
];

const featuresRow2: Feature[] = [
    {
        icon: <LuZap size={28} />,
        title: '富媒体支持',
        description: 'LaTeX公式、代码高亮、图片音频，满足各类学习需求',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
        icon: <LuSparkles size={28} />,
        title: '专注模式',
        description: '极简沉浸式界面，屏蔽干扰，快速进入心流状态',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    {
        icon: <LuShield size={28} />,
        title: '隐私安全',
        description: '银行级加密标准，您的数据只属于您自己',
        gradient: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    },
    {
        icon: <LuGlobe size={28} />,
        title: '社区共享',
        description: '全球学霸分享优质卡片组，覆盖数百个学科',
        gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    },
];

function FeatureCard({ feature }: { feature: Feature }) {
    return (
        <div className={styles.card}>
            <div className={styles.cardGlow} style={{ background: feature.gradient }} />
            <div className={styles.cardContent}>
                <div className={styles.iconWrapper} style={{ background: feature.gradient }}>
                    {feature.icon}
                </div>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardDescription}>{feature.description}</p>
            </div>
        </div>
    );
}

export function FeaturesMarquee() {
    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);

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
                <span className={styles.badge}><span>✨ 核心功能</span></span>
                <h2 className={styles.title}>为高效学习而设计</h2>
                <p className={styles.subtitle}>
                    除了强大的 AI 生成能力，我们还提供全方位的学习辅助功能
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
                            <FeatureCard key={`row1-${index}`} feature={feature} />
                        ))}
                    </div>
                </div>

                {/* Row 2 - Left to Right */}
                <div className={styles.marqueeWrapper}>
                    <div ref={row2Ref} className={`${styles.marqueeTrack} ${styles.row2}`}>
                        {row2Items.map((feature, index) => (
                            <FeatureCard key={`row2-${index}`} feature={feature} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FeaturesMarquee;
