'use client';

import React from 'react';
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
    if (selectedCount === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.info}>
                <span className={styles.count}>已选择 {selectedCount} 张卡片</span>
                {selectedCount < totalCount ? (
                    <button className={styles.selectButton} onClick={onSelectAll}>
                        全选 ({totalCount})
                    </button>
                ) : (
                    <button className={styles.selectButton} onClick={onDeselectAll}>
                        取消全选
                    </button>
                )}
            </div>

            <div className={styles.actions}>
                <button className={styles.actionButton} onClick={onAddTags}>
                    🏷️ 添加标签
                </button>
                <button className={styles.actionButton} onClick={onMoveDeck}>
                    📁 移动卡组
                </button>
                <button className={styles.actionButton} onClick={onResetProgress}>
                    🔄 重置进度
                </button>
                <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={onDelete}>
                    🗑️ 删除
                </button>
            </div>
        </div>
    );
}
