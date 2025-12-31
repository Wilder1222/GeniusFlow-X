import { NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId: targetUserId } = await context.params;
        const supabase = await createRouteClient(request);

        const { data: { user } } = await supabase.auth.getUser();

        // If not logged in, clearly not following
        if (!user) {
            return successResponse({ isFollowing: false });
        }

        // Get target profile to get their UUID (following_id)
        const { data: targetProfile, error: targetError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', targetUserId)
            .single();

        if (targetError || !targetProfile) {
            return successResponse({ isFollowing: false });
        }

        // Get current user profile to get their UUID (follower_id)
        const { data: currentUserProfile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('id', user.id)
            .single();

        if (!currentUserProfile) {
            return successResponse({ isFollowing: false });
        }

        const { data } = await supabase
            .from('user_follows')
            .select('id')
            .eq('follower_id', currentUserProfile.user_id)
            .eq('following_id', targetProfile.user_id)
            .single();

        return successResponse({ isFollowing: !!data });

    } catch (error: any) {
        return errorResponse(error);
    }
}
