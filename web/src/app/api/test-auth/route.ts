import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * 认证服务测试 API
 * GET /api/test-auth
 */
export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const results: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        config: {
            url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
            keyLength: supabaseAnonKey?.length || 0,
        },
        tests: {},
    };

    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json({
            success: false,
            error: '环境变量未配置',
        }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. 测试认证服务健康状态
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

        const healthUrl = `${supabaseUrl}/auth/v1/health`;
        const response = await fetch(healthUrl, {
            signal: controller.signal,
            headers: {
                'apikey': supabaseAnonKey,
            },
        });

        clearTimeout(timeoutId);

        (results.tests as Record<string, unknown>).authHealth = {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
        };
    } catch (e) {
        (results.tests as Record<string, unknown>).authHealth = {
            success: false,
            error: e instanceof Error ? e.message : String(e),
        };
    }

    // 2. 测试获取会话
    try {
        const { data, error } = await supabase.auth.getSession();
        (results.tests as Record<string, unknown>).getSession = {
            success: !error,
            hasSession: !!data.session,
            error: error?.message,
        };
    } catch (e) {
        (results.tests as Record<string, unknown>).getSession = {
            success: false,
            error: String(e),
        };
    }

    // 3. 测试数据库连接（再次确认）
    try {
        const { error } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);

        (results.tests as Record<string, unknown>).database = {
            success: !error,
            error: error?.message,
        };
    } catch (e) {
        (results.tests as Record<string, unknown>).database = {
            success: false,
            error: String(e),
        };
    }

    const tests = results.tests as Record<string, { success: boolean }>;
    const allSuccess = Object.values(tests).every(t => t.success);

    return NextResponse.json({
        success: allSuccess,
        ...results,
        suggestion: !allSuccess
            ? '认证服务连接失败，可能是网络问题或 Supabase 项目配置问题。请检查 VPN/代理设置，或在 Supabase Dashboard 确认项目状态。'
            : null,
    });
}
