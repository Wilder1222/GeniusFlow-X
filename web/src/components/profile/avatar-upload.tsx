'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components';
import { uploadAvatar } from '@/lib/profile';
import styles from './avatar-upload.module.css';

export interface AvatarUploadProps {
    currentAvatarUrl?: string | null;
    displayName?: string | null;
    onUpload?: (url: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, displayName, onUpload }: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitials = (name: string | null | undefined): string => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            setError('请选择图片文件');
            return;
        }

        // 验证文件大小（最大 2MB）
        if (file.size > 2 * 1024 * 1024) {
            setError('图片大小不能超过 2MB');
            return;
        }

        setError('');

        // 创建预览
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // 上传文件
        handleUpload(file);
    };

    const handleUpload = async (file: File) => {
        setLoading(true);
        setError('');

        try {
            const url = await uploadAvatar(file);
            onUpload?.(url);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : '上传失败';
            setError(errorMessage);
            setPreview(null);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const avatarSrc = preview || currentAvatarUrl;

    return (
        <div className={styles.container}>
            <div className={styles.avatarWrapper} onClick={handleClick}>
                {avatarSrc ? (
                    <img src={avatarSrc} alt="头像" className={styles.avatar} />
                ) : (
                    <div className={styles.placeholder}>
                        {getInitials(displayName)}
                    </div>
                )}
                <div className={styles.overlay}>
                    <span className={styles.overlayIcon}>📷</span>
                    <span className={styles.overlayText}>更换头像</span>
                </div>
                {loading && (
                    <div className={styles.loadingOverlay}>
                        <span className={styles.spinner}>⏳</span>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className={styles.fileInput}
            />

            {error && <p className={styles.error}>{error}</p>}

            <p className={styles.hint}>
                点击上传新头像<br />
                支持 JPG、PNG，最大 2MB
            </p>
        </div>
    );
}
