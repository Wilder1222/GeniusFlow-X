import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * Supabase 连接测试 API
 * GET /api/test-db
 */
export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        tests: {},
    };

    if (!supabaseUrl || !supabaseAnonKey) {
        return errorResponse(
            new AppError(
                '环境变量未配置',
                ErrorCode.INTERNAL_ERROR,
                500
            )
        );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 2. 测试 profiles 表查询
    try {
        const { data, error, count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .limit(5);

        if (error) {
            (results.tests as Record<string, unknown>).profiles = {
                success: false,
                error: error.message,
                code: error.code,
            };
        } else {
            (results.tests as Record<string, unknown>).profiles = {
                success: true,
                count: count,
                sample: data?.slice(0, 2),
            };
        }
    } catch (e) {
        (results.tests as Record<string, unknown>).profiles = {
            success: false,
            error: String(e),
        };
    }

    // 3. 测试 user_settings 表查询
    try {
        const { data, error, count } = await supabase
            .from('profile_settings')
            .select('*', { count: 'exact' })
            .limit(5);

        if (error) {
            (results.tests as Record<string, unknown>).user_settings = {
                success: false,
                error: error.message,
                code: error.code,
            };
        } else {
            (results.tests as Record<string, unknown>).user_settings = {
                success: true,
                count: count,
            };
        }
    } catch (e) {
        (results.tests as Record<string, unknown>).user_settings = {
            success: false,
            error: String(e),
        };
    }

    // 4. 测试 study_stats 表查询
    try {
        const { data, error, count } = await supabase
            .from('study_stats')
            .select('*', { count: 'exact' })
            .limit(5);

        if (error) {
            (results.tests as Record<string, unknown>).study_stats = {
                success: false,
                error: error.message,
                code: error.code,
            };
        } else {
            (results.tests as Record<string, unknown>).study_stats = {
                success: true,
                count: count,
            };
        }
    } catch (e) {
        (results.tests as Record<string, unknown>).study_stats = {
            success: false,
            error: String(e),
        };
    }

    // 5. 测试 follows 表查询
    try {
        const { data, error, count } = await supabase
            .from('user_follows')
            .select('*', { count: 'exact' })
            .limit(5);

        if (error) {
            (results.tests as Record<string, unknown>).follows = {
                success: false,
                error: error.message,
                code: error.code,
            };
        } else {
            (results.tests as Record<string, unknown>).follows = {
                success: true,
                count: count,
            };
        }
    } catch (e) {
        (results.tests as Record<string, unknown>).follows = {
            success: false,
            error: String(e),
        };
    }

    // 6. 测试认证服务
    try {
        const { data, error } = await supabase.auth.getSession();
        (results.tests as Record<string, unknown>).auth = {
            success: !error,
            hasSession: !!data.session,
            error: error?.message,
        };
    } catch (e) {
        (results.tests as Record<string, unknown>).auth = {
            success: false,
            error: String(e),
        };
    }

    // 计算总体结果
    const tests = results.tests as Record<string, { success: boolean }>;
    const allSuccess = Object.values(tests).every(t => t.success);

    return NextResponse.json({
        success: allSuccess,
        ...results,
    });
}
