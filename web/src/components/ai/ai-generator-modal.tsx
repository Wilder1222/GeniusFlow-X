'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
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
    const tAI = useTranslations('AI');
    const tDomain = useTranslations('AIDomains');
    const tError = useTranslations('Errors');
    const tCommon = useTranslations('Common');
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
            setExtractError(tAI('unsupportedFormat'));
            return;
        }

        // Check file size (10MB limit)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            setExtractError(tAI('fileTooLarge'));
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
            setExtractError(tAI('unsupportedFormat'));
            return;
        }

        // Check file size (10MB limit)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            setExtractError(tAI('fileTooLarge'));
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
            toast.error(tAI('usageLimitReached'));
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
                const domainName = tDomain(`${selectedDomain}.name`);
                setNewDeckTitle(sourceType === 'file' && uploadedFile
                    ? uploadedFile.name.replace(/\.[^.]+$/, '')
                    : `${domainName} - ${topic.slice(0, 20)}`);
            }
            setStep('preview');
            // Refresh usage status after generation
            fetchUsageStatus();
        } catch (error: any) {
            console.error('Generation failed:', error);
            setStep('input');
            const errorCode = formatApiError(error);
            toast.error(tError(errorCode));
        }
    };

    // Resume Interview Handlers
    const handleResumeAnalysis = async () => {
        if (!extractedText.trim()) return;

        // 1. Check usage limit BEFORE starting
        if (usageStatus && usageStatus.remaining <= 0) {
            toast.error(tAI('usageLimitReached'));
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
                    ? `${tAI('resumeTitlePrefix')} - ${uploadedFile.name.replace(/\.[^.]+$/, '')}`
                    : tAI('resumeDefaultTitle'));
            }
            setStep('preview');
            // Refresh usage status after analysis
            fetchUsageStatus();
        } catch (error: any) {
            console.error('Resume analysis failed:', error);
            setStep('input');
            toast.error(tError(formatApiError(error)));
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
            toast.error(tAI('usageLimitReached'));
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
            toast.success(tAI('saved', { count: generatedCards.length }));

            // Refresh usage status after saving
            fetchUsageStatus();
            fetchUserDecks();

            // Reset cards and return to input step for continued generation
            setGeneratedCards([]);
            setStep('input');

            if (onCardsAdded) onCardsAdded();

        } catch (error: any) {
            console.error('Save failed:', error);
            toast.error(tAI('saveFailed', { error: error.message || tCommon('unknownError') }));
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
                            <button onClick={goBack} className={styles.backBtn} title={tCommon('back')}>
                                <LuArrowLeft size={20} />
                            </button>
                        )}
                        <div className={styles.iconBox}>
                            <LuSparkles size={20} />
                        </div>
                        <h3>{tAI('title')}</h3>
                        {usageStatus && (
                            <span className={styles.usageBadge}>
                                {tAI('usageRemaining', { remaining: usageStatus.remaining, limit: usageStatus.limit })}
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
                            {tAI('flashcardMode')}
                        </button>
                        <button
                            className={`${styles.modeTab} ${modalMode === 'resume' ? styles.active : ''}`}
                            onClick={() => setModalMode('resume')}
                        >
                            <LuBriefcase size={16} />
                            {tAI('resumeMode')}
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
                                        <span className={styles.domainTagsLabel}>{tAI('selectDomain')}</span>
                                        <div className={styles.domainTags}>
                                            {AI_DOMAINS.map(domain => (
                                                <button
                                                    key={domain.id}
                                                    className={`${styles.domainTag} ${selectedDomain === domain.id ? styles.domainTagActive : ''}`}
                                                    onClick={() => setSelectedDomain(domain.id)}
                                                    style={{ '--domain-color': domain.color } as React.CSSProperties}
                                                >
                                                    <span>{domain.icon}</span>
                                                    <span>{tDomain(`${domain.id}.name`)}</span>
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
                                            {tAI('textInput')}
                                        </button>
                                        <button
                                            className={`${styles.sourceTab} ${sourceType === 'file' ? styles.active : ''}`}
                                            onClick={() => setSourceType('file')}
                                        >
                                            <LuUpload size={16} />
                                            {tAI('uploadFile')}
                                        </button>
                                    </div>

                                    {/* Text Input */}
                                    {sourceType === 'text' && (
                                        <>
                                            <div className={styles.inputWrapper}>
                                                <textarea
                                                    value={topic}
                                                    onChange={(e) => setTopic(e.target.value)}
                                                    placeholder={tAI('placeholder', { suggestion: (tDomain.raw(`${selectedDomain}.suggestions`) as string[])[0] })}
                                                    className={styles.topicTextarea}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className={styles.suggestions}>
                                                <span>{tAI('suggestions')}</span>
                                                {(tDomain.raw(`${selectedDomain}.suggestions`) as string[]).map((t: string) => (
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
                                                        <span>{tAI('extracting')}</span>
                                                    </div>
                                                ) : uploadedFile ? (
                                                    <div className={styles.uploadedFileInfo}>
                                                        <LuFileText size={32} />
                                                        <span className={styles.fileName}>{uploadedFile.name}</span>
                                                        <span className={styles.fileSize}>
                                                            {extractedText ? `${extractedText.length} ${tAI('characters')}` : tAI('extracting')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className={styles.uploadPrompt}>
                                                        <LuUpload size={32} />
                                                        <span>{tAI('dragDrop')}</span>
                                                        <span className={styles.uploadHint}>{tAI('supportedFormats')}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {extractError && <p className={styles.errorText}>{extractError}</p>}
                                            {extractedText && (
                                                <div className={styles.extractedPreview}>
                                                    <span className={styles.previewLabel}>{tAI('extractPreview')}</span>
                                                    <p>{extractedText.slice(0, 200)}...</p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Card Count & Generate */}
                                    <div className={styles.generateActions}>
                                        <div className={styles.countSelector}>
                                            <span className={styles.selectorLabel}>{tAI('quantity')}</span>
                                            <div className={styles.countButtons}>
                                                {(['auto', 3, 5, 10] as const).map(count => (
                                                    <button
                                                        key={count}
                                                        onClick={() => setCardCount(count)}
                                                        className={`${styles.countBtn} ${cardCount === count ? styles.countBtnActive : ''}`}
                                                    >
                                                        {count === 'auto' ? tAI('auto') : `${count}${tAI('cards')}`}
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
                                            <span>{tAI('generate')}</span>
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Resume Interview Mode Content */}
                            {modalMode === 'resume' && (
                                <>
                                    <div className={styles.resumeIntro}>
                                        <h4>{tAI('resumeIntroTitle')}</h4>
                                        <p>{tAI('resumeIntroDesc')}</p>
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
                                                <span>{tAI('extractingResume')}</span>
                                            </div>
                                        ) : uploadedFile ? (
                                            <div className={styles.uploadedFileInfo}>
                                                <LuFileText size={32} />
                                                <span className={styles.fileName}>{uploadedFile.name}</span>
                                                <span className={styles.fileSize}>
                                                    {extractedText ? `${extractedText.length} ${tAI('characters')}` : tAI('extracting')}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className={styles.uploadPrompt}>
                                                <LuUpload size={32} />
                                                <span>{tAI('dragDrop')}</span>
                                                <span className={styles.uploadHint}>{tAI('supportedFormats')}</span>
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
                                            <span>{tAI('startAnalysis')}</span>
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
                            <h4>{tAI('generating')}</h4>
                            <p>{tAI('generatingHint', { domain: tDomain(`${selectedDomain}.name`) })}</p>
                        </div>
                    )}

                    {/* Preview Step */}
                    {step === 'preview' && (
                        <div className={styles.previewStep}>
                            <div className={styles.previewHeader}>
                                <h4>
                                    <LuCheck size={18} className={styles.successIcon} />
                                    {tAI('generated', { count: generatedCards.length })}
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
                                                title={tAI('regenerate')}
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
                                    <h5>{tAI('resumeSuggestions')}</h5>
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
                                                {tAI('generatingMore')}
                                            </>
                                        ) : (
                                            <>
                                                <LuPlus size={16} />
                                                {tAI('continueGenerate')}
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
                                        <option value="new">✨ {tAI('createNewDeck')}</option>
                                        {userDecks.map(d => (
                                            <option key={d.id} value={d.id}>📚 {d.title}</option>
                                        ))}
                                    </select>
                                    {saveMode === 'new' && (
                                        <input
                                            type="text"
                                            value={newDeckTitle}
                                            onChange={(e) => setNewDeckTitle(e.target.value)}
                                            placeholder={tAI('newDeckPlaceholder')}
                                            className={styles.saveInput}
                                        />
                                    )}
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || (saveMode === 'new' && !newDeckTitle.trim()) || (saveMode === 'existing' && !selectedDeckId)}
                                        className={styles.saveBtn}
                                    >
                                        {isSaving ? <LuLoader className={styles.spinning} size={14} /> : <LuSave size={14} />}
                                        {tAI('saveCards')}
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
