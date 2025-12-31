import { NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params;
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const supabase = await createRouteClient(request);

        const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', userId)
            .single();

        if (!profile) return successResponse([]);

        const { data, error } = await supabase
            .from('user_follows')
            .select(`
                id,
                follower_id,
                profiles!follows_follower_id_fkey (
                    user_id,
                    username,
                    display_name,
                    avatar_url,
                    bio
                )
            `)
            .eq('following_id', profile.user_id)
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const followers = (data || []).map((item: any) => ({
            userId: item.profiles.user_id,
            username: item.profiles.username,
            displayName: item.profiles.display_name,
            avatarUrl: item.profiles.avatar_url,
            bio: item.profiles.bio,
        }));

        return successResponse(followers);

    } catch (error: any) {
        return errorResponse(error);
    }
}
