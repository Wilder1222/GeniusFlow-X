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
    // 400 Bad Request
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',

    // 401 Unauthorized
    UNAUTHORIZED = 'UNAUTHORIZED',
    AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',

    // 403 Forbidden
    FORBIDDEN = 'FORBIDDEN',

    // 404 Not Found
    NOT_FOUND = 'NOT_FOUND',
    USER_NOT_FOUND = 'USER_NOT_FOUND',

    // 409 Conflict
    CONFLICT = 'CONFLICT',
    USERNAME_TAKEN = 'USERNAME_TAKEN',
    EMAIL_TAKEN = 'EMAIL_TAKEN',

    // 500 Internal Server Error
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
}

export const ErrorMessages: Record<string, string> = {
    [ErrorCode.INTERNAL_ERROR]: '系统内部错误，请稍后重试',
    [ErrorCode.DATABASE_ERROR]: '数据库操作失败',
    [ErrorCode.UNAUTHORIZED]: '未授权，请先登录',
    [ErrorCode.FORBIDDEN]: '无权执行此操作',
    [ErrorCode.NOT_FOUND]: '资源不存在',
    [ErrorCode.VALIDATION_ERROR]: '输入数据无效',
    [ErrorCode.CONFLICT]: '资源冲突',
};

/**
 * Get friendly error message for client-side display
 */
export function getFriendlyErrorMessage(error: unknown): string {
    if (error instanceof AppError) {
        return error.message;
    }

    // Handle Supabase/Postgres errors
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = (error as { code: string }).code;

        switch (code) {
            case '23505': // unique_violation
                return '该记录已存在（如: 用户名或邮箱已被使用）';
            case '23503': // foreign_key_violation
                return '关联数据不存在';
            case 'PGRST116':
                return '未找到数据';
            case '42501': // insufficient_privilege
                return '无权进行此操作';
        }
    }

    if (error instanceof Error) {
        // Filter out generic database messages if they leak info
        // Simple heuristic: if it looks like a DB error but wasn't caught above, hide it
        if (error.message.includes('violates') || error.message.includes('constraint')) {
            return '数据冲突或校验失败';
        }
        return error.message;
    }

    return '发生未知错误';
}
