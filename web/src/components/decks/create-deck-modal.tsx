'use client';

import React, { useState } from 'react';
import styles from './create-deck-modal.module.css';

interface CreateDeckModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; is_public: boolean }) => Promise<void>;
}

export function CreateDeckModal({ isOpen, onClose, onSubmit }: CreateDeckModalProps) {
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
            alert('创建失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>新建卡组</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>名称</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="例如：英语四级词汇"
                            autoFocus
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>描述 (可选)</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="简单描述这个卡组的内容..."
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
                            取消
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading || !title.trim()}
                        >
                            {loading ? '创建中...' : '创建'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
