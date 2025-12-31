'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { parseApkg, ApkgImportResult } from '@/lib/apkg-parser';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/lib/contexts/toast-context';
import { formatApiError } from '@/lib/error-handler';
import styles from './apkg-import-modal.module.css';

interface ApkgImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: (deckName: string, cards: any[]) => void;
}

export function ApkgImportModal({ isOpen, onClose, onImportComplete }: ApkgImportModalProps) {
    const t = useTranslations('ApkgImport');
    const toast = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);
    const [preview, setPreview] = useState<ApkgImportResult | null>(null);
    const [importing, setImporting] = useState(false);
    const [step, setStep] = useState<'select' | 'preview'>('select');

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.name.endsWith('.apkg')) {
            setFile(selectedFile);
        } else {
            toast.warning(t('selectFile'));
        }
    };

    const handleParse = async () => {
        if (!file) return;

        setParsing(true);
        try {
            const result = await parseApkg(file);
            setPreview(result);
            setStep('preview');
        } catch (error: any) {
            console.error('Parse error:', error);
            toast.error(formatApiError(error));
        } finally {
            setParsing(false);
        }
    };

    const handleImport = async () => {
        if (!preview) return;

        setImporting(true);
        try {
            // Use transactional import API - creates deck and cards atomically
            const data = await apiClient.post('/api/import', {
                deck_title: preview.deckName,
                deck_description: `Imported from ${file?.name}`,
                cards: preview.cards.map(card => ({
                    front: card.front,
                    back: card.back,
                    tags: card.tags || []
                }))
            });

            if (!data.success) {
                throw new Error(data.error?.message || t('importFailed'));
            }

            toast.success(t('importSuccess', { count: data.data.cards_imported, deckName: preview.deckName }));
            onImportComplete(preview.deckName, preview.cards);
            handleClose();
        } catch (error: any) {
            console.error('Import error:', error);
            toast.error(formatApiError(error));
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreview(null);
        setStep('select');
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

                {step === 'select' ? (
                    <>
                        <div className={styles.content}>
                            <div className={styles.instructions}>
                                <h3>{t('introTitle')}</h3>
                                <p>{t('introDesc')}</p>
                                <ul>
                                    <li>{t('feature1')}</li>
                                    <li>{t('feature2')}</li>
                                    <li>{t('feature3')}</li>
                                    <li>{t('feature4')}</li>
                                </ul>
                            </div>

                            <div className={styles.fileInput}>
                                <input
                                    type="file"
                                    accept=".apkg"
                                    onChange={handleFileSelect}
                                    className={styles.hiddenInput}
                                    id="apkg-file"
                                />
                                <label htmlFor="apkg-file" className={styles.fileLabel}>
                                    {file ? file.name : t('chooseFile')}
                                </label>
                                {file && (
                                    <span className={styles.fileSize}>
                                        ({(file.size / 1024).toFixed(2)} KB)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <button onClick={handleClose} className={styles.cancelButton}>
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleParse}
                                disabled={!file || parsing}
                                className={styles.parseButton}
                            >
                                {parsing ? t('parsing') : t('parse')}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.content}>
                            <div className={styles.previewHeader}>
                                <h3>📋 {preview?.deckName}</h3>
                                <span className={styles.cardCount}>
                                    {t('cardsCount', { count: preview?.cards.length ?? 0 })}
                                </span>
                            </div>

                            <div className={styles.previewList}>
                                {preview?.cards.slice(0, 10).map((card, index) => (
                                    <div key={index} className={styles.previewCard}>
                                        <div className={styles.cardNumber}>#{index + 1}</div>
                                        <div className={styles.cardPreview}>
                                            <div className={styles.cardFront}>
                                                <strong>Q:</strong> {card.front}
                                            </div>
                                            <div className={styles.cardBack}>
                                                <strong>A:</strong> {card.back}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {preview && preview.cards.length > 10 && (
                                    <div className={styles.moreCards}>
                                        {t('moreCards', { count: preview.cards.length - 10 })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <button onClick={() => setStep('select')} className={styles.cancelButton}>
                                {t('back')}
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importing || !preview}
                                className={styles.importButton}
                            >
                                {importing ? t('importing') : t('importCount', { count: preview?.cards.length ?? 0 })}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
