'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/lib/contexts/toast-context';
import styles from './create-deck-modal.module.css';

interface CreateDeckModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; is_public: boolean }) => Promise<void>;
}

export function CreateDeckModal({ isOpen, onClose, onSubmit }: CreateDeckModalProps) {
    const toast = useToast();
    const t = useTranslations('CreateDeck');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            await onSubmit({ title, description, is_public: isPublic });
            // Reset form
            setTitle('');
            setDescription('');
            setIsPublic(false);
            onClose();
        } catch (error) {
            console.error('Create deck failed:', error);
            toast.error(t('failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{t('title')}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('name')}</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            autoFocus
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('description')}</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={t('descriptionPlaceholder')}
                        />
                    </div>

                    {/* Add checkbox for public later if needed */}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={loading}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading || !title.trim()}
                        >
                            {loading ? t('creating') : t('create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
