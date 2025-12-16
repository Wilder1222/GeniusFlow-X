'use client';

import React, { useState } from 'react';
import { createCard } from '@/lib/cards';
import { apiClient } from '@/lib/api-client';
import styles from './ai-generator-modal.module.css';

interface CardDraft {
    front: string;
    back: string;
    tags?: string[];
    difficulty?: string;
}

interface AIGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    deckId: string;
    onCardsAdded: () => void;
}

export function AIGeneratorModal({ isOpen, onClose, deckId, onCardsAdded }: AIGeneratorModalProps) {
    const [text, setText] = useState('');
    const [granularity, setGranularity] = useState<'fine' | 'recommended' | 'coarse'>('recommended');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [drafts, setDrafts] = useState<CardDraft[]>([]);
    const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(new Set());

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!text.trim() || text.trim().length < 5) {
            setError('请输入至少5个字符的文本');
            return;
        }

        setLoading(true);
        setError('');
        setDrafts([]);

        try {
            const result = await apiClient.post('/api/ai/generate-cards', { text, granularity });

            if (!result.success) {
                console.log('[AI Generation] Result:', result);
                throw new Error(result.error || 'Failed to generate cards');
            }

            setDrafts(result.data.cards);
        } catch (err: any) {
            setError(err.message || 'AI generation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (index: number) => {
        const draft = drafts[index];
        try {
            await createCard({
                deck_id: deckId,
                front: draft.front,
                back: draft.back
            });
            setAcceptedIndices(prev => new Set([...prev, index]));
        } catch (err) {
            console.error('Failed to add card:', err);
            alert('Failed to add card');
        }
    };

    const handleAcceptAll = async () => {
        try {
            for (let i = 0; i < drafts.length; i++) {
                if (!acceptedIndices.has(i)) {
                    await handleAccept(i);
                }
            }
            // After accepting all, notify parent and close
            onCardsAdded();
            handleClose();
        } catch (err) {
            console.error('Failed to accept all:', err);
        }
    };

    const handleClose = () => {
        setText('');
        setDrafts([]);
        setAcceptedIndices(new Set());
        setError('');
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>AI 生成卡片</h2>
                    <button className={styles.closeBtn} onClick={handleClose}>×</button>
                </div>

                <div className={styles.content}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputSection}>
                        <label className={styles.label}>输入文本</label>
                        <textarea
                            className={styles.textarea}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="粘贴或输入你想生成卡片的内容... 例如：光合作用是植物将光能转化为化学能的过程。"
                        />
                    </div>

                    <div className={styles.optionsSection}>
                        <label className={styles.label}>粒度控制</label>
                        <div className={styles.granularityGroup}>
                            <button
                                className={`${styles.granularityBtn} ${granularity === 'coarse' ? styles.active : ''}`}
                                onClick={() => setGranularity('coarse')}
                            >
                                粗粒度 (1张)
                            </button>
                            <button
                                className={`${styles.granularityBtn} ${granularity === 'recommended' ? styles.active : ''}`}
                                onClick={() => setGranularity('recommended')}
                            >
                                推荐 (3张)
                            </button>
                            <button
                                className={`${styles.granularityBtn} ${granularity === 'fine' ? styles.active : ''}`}
                                onClick={() => setGranularity('fine')}
                            >
                                细粒度 (5张)
                            </button>
                        </div>
                    </div>

                    {loading && <div className={styles.loading}>AI 生成中...</div>}

                    {drafts.length > 0 && (
                        <div className={styles.resultsSection}>
                            <h3>生成结果 ({drafts.length} 张卡片)</h3>
                            {drafts.map((draft, index) => (
                                <div key={index} className={styles.cardDraft}>
                                    <div className={styles.cardFront}>
                                        <div className={styles.cardLabel}>正面</div>
                                        <div className={styles.cardText}>{draft.front}</div>
                                    </div>
                                    <div className={styles.cardBack}>
                                        <div className={styles.cardLabel}>背面</div>
                                        <div className={styles.cardText}>{draft.back}</div>
                                    </div>
                                    {draft.tags && draft.tags.length > 0 && (
                                        <div className={styles.cardMeta}>
                                            {draft.tags.map((tag, i) => (
                                                <span key={i} className={styles.tag}>{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className={styles.cardActions}>
                                        {acceptedIndices.has(index) ? (
                                            <div style={{ color: 'var(--success-color)', fontWeight: 600 }}>✓ 已添加</div>
                                        ) : (
                                            <>
                                                <button
                                                    className={styles.acceptBtn}
                                                    onClick={() => handleAccept(index)}
                                                >
                                                    添加此卡片
                                                </button>
                                                <button className={styles.rejectBtn}>
                                                    跳过
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    {drafts.length > 0 && acceptedIndices.size < drafts.length ? (
                        <button className={styles.generateBtn} onClick={handleAcceptAll}>
                            添加全部剩余卡片
                        </button>
                    ) : (
                        <button
                            className={styles.generateBtn}
                            onClick={handleGenerate}
                            disabled={loading || !text.trim() || text.trim().length < 5}
                        >
                            {loading ? '生成中...' : '生成卡片'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
