'use client';

import React from 'react';
import styles from './input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    fullWidth = false,
    className = '',
    ...props
}) => {
    return (
        <div className={`${styles.inputWrapper} ${fullWidth ? styles.fullWidth : ''}`}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                className={`${styles.input} ${error ? styles.error : ''} ${className}`}
                {...props}
            />
            {error && <span className={styles.errorText}>{error}</span>}
            {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
        </div>
    );
};
