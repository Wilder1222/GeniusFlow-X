'use client';

import React, { useState, useRef, DragEvent } from 'react';
import { uploadImage } from '@/lib/media';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/types/media';
import styles from './image-upload.module.css';

interface ImageUploadProps {
    userId: string;
    deckId: string;
    cardId: string;
    currentImage?: string | null;
    onUploadComplete: (imageUrl: string) => void;
    onDelete?: () => void;
    label?: string;
}

export default function ImageUpload({
    userId,
    deckId,
    cardId,
    currentImage,
    onUploadComplete,
    onDelete,
    label = '上传图片'
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setError(null);

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
            setError('仅支持 JPG, PNG, GIF, WebP 格式');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError(`文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        setProgress(0);

        try {
            // Simulate progress (Supabase doesn't provide upload progress yet)
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const imageUrl = await uploadImage(file, userId, deckId, cardId);

            clearInterval(progressInterval);
            setProgress(100);

            onUploadComplete(imageUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || '上传失败');
            setPreview(currentImage || null);
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDeleteClick = () => {
        setPreview(null);
        onDelete?.();
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>

            {preview ? (
                <div className={styles.previewContainer}>
                    <img src={preview} alt="Preview" className={styles.preview} />
                    <div className={styles.previewActions}>
                        <button
                            type="button"
                            className={styles.changeButton}
                            onClick={handleClick}
                            disabled={uploading}
                        >
                            更换图片
                        </button>
                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={handleDeleteClick}
                            disabled={uploading}
                        >
                            删除图片
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`${styles.dropzone} ${dragActive ? styles.active : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                        onChange={handleFileInput}
                        className={styles.fileInput}
                        disabled={uploading}
                    />
                    <div className={styles.dropzoneContent}>
                        <span className={styles.uploadIcon}>📁</span>
                        <p className={styles.dropzoneText}>
                            {dragActive ? '松开以上传' : '拖拽图片到此处或点击上传'}
                        </p>
                        <p className={styles.dropzoneHint}>
                            支持 JPG, PNG, GIF, WebP，最大 5MB
                        </p>
                    </div>
                </div>
            )}

            {uploading && (
                <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className={styles.progressText}>{progress}%</span>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}
