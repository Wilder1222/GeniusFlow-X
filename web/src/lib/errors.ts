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
    [ErrorCode.INTERNAL_ERROR]: '服务器繁忙，请稍后重试',
    [ErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络',
    [ErrorCode.TIMEOUT]: '请求超时，请重试',
    [ErrorCode.VALIDATION_ERROR]: '输入数据无效，请检查',
    [ErrorCode.INVALID_INPUT]: '输入参数有误',
    [ErrorCode.NOT_FOUND]: '请求的资源不存在',
    [ErrorCode.FORBIDDEN]: '无权执行此操作',
    [ErrorCode.RATE_LIMIT]: '操作过于频繁，请稍后再试',
    [ErrorCode.DATABASE_ERROR]: '数据操作失败，请重试',
    [ErrorCode.CONFLICT]: '数据冲突，请刷新后重试',

    // 认证
    [ErrorCode.UNAUTHORIZED]: '请先登录',
    [ErrorCode.AUTH_INVALID_CREDENTIALS]: '用户名或密码错误',
    [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: '邮箱未验证，请先验证邮箱',
    [ErrorCode.AUTH_USER_NOT_FOUND]: '用户不存在',
    [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: '该邮箱已被注册',
    [ErrorCode.AUTH_USERNAME_TAKEN]: '用户名已被占用',
    [ErrorCode.AUTH_WEAK_PASSWORD]: '密码强度不足，请使用更复杂的密码',
    [ErrorCode.AUTH_TOKEN_EXPIRED]: '登录已过期，请重新登录',
    [ErrorCode.AUTH_SESSION_INVALID]: '会话无效，请重新登录',

    // AI
    [ErrorCode.AI_SERVICE_UNAVAILABLE]: 'AI 服务暂时不可用，请稍后重试',
    [ErrorCode.AI_QUOTA_EXCEEDED]: '今日 AI 使用额度已用尽',
    [ErrorCode.AI_RATE_LIMIT]: 'AI 请求过于频繁，请稍后再试',
    [ErrorCode.AI_INVALID_CONTENT]: '输入内容不符合要求',
    [ErrorCode.AI_CONTENT_TOO_SHORT]: '输入内容过短，请提供更多信息',
    [ErrorCode.AI_CONTENT_TOO_LONG]: '输入内容超出限制，请精简后重试',
    [ErrorCode.AI_GENERATION_FAILED]: 'AI 生成失败，请重试',
    [ErrorCode.AI_PARSE_FAILED]: 'AI 响应解析失败，请重试',
    [ErrorCode.AI_FILE_EXTRACT_FAILED]: '文件内容提取失败',
    [ErrorCode.AI_UNSUPPORTED_FILE_TYPE]: '不支持的文件类型',
    [ErrorCode.AI_RESUME_ANALYSIS_FAILED]: '简历分析失败，请重试',

    // 卡组
    [ErrorCode.DECK_NOT_FOUND]: '卡组不存在或已删除',
    [ErrorCode.DECK_CREATE_FAILED]: '创建卡组失败，请重试',
    [ErrorCode.DECK_UPDATE_FAILED]: '更新卡组失败，请重试',
    [ErrorCode.DECK_DELETE_FAILED]: '删除卡组失败，请重试',
    [ErrorCode.DECK_TITLE_REQUIRED]: '请输入卡组标题',
    [ErrorCode.DECK_TITLE_TOO_LONG]: '卡组标题过长',
    [ErrorCode.DECK_ACCESS_DENIED]: '无权访问此卡组',

    // 卡片
    [ErrorCode.CARD_NOT_FOUND]: '卡片不存在或已删除',
    [ErrorCode.CARD_CREATE_FAILED]: '创建卡片失败，请重试',
    [ErrorCode.CARD_UPDATE_FAILED]: '更新卡片失败，请重试',
    [ErrorCode.CARD_DELETE_FAILED]: '删除卡片失败，请重试',
    [ErrorCode.CARD_FRONT_REQUIRED]: '卡片正面内容不能为空',
    [ErrorCode.CARD_BACK_REQUIRED]: '卡片背面内容不能为空',
    [ErrorCode.CARD_BATCH_LIMIT]: '批量操作超出限制（最多100张）',
    [ErrorCode.CARD_IMPORT_FAILED]: '卡片导入失败，请检查文件格式',

    // 学习
    [ErrorCode.STUDY_NO_DUE_CARDS]: '太棒了！暂无待复习卡片',
    [ErrorCode.STUDY_GRADE_FAILED]: '评分提交失败，请重试',
    [ErrorCode.STUDY_INVALID_RATING]: '无效的评分',
    [ErrorCode.STUDY_SESSION_EXPIRED]: '学习会话已过期，请重新开始',

    // 统计
    [ErrorCode.STATS_LOAD_FAILED]: '统计数据加载失败',
    [ErrorCode.STATS_NO_DATA]: '暂无统计数据',

    // 用户
    [ErrorCode.USER_NOT_FOUND]: '用户不存在',
    [ErrorCode.USER_PROFILE_UPDATE_FAILED]: '更新个人资料失败，请重试',
    [ErrorCode.USER_AVATAR_UPLOAD_FAILED]: '头像上传失败，请重试',
    [ErrorCode.USER_PASSWORD_MISMATCH]: '两次输入的密码不一致',
    [ErrorCode.USER_PASSWORD_CHANGE_FAILED]: '密码修改失败，请重试',

    // 导入/导出
    [ErrorCode.IMPORT_FILE_INVALID]: '文件格式无效',
    [ErrorCode.IMPORT_PARSE_FAILED]: '文件解析失败，请检查格式',
    [ErrorCode.EXPORT_FAILED]: '导出失败，请重试',
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
                return '该记录已存在';
            case '23503': // foreign_key_violation
                return '关联数据不存在';
            case 'PGRST116':
                return '未找到数据';
            case '42501': // insufficient_privilege
                return '无权进行此操作';
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

