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

// Demo conversation data for different topics
const demoData: Record<string, typeof demoConversationTemplate> = {
    'React Hooks 基础': [
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
                    back: 'React Hooks 是 React 16.8 版本引入的一项核心功能，它允许你在函数组件中使用 state 和其他 React 特性（如生命周期、context 等），而无需编写 class。'
                },
                {
                    front: '常用的React Hooks有哪些？',
                    back: '1.useState：管理局部状态\n2.useEffect：处理副作用\n3.useContext：订阅 Context\n4.useRef：获取 DOM 引用'
                },
                {
                    front: 'React Hooks的优点有哪些？',
                    back: '1.代码更简洁：避免 class 的 this 绑定\n2.逻辑复用更灵活：通过自定义 Hook 复用状态逻辑\n3.关注点分离：拆分成独立的函数'
                },
            ]
        }
    ],
    '生物细胞结构': [
        {
            role: 'user',
            content: '帮我生成关于生物细胞结构的学习卡片'
        },
        {
            role: 'ai',
            content: '好的！我来为您生成生物细胞结构的学习卡片。正在整理核心知识点...',
            typing: true
        },
        {
            role: 'ai',
            content: '已生成 3 张高质量闪卡！',
            cards: [
                {
                    front: '细胞的基本结构包括哪些部分？',
                    back: '细胞的基本结构包括：\n1.细胞膜：控制物质进出\n2.细胞质：进行代谢活动\n3.细胞核：存储遗传信息\n4.线粒体：能量工厂\n5.核糖体：蛋白质合成场所'
                },
                {
                    front: '动物细胞和植物细胞的主要区别是什么？',
                    back: '植物细胞特有：\n1.细胞壁：提供支持和保护\n2.叶绿体：进行光合作用\n3.大液泡：储存水分和营养\n\n动物细胞特有：\n1.中心体：参与细胞分裂'
                },
                {
                    front: '线粒体被称为"细胞的能量工厂"的原因是什么？',
                    back: '线粒体是进行有氧呼吸的主要场所，通过氧化分解有机物释放能量，将ADP转化为ATP，为细胞的各种生命活动提供能量。'
                },
            ]
        }
    ],
    '世界地理知识': [
        {
            role: 'user',
            content: '帮我生成关于世界地理知识的学习卡片'
        },
        {
            role: 'ai',
            content: '好的！我来为您生成世界地理知识的学习卡片。正在整理重要知识点...',
            typing: true
        },
        {
            role: 'ai',
            content: '已生成 3 张高质量闪卡！',
            cards: [
                {
                    front: '世界七大洲按面积从大到小排列是什么？',
                    back: '1.亚洲（4458万km²）\n2.非洲（3020万km²）\n3.北美洲（2422万km²）\n4.南美洲（1784万km²）\n5.南极洲（1400万km²）\n6.欧洲（1016万km²）\n7.大洋洲（897万km²）'
                },
                {
                    front: '世界上最长的河流是哪条？',
                    back: '尼罗河，全长约6670公里，流经非洲东部和北部，是世界上最长的河流。\n\n第二长是亚马逊河（约6400km），第三是长江（约6300km）。'
                },
                {
                    front: '什么是板块构造理论？',
                    back: '板块构造理论认为地球岩石圈分为若干巨大的板块，这些板块漂浮在软流圈上缓慢移动。板块边界处会发生：\n1.碰撞：形成山脉\n2.分离：形成裂谷\n3.滑动：引发地震'
                },
            ]
        }
    ],
    '英语语法规则': [
        {
            role: 'user',
            content: '帮我生成关于英语语法规则的学习卡片'
        },
        {
            role: 'ai',
            content: '好的！我来为您生成英语语法规则的学习卡片。正在整理核心语法点...',
            typing: true
        },
        {
            role: 'ai',
            content: '已生成 3 张高质量闪卡！',
            cards: [
                {
                    front: '英语中的时态有哪些？',
                    back: '英语有12种基本时态：\n\n现在时：一般现在、现在进行、现在完成、现在完成进行\n过去时：一般过去、过去进行、过去完成、过去完成进行\n将来时：一般将来、将来进行、将来完成、将来完成进行'
                },
                {
                    front: '什么时候使用现在完成时？',
                    back: '现在完成时（have/has + 过去分词）用于：\n1.过去的动作对现在有影响\n2.从过去持续到现在的动作\n3.与 ever, never, just, already 等词连用\n\n例：I have finished my homework.'
                },
                {
                    front: '冠词 a/an 和 the 的区别是什么？',
                    back: 'a/an（不定冠词）：\n- 首次提及的事物\n- 泛指某一类事物\n- a用于辅音前，an用于元音前\n\nthe（定冠词）：\n- 特指已知的事物\n- 独一无二的事物\n- 上文提到过的事物'
                },
            ]
        }
    ]
};

// Type definition for conversation
const demoConversationTemplate = [
    { role: 'user' as const, content: '' },
    { role: 'ai' as const, content: '', typing: true },
    { role: 'ai' as const, content: '', cards: [{ front: '', back: '' }] }
];

// Sample prompts for users to try
const samplePrompts = [
    'React Hooks 基础',
    '生物细胞结构',
    '世界地理知识',
    '英语语法规则'
];

export default function AIDemo() {
    const [messages, setMessages] = useState<typeof demoConversationTemplate>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCards, setShowCards] = useState(false);
    const [flippedCard, setFlippedCard] = useState<number | null>(null);
    const [currentTopic, setCurrentTopic] = useState('React Hooks 基础');
    const chatRef = useRef<HTMLDivElement>(null);

    // Get current demo data based on selected topic
    const currentDemoData = demoData[currentTopic] || demoData['React Hooks 基础'];

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

    // Get cards from current demo data
    const currentCards = currentDemoData[2]?.cards || [];

    return (
        <section className={styles.aiDemo} id="ai-demo">
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.badge}><LuSparkles size={16} /><span>核心亮点</span></span>
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
                                        {currentCards.map((card: { front: string; back: string }, index: number) => (
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
                                <button className={styles.startBtn} onClick={() => startDemo()}>
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
                                    <span
                                        key={index}
                                        className={`${styles.promptTag} ${currentTopic === prompt ? styles.promptTagActive : ''}`}
                                        onClick={() => startDemo(prompt)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {prompt}
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
