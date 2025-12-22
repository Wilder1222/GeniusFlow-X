'use client';

import React from 'react';
import styles from './loading-modal.module.css';

interface LoadingModalProps {
    isOpen: boolean;
    message?: string;
}

export function LoadingModal({ isOpen, message = '登录中...' }: LoadingModalProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.spinner}>
                    <svg className={styles.spinnerIcon} viewBox="0 0 50 50">
                        <circle
                            className={styles.path}
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            strokeWidth="5"
                        ></circle>
                    </svg>
                </div>
                <p className={styles.message}>{message}</p>
            </div>
        </div>
    );
}
