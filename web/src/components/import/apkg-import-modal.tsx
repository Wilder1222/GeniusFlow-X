'use client';

import React, { useState } from 'react';
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
            toast.warning('请选择有效的 .apkg 文件');
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
                throw new Error(data.error?.message || '导入失败');
            }

            toast.success(`成功导入 ${data.data.cards_imported} 张卡片到卡组「${preview.deckName}」！`);
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
                    <h2>.apkg 文件导入</h2>
                    <button onClick={handleClose} className={styles.closeButton}>
                        ✕
                    </button>
                </div>

                {step === 'select' ? (
                    <>
                        <div className={styles.content}>
                            <div className={styles.instructions}>
                                <h3>📦 导入 Anki 卡组</h3>
                                <p>选择一个 .apkg 文件来导入您的 Anki 卡组</p>
                                <ul>
                                    <li>支持标准 Anki .apkg 格式</li>
                                    <li>自动提取卡片内容</li>
                                    <li>保留标签信息</li>
                                    <li>导入学习进度</li>
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
                                    {file ? file.name : '选择 .apkg 文件'}
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
                                取消
                            </button>
                            <button
                                onClick={handleParse}
                                disabled={!file || parsing}
                                className={styles.parseButton}
                            >
                                {parsing ? '解析中...' : '解析预览'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.content}>
                            <div className={styles.previewHeader}>
                                <h3>📋 {preview?.deckName}</h3>
                                <span className={styles.cardCount}>
                                    {preview?.cards.length} 张卡片
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
                                        还有 {preview.cards.length - 10} 张卡片...
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.footer}>
                            <button onClick={() => setStep('select')} className={styles.cancelButton}>
                                返回
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importing || !preview}
                                className={styles.importButton}
                            >
                                {importing ? '导入中...' : `导入 ${preview?.cards.length} 张卡片`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
