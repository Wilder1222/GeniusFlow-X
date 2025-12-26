/**
 * Client-side Error Handler
 * Provides user-friendly error messages for toast notifications
 */

import { ErrorCode, ErrorMessages, getFriendlyErrorMessage } from './errors';

/**
 * Format API error for display in toast notifications
 * Hides technical details and returns user-friendly Chinese message
 */
export function formatApiError(error: unknown): string {
    // Use the enhanced getFriendlyErrorMessage from errors.ts
    return getFriendlyErrorMessage(error);
}

/**
 * Log error details to console for debugging
 * Call this before showing user-friendly message
 */
export function logError(context: string, error: unknown): void {
    console.error(`[${context}]`, error);

    // In development, log more details
    if (process.env.NODE_ENV === 'development') {
        if (error instanceof Error) {
            console.error(`  Message: ${error.message}`);
            console.error(`  Stack: ${error.stack}`);
        }
        if (typeof error === 'object' && error !== null) {
            console.error(`  Details:`, JSON.stringify(error, null, 2));
        }
    }
}

/**
 * Handle API response and extract error message
 */
export function handleApiResponse<T>(response: { success: boolean; data?: T; error?: { code?: string; message?: string } }): T {
    if (!response.success) {
        const errorCode = response.error?.code;
        if (errorCode && ErrorMessages[errorCode]) {
            throw new Error(ErrorMessages[errorCode]);
        }
        throw new Error(response.error?.message || ErrorMessages[ErrorCode.INTERNAL_ERROR]);
    }
    return response.data as T;
}

// Re-export for convenience
export { ErrorCode, ErrorMessages, getFriendlyErrorMessage };
