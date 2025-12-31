'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import styles from './toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastProps {
    toast: ToastItem;
    onClose: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
};

function Toast({ toast, onClose }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);
    const duration = toast.duration ?? 4000;

    useEffect(() => {
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, duration - 250);

        const removeTimer = setTimeout(() => {
            onClose(toast.id);
        }, duration);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, duration, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(toast.id), 250);
    };

    return (
        <div
            className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
            role="alert"
        >
            <div className={styles.iconContainer}>
                {icons[toast.type]}
            </div>
            <div className={styles.content}>
                <p className={styles.message}>{toast.message}</p>
            </div>
            <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close notification"
            >
                <X size={14} />
            </button>
            <div
                className={styles.progressBar}
                style={{ animationDuration: `${duration}ms` }}
            />
        </div>
    );
}

interface ToastContainerProps {
    toasts: ToastItem[];
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className={styles.container}>
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
}

export default Toast;
