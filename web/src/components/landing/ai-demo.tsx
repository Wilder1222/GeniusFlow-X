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
        content: '已生成 3 张高质量闪卡！',
        cards: [
            {
                front: '什么是React Hooks？',
                back: 'React Hooks 是 React 16.8 版本引入的一项核心功能，它允许你在函数组件中使用 state 和其他 React 特性（如生命周期、context 等），而无需编写 class，你可以通过组合现有的 Hooks 来创建自定义 Hook，将组件逻辑提取到可重用的函数中。自定义 Hook 的名称必须以 "use" 开头'
            },
            {
                front: '常用的React Hooks有哪些？',
                back: '1.useState：在函数组件中添加和管理局部状态。\n2.useEffect：用于处理副作用（数据获取、订阅、DOM 操作等），模拟生命周期。\n3.useContext：订阅 React Context，避免多层组件传递 props'
            },
            {
                front: 'React Hooks的优点有哪些？',
                back: '1.代码更简洁：避免了 class 组件中的 this绑定和复杂的生命周期方法。\n2.逻辑复用更灵活：通过自定义 Hook 可以轻松地在多个组件之间复用状态逻辑。\n3.关注点分离：可以将一个组件的不同功能拆分成更小的、独立的函数（Hook）。'
            },
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
                                                        <p style={{ whiteSpace: 'pre-line', textAlign: 'left', lineHeight: '1.6', fontSize: '0.85em' }}>{card.back}</p>
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
