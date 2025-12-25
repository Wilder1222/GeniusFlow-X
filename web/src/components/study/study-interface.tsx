'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/types/decks';
import { Rating } from '@/lib/study';
import { getSettings } from '@/lib/settings';
import { apiClient } from '@/lib/api-client';
import { StudyCard } from './study-card';
import { CheckCircle, X, ChevronLeft, Zap, Trophy } from 'lucide-react';
import styles from './study-interface.module.css';

interface StudyInterfaceProps {
    cards: Card[];
    onGrade: (cardId: string, rating: Rating) => Promise<void>;
}

export function StudyInterface({ cards, onGrade }: StudyInterfaceProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [finished, setFinished] = useState(false);
    const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
    const [xpResult, setXpResult] = useState<any>(null);
    const [ttsSettings, setTtsSettings] = useState({ enabled: true, autoPlay: false });

    useEffect(() => {
        async function fetchSettings() {
            try {
                const settings = await getSettings();
                if (settings) {
                    setTtsSettings({
                        enabled: settings.ttsEnabled,
                        autoPlay: settings.ttsAutoPlay
                    });
                }
            } catch (e) {
                console.warn('Failed to fetch settings, using defaults', e);
            }
        }
        fetchSettings();
    }, []);

    useEffect(() => {
        if (cards.length > 0 && currentIndex >= cards.length && !finished) {
            setFinished(true);
            completeSession();
        }
    }, [currentIndex, cards.length, finished]);

    const completeSession = async () => {
        try {
            const data = await apiClient.post('/api/study/complete', {
                correctCount: stats.correct,
                incorrectCount: stats.incorrect
            });

            if (data.success) {
                setXpResult(data.data);
            }
        } catch (error) {
            console.error('Failed to complete session:', error);
        }
    };

    if (cards.length === 0 || finished) {
        return (
            <div className={styles.finishContainer}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={styles.finishCard}
                >
                    <div className={styles.finishIcon}><CheckCircle /></div>
                    <h2 className={styles.finishTitle}>全部复习完成！</h2>
                    <p className={styles.finishSubtitle}>今天也是充满进步的一天，继续保持！</p>

                    {xpResult && (
                        <div className={styles.xpSection}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className={styles.xpGained}
                            >
                                <Zap className={styles.zapIcon} />
                                <span>获得 {xpResult.xpGained} XP</span>
                            </motion.div>

                            {xpResult.leveledUp && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={styles.levelUpBadge}
                                >
                                    <Trophy /> 等级提升 Lv.{xpResult.newLevel}
                                </motion.div>
                            )}
                        </div>
                    )}

                    <button
                        className={styles.backBtn}
                        onClick={() => window.location.href = '/home'}
                    >
                        返回首页
                    </button>
                </motion.div>

                <AnimatePresence>
                    {xpResult?.achievements?.unlocked?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.achievementSection}
                        >
                            <h3 className={styles.sectionTitle}>🏆 解锁新成就</h3>
                            <div className={styles.achievementGrid}>
                                {xpResult.achievements.unlocked.map((a: any, i: number) => (
                                    <div key={i} className={styles.achievementCard}>
                                        <div className={styles.aIcon}>{a.icon || '✨'}</div>
                                        <div className={styles.aInfo}>
                                            <div className={styles.aName}>{a.name}</div>
                                            <div className={styles.aXp}>+{a.xpReward} XP</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    const currentCard = cards[currentIndex];
    const progress = ((currentIndex) / cards.length) * 100;

    const handleReveal = () => setIsRevealed(true);

    const handleGrade = async (rating: Rating) => {
        if (rating === Rating.Good || rating === Rating.Easy) {
            setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        } else {
            setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
        }

        await onGrade(currentCard.id, rating);
        setIsRevealed(false);
        setCurrentIndex(prev => prev + 1);
    };

    const gradeButtons = [
        { label: '忘记', sub: 'Again', rating: Rating.Again, color: '#ef4444', class: styles.again },
        { label: '困难', sub: 'Hard', rating: Rating.Hard, color: '#f59e0b', class: styles.hard },
        { label: '一般', sub: 'Good', rating: Rating.Good, color: '#3b82f6', class: styles.good },
        { label: '简单', sub: 'Easy', rating: Rating.Easy, color: '#10b981', class: styles.easy },
    ];

    return (
        <div className={styles.studyWrapper}>
            <div className={styles.studyHeader}>
                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <span className={styles.label}>学习进度</span>
                        <span className={styles.stats}>
                            <CheckCircle size={18} /> {stats.correct} &nbsp;
                            <X size={18} /> {stats.incorrect}
                        </span>
                    </div>
                    <div className={styles.progressBar}>
                        <motion.div
                            className={styles.progressFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className={styles.remaining}>
                        还剩 {cards.length - currentIndex} 张卡片
                    </div>
                </div>
            </div>

            <div className={styles.cardContainer}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentCard.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={styles.cardMotion}
                    >
                        <StudyCard
                            card={currentCard}
                            isRevealed={isRevealed}
                            onReveal={handleReveal}
                            onGrade={handleGrade}
                            ttsEnabled={ttsSettings.enabled}
                            ttsAutoPlay={ttsSettings.autoPlay}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className={styles.actionContainer}>
                {!isRevealed ? (
                    <motion.button
                        className={styles.revealAction}
                        onClick={handleReveal}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        显示答案
                    </motion.button>
                ) : (
                    <div className={styles.gradeGrid}>
                        {gradeButtons.map((btn, i) => (
                            <motion.button
                                key={i}
                                className={`${styles.gradeBtn} ${btn.class}`}
                                onClick={() => handleGrade(btn.rating)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className={styles.btnLabel}>{btn.label}</span>
                                <span className={styles.btnDesc}>{btn.sub}</span>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
