'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/types/decks';
import ImageUpload from '@/components/media/image-upload';
import { deleteImage } from '@/lib/media';
import { useToast } from '@/lib/contexts/toast-context';
import { formatApiError } from '@/lib/error-handler';
import styles from './edit-card-modal.module.css';

interface EditCardModalProps {
    isOpen: boolean;
    card: Card | null;
    userId: string;  // Add userId for image upload
    deckId: string;  // Add deckId for image upload
    onClose: () => void;
    onSave: (cardId: string, updates: {
        front: string;
        back: string;
        tags: string[];
        front_media?: string | null;
        back_media?: string | null;
    }) => Promise<void>;
}

export default function EditCardModal({ isOpen, card, userId, deckId, onClose, onSave }: EditCardModalProps) {
    const t = useTranslations('EditCard');
    const toast = useToast();
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [tags, setTags] = useState('');
    const [frontMedia, setFrontMedia] = useState<string | null>(null);
    const [backMedia, setBackMedia] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (card) {
            setFront(card.front);
            setBack(card.back);
            setTags(card.tags?.join(', ') || '');
            setFrontMedia(card.front_media || null);
            setBackMedia(card.back_media || null);
        }
    }, [card]);

    if (!isOpen || !card) return null;

    const handleSave = async () => {
        if (!front.trim() || !back.trim()) {
            toast.warning(t('emptyError'));
            return;
        }

        setSaving(true);
        try {
            const tagsArray = tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            // Delete old media if changed
            if (card?.front_media && card.front_media !== frontMedia) {
                await deleteImage(card.front_media);
            }
            if (card?.back_media && card.back_media !== backMedia) {
                await deleteImage(card.back_media);
            }

            await onSave(card!.id, {
                front: front.trim(),
                back: back.trim(),
                tags: tagsArray,
                front_media: frontMedia,
                back_media: backMedia
            });

            onClose();
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(formatApiError(error));
        } finally {
            setSaving(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !saving) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && !saving) {
            onClose();
        }
        if (e.key === 'Enter' && e.metaKey) {
            handleSave();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick} onKeyDown={handleKeyDown}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('title')}</h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={saving}
                    >
                        ×
                    </button>
                </div>

                <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('front')}</label>
                        <textarea
                            className={styles.textarea}
                            value={front}
                            onChange={(e) => setFront(e.target.value)}
                            placeholder={t('frontPlaceholder')}
                            autoFocus
                            disabled={saving}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('back')}</label>
                        <textarea
                            className={styles.textarea}
                            value={back}
                            onChange={(e) => setBack(e.target.value)}
                            placeholder={t('backPlaceholder')}
                            disabled={saving}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('tags')}</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder={t('tagsPlaceholder')}
                            disabled={saving}
                        />
                        <span className={styles.hint}>{t('tagsHint')}</span>
                    </div>

                    <div className={styles.formGroup}>
                        <ImageUpload
                            userId={userId}
                            deckId={deckId}
                            cardId={card?.id || 'temp'}
                            currentImage={frontMedia}
                            label={t('frontImage')}
                            onUploadComplete={(url) => setFrontMedia(url)}
                            onDelete={() => setFrontMedia(null)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <ImageUpload
                            userId={userId}
                            deckId={deckId}
                            cardId={card?.id || 'temp'}
                            currentImage={backMedia}
                            label={t('backImage')}
                            onUploadComplete={(url) => setBackMedia(url)}
                            onDelete={() => setBackMedia(null)}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={`${styles.button} ${styles.cancelButton}`}
                            onClick={onClose}
                            disabled={saving}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className={`${styles.button} ${styles.saveButton}`}
                            disabled={saving}
                        >
                            {saving ? t('saving') : t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
