import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * POST /api/achievements/check
 * Check and unlock achievements for user
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

        // Use RPC to check all requirements and unlock new achievements in one call
        const { data: newlyUnlocked, error: rpcError } = await supabase.rpc('check_achievements', {
            p_user_id: user.id
        });

        if (rpcError) {
            console.error('[Achievements] RPC Error:', rpcError);
            return errorResponse(rpcError);
        }

        // We still need the total count if we want to return it exactly as before, 
        // but for performance, we can just return the newly unlocked ones or fetch total in parallel.
        const { count: totalUnlocked } = await supabase
            .from('user_achievements')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        return successResponse({
            newlyUnlocked: newlyUnlocked || [],
            totalUnlocked: totalUnlocked || 0
        });

    } catch (error: any) {
        console.error('[Achievements] Error:', error);
        return errorResponse(error);
    }
}
