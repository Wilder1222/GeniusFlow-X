'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { parseMarkdownToCards } from '@/lib/markdown-parser';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/lib/contexts/toast-context';
import { formatApiError } from '@/lib/error-handler';
import styles from './markdown-import-modal.module.css';

interface MarkdownImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    deckId: string;
    onImportComplete: () => void;
}

export function MarkdownImportModal({ isOpen, onClose, deckId, onImportComplete }: MarkdownImportModalProps) {
    const t = useTranslations('Import');
    const toast = useToast();
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
            toast.success(t('importSuccess', { count: successCount }));
            onImportComplete();
            handleClose();
        } catch (error: any) {
            console.error('Import error:', error);
            toast.error(formatApiError(error));
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
                    <h2>{t('title')}</h2>
                    <button onClick={handleClose} className={styles.closeButton}>
                        ✕
                    </button>
                </div>

                {step === 'input' ? (
                    <>
                        <div className={styles.content}>
                            <div className={styles.instructions}>
                                <h3>{t('supportedFormats')}</h3>
                                <p><strong>{t('qaFormat')}</strong></p>
                                <pre>{`Q: 什么是 React?
A: 一个用于构建用户界面的 JavaScript 库`}</pre>

                                <p><strong>{t('listFormat')}</strong></p>
                                <pre>{`- 前面内容 | 后面内容
- Capital of France | Paris`}</pre>

                                <p><strong>{t('doubleColonFormat')}</strong></p>
                                <pre>{`前面内容 :: 后面内容
What is AI :: Artificial Intelligence`}</pre>
                            </div>

                            <textarea
                                className={styles.textarea}
                                placeholder={t('placeholder')}
                                value={markdownText}
                                onChange={(e) => setMarkdownText(e.target.value)}
                                rows={12}
                            />
                        </div>

                        <div className={styles.footer}>
                            <button onClick={handleClose} className={styles.cancelButton}>
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleParse}
                                disabled={!markdownText.trim()}
                                className={styles.parseButton}
                            >
                                {t('parse')}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.content}>
                            <div className={styles.previewHeader}>
                                <h3>{t('preview', { count: preview.length })}</h3>
                                <button onClick={() => setStep('input')} className={styles.backButton}>
                                    {t('backToEdit')}
                                </button>
                            </div>

                            <div className={styles.previewList}>
                                {preview.map((card, index) => (
                                    <div key={index} className={styles.previewCard}>
                                        <div className={styles.cardNumber}>#{index + 1}</div>
                                        <div className={styles.cardPreview}>
                                            <div className={styles.cardFront}>
                                                <strong>{t('front')}</strong>{card.front}
                                            </div>
                                            <div className={styles.cardBack}>
                                                <strong>{t('backLabel')}</strong>{card.back}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <button onClick={() => setStep('input')} className={styles.cancelButton}>
                                {t('backBtn')}
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importing || preview.length === 0}
                                className={styles.importButton}
                            >
                                {importing ? t('importing') : t('importCount', { count: preview.length })}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
