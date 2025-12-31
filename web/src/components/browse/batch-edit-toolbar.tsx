'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import styles from './batch-edit-toolbar.module.css';

interface Props {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onAddTags: () => void;
    onMoveDeck: () => void;
    onResetProgress: () => void;
    onDelete: () => void;
}

export default function BatchEditToolbar({
    selectedCount,
    totalCount,
    onSelectAll,
    onDeselectAll,
    onAddTags,
    onMoveDeck,
    onResetProgress,
    onDelete
}: Props) {
    const t = useTranslations('Browse');
    if (selectedCount === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.info}>
                <span className={styles.count}>{t('selectedCount', { count: selectedCount })}</span>
                {selectedCount < totalCount ? (
                    <button className={styles.selectButton} onClick={onSelectAll}>
                        {t('selectAll', { count: totalCount })}
                    </button>
                ) : (
                    <button className={styles.selectButton} onClick={onDeselectAll}>
                        {t('deselectAll')}
                    </button>
                )}
            </div>

            <div className={styles.actions}>
                <button className={styles.actionButton} onClick={onAddTags}>
                    🏷️ {t('addTags')}
                </button>
                <button className={styles.actionButton} onClick={onMoveDeck}>
                    📁 {t('moveDeck')}
                </button>
                <button className={styles.actionButton} onClick={onResetProgress}>
                    🔄 {t('resetProgress')}
                </button>
                <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={onDelete}>
                    🗑️ {t('delete')}
                </button>
            </div>
        </div>
    );
}
