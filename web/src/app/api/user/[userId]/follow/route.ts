import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

// Helper to get profiles
async function getProfiles(supabase: any, targetUserId: string, viewerId: string) {
    // 1. Get Viewer Profile (for 9-digit ID)
    const { data: viewerProfile } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('id', viewerId)
        .single();

    if (!viewerProfile) {
        throw new AppError('Viewer profile not found', ErrorCode.NOT_FOUND, 404);
    }

    // 2. Get Target Profile
    const { data: targetProfile } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('user_id', targetUserId)
        .single();

    if (!targetProfile) {
        throw new AppError('Target user not found', ErrorCode.NOT_FOUND, 404);
    }

    if (viewerProfile.id === targetProfile.id) {
        throw new AppError('Cannot follow yourself', ErrorCode.INVALID_INPUT, 400);
    }

    return { viewerProfile, targetProfile };
}

export async function POST(
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

        const { data: { user: viewer }, error: authError } = await supabase.auth.getUser();
        if (authError || !viewer) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        const { viewerProfile, targetProfile } = await getProfiles(supabase, targetUserId, viewer.id);

        const { error } = await supabase
            .from('user_follows')
            .insert({
                follower_id: viewerProfile.user_id,
                following_id: targetProfile.user_id
            });

        if (error) {
            if (error.code === '23505') { // Unique violation
                return errorResponse(new AppError('Already following', ErrorCode.CONFLICT, 409));
            }
            throw error;
        }

        return successResponse({ followed: true });

    } catch (error: any) {
        return errorResponse(error);
    }
}

export async function DELETE(
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

        const { data: { user: viewer }, error: authError } = await supabase.auth.getUser();
        if (authError || !viewer) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        const { viewerProfile, targetProfile } = await getProfiles(supabase, targetUserId, viewer.id);

        const { error } = await supabase
            .from('user_follows')
            .delete()
            .eq('follower_id', viewerProfile.user_id)
            .eq('following_id', targetProfile.user_id);

        if (error) throw error;

        return successResponse({ followed: false });

    } catch (error: any) {
        return errorResponse(error);
    }
}
