// Media types for GeniusFlow-X
export interface MediaFile {
    id: string;
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    uploadedBy: string;
}

export interface CardMedia {
    frontMedia?: string | null;  // URL to front image
    backMedia?: string | null;   // URL to back image
}

export type AllowedImageType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export const ALLOWED_IMAGE_TYPES: AllowedImageType[] = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const STORAGE_BUCKET = 'GeniusFlow-X';
export const MEDIA_CATEGORY = 'card-media'; // First level folder for category

// Helper function to validate file type
export function isValidImageType(mimeType: string): mimeType is AllowedImageType {
    return ALLOWED_IMAGE_TYPES.includes(mimeType as AllowedImageType);
}

// Helper function to validate file size
export function isValidFileSize(size: number): boolean {
    return size > 0 && size <= MAX_FILE_SIZE;
}

// Generate storage path for user's media
// Structure: card-media/{user_id}/{deck_id}/{card_id}_{timestamp}.{extension}
export function generateMediaPath(userId: string, deckId: string, cardId: string, extension: string): string {
    const timestamp = Date.now();
    return `${MEDIA_CATEGORY}/${userId}/${deckId}/${cardId}_${timestamp}.${extension}`;
}

// Extract file extension from filename
export function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}
