import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;



/**
 * 用户注册 API
 * POST /api/auth/signup
 * 
 * 流程：
 * 1. 先通过 Supabase Auth 创建认证用户
 * 2. 再用 Service Role 写入 profiles 表（绕过 RLS）
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, username } = body;

        // 验证必填字段
        if (!email || !password) {
            throw new AppError('邮箱和密码不能为空', ErrorCode.INVALID_INPUT, 400);
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError('邮箱格式不正确', ErrorCode.INVALID_INPUT, 400);
        }

        // 验证密码长度
        if (password.length < 6) {
            throw new AppError('密码至少需要6个字符', ErrorCode.INVALID_INPUT, 400);
        }

        // 验证用户名格式（如果提供）
        if (username) {
            if (username.length < 3 || username.length > 20) {
                throw new AppError('用户名长度需要在 3-20 个字符之间', ErrorCode.INVALID_INPUT, 400);
            }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                throw new AppError('用户名只能包含字母、数字和下划线', ErrorCode.INVALID_INPUT, 400);
            }
        }

        // 检查 Supabase 配置
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new AppError('服务器配置错误', ErrorCode.INTERNAL_ERROR, 500);
        }


        // 创建 Supabase 客户端
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        // 创建 Service Role 客户端 (Required for manual fallback)
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey!); // Force non-null as we checked it above (or should check)

        // 步骤 1: 通过 Supabase Auth 创建认证用户
        const { data: authData, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username || undefined,
                },
            },
        });

        if (error) {
            console.error('Signup Error Full:', error);
            if (error.message.includes('User already registered')) {
                throw new AppError('该邮箱已被注册', ErrorCode.CONFLICT, 400);
            }
            throw new AppError(error.message, ErrorCode.UNAUTHORIZED, 400);
        }

        if (!authData.user) {
            throw new AppError('注册失败，未能创建用户', ErrorCode.INTERNAL_ERROR, 500);
        }

        // 步骤 2: 用 Service Role 写入 profiles 表 (Fallback for Trigger failure)
        try {
            // Check if profile exists (Trigger might have worked?)
            const { data: existingProfile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('id', authData.user.id)
                .single();

            if (!existingProfile) {
                console.log('Trigger failed or disabled. Manually creating profile...');

                // Need a unique 9-digit ID. Logic: Increment max or random?
                // Re-implementing simplified ID generation
                const baseId = 100000000;
                // Just use a random one for now to avoid race conditions complexity in simplified fallback
                // Or query max.
                const { data: maxProfile } = await supabaseAdmin
                    .from('profiles')
                    .select('user_id')
                    .order('user_id', { ascending: false })
                    .limit(1)
                    .single();

                let nextUserId = String(baseId + 1);
                if (maxProfile && maxProfile.user_id) {
                    const currentMax = parseInt(maxProfile.user_id, 10);
                    if (!isNaN(currentMax)) {
                        nextUserId = String(currentMax + 1);
                    }
                }

                const finalUsername = username || `user_${nextUserId}`;

                // Insert into profiles
                const { error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        user_id: nextUserId,
                        email: email,
                        username: finalUsername,
                        is_public: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });

                if (profileError) {
                    console.error('Manual profile creation failed:', profileError);
                } else {
                    // Insert settings
                    await supabaseAdmin
                        .from('profile_settings')
                        .insert({
                            user_id: authData.user.id,
                            theme: 'system',
                            language: 'zh-CN',
                            email_notifications: true,
                            daily_goal: 20,
                            updated_at: new Date().toISOString(),
                        });

                    // Insert stats
                    await supabaseAdmin
                        .from('study_stats')
                        .insert({
                            user_id: authData.user.id,
                            total_cards_reviewed: 0,
                            total_study_time_minutes: 0,
                            current_streak: 0,
                            longest_streak: 0,
                            updated_at: new Date().toISOString(),
                        });
                }
            }

        } catch (manualError) {
            console.error('Manual fallback error:', manualError);
            // Don't fail the request if auth succeeded
        }

        return successResponse({
            user: {
                id: authData.user.id,
                email: authData.user.email,
            },
            session: authData.session ? {
                accessToken: authData.session.access_token,
                refreshToken: authData.session.refresh_token,
                expiresAt: authData.session.expires_at,
            } : null,
            message: authData.session
                ? '注册成功'
                : '注册成功，请查看邮箱确认链接',
        }, authData.session ? 200 : 202);

    } catch (error: any) {
        return errorResponse(error);
    }
}
