import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * 用户登录 API
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // 验证必填字段
        if (!email || !password) {
            throw new AppError('邮箱和密码为必填项', ErrorCode.INVALID_INPUT, 400);
        }

        // 创建响应对象（用于设置 cookies）
        let response = NextResponse.json({ success: true });

        // 创建支持 SSR 的 Supabase 客户端
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                    },
                    remove(name: string, options: CookieOptions) {
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        });
                    },
                },
            }
        );

        // 调用 Supabase 登录
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('登录失败:', error);
            console.error('登录失败:', error);
            throw new AppError(error.message, ErrorCode.UNAUTHORIZED, 401);
        }

        // 返回成功响应（cookies 已经被设置）
        // 返回成功响应（cookies 已经被设置）
        // 注意：这里我们需要手动构建响应以保留 cookies
        // errorResponse 和 successResponse 会返回新的 NextResponse，可能丢失 cookies
        // 所以对于需要设置 cookie 的路由，我们可能需要特殊处理，或者修改 helper

        // 实际上 createServerClient 的 cookies set 方法是直接修改了 request headers 或者 response cookies
        // 但在这里我们手动创建了一个 response 对象

        // 为了兼容 unify response，我们可以这样：
        const finalResponse = successResponse({
            user: data.user ? {
                id: data.user.id,
                email: data.user.email,
            } : null,
            session: data.session ? {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresAt: data.session.expires_at,
            } : null,
        }, 200);

        // 复制 cookies 到最终响应
        response.cookies.getAll().forEach((cookie: any) => {
            finalResponse.cookies.set(cookie.name, cookie.value, cookie);
        });

        return finalResponse;

    } catch (err) {
        return errorResponse(err);
    }
}
