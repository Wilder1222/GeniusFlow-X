import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        // OAuth callback - 这里 Supabase 会自动处理
        // 重定向到首页
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 没有 code，重定向到登录页
    return NextResponse.redirect(new URL('/auth/login', request.url));
}
