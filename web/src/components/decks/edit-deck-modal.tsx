'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Deck } from '@/types/decks';
import { useToast } from '@/lib/contexts/toast-context';
import { formatApiError } from '@/lib/error-handler';
import styles from './edit-deck-modal.module.css';

interface EditDeckModalProps {
    isOpen: boolean;
    deck: Deck | null;
    onClose: () => void;
    onSave: (deckId: string, updates: { title: string; description: string }) => Promise<void>;
}

export default function EditDeckModal({ isOpen, deck, onClose, onSave }: EditDeckModalProps) {
    const t = useTranslations('EditDeck');
    const toast = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (deck) {
            setTitle(deck.title);
            setDescription(deck.description || '');
        }
    }, [deck]);

    if (!isOpen || !deck) return null;

    const handleSave = async () => {
        if (!title.trim()) {
            toast.warning(t('nameRequired'));
            return;
        }

        setSaving(true);
        try {
            await onSave(deck.id, {
                title: title.trim(),
                description: description.trim()
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
                        <label className={styles.label}>{t('name')}</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            autoFocus
                            disabled={saving}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('description')}</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('descriptionPlaceholder')}
                            disabled={saving}
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
