import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * 用户登出 API
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('登出失败:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '登出成功',
        });

    } catch (err) {
        console.error('登出 API 错误:', err);
        return NextResponse.json(
            { success: false, error: '服务器内部错误' },
            { status: 500 }
        );
    }
}
