'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Shield, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '@/components';
import styles from './pricing.module.css';

const PricingPage = () => {
    const [isYearly, setIsYearly] = useState(true);

    const plans = [
        {
            name: 'Free',
            description: '体验 AI 学习的魅力',
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: [
                { text: '每日 10 次 AI 生成', included: true },
                { text: '基础牌组管理', included: true },
                { text: '学习统计分析', included: true },
                { text: '多端同步', included: true },
                { text: 'Pro 专属功能', included: false },
                { text: '优先级支持', included: false },
            ],
            buttonText: '当前方案',
            buttonLink: '#',
            highlight: false,
            icon: <Zap className="w-6 h-6" style={{ color: 'var(--color-accent-blue)' }} />,
        },
        {
            name: 'Pro',
            description: '解锁无限学习潜能',
            monthlyPrice: 29,
            yearlyPrice: 19, // per month effectively
            features: [
                { text: '每日 200 次 AI 生成', included: true, highlight: true },
                { text: '无限牌组管理', included: true },
                { text: '高级统计与 AI 建议', included: true },
                { text: '离线学习模式', included: true },
                { text: 'OCR 文字识别生成', included: true },
                { text: '24/7 优先技术支持', included: true },
            ],
            buttonText: '立即升级',
            buttonLink: '/checkout/pro',
            highlight: true,
            icon: <Crown className="w-6 h-6" style={{ color: 'var(--chart-accent)' }} />,
        }
    ];

    return (
        <MainLayout>
            <div className={styles.pricingPage}>
                {/* Background Effects */}
                <div className={styles.backgroundEffects}>
                    <div className={styles.glow1}></div>
                    <div className={styles.glow2}></div>
                </div>

                <div className={styles.container}>
                    <div className={styles.header}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className={styles.title}>
                                选择适合您的方案
                            </h1>
                            <p className={styles.description}>
                                无论您是初学者还是专业学习者，我们都有为您量身定制的方案。
                            </p>
                        </motion.div>

                        {/* Pricing Toggle */}
                        <div className={styles.toggleContainer}>
                            <span className={`${styles.toggleLabel} ${!isYearly ? styles.activeLabel : ''}`}>按月付费</span>
                            <button
                                onClick={() => setIsYearly(!isYearly)}
                                className={styles.toggleSwitch}
                                aria-label="切换按年/按月付费"
                            >
                                <motion.div
                                    animate={{ x: isYearly ? 28 : 0 }}
                                    className={styles.toggleHandle}
                                />
                            </button>
                            <span className={`${styles.toggleLabel} ${isYearly ? styles.activeLabel : ''}`}>
                                按年付费
                                <span className={styles.discountBadge}>
                                    立省 35%
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className={styles.plansGrid}>
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`${styles.planCard} ${plan.highlight ? styles.highlightedCard : ''}`}
                            >
                                {plan.highlight && (
                                    <div className={styles.popularBadge}>
                                        最受欢迎
                                    </div>
                                )}

                                <div className={styles.planHeader}>
                                    <div className={styles.iconWrapper}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h3 className={styles.planName}>{plan.name}</h3>
                                        <p className={styles.planDesc}>{plan.description}</p>
                                    </div>
                                </div>

                                <div className={styles.priceContainer}>
                                    <div className={styles.priceDisplay}>
                                        <span className={styles.currency}>¥</span>
                                        <span className={styles.amount}>
                                            {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                        </span>
                                        <span className={styles.period}>/月</span>
                                    </div>
                                    {isYearly && plan.monthlyPrice > 0 && (
                                        <p className={styles.yearlyTotal}>
                                            总计 ¥{plan.yearlyPrice * 12} /年
                                        </p>
                                    )}
                                </div>

                                <ul className={styles.featureList}>
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className={styles.featureItem}>
                                            {feature.included ? (
                                                <Check
                                                    className={styles.checkIcon}
                                                    style={{ color: feature.highlight ? 'var(--color-brand-primary)' : 'var(--color-status-good)' }}
                                                />
                                            ) : (
                                                <X className={styles.checkIcon} style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }} />
                                            )}
                                            <span className={`
                                                ${styles.featureText}
                                                ${feature.included ? styles.featureIncluded : styles.featureNotIncluded}
                                                ${feature.highlight ? styles.featureHighlighted : ''}
                                            `}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href={plan.buttonLink} className="block mt-auto">
                                    <button className={`
                                        ${styles.ctaButton}
                                        ${plan.highlight ? styles.primaryButton : styles.secondaryButton}
                                    `}>
                                        {plan.buttonText}
                                    </button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Trust Badges */}
                    <div className={styles.trustBadges}>
                        <div className={styles.trustBadge}>
                            <Shield className={styles.trustIcon} />
                            <span className={styles.trustText}>安全支付</span>
                        </div>
                        <div className={styles.trustBadge}>
                            <Sparkles className={styles.trustIcon} />
                            <span className={styles.trustText}>随时取消</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default PricingPage;
