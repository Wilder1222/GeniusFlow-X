import { NextResponse } from 'next/server';
import { AppError, ErrorCode, ErrorMessages } from './errors';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

/**
 * Success Response Helper
 */
export function successResponse<T>(data: T, statusCode: number = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
        },
        { status: statusCode }
    );
}

/**
 * Error Response Helper
 */
export function errorResponse(error: unknown): NextResponse<ApiResponse<null>> {
    console.error('[API Error]:', error);

    let code: string = ErrorCode.INTERNAL_ERROR;
    let message = ErrorMessages[ErrorCode.INTERNAL_ERROR];
    let statusCode = 500;

    if (error instanceof AppError) {
        code = error.code;
        message = error.message;
        statusCode = error.statusCode;
    } else if (error instanceof Error) {
        // For standard errors, we might want to hide the message in production
        // But for development we can show it, or check specific types
        // Here we keep it generic for non-AppErrors to avoid leaking info
        if (process.env.NODE_ENV === 'development') {
            message = error.message;
        }
    }

    return NextResponse.json(
        {
            success: false,
            error: {
                code,
                message,
            },
        },
        { status: statusCode }
    );
}
