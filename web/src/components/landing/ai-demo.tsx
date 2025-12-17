'use client';

import { useState, useEffect, useRef } from 'react';
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

// Demo conversation data
const demoConversation = [
    {
        role: 'user',
        content: '帮我生成关于 React Hooks 的学习卡片'
    },
    {
        role: 'ai',
        content: '好的！我来为您生成 React Hooks 的学习卡片。正在分析核心概念...',
        typing: true
    },
    {
        role: 'ai',
        content: '已生成 5 张高质量闪卡！',
        cards: [
            { front: 'useState 的作用是什么？', back: '用于在函数组件中添加状态管理，返回状态值和更新函数' },
            { front: 'useEffect 何时执行？', back: '组件渲染后执行，可通过依赖数组控制执行时机' },
            { front: 'useCallback 与 useMemo 的区别？', back: 'useCallback 缓存函数，useMemo 缓存计算结果' },
        ]
    }
];

// Sample prompts for users to try
const samplePrompts = [
    'React Hooks 基础',
    '生物细胞结构',
    '世界地理知识',
    '英语语法规则'
];

export default function AIDemo() {
    const [messages, setMessages] = useState<typeof demoConversation>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCards, setShowCards] = useState(false);
    const [flippedCard, setFlippedCard] = useState<number | null>(null);
    const chatRef = useRef<HTMLDivElement>(null);

    // Auto-play demo
    useEffect(() => {
        if (!isPlaying) return;

        if (currentStep >= demoConversation.length) {
            setIsPlaying(false);
            setShowCards(true);
            return;
        }

        const timer = setTimeout(() => {
            setMessages(prev => [...prev, demoConversation[currentStep]]);
            setCurrentStep(prev => prev + 1);

            // Scroll to bottom
            if (chatRef.current) {
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
            }
        }, currentStep === 0 ? 500 : currentStep === 1 ? 1500 : 2000);

        return () => clearTimeout(timer);
    }, [isPlaying, currentStep]);

    const startDemo = () => {
        setMessages([]);
        setCurrentStep(0);
        setShowCards(false);
        setFlippedCard(null);
        setIsPlaying(true);
    };

    const resetDemo = () => {
        setMessages([]);
        setCurrentStep(0);
        setShowCards(false);
        setFlippedCard(null);
        setIsPlaying(false);
    };

    return (
        <section className={styles.aiDemo} id="ai-demo">
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.badge}><LuBot size={16} /> 核心亮点</span>
                    <h2 className={styles.title}>
                        AI 对话式<span className={styles.gradient}>智能生成</span>
                    </h2>
                    <p className={styles.subtitle}>
                        只需描述您想学习的内容，AI 即刻为您生成专业的学习卡片。
                        无需手动输入，高效又准确。
                    </p>
                </div>

                <div className={styles.demoContainer}>
                    {/* Chat Demo */}
                    <div className={styles.chatWindow}>
                        <div className={styles.chatHeader}>
                            <div className={styles.chatDots}>
                                <span></span><span></span><span></span>
                            </div>
                            <span className={styles.chatTitle}>AI 闪卡助手</span>
                            <div className={styles.chatStatus}>
                                <span className={styles.statusDot}></span>
                                在线
                            </div>
                        </div>

                        <div className={styles.chatBody} ref={chatRef}>
                            {messages.length === 0 && !isPlaying && (
                                <div className={styles.chatPlaceholder}>
                                    <div className={styles.placeholderIcon}><LuMessageSquare size={48} /></div>
                                    <p>点击下方按钮开始演示</p>
                                    <p className={styles.placeholderHint}>看看 AI 如何帮您生成闪卡</p>
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
                                        {demoConversation[2].cards?.map((card, index) => (
                                            <div
                                                key={index}
                                                className={`${styles.miniCard} ${flippedCard === index ? styles.flipped : ''}`}
                                                onClick={() => setFlippedCard(flippedCard === index ? null : index)}
                                            >
                                                <div className={styles.cardInner}>
                                                    <div className={styles.cardFront}>
                                                        <span className={styles.cardLabel}>Q</span>
                                                        <p>{card.front}</p>
                                                    </div>
                                                    <div className={styles.cardBack}>
                                                        <span className={styles.cardLabel}>A</span>
                                                        <p>{card.back}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className={styles.cardsTip}><LuPointer size={14} /> 点击卡片查看答案</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.chatFooter}>
                            {!isPlaying && messages.length === 0 && (
                                <button className={styles.startBtn} onClick={startDemo}>
                                    <LuPlay size={16} /> 开始演示
                                </button>
                            )}
                            {(isPlaying || messages.length > 0) && (
                                <button className={styles.resetBtn} onClick={resetDemo}>
                                    <LuRotateCcw size={16} /> 重新演示
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Features Highlight */}
                    <div className={styles.featuresHighlight}>
                        <h3 className={styles.featuresTitle}>强大的 AI 能力</h3>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}><LuFileText size={22} /></div>
                            <div className={styles.featureText}>
                                <h4>多格式输入</h4>
                                <p>支持文本、PDF、网页链接等多种内容来源</p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}><LuTarget size={22} /></div>
                            <div className={styles.featureText}>
                                <h4>精准提取</h4>
                                <p>智能识别知识点，生成高质量问答对</p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}><LuRefreshCw size={22} /></div>
                            <div className={styles.featureText}>
                                <h4>即时调整</h4>
                                <p>对生成结果不满意？告诉 AI 立即优化</p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.featureIcon}><LuGlobe size={22} /></div>
                            <div className={styles.featureText}>
                                <h4>多语言支持</h4>
                                <p>支持中英日韩等多种语言内容处理</p>
                            </div>
                        </div>

                        <div className={styles.promptSuggestions}>
                            <p className={styles.promptLabel}>试试这些话题：</p>
                            <div className={styles.promptTags}>
                                {samplePrompts.map((prompt, index) => (
                                    <span key={index} className={styles.promptTag}>{prompt}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
