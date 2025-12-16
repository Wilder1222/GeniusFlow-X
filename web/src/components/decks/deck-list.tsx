'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Deck } from '@/types/decks';
import { apiClient } from '@/lib/api-client';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import styles from './deck-list.module.css';

interface DeckListProps {
    decks: Deck[];
    onCreateClick?: () => void;
    onDeckDeleted?: () => void;
}

export function DeckList({ decks, onCreateClick, onDeckDeleted }: DeckListProps) {
    const router = useRouter();
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
                throw new Error(data.error?.message || '删除失败');
            }

            // Close dialog
            setDeleteDialog({ isOpen: false, deck: null });

            // Notify parent to refresh
            if (onDeckDeleted) {
                onDeckDeleted();
            }
        } catch (error: any) {
            console.error('Delete deck error:', error);
            alert('删除失败：' + error.message);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialog({ isOpen: false, deck: null });
    };

    if (decks.length === 0) {
        return (
            <div className={styles.emptyState}>
                <h3>还没有卡组</h3>
                <p style={{ marginBottom: '24px' }}>创建一个卡组开始学习吧</p>
                <button className={styles.createButton} onClick={onCreateClick}>
                    + 新建卡组
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
                            <p className={styles.cardDesc}>{deck.description || '无描述'}</p>
                        </div>
                        <div className={styles.cardFooter}>
                            <span>{deck.tags.length > 0 ? deck.tags[0] : '默认'}</span>
                            <span>{new Date(deck.created_at).toLocaleDateString()}</span>
                        </div>

                        {/* Delete button */}
                        <button
                            className={styles.deleteButton}
                            onClick={(e) => handleDeleteClick(e, deck)}
                            title="删除卡组"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                title="删除卡组"
                message="确定要删除这个卡组吗？"
                details={deleteDialog.deck ? `卡组「${deleteDialog.deck.title}」及其所有卡片将被永久删除，此操作不可恢复。` : ''}
                variant="danger"
                confirmText="删除"
                cancelText="取消"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    );
}
