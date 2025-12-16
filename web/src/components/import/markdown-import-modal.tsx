'use client';

import React, { useState } from 'react';
import { parseMarkdownToCards } from '@/lib/markdown-parser';
import { apiClient } from '@/lib/api-client';
import styles from './markdown-import-modal.module.css';

interface MarkdownImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    deckId: string;
    onImportComplete: () => void;
}

export function MarkdownImportModal({ isOpen, onClose, deckId, onImportComplete }: MarkdownImportModalProps) {
    const [markdownText, setMarkdownText] = useState('');
    const [preview, setPreview] = useState<Array<{ front: string; back: string }>>([]);
    const [importing, setImporting] = useState(false);
    const [step, setStep] = useState<'input' | 'preview'>('input');

    if (!isOpen) return null;

    const handleParse = () => {
        const cards = parseMarkdownToCards(markdownText);
        setPreview(cards);
        setStep('preview');
    };

    const handleImport = async () => {
        setImporting(true);
        try {
            const data = await apiClient.post('/api/cards/batch', {
                deck_id: deckId,
                cards: preview.map(card => ({
                    front: card.front,
                    back: card.back,
                    tags: []
                }))
            });
            const successCount = data.data?.length || 0;
            alert(`成功导入 ${successCount} 张卡片！`);
            onImportComplete();
            handleClose();
        } catch (error: any) {
            console.error('Import error:', error);
            alert('导入失败：' + error.message);
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        setMarkdownText('');
        setPreview([]);
        setStep('input');
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Markdown 导入</h2>
                    <button onClick={handleClose} className={styles.closeButton}>
                        ✕
                    </button>
                </div>

                {step === 'input' ? (
                    <>
                        <div className={styles.content}>
                            <div className={styles.instructions}>
                                <h3>支持的格式</h3>
                                <p><strong>Q&A 格式：</strong></p>
                                <pre>{`Q: 什么是 React?
A: 一个用于构建用户界面的 JavaScript 库`}</pre>

                                <p><strong>列表格式：</strong></p>
                                <pre>{`- 前面内容 | 后面内容
- Capital of France | Paris`}</pre>

                                <p><strong>双冒号格式：</strong></p>
                                <pre>{`前面内容 :: 后面内容
What is AI :: Artificial Intelligence`}</pre>
                            </div>

                            <textarea
                                className={styles.textarea}
                                placeholder="在此粘贴 Markdown 内容..."
                                value={markdownText}
                                onChange={(e) => setMarkdownText(e.target.value)}
                                rows={12}
                            />
                        </div>

                        <div className={styles.footer}>
                            <button onClick={handleClose} className={styles.cancelButton}>
                                取消
                            </button>
                            <button
                                onClick={handleParse}
                                disabled={!markdownText.trim()}
                                className={styles.parseButton}
                            >
                                解析预览
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.content}>
                            <div className={styles.previewHeader}>
                                <h3>预览 ({preview.length} 张卡片)</h3>
                                <button onClick={() => setStep('input')} className={styles.backButton}>
                                    ← 返回编辑
                                </button>
                            </div>

                            <div className={styles.previewList}>
                                {preview.map((card, index) => (
                                    <div key={index} className={styles.previewCard}>
                                        <div className={styles.cardNumber}>#{index + 1}</div>
                                        <div className={styles.cardPreview}>
                                            <div className={styles.cardFront}>
                                                <strong>正面：</strong>{card.front}
                                            </div>
                                            <div className={styles.cardBack}>
                                                <strong>背面：</strong>{card.back}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <button onClick={() => setStep('input')} className={styles.cancelButton}>
                                返回
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importing || preview.length === 0}
                                className={styles.importButton}
                            >
                                {importing ? '导入中...' : `导入 ${preview.length} 张卡片`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
