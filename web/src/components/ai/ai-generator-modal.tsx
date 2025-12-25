'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    LuSparkles,
    LuX,
    LuCheck,
    LuLoader,
    LuPlus,
    LuSave,
    LuArrowLeft,
    LuBook,
    LuFileText,
    LuUpload
} from 'react-icons/lu';
import styles from './ai-generator-modal.module.css';
import { aiService, GeneratedCard } from '@/lib/ai-service';
import { AI_DOMAINS, AIDomain, getDomainConfig } from '@/lib/ai-domains';
import { getUserDecks } from '@/lib/decks';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { Deck } from '@/types/decks';
import { MarkdownContent } from '@/components/common/markdown-content';

interface AIGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (deckId: string) => void;
    deckId?: string;
    onCardsAdded?: () => void;
}

type Step = 'input' | 'generating' | 'preview';
type SourceType = 'text' | 'file';

export function AIGeneratorModal({ isOpen, onClose, onSuccess, deckId, onCardsAdded }: AIGeneratorModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState<Step>('input');
    const [selectedDomain, setSelectedDomain] = useState<AIDomain>('general');
    const [sourceType, setSourceType] = useState<SourceType>('text');
    const [topic, setTopic] = useState('');
    const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
    const [userDecks, setUserDecks] = useState<Deck[]>([]);

    // File upload state
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Save options
    const [saveMode, setSaveMode] = useState<'existing' | 'new'>('new');
    const [selectedDeckId, setSelectedDeckId] = useState('');
    const [newDeckTitle, setNewDeckTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [cardCount, setCardCount] = useState<3 | 5 | 10 | 'auto'>('auto');

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep('input');
            setSelectedDomain('general'); // 默认选择通用
            setSourceType('text');
            setTopic('');
            setGeneratedCards([]);
            setNewDeckTitle('');
            setUploadedFile(null);
            setExtractedText('');
            setExtractError('');

            if (deckId) {
                setSaveMode('existing');
                setSelectedDeckId(deckId);
            } else {
                setSaveMode('new');
                setSelectedDeckId('');
            }

            fetchUserDecks();
        }
    }, [isOpen, deckId]);

    const fetchUserDecks = async () => {
        if (!user) return;
        try {
            const decks = await getUserDecks(user.id);
            setUserDecks(decks);
        } catch (error) {
            console.error('Failed to fetch decks:', error);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFile(file);
        setExtractError('');
        setIsExtracting(true);

        try {
            const result = await aiService.extractFromFile(file);
            setExtractedText(result.text);
            setTopic(result.text.slice(0, 500));
        } catch (error: any) {
            setExtractError(error.message || '文件提取失败');
            setExtractedText('');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleFileDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;

        const allowedTypes = ['.pdf', '.docx', '.txt'];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedTypes.includes(ext)) {
            setExtractError('不支持的文件格式，请上传 PDF、DOCX 或 TXT 文件');
            return;
        }

        setUploadedFile(file);
        setExtractError('');
        setIsExtracting(true);

        try {
            const result = await aiService.extractFromFile(file);
            setExtractedText(result.text);
            setTopic(result.text.slice(0, 500));
        } catch (error: any) {
            setExtractError(error.message || '文件提取失败');
            setExtractedText('');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleGenerate = async () => {
        const textToGenerate = sourceType === 'file' ? extractedText : topic;
        if (!textToGenerate.trim()) return;

        setStep('generating');
        try {
            const countParam = cardCount === 'auto' ? undefined : cardCount;
            const cards = await aiService.generateFlashcards({
                topic: textToGenerate,
                count: countParam,
                domain: selectedDomain,
                sourceType
            });
            setGeneratedCards(cards);
            if (!deckId) {
                const domainConfig = getDomainConfig(selectedDomain);
                setNewDeckTitle(sourceType === 'file' && uploadedFile
                    ? uploadedFile.name.replace(/\.[^.]+$/, '')
                    : `${domainConfig.name} - ${topic.slice(0, 20)}`);
            }
            setStep('preview');
        } catch (error: any) {
            console.error('Generation failed:', error);
            setStep('input');
            const errorMessage = error.message || '生成失败，请稍后重试';
            alert(errorMessage);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        if (saveMode === 'new' && !newDeckTitle.trim()) return;
        if (saveMode === 'existing' && !selectedDeckId) return;

        setIsSaving(true);
        try {
            let targetDeckId = selectedDeckId;

            if (saveMode === 'new') {
                const response = await apiClient.post<any>('/api/decks', {
                    title: newDeckTitle,
                    description: `Generated by AI for topic: ${topic.slice(0, 100)}`
                });

                if (!response.success || !response.data) {
                    throw new Error(response.error?.message || 'Failed to create deck');
                }
                targetDeckId = response.data.id;
            }

            if (!targetDeckId) throw new Error('Target deck ID is missing');

            const batchResponse = await apiClient.post<any>('/api/cards/batch', {
                deck_id: targetDeckId,
                cards: generatedCards.map(card => ({
                    front: card.front,
                    back: card.back,
                    tags: card.tags || []
                }))
            });

            if (!batchResponse.success) {
                throw new Error(batchResponse.error?.message || 'Failed to save cards');
            }

            if (onSuccess) onSuccess(targetDeckId);
            if (onCardsAdded) onCardsAdded();

            onClose();

        } catch (error: any) {
            console.error('Save failed:', error);
            alert(`保存失败: ${error.message || '未知错误'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const goBack = () => {
        if (step === 'preview') setStep('input');
    };

    const domainConfig = getDomainConfig(selectedDomain);
    const canGenerate = sourceType === 'text' ? topic.trim().length > 0 : extractedText.length > 0;

    if (!isOpen) return null;

    return createPortal(
        <div className={styles.overlay}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        {step === 'preview' && (
                            <button onClick={goBack} className={styles.backBtn} title="返回">
                                <LuArrowLeft size={20} />
                            </button>
                        )}
                        <div className={styles.iconBox}>
                            <LuSparkles size={20} />
                        </div>
                        <h3>AI 闪卡生成</h3>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <LuX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    {/* Input Step - Combined with Domain Selection */}
                    {step === 'input' && (
                        <div className={styles.inputStep}>
                            {/* Domain Tags - Compact */}
                            <div className={styles.domainTagsSection}>
                                <span className={styles.domainTagsLabel}>选择领域：</span>
                                <div className={styles.domainTags}>
                                    {AI_DOMAINS.map(domain => (
                                        <button
                                            key={domain.id}
                                            className={`${styles.domainTag} ${selectedDomain === domain.id ? styles.domainTagActive : ''}`}
                                            onClick={() => setSelectedDomain(domain.id)}
                                            style={{ '--domain-color': domain.color } as React.CSSProperties}
                                        >
                                            <span>{domain.icon}</span>
                                            <span>{domain.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Source Type Tabs */}
                            <div className={styles.sourceTabs}>
                                <button
                                    className={`${styles.sourceTab} ${sourceType === 'text' ? styles.active : ''}`}
                                    onClick={() => setSourceType('text')}
                                >
                                    <LuFileText size={16} />
                                    文本输入
                                </button>
                                <button
                                    className={`${styles.sourceTab} ${sourceType === 'file' ? styles.active : ''}`}
                                    onClick={() => setSourceType('file')}
                                >
                                    <LuUpload size={16} />
                                    上传文件
                                </button>
                            </div>

                            {/* Text Input */}
                            {sourceType === 'text' && (
                                <>
                                    <div className={styles.inputWrapper}>
                                        <textarea
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder={`输入主题或粘贴内容，例如：${domainConfig.suggestions[0]}...`}
                                            className={styles.topicTextarea}
                                            autoFocus
                                        />
                                    </div>
                                    <div className={styles.suggestions}>
                                        <span>推荐：</span>
                                        {domainConfig.suggestions.map(t => (
                                            <button key={t} onClick={() => setTopic(t)} className={styles.tag}>{t}</button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* File Upload */}
                            {sourceType === 'file' && (
                                <>
                                    <div
                                        className={`${styles.uploadArea} ${uploadedFile ? styles.hasFile : ''}`}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleFileDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.docx,.txt"
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
                                        />
                                        {isExtracting ? (
                                            <div className={styles.uploadLoading}>
                                                <LuLoader className={styles.spinner} size={32} />
                                                <span>正在提取文本...</span>
                                            </div>
                                        ) : uploadedFile ? (
                                            <div className={styles.uploadedFileInfo}>
                                                <LuFileText size={32} />
                                                <span className={styles.fileName}>{uploadedFile.name}</span>
                                                <span className={styles.fileSize}>
                                                    {extractedText ? `${extractedText.length} 字符` : '提取中...'}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className={styles.uploadPrompt}>
                                                <LuUpload size={32} />
                                                <span>拖拽文件到此处，或点击上传</span>
                                                <span className={styles.uploadHint}>支持 PDF、DOCX、TXT 格式</span>
                                            </div>
                                        )}
                                    </div>
                                    {extractError && <p className={styles.errorText}>{extractError}</p>}
                                    {extractedText && (
                                        <div className={styles.extractedPreview}>
                                            <span className={styles.previewLabel}>提取内容预览：</span>
                                            <p>{extractedText.slice(0, 200)}...</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Card Count & Generate */}
                            <div className={styles.generateActions}>
                                <div className={styles.countSelector}>
                                    <span className={styles.selectorLabel}>数量：</span>
                                    <div className={styles.countButtons}>
                                        {(['auto', 3, 5, 10] as const).map(count => (
                                            <button
                                                key={count}
                                                onClick={() => setCardCount(count)}
                                                className={`${styles.countBtn} ${cardCount === count ? styles.countBtnActive : ''}`}
                                            >
                                                {count === 'auto' ? '自动' : `${count}张`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!canGenerate}
                                    className={styles.primaryBtn}
                                >
                                    <LuSparkles size={18} />
                                    <span>开始生成</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Generating Step */}
                    {step === 'generating' && (
                        <div className={styles.generatingStep}>
                            <div className={styles.loaderWrapper}>
                                <LuLoader size={48} className={styles.spinner} />
                            </div>
                            <h4>正在深入分析知识网络...</h4>
                            <p>AI 正在为你整理 "{domainConfig.name}" 领域的核心考点</p>
                        </div>
                    )}

                    {/* Preview Step */}
                    {step === 'preview' && (
                        <div className={styles.previewStep}>
                            <div className={styles.previewHeader}>
                                <h4>
                                    <LuCheck size={18} className={styles.successIcon} />
                                    已生成 {generatedCards.length} 张卡片
                                </h4>

                                {!deckId && (
                                    <div className={styles.saveOptions}>
                                        <div className={styles.toggleGroup}>
                                            <button
                                                className={`${styles.toggleBtn} ${saveMode === 'new' ? styles.active : ''}`}
                                                onClick={() => setSaveMode('new')}
                                            >
                                                <LuPlus size={14} /> 新建牌组
                                            </button>
                                            <button
                                                className={`${styles.toggleBtn} ${saveMode === 'existing' ? styles.active : ''}`}
                                                onClick={() => setSaveMode('existing')}
                                            >
                                                <LuBook size={14} /> 现有牌组
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.cardsList}>
                                {generatedCards.map((card, i) => (
                                    <div key={i} className={styles.miniCard}>
                                        <div className={styles.cardFront}>
                                            <span className={styles.label}>Q</span>
                                            <p>{card.front}</p>
                                        </div>
                                        <div className={styles.divider} />
                                        <div className={styles.cardBack}>
                                            <span className={styles.label}>A</span>
                                            <div className={styles.cardBackContent}>
                                                <MarkdownContent content={card.back} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.saveForm}>
                                {saveMode === 'new' ? (
                                    <input
                                        type="text"
                                        value={newDeckTitle}
                                        onChange={(e) => setNewDeckTitle(e.target.value)}
                                        placeholder="输入牌组名称"
                                        className={styles.saveInput}
                                    />
                                ) : (
                                    <select
                                        value={selectedDeckId}
                                        onChange={(e) => setSelectedDeckId(e.target.value)}
                                        className={styles.saveSelect}
                                        disabled={!!deckId}
                                    >
                                        <option value="">选择一个牌组...</option>
                                        {userDecks.map(d => (
                                            <option key={d.id} value={d.id}>{d.title}</option>
                                        ))}
                                    </select>
                                )}

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || (saveMode === 'new' && !newDeckTitle) || (saveMode === 'existing' && !selectedDeckId)}
                                    className={styles.saveBtn}
                                >
                                    {isSaving ? <LuLoader className={styles.spinner} /> : <LuSave />}
                                    保存{deckId ? '到当前牌组' : '并开始学习'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
