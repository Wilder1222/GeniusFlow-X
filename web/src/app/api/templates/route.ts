import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * GET /api/templates
 * 获取用户的卡片模板列表（包括公共模板）
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return req.cookies.get(name)?.value;
                    },
                    set() { },
                    remove() { }
                }
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        // 获取公共模板和用户自己的模板
        const { data: templates, error: templatesError } = await supabase
            .from('card_templates')
            .select('*')
            .or(`user_id.eq.${user.id},is_public.eq.true`)
            .order('created_at', { ascending: false });

        if (templatesError) {
            console.error('[Templates] Error fetching templates:', templatesError);
            return errorResponse(templatesError);
        }

        return successResponse(templates || []);

    } catch (error: any) {
        console.error('[Templates] Error:', error);
        return errorResponse(error);
    }
}

/**
 * POST /api/templates
 * 创建新的卡片模板
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return req.cookies.get(name)?.value;
                    },
                    set() { },
                    remove() { }
                }
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        const body = await req.json();
        const { name, type, front_template, back_template, css, is_public } = body;

        if (!name || !type || !front_template || !back_template) {
            return errorResponse(new AppError('Missing required fields', ErrorCode.INVALID_INPUT, 400));
        }

        const { data: template, error: insertError } = await supabase
            .from('card_templates')
            .insert({
                user_id: user.id,
                name,
                type,
                front_template,
                back_template,
                css: css || '',
                is_public: is_public || false
            })
            .select()
            .single();

        if (insertError) {
            console.error('[Templates] Error creating template:', insertError);
            return errorResponse(insertError);
        }

        return successResponse(template);

    } catch (error: any) {
        console.error('[Templates] Error:', error);
        return errorResponse(error);
    }
}
