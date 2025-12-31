'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
    LuBot,
    LuMessageSquare,
    LuFileText,
    LuTarget,
    LuRefreshCw,
    LuGlobe,
    LuPlay,
    LuRotateCcw,
    LuSparkles,
    LuPointer
} from 'react-icons/lu';
import styles from './ai-demo.module.css';

// Topics keys matching the JSON structure
const TOPICS = ['react', 'biology', 'geography', 'grammar'];

interface DemoCard {
    front: string;
    back: string;
}

interface DemoMessage {
    role: 'user' | 'ai';
    content: string;
    cards?: DemoCard[];
    typing?: boolean;
}

export default function AIDemo() {
    const t = useTranslations('Landing.AIDemo');
    const [messages, setMessages] = useState<DemoMessage[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCards, setShowCards] = useState(false);
    const [flippedCard, setFlippedCard] = useState<number | null>(null);
    const [currentTopic, setCurrentTopic] = useState('react');
    const chatRef = useRef<HTMLDivElement>(null);

    // Get current demo data based on selected topic
    // We use t.raw to get the complex object (array of messages)
    const currentDemoData = (t.raw(`topics.${currentTopic}.messages`) as DemoMessage[]).map((msg, index) => ({
        ...msg,
        // Add typing flag to the first AI response (index 1 usually) for visual effect
        typing: index === 1
    }));

    // Auto-play demo
    useEffect(() => {
        if (!isPlaying) return;

        if (currentStep >= currentDemoData.length) {
            setIsPlaying(false);
            setShowCards(true);
            return;
        }

        const timer = setTimeout(() => {
            setMessages(prev => [...prev, currentDemoData[currentStep]]);
            setCurrentStep(prev => prev + 1);

            // Scroll to bottom
            if (chatRef.current) {
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
            }
        }, currentStep === 0 ? 500 : currentStep === 1 ? 1500 : 2000);

        return () => clearTimeout(timer);
    }, [isPlaying, currentStep, currentDemoData]);

    const startDemo = (topic?: string) => {
        if (topic) {
            setCurrentTopic(topic);
        }
        setMessages([]);
        setCurrentStep(0);
        setShowCards(false);
        setFlippedCard(null);
        // Use setTimeout to ensure state updates before starting
        setTimeout(() => setIsPlaying(true), 50);
    };

    const resetDemo = () => {
        setMessages([]);
        setCurrentStep(0);
        setShowCards(false);
        setFlippedCard(null);
        setIsPlaying(false);
    };

    // Get cards from current demo data (usually the last message)
    const lastMessage = currentDemoData[currentDemoData.length - 1];
    const currentCards = lastMessage?.cards || [];

    return (
        <section className={styles.aiDemo} id="ai-demo">
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.badge}><LuSparkles size={16} /><span>{t('badge')}</span></span>
                    <h2 className={styles.title}>
                        {t('title')}<span className={styles.gradient}>{t('titleHighlight')}</span>
                    </h2>
                    <p className={styles.subtitle}>
                        {t('subtitle')}
                    </p>
                </div>

                <div className={styles.demoContainer}>
                    {/* Chat Demo */}
                    <div className={styles.chatWindow}>
                        <div className={styles.chatHeader}>
                            <div className={styles.chatDots}>
                                <span></span><span></span><span></span>
                            </div>
                            <span className={styles.chatTitle}>{t('chatTitle')}</span>
                            <div className={styles.chatStatus}>
                                <span className={styles.statusDot}></span>
                                {t('status')}
                            </div>
                        </div>

                        <div className={styles.chatBody} ref={chatRef}>
                            {messages.length === 0 && !isPlaying && (
                                <div className={styles.chatPlaceholder}>
                                    <div className={styles.placeholderIcon}><LuMessageSquare size={48} /></div>
                                    <p>{t('placeholder')}</p>
                                    <p className={styles.placeholderHint}>{t('placeholderHint')}</p>
                                </div>
                            )}

                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
                                >
                                    {msg.role === 'ai' && (
                                        <div className={styles.aiAvatar}><LuBot size={20} /></div>
                                    )}
                                    <div className={styles.messageContent}>
                                        <p>{msg.content}</p>
                                        {msg.typing && (
                                            <div className={styles.typingIndicator}>
                                                <span></span><span></span><span></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Generated Cards Preview */}
                            {showCards && (
                                <div className={styles.cardsPreview}>
                                    <div className={styles.cardsGrid}>
                                        {currentCards.map((card, index) => (
                                            <div
                                                key={index}
                                                className={`${styles.miniCard} ${flippedCard === index ? styles.flipped : ''}`}
                                                onClick={() => setFlippedCard(flippedCard === index ? null : index)}
                                            >
                                                <div className={styles.cardInner}>
                                                    <div className={styles.cardFront}>
                                                        <span className={styles.cardLabel}>{t('cardFront')}</span>
                                                        <p>{card.front}</p>
                                                    </div>
                                                    <div className={styles.cardBack}>
                                                        <span className={styles.cardLabel}>{t('cardBack')}</span>
                                                        <p style={{ whiteSpace: 'pre-line', textAlign: 'left', lineHeight: '1.6', fontSize: '0.85em' }}>{card.back}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className={styles.cardsTip}><LuPointer size={14} /> {t('clickToFlip')}</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.chatFooter}>
                            {!isPlaying && messages.length === 0 && (
                                <button className={styles.startBtn} onClick={() => startDemo()}>
                                    <LuPlay size={16} /> {t('start')}
                                </button>
                            )}
                            {(isPlaying || messages.length > 0) && (
                                <button className={styles.resetBtn} onClick={resetDemo}>
                                    <LuRotateCcw size={16} /> {t('restart')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Features Highlight */}
                    <div className={styles.featuresHighlight}>
                        <h3 className={styles.featuresTitle}>{t('featuresTitle')}</h3>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}><LuFileText size={22} /></div>
                            <div className={styles.featureText}>
                                <h4>{t('features.multiFormat.title')}</h4>
                                <p>{t('features.multiFormat.desc')}</p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}><LuTarget size={22} /></div>
                            <div className={styles.featureText}>
                                <h4>{t('features.extract.title')}</h4>
                                <p>{t('features.extract.desc')}</p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}><LuRefreshCw size={22} /></div>
                            <div className={styles.featureText}>
                                <h4>{t('features.refine.title')}</h4>
                                <p>{t('features.refine.desc')}</p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}><LuGlobe size={22} /></div>
                            <div className={styles.featureText}>
                                <h4>{t('features.multiLang.title')}</h4>
                                <p>{t('features.multiLang.desc')}</p>
                            </div>
                        </div>

                        <div className={styles.promptSuggestions}>
                            <p className={styles.promptLabel}>{t('promptLabel')}</p>
                            <div className={styles.promptTags}>
                                {TOPICS.map((topic) => (
                                    <span
                                        key={topic}
                                        className={`${styles.promptTag} ${currentTopic === topic ? styles.promptTagActive : ''}`}
                                        onClick={() => startDemo(topic)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {t(`topics.${topic}.label`)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
