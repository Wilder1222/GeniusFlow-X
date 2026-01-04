'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Deck } from '@/types/decks';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/lib/contexts/toast-context';
import { formatApiError } from '@/lib/error-handler';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import styles from './deck-list.module.css';

interface DeckListProps {
    decks: Deck[];
    onCreateClick?: () => void;
    onDeckDeleted?: () => void;
}

export function DeckList({ decks, onCreateClick, onDeckDeleted }: DeckListProps) {
    const router = useRouter();
    const toast = useToast();
    const t = useTranslations('Decks');
    const tCommon = useTranslations('Common');
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; deck: Deck | null }>({
        isOpen: false,
        deck: null
    });

    const handleDeleteClick = (e: React.MouseEvent, deck: Deck) => {
        e.stopPropagation(); // Prevent navigation
        setDeleteDialog({ isOpen: true, deck });
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialog.deck) return;

        try {
            const data = await apiClient.delete(`/api/decks/${deleteDialog.deck.id}`);

            if (!data.success) {
                throw new Error(data.error?.message || t('deleteFailed'));
            }

            // Close dialog
            setDeleteDialog({ isOpen: false, deck: null });

            // Notify parent to refresh
            if (onDeckDeleted) {
                onDeckDeleted();
            }
        } catch (error: any) {
            console.error('Delete deck error:', error);
            toast.error(formatApiError(error));
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialog({ isOpen: false, deck: null });
    };

    if (decks.length === 0) {
        return (
            <div className={styles.emptyState}>
                <h3>{t('emptyTitle')}</h3>
                <p style={{ marginBottom: '24px' }}>{t('emptySubtitle')}</p>
                <button className={styles.createButton} onClick={onCreateClick}>
                    {t('create')}
                </button>
            </div>
        );
    }

    return (
        <>
            <div className={styles.deckGrid}>
                {decks.map((deck) => (
                    <div
                        key={deck.id}
                        className={styles.deckCard}
                        onClick={() => router.push(`/decks/${deck.id}`)}
                    >
                        <div>
                            <h3 className={styles.cardTitle}>{deck.title}</h3>
                            <p className={styles.cardDesc}>{deck.description || t('noDescription')}</p>
                        </div>
                        <div className={styles.cardFooter}>
                            <span>{deck.tags.length > 0 ? (deck.tags[0] || t('defaultTag')) : t('defaultTag')}</span>
                            <span>{new Date(deck.created_at).toLocaleDateString()}</span>
                        </div>

                        {/* Delete button */}
                        <button
                            className={styles.deleteButton}
                            onClick={(e) => handleDeleteClick(e, deck)}
                            title={t('deleteDeck')}
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                title={t('deleteConfirmTitle')}
                message={t('deleteConfirmMessage')}
                details={deleteDialog.deck ? t('deleteConfirmDetails', { title: deleteDialog.deck.title }) : ''}
                variant="danger"
                confirmText={t('deleteDeck')}
                cancelText={tCommon('cancel')}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    );
}
