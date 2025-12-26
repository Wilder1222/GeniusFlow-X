'use client';

import React, { createContext, useContext, useCallback, useState, useMemo } from 'react';
import { ToastContainer, ToastItem, ToastType } from '@/components/ui/toast';

interface ToastContextType {
    toasts: ToastItem[];
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    dismiss: (id: string) => void;
    dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
        const id = `toast-${++toastIdCounter}`;
        const newToast: ToastItem = { id, type, message, duration };

        setToasts((prev) => {
            // 限制最多显示 5 个 Toast
            const limited = prev.length >= 5 ? prev.slice(1) : prev;
            return [...limited, newToast];
        });

        return id;
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const dismissAll = useCallback(() => {
        setToasts([]);
    }, []);

    const success = useCallback((message: string, duration?: number) => {
        return addToast('success', message, duration);
    }, [addToast]);

    const error = useCallback((message: string, duration?: number) => {
        return addToast('error', message, duration ?? 5000); // 错误提示显示更久
    }, [addToast]);

    const warning = useCallback((message: string, duration?: number) => {
        return addToast('warning', message, duration);
    }, [addToast]);

    const info = useCallback((message: string, duration?: number) => {
        return addToast('info', message, duration);
    }, [addToast]);

    const contextValue = useMemo(() => ({
        toasts,
        success,
        error,
        warning,
        info,
        dismiss,
        dismissAll,
    }), [toasts, success, error, warning, info, dismiss, dismissAll]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer toasts={toasts} onClose={dismiss} />
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export default ToastContext;
