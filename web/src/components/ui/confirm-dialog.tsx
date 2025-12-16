'use client';

import { useState } from 'react';
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
    confirmText = '确认',
    cancelText = '取消',
    variant = 'warning',
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    const [isProcessing, setIsProcessing] = useState(false);

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
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.button} ${styles.confirmButton}`}
                        onClick={handleConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? '处理中...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
