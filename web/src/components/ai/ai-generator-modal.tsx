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
    LuUpload,
    LuRefreshCw,
    LuBriefcase
} from 'react-icons/lu';
import styles from './ai-generator-modal.module.css';
import { aiService, GeneratedCard, AIUsageStatus } from '@/lib/ai-service';
import { AI_DOMAINS, AIDomain, getDomainConfig } from '@/lib/ai-domains';
import { getUserDecks } from '@/lib/decks';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/contexts/toast-context';
import { formatApiError } from '@/lib/error-handler';
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
type ModalMode = 'flashcard' | 'resume';

export function AIGeneratorModal({ isOpen, onClose, onSuccess, deckId, onCardsAdded }: AIGeneratorModalProps) {
    const { user } = useAuth();
    const toast = useToast();
    const [modalMode, setModalMode] = useState<ModalMode>('flashcard');
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

    // Resume interview state
    const [resumeSuggestions, setResumeSuggestions] = useState<string[]>([]);
    const [resumeBatchIndex, setResumeBatchIndex] = useState(0);
    const [resumeHasMore, setResumeHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Card regeneration state
    const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

    // AI usage status
    const [usageStatus, setUsageStatus] = useState<AIUsageStatus | null>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setModalMode('flashcard');
            setStep('input');
            setSelectedDomain('general');
            setSourceType('text');
            setTopic('');
            setGeneratedCards([]);
            setNewDeckTitle('');
            setUploadedFile(null);
            setExtractedText('');
            setExtractError('');
            setResumeSuggestions([]);
            setResumeBatchIndex(0);
            setResumeHasMore(false);
            setRegeneratingIndex(null);

            if (deckId) {
                setSaveMode('existing');
                setSelectedDeckId(deckId);
            } else {
                // Load saved preference from localStorage
                const savedMode = localStorage.getItem('ai-save-mode') as 'new' | 'existing' | null;
                const savedDeckId = localStorage.getItem('ai-save-deck-id');
                if (savedMode) {
                    setSaveMode(savedMode);
                }
                if (savedDeckId) {
                    setSelectedDeckId(savedDeckId);
                }
            }

            fetchUserDecks();
            fetchUsageStatus();
        }
    }, [isOpen, deckId]);

    const fetchUsageStatus = async () => {
        try {
            const status = await aiService.getUsageStatus();
            setUsageStatus(status);
        } catch (error) {
            console.error('Failed to fetch usage status:', error);
        }
    };

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

        // Check file type
        const allowedTypes = ['.pdf', '.docx', '.txt'];
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedTypes.includes(ext)) {
            setExtractError('不支持的文件格式，请上传 PDF、DOCX 或 TXT 文件');
            return;
        }

        // Check file size (10MB limit)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            setExtractError('文件大小超过10MB限制');
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
            setExtractError(formatApiError(error));
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

        // Check file size (10MB limit)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            setExtractError('文件大小超过10MB限制');
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
            setExtractError(formatApiError(error));
            setExtractedText('');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleGenerate = async () => {
        const textToGenerate = sourceType === 'file' ? extractedText : topic;
        if (!textToGenerate.trim()) return;

        // 1. Check usage limit BEFORE starting
        if (usageStatus && usageStatus.remaining <= 0) {
            toast.error('您今天的 AI 生成次数已用尽，请明天再试或升级会员。');
            return;
        }

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
            // Refresh usage status after generation
            fetchUsageStatus();
        } catch (error: any) {
            console.error('Generation failed:', error);
            setStep('input');
            const errorMessage = formatApiError(error);
            toast.error(errorMessage);
        }
    };

    // Resume Interview Handlers
    const handleResumeAnalysis = async () => {
        if (!extractedText.trim()) return;

        // 1. Check usage limit BEFORE starting
        if (usageStatus && usageStatus.remaining <= 0) {
            toast.error('您今天的 AI 生成次数已用尽，请明天再试或升级会员。');
            return;
        }

        setStep('generating');
        try {
            const result = await aiService.analyzeResume(extractedText, 0);
            setResumeSuggestions(result.suggestions);
            setGeneratedCards(result.interviewCards);
            setResumeBatchIndex(result.nextBatchIndex);
            setResumeHasMore(result.hasMore);
            if (!deckId) {
                setNewDeckTitle(uploadedFile
                    ? `面试准备 - ${uploadedFile.name.replace(/\.[^.]+$/, '')}`
                    : '简历面试练习');
            }
            setStep('preview');
            // Refresh usage status after analysis
            fetchUsageStatus();
        } catch (error: any) {
            console.error('Resume analysis failed:', error);
            setStep('input');
            toast.error(formatApiError(error));
        }
    };

    const handleContinueResume = async () => {
        if (!extractedText.trim() || !resumeHasMore) return;

        setIsLoadingMore(true);
        try {
            const result = await aiService.analyzeResume(extractedText, resumeBatchIndex);
            setGeneratedCards(prev => [...prev, ...result.interviewCards]);
            setResumeBatchIndex(result.nextBatchIndex);
            setResumeHasMore(result.hasMore);
            // Refresh usage status after continuing
            fetchUsageStatus();
        } catch (error: any) {
            console.error('Continue resume failed:', error);
            toast.error(formatApiError(error));
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleRegenerateCard = async (index: number) => {
        const card = generatedCards[index];
        if (!card) return;

        // Check usage limit BEFORE starting
        if (usageStatus && usageStatus.remaining <= 0) {
            toast.error('您今天的 AI 生成次数已用尽，请明天再试或升级会员。');
            return;
        }

        setRegeneratingIndex(index);
        try {
            const context = modalMode === 'resume' ? extractedText.slice(0, 500) : topic;
            const newCard = await aiService.regenerateCard(
                { front: card.front, back: card.back },
                context
            );
            setGeneratedCards(prev => {
                const updated = [...prev];
                updated[index] = newCard;
                return updated;
            });
            // Refresh usage status after regeneration
            fetchUsageStatus();
        } catch (error: any) {
            console.error('Card regeneration failed:', error);
            toast.error(formatApiError(error));
        } finally {
            setRegeneratingIndex(null);
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

            // Save user preference to localStorage
            if (!deckId) {
                localStorage.setItem('ai-save-mode', saveMode);
                if (saveMode === 'existing' && targetDeckId) {
                    localStorage.setItem('ai-save-deck-id', targetDeckId);
                }
            }

            // Show success message
            toast.success(`已保存 ${generatedCards.length} 张卡片`);

            // Refresh usage status after saving
            fetchUsageStatus();
            fetchUserDecks();

            // Reset cards and return to input step for continued generation
            setGeneratedCards([]);
            setStep('input');

            if (onCardsAdded) onCardsAdded();

        } catch (error: any) {
            console.error('Save failed:', error);
            toast.error(`保存失败: ${error.message || '未知错误'}`);
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
                        {usageStatus && (
                            <span className={styles.usageBadge}>
                                {usageStatus.remaining}/{usageStatus.limit} 次可用
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <LuX size={20} />
                    </button>
                </div>

                {/* Mode Tabs */}
                {step === 'input' && (
                    <div className={styles.modeTabs}>
                        <button
                            className={`${styles.modeTab} ${modalMode === 'flashcard' ? styles.active : ''}`}
                            onClick={() => setModalMode('flashcard')}
                        >
                            <LuSparkles size={16} />
                            闪卡生成
                        </button>
                        <button
                            className={`${styles.modeTab} ${modalMode === 'resume' ? styles.active : ''}`}
                            onClick={() => setModalMode('resume')}
                        >
                            <LuBriefcase size={16} />
                            简历面试
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className={styles.body}>
                    {/* Input Step */}
                    {step === 'input' && (
                        <div className={styles.inputStep}>
                            {/* Flashcard Mode Content */}
                            {modalMode === 'flashcard' && (
                                <>
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
                                                        <span className={styles.uploadHint}>支持 PDF、DOCX、TXT 格式，最大 10MB</span>
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
                                </>
                            )}

                            {/* Resume Interview Mode Content */}
                            {modalMode === 'resume' && (
                                <>
                                    <div className={styles.resumeIntro}>
                                        <h4>📄 简历面试模式</h4>
                                        <p>上传您的简历，AI将分析并生成模拟面试问答卡片</p>
                                    </div>

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
                                                <span>正在提取简历内容...</span>
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
                                                <span>拖拽简历到此处，或点击上传</span>
                                                <span className={styles.uploadHint}>支持 PDF、DOCX、TXT 格式，最大 10MB</span>
                                            </div>
                                        )}
                                    </div>
                                    {extractError && <p className={styles.errorText}>{extractError}</p>}

                                    <div className={styles.generateActions}>
                                        <button
                                            onClick={handleResumeAnalysis}
                                            disabled={!extractedText}
                                            className={styles.primaryBtn}
                                        >
                                            <LuBriefcase size={18} />
                                            <span>开始分析</span>
                                        </button>
                                    </div>
                                </>
                            )}
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
                            </div>

                            <div className={styles.cardsList}>
                                {generatedCards.map((card, i) => (
                                    <div key={i} className={`${styles.miniCard} ${regeneratingIndex === i ? styles.regenerating : ''}`}>
                                        <div className={styles.cardHeader}>
                                            <span className={styles.cardIndex}>#{i + 1}</span>
                                            <button
                                                className={styles.regenerateBtn}
                                                onClick={() => handleRegenerateCard(i)}
                                                disabled={regeneratingIndex !== null}
                                                title="重新生成此卡片"
                                            >
                                                <LuRefreshCw size={14} className={regeneratingIndex === i ? styles.spinning : ''} />
                                            </button>
                                        </div>
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

                            {/* Resume Suggestions - Only in resume mode */}
                            {modalMode === 'resume' && resumeSuggestions.length > 0 && (
                                <div className={styles.resumeSuggestions}>
                                    <h5>📝 简历优化建议</h5>
                                    <ul>
                                        {resumeSuggestions.map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Continue Generating - Resume mode only */}
                            {modalMode === 'resume' && resumeHasMore && (
                                <div className={styles.continueSection}>
                                    <button
                                        className={styles.continueBtn}
                                        onClick={handleContinueResume}
                                        disabled={isLoadingMore}
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <LuLoader size={16} className={styles.spinning} />
                                                生成中...
                                            </>
                                        ) : (
                                            <>
                                                <LuPlus size={16} />
                                                继续生成更多面试题
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Save Options - Unified control */}
                            <div className={styles.saveSection}>
                                <div className={styles.saveRowContent}>
                                    <select
                                        value={saveMode === 'new' ? 'new' : selectedDeckId}
                                        onChange={(e) => {
                                            if (e.target.value === 'new') {
                                                setSaveMode('new');
                                                setSelectedDeckId('');
                                            } else {
                                                setSaveMode('existing');
                                                setSelectedDeckId(e.target.value);
                                            }
                                        }}
                                        className={styles.saveSelect}
                                        disabled={!!deckId}
                                    >
                                        <option value="new">✨ 创建新牌组</option>
                                        {userDecks.map(d => (
                                            <option key={d.id} value={d.id}>📚 {d.title}</option>
                                        ))}
                                    </select>
                                    {saveMode === 'new' && (
                                        <input
                                            type="text"
                                            value={newDeckTitle}
                                            onChange={(e) => setNewDeckTitle(e.target.value)}
                                            placeholder="输入新牌组名称"
                                            className={styles.saveInput}
                                        />
                                    )}
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || (saveMode === 'new' && !newDeckTitle.trim()) || (saveMode === 'existing' && !selectedDeckId)}
                                        className={styles.saveBtn}
                                    >
                                        {isSaving ? <LuLoader className={styles.spinning} size={14} /> : <LuSave size={14} />}
                                        保存卡片
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
