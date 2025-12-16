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

        if (!targetUserId) {
            return errorResponse(new AppError('User ID is required', ErrorCode.INVALID_INPUT, 400));
        }

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

        // 1. Get Viewer (Optional)
        const { data: { user: viewer } } = await supabase.auth.getUser();

        // 2. Fetch Target Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, user_id, username, display_name, avatar_url, bio, is_public')
            .eq('user_id', targetUserId)
            .single();

        if (profileError || !profile) {
            return errorResponse(new AppError('User not found', ErrorCode.NOT_FOUND, 404));
        }

        // 3. Check Privacy
        // If profile is private AND viewer is not the owner, deny access
        if (!profile.is_public && viewer?.id !== profile.id) {
            return errorResponse(new AppError('Profile is private', ErrorCode.FORBIDDEN, 403));
        }

        // 4. Get Follow Counts and Stats
        const [followersResult, followingResult, statsResult] = await Promise.all([
            supabase
                .from('user_follows')
                .select('id', { count: 'exact', head: true })
                .eq('following_id', profile.user_id),
            supabase
                .from('user_follows')
                .select('id', { count: 'exact', head: true })
                .eq('follower_id', profile.user_id),
            supabase
                .from('study_stats')
                .select('*')
                .eq('user_id', profile.id)
                .single()
        ]);

        // 5. Check isFollowing (if viewer exists)
        let isFollowing = false;
        if (viewer && viewer.id !== profile.id) {
            // Need viewer's 9-digit ID to check user_follows table which uses 9-digit IDs
            const { data: viewerProfile } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('id', viewer.id)
                .single();

            if (viewerProfile) {
                const { count } = await supabase
                    .from('user_follows')
                    .select('id', { count: 'exact', head: true })
                    .eq('follower_id', viewerProfile.user_id)
                    .eq('following_id', profile.user_id);

                isFollowing = (count || 0) > 0;
            }
        }

        return successResponse({
            userId: profile.user_id,
            username: profile.username,
            displayName: profile.display_name,
            avatarUrl: profile.avatar_url,
            bio: profile.bio,
            isPublic: profile.is_public,
            followersCount: followersResult.count || 0,
            followingCount: followingResult.count || 0,
            stats: statsResult.data || null,
            isFollowing,
            isOwnProfile: viewer?.id === profile.id
        });

    } catch (error: any) {
        console.error('[Public Profile] Error:', error);
        return errorResponse(error);
    }
}
