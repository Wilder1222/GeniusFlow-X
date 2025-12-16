import { supabase } from '@/lib/supabase';
import {
    STORAGE_BUCKET,
    MEDIA_CATEGORY,
    MAX_FILE_SIZE,
    isValidImageType,
    isValidFileSize,
    generateMediaPath,
    getFileExtension
} from '@/types/media';

/**
 * Upload image to Supabase Storage
 * @returns Public URL of uploaded image
 */
export async function uploadImage(
    file: File,
    userId: string,
    deckId: string,
    cardId: string
): Promise<string> {
    // Validate file type
    if (!isValidImageType(file.type)) {
        throw new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.');
    }

    // Validate file size
    if (!isValidFileSize(file.size)) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`);
    }

    // Generate file path
    const extension = getFileExtension(file.name);
    const filePath = generateMediaPath(userId, deckId, cardId, extension);

    console.log('[uploadImage] Uploading to:', filePath);

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        console.error('[uploadImage] Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    console.log('[uploadImage] Upload successful:', urlData.publicUrl);
    return urlData.publicUrl;
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    try {
        // Extract path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        // Path format: /storage/v1/object/public/GeniusFlow-X/card-media/...
        const bucketIndex = pathParts.indexOf(STORAGE_BUCKET);
        if (bucketIndex === -1) {
            throw new Error('Invalid image URL');
        }
        const filePath = pathParts.slice(bucketIndex + 1).join('/');

        console.log('[deleteImage] Deleting:', filePath);

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);

        if (error) {
            console.error('[deleteImage] Delete error:', error);
            throw error;
        }

        console.log('[deleteImage] Delete successful');
    } catch (error) {
        console.error('[deleteImage] Error parsing URL or deleting:', error);
        // Don't throw - deletion failure shouldn't block other operations
    }
}

/**
 * Batch delete multiple images
 */
export async function batchDeleteImages(imageUrls: (string | null | undefined)[]): Promise<void> {
    const validUrls = imageUrls.filter((url): url is string => !!url);
    await Promise.all(validUrls.map(url => deleteImage(url)));
}

/**
 * Compress image before upload (optional, using canvas)
 */
export async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if too large
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Compression failed'));
                        }
                    },
                    file.type,
                    quality
                );
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}
