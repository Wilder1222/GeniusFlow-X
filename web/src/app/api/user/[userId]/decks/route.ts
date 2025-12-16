import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const params = await context.params;
        const targetUserId = params.userId;

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

        // 1. Resolve 9-digit ID to UUID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, is_public')
            .eq('user_id', targetUserId)
            .single();

        if (profileError || !profile) {
            return errorResponse(new AppError('User not found', ErrorCode.NOT_FOUND, 404));
        }

        // 2. Fetch Public Decks
        // Note: Even if profile is private, we *could* technically show public decks if they are shared?
        // But usually private profile means everything is private. 
        // Let's enforce: If profile is private, no decks visible unless viewer is owner.

        const { data: { user: viewer } } = await supabase.auth.getUser();

        if (!profile.is_public && viewer?.id !== profile.id) {
            return errorResponse(new AppError('Profile is private', ErrorCode.FORBIDDEN, 403));
        }

        const { data: decks, error: decksError } = await supabase
            .from('decks')
            .select('*')
            .eq('user_id', profile.id)
            .eq('is_public', true)
            .order('created_at', { ascending: false });

        if (decksError) throw decksError;

        return successResponse(decks);

    } catch (error: any) {
        return errorResponse(error);
    }
}
