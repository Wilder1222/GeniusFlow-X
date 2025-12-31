'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './confirm-dialog.module.css';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    details?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'warning' | 'danger';
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    details,
    confirmText,
    cancelText,
    variant = 'warning',
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const t = useTranslations('ConfirmDialog');

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await onConfirm();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isProcessing) {
            onCancel();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.dialog}>
                <div className={`${styles.iconContainer} ${styles[variant]}`}>
                    {variant === 'warning' ? '⚠️' : '🗑️'}
                </div>

                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>

                {details && (
                    <div className={styles.details}>
                        {details}
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        className={`${styles.button} ${styles.cancelButton}`}
                        onClick={onCancel}
                        disabled={isProcessing}
                    >
                        {cancelText || t('cancel')}
                    </button>
                    <button
                        className={`${styles.button} ${styles.confirmButton}`}
                        onClick={handleConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? t('processing') : (confirmText || t('confirm'))}
                    </button>
                </div>
            </div>
        </div>
    );
}
