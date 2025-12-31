import { NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params;
        const supabase = await createRouteClient(request);

        // Get user's UUID
        const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', userId)
            .single();

        if (!profile) {
            return successResponse({ followersCount: 0, followingCount: 0 });
        }

        const [followersResult, followingResult] = await Promise.all([
            supabase
                .from('user_follows')
                .select('id', { count: 'exact', head: true })
                .eq('following_id', profile.user_id),
            supabase
                .from('user_follows')
                .select('id', { count: 'exact', head: true })
                .eq('follower_id', profile.user_id),
        ]);

        return successResponse({
            followersCount: followersResult.count || 0,
            followingCount: followingResult.count || 0,
        });

    } catch (error: any) {
        return errorResponse(error);
    }
}
