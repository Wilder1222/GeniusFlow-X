'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/types/decks';
import ImageUpload from '@/components/media/image-upload';
import { deleteImage } from '@/lib/media';
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
            alert('正面和背面不能为空');
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
            alert('保存失败：' + error.message);
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
                    <h2 className={styles.title}>编辑卡片</h2>
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
                        <label className={styles.label}>正面（问题）</label>
                        <textarea
                            className={styles.textarea}
                            value={front}
                            onChange={(e) => setFront(e.target.value)}
                            placeholder="输入问题..."
                            autoFocus
                            disabled={saving}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>背面（答案）</label>
                        <textarea
                            className={styles.textarea}
                            value={back}
                            onChange={(e) => setBack(e.target.value)}
                            placeholder="输入答案..."
                            disabled={saving}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>标签</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="标签1, 标签2, ..."
                            disabled={saving}
                        />
                        <span className={styles.hint}>使用逗号分隔多个标签</span>
                    </div>

                    <div className={styles.formGroup}>
                        <ImageUpload
                            userId={userId}
                            deckId={deckId}
                            cardId={card?.id || 'temp'}
                            currentImage={frontMedia}
                            label="正面图片（可选）"
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
                            label="背面图片（可选）"
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
                            取消
                        </button>
                        <button
                            type="submit"
                            className={`${styles.button} ${styles.saveButton}`}
                            disabled={saving}
                        >
                            {saving ? '保存中...' : '保存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
