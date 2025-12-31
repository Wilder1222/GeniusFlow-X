/**
 * Application Error Types
 */

export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isPublic: boolean;

    constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, isPublic: boolean = true) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.isPublic = isPublic;
    }
}

export enum ErrorCode {
    // ========== 通用错误 (COMMON) ==========
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT = 'TIMEOUT',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',
    NOT_FOUND = 'NOT_FOUND',
    FORBIDDEN = 'FORBIDDEN',
    RATE_LIMIT = 'RATE_LIMIT',
    DATABASE_ERROR = 'DATABASE_ERROR',
    CONFLICT = 'CONFLICT',

    // ========== 认证模块 (AUTH) ==========
    UNAUTHORIZED = 'UNAUTHORIZED',
    AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
    AUTH_EMAIL_NOT_VERIFIED = 'AUTH_EMAIL_NOT_VERIFIED',
    AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
    AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
    AUTH_USERNAME_TAKEN = 'AUTH_USERNAME_TAKEN',
    AUTH_WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
    AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
    AUTH_SESSION_INVALID = 'AUTH_SESSION_INVALID',

    // ========== AI 模块 ==========
    AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
    AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
    AI_RATE_LIMIT = 'AI_RATE_LIMIT',
    AI_INVALID_CONTENT = 'AI_INVALID_CONTENT',
    AI_CONTENT_TOO_SHORT = 'AI_CONTENT_TOO_SHORT',
    AI_CONTENT_TOO_LONG = 'AI_CONTENT_TOO_LONG',
    AI_GENERATION_FAILED = 'AI_GENERATION_FAILED',
    AI_PARSE_FAILED = 'AI_PARSE_FAILED',
    AI_FILE_EXTRACT_FAILED = 'AI_FILE_EXTRACT_FAILED',
    AI_UNSUPPORTED_FILE_TYPE = 'AI_UNSUPPORTED_FILE_TYPE',
    AI_RESUME_ANALYSIS_FAILED = 'AI_RESUME_ANALYSIS_FAILED',

    // ========== 卡组模块 (DECK) ==========
    DECK_NOT_FOUND = 'DECK_NOT_FOUND',
    DECK_CREATE_FAILED = 'DECK_CREATE_FAILED',
    DECK_UPDATE_FAILED = 'DECK_UPDATE_FAILED',
    DECK_DELETE_FAILED = 'DECK_DELETE_FAILED',
    DECK_TITLE_REQUIRED = 'DECK_TITLE_REQUIRED',
    DECK_TITLE_TOO_LONG = 'DECK_TITLE_TOO_LONG',
    DECK_ACCESS_DENIED = 'DECK_ACCESS_DENIED',

    // ========== 卡片模块 (CARD) ==========
    CARD_NOT_FOUND = 'CARD_NOT_FOUND',
    CARD_CREATE_FAILED = 'CARD_CREATE_FAILED',
    CARD_UPDATE_FAILED = 'CARD_UPDATE_FAILED',
    CARD_DELETE_FAILED = 'CARD_DELETE_FAILED',
    CARD_FRONT_REQUIRED = 'CARD_FRONT_REQUIRED',
    CARD_BACK_REQUIRED = 'CARD_BACK_REQUIRED',
    CARD_BATCH_LIMIT = 'CARD_BATCH_LIMIT',
    CARD_IMPORT_FAILED = 'CARD_IMPORT_FAILED',

    // ========== 学习模块 (STUDY) ==========
    STUDY_NO_DUE_CARDS = 'STUDY_NO_DUE_CARDS',
    STUDY_GRADE_FAILED = 'STUDY_GRADE_FAILED',
    STUDY_INVALID_RATING = 'STUDY_INVALID_RATING',
    STUDY_SESSION_EXPIRED = 'STUDY_SESSION_EXPIRED',

    // ========== 统计模块 (STATS) ==========
    STATS_LOAD_FAILED = 'STATS_LOAD_FAILED',
    STATS_NO_DATA = 'STATS_NO_DATA',

    // ========== 用户模块 (USER) ==========
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    USER_PROFILE_UPDATE_FAILED = 'USER_PROFILE_UPDATE_FAILED',
    USER_AVATAR_UPLOAD_FAILED = 'USER_AVATAR_UPLOAD_FAILED',
    USER_PASSWORD_MISMATCH = 'USER_PASSWORD_MISMATCH',
    USER_PASSWORD_CHANGE_FAILED = 'USER_PASSWORD_CHANGE_FAILED',

    // ========== 导入/导出 ==========
    IMPORT_FILE_INVALID = 'IMPORT_FILE_INVALID',
    IMPORT_PARSE_FAILED = 'IMPORT_PARSE_FAILED',
    EXPORT_FAILED = 'EXPORT_FAILED',
}

export const ErrorMessages: Record<string, string> = {
    // 通用
    [ErrorCode.INTERNAL_ERROR]: 'INTERNAL_ERROR',
    [ErrorCode.NETWORK_ERROR]: 'NETWORK_ERROR',
    [ErrorCode.TIMEOUT]: 'TIMEOUT',
    [ErrorCode.VALIDATION_ERROR]: 'VALIDATION_ERROR',
    [ErrorCode.INVALID_INPUT]: 'INVALID_INPUT',
    [ErrorCode.NOT_FOUND]: 'NOT_FOUND',
    [ErrorCode.FORBIDDEN]: 'FORBIDDEN',
    [ErrorCode.RATE_LIMIT]: 'RATE_LIMIT',
    [ErrorCode.DATABASE_ERROR]: 'DATABASE_ERROR',
    [ErrorCode.CONFLICT]: 'CONFLICT',

    // 认证
    [ErrorCode.UNAUTHORIZED]: 'UNAUTHORIZED',
    [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'AUTH_INVALID_CREDENTIALS',
    [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: 'AUTH_EMAIL_NOT_VERIFIED',
    [ErrorCode.AUTH_USER_NOT_FOUND]: 'AUTH_USER_NOT_FOUND',
    [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: 'AUTH_EMAIL_ALREADY_EXISTS',
    [ErrorCode.AUTH_USERNAME_TAKEN]: 'AUTH_USERNAME_TAKEN',
    [ErrorCode.AUTH_WEAK_PASSWORD]: 'AUTH_WEAK_PASSWORD',
    [ErrorCode.AUTH_TOKEN_EXPIRED]: 'AUTH_TOKEN_EXPIRED',
    [ErrorCode.AUTH_SESSION_INVALID]: 'AUTH_SESSION_INVALID',

    // AI
    [ErrorCode.AI_SERVICE_UNAVAILABLE]: 'AI_SERVICE_UNAVAILABLE',
    [ErrorCode.AI_QUOTA_EXCEEDED]: 'AI_QUOTA_EXCEEDED',
    [ErrorCode.AI_RATE_LIMIT]: 'AI_RATE_LIMIT',
    [ErrorCode.AI_INVALID_CONTENT]: 'AI_INVALID_CONTENT',
    [ErrorCode.AI_CONTENT_TOO_SHORT]: 'AI_CONTENT_TOO_SHORT',
    [ErrorCode.AI_CONTENT_TOO_LONG]: 'AI_CONTENT_TOO_LONG',
    [ErrorCode.AI_GENERATION_FAILED]: 'AI_GENERATION_FAILED',
    [ErrorCode.AI_PARSE_FAILED]: 'AI_PARSE_FAILED',
    [ErrorCode.AI_FILE_EXTRACT_FAILED]: 'AI_FILE_EXTRACT_FAILED',
    [ErrorCode.AI_UNSUPPORTED_FILE_TYPE]: 'AI_UNSUPPORTED_FILE_TYPE',
    [ErrorCode.AI_RESUME_ANALYSIS_FAILED]: 'AI_RESUME_ANALYSIS_FAILED',

    // 卡组
    [ErrorCode.DECK_NOT_FOUND]: 'DECK_NOT_FOUND',
    [ErrorCode.DECK_CREATE_FAILED]: 'DECK_CREATE_FAILED',
    [ErrorCode.DECK_UPDATE_FAILED]: 'DECK_UPDATE_FAILED',
    [ErrorCode.DECK_DELETE_FAILED]: 'DECK_DELETE_FAILED',
    [ErrorCode.DECK_TITLE_REQUIRED]: 'DECK_TITLE_REQUIRED',
    [ErrorCode.DECK_TITLE_TOO_LONG]: 'DECK_TITLE_TOO_LONG',
    [ErrorCode.DECK_ACCESS_DENIED]: 'DECK_ACCESS_DENIED',

    // 卡片
    [ErrorCode.CARD_NOT_FOUND]: 'CARD_NOT_FOUND',
    [ErrorCode.CARD_CREATE_FAILED]: 'CARD_CREATE_FAILED',
    [ErrorCode.CARD_UPDATE_FAILED]: 'CARD_UPDATE_FAILED',
    [ErrorCode.CARD_DELETE_FAILED]: 'CARD_DELETE_FAILED',
    [ErrorCode.CARD_FRONT_REQUIRED]: 'CARD_FRONT_REQUIRED',
    [ErrorCode.CARD_BACK_REQUIRED]: 'CARD_BACK_REQUIRED',
    [ErrorCode.CARD_BATCH_LIMIT]: 'CARD_BATCH_LIMIT',
    [ErrorCode.CARD_IMPORT_FAILED]: 'CARD_IMPORT_FAILED',

    // 学习
    [ErrorCode.STUDY_NO_DUE_CARDS]: 'STUDY_NO_DUE_CARDS',
    [ErrorCode.STUDY_GRADE_FAILED]: 'STUDY_GRADE_FAILED',
    [ErrorCode.STUDY_INVALID_RATING]: 'STUDY_INVALID_RATING',
    [ErrorCode.STUDY_SESSION_EXPIRED]: 'STUDY_SESSION_EXPIRED',

    // 统计
    [ErrorCode.STATS_LOAD_FAILED]: 'STATS_LOAD_FAILED',
    [ErrorCode.STATS_NO_DATA]: 'STATS_NO_DATA',

    // 用户
    [ErrorCode.USER_NOT_FOUND]: 'USER_NOT_FOUND',
    [ErrorCode.USER_PROFILE_UPDATE_FAILED]: 'USER_PROFILE_UPDATE_FAILED',
    [ErrorCode.USER_AVATAR_UPLOAD_FAILED]: 'USER_AVATAR_UPLOAD_FAILED',
    [ErrorCode.USER_PASSWORD_MISMATCH]: 'USER_PASSWORD_MISMATCH',
    [ErrorCode.USER_PASSWORD_CHANGE_FAILED]: 'USER_PASSWORD_CHANGE_FAILED',

    // 导入/导出
    [ErrorCode.IMPORT_FILE_INVALID]: 'IMPORT_FILE_INVALID',
    [ErrorCode.IMPORT_PARSE_FAILED]: 'IMPORT_PARSE_FAILED',
    [ErrorCode.EXPORT_FAILED]: 'EXPORT_FAILED',
};

/**
 * Get friendly error message for client-side display
 */
export function getFriendlyErrorMessage(error: unknown): string {
    // 1. AppError with known code
    if (error instanceof AppError) {
        return ErrorMessages[error.code] || error.message;
    }

    // 2. API response with error code
    if (typeof error === 'object' && error !== null) {
        const errObj = error as Record<string, any>;

        // Format: { error: { code, message } }
        if (errObj.error?.code && ErrorMessages[errObj.error.code]) {
            return ErrorMessages[errObj.error.code];
        }

        // Format: { code, message }
        if (errObj.code && ErrorMessages[errObj.code]) {
            return ErrorMessages[errObj.code];
        }
    }

    // 3. Handle Supabase/Postgres errors
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = (error as { code: string }).code;

        switch (code) {
            case '23505': // unique_violation
                return 'UNIQUE_VIOLATION';
            case '23503': // foreign_key_violation
                return 'FOREIGN_KEY_VIOLATION';
            case 'PGRST116':
                return 'DATA_NOT_FOUND';
            case '42501': // insufficient_privilege
                return 'INSUFFICIENT_PRIVILEGE';
        }
    }

    // 4. Standard Error - match keywords
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();

        // Network errors
        if (msg.includes('network') || msg.includes('fetch failed')) {
            return ErrorMessages[ErrorCode.NETWORK_ERROR];
        }
        if (msg.includes('timeout')) {
            return ErrorMessages[ErrorCode.TIMEOUT];
        }
        if (msg.includes('unauthorized') || msg.includes('401')) {
            return ErrorMessages[ErrorCode.AUTH_TOKEN_EXPIRED];
        }
        if (msg.includes('forbidden') || msg.includes('403')) {
            return ErrorMessages[ErrorCode.FORBIDDEN];
        }
        if (msg.includes('not found') || msg.includes('404')) {
            return ErrorMessages[ErrorCode.NOT_FOUND];
        }
        if (msg.includes('rate limit') || msg.includes('429') || msg.includes('too many')) {
            return ErrorMessages[ErrorCode.RATE_LIMIT];
        }

        // AI errors
        if (msg.includes('api key') || msg.includes('apikey')) {
            return ErrorMessages[ErrorCode.AI_SERVICE_UNAVAILABLE];
        }
        if (msg.includes('quota') || msg.includes('exceeded')) {
            return ErrorMessages[ErrorCode.AI_QUOTA_EXCEEDED];
        }

        // Database errors - hide details
        if (msg.includes('violates') || msg.includes('constraint') || msg.includes('duplicate')) {
            return ErrorMessages[ErrorCode.CONFLICT];
        }
    }

    // 5. Default fallback
    return ErrorMessages[ErrorCode.INTERNAL_ERROR];
}

