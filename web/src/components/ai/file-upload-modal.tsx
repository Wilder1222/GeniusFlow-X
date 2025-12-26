'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/lib/contexts/toast-context';
import styles from './file-upload-modal.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    deckId: string;
    onCardsGenerated: (count: number) => void;
}

type FileType = 'pdf' | 'txt' | 'docx' | 'unknown';

export default function FileUploadModal({ isOpen, onClose, deckId, onCardsGenerated }: Props) {
    const toast = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [step, setStep] = useState<'upload' | 'preview' | 'generate'>('upload');
    const [cardCount, setCardCount] = useState(10);

    const getFileType = (filename: string): FileType => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'pdf';
        if (ext === 'txt') return 'txt';
        if (ext === 'docx') return 'docx';
        return 'unknown';
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (!selectedFile) return;

        const fileType = getFileType(selectedFile.name);
        if (fileType === 'unknown') {
            toast.error('不支持的文件格式，请上传 PDF、TXT 或 DOCX 文件');
            return;
        }

        setFile(selectedFile);
        setLoading(true);

        try {
            // For TXT files, read directly
            if (fileType === 'txt') {
                const text = await selectedFile.text();
                setExtractedText(text);
                setStep('preview');
            } else {
                // For PDF/DOCX, send to API
                const formData = new FormData();
                formData.append('file', selectedFile);

                const result = await fetch('/api/ai/extract-file', {
                    method: 'POST',
                    body: formData
                });

                const data = await result.json();
                if (data.success && data.data.text) {
                    setExtractedText(data.data.text);
                    setStep('preview');
                } else {
                    toast.error('文件解析失败: ' + (data.error || '未知错误'));
                }
            }
        } catch (error) {
            console.error('File processing error:', error);
            toast.error('文件处理失败');
        } finally {
            setLoading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/plain': ['.txt'],
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    const handleGenerate = async () => {
        if (!extractedText.trim()) return;

        setGenerating(true);
        try {
            const result = await apiClient.post<{ success: boolean; data: { cards: any[] } }>('/api/ai/generate', {
                content: extractedText,
                deckId,
                count: cardCount
            });

            if (result.success && result.data.cards) {
                onCardsGenerated(result.data.cards.length);
                onClose();
            } else {
                toast.error('生成失败');
            }
        } catch (error) {
            console.error('Generate error:', error);
            toast.error('生成失败');
        } finally {
            setGenerating(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setExtractedText('');
        setStep('upload');
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>📄 从文件生成卡片</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.content}>
                    {step === 'upload' && (
                        <div
                            {...getRootProps()}
                            className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
                        >
                            <input {...getInputProps()} />
                            {loading ? (
                                <div className={styles.loading}>
                                    <span className={styles.spinner}></span>
                                    正在解析文件...
                                </div>
                            ) : (
                                <>
                                    <div className={styles.uploadIcon}>📁</div>
                                    <p className={styles.uploadText}>
                                        {isDragActive ? '放开以上传文件' : '拖拽文件到这里，或点击选择'}
                                    </p>
                                    <p className={styles.uploadHint}>支持 PDF、TXT、DOCX，最大 10MB</p>
                                </>
                            )}
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className={styles.previewStep}>
                            <div className={styles.fileInfo}>
                                <span className={styles.fileName}>📄 {file?.name}</span>
                                <button className={styles.changeButton} onClick={handleReset}>
                                    更换文件
                                </button>
                            </div>

                            <div className={styles.textPreview}>
                                <label className={styles.previewLabel}>提取的文本内容</label>
                                <textarea
                                    className={styles.previewTextarea}
                                    value={extractedText}
                                    onChange={(e) => setExtractedText(e.target.value)}
                                    rows={10}
                                />
                                <p className={styles.charCount}>{extractedText.length} 字符</p>
                            </div>

                            <div className={styles.countSelector}>
                                <label>生成卡片数量:</label>
                                <select
                                    value={cardCount}
                                    onChange={(e) => setCardCount(Number(e.target.value))}
                                    className={styles.countSelect}
                                >
                                    <option value={5}>5张</option>
                                    <option value={10}>10张</option>
                                    <option value={20}>20张</option>
                                    <option value={30}>30张</option>
                                </select>
                            </div>

                            <button
                                className={styles.generateButton}
                                onClick={handleGenerate}
                                disabled={generating || !extractedText.trim()}
                            >
                                {generating ? '正在生成...' : `🤖 AI生成 ${cardCount} 张卡片`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
