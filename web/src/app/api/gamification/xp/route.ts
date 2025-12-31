import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

import { calculateLevel, xpForNextLevel, getXPForLevel } from '@/lib/xp-service';

/**
 * POST /api/gamification/xp
 * Add XP to user and check for level up
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
        const { amount, reason, metadata } = body;

        if (!amount || !reason) {
            return errorResponse(new AppError('Invalid XP data', ErrorCode.INVALID_INPUT, 400));
        }

        // Use RPC to update XP, Level and record transaction in one transaction
        const { data: result, error: rpcError } = await supabase.rpc('award_xp', {
            p_user_id: user.id,
            p_amount: amount,
            p_reason: reason,
            p_metadata: metadata || null
        });

        if (rpcError) {
            console.error('[XP] RPC Error:', rpcError);
            return errorResponse(rpcError);
        }

        return successResponse({
            ...result,
            nextLevelXp: xpForNextLevel(result.level),
            currentLevelXp: getXPForLevel(result.level),
            progress: ((result.xp - getXPForLevel(result.level)) / (xpForNextLevel(result.level) - getXPForLevel(result.level))) * 100
        });
    } catch (error: any) {
        console.error('[XP] Error:', error);
        return errorResponse(error);
    }
}

/**
 * GET /api/gamification/xp
 * Get current XP and level info
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

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('xp, level')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('[XP] Error fetching profile:', profileError);
            return errorResponse(profileError);
        }

        const xp = profile.xp || 0;
        // Derive level from XP to ensure consistency if DB column is stale
        const level = calculateLevel(xp);
        const nextLevelXp = xpForNextLevel(level);
        const currentLevelXp = getXPForLevel(level);
        const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

        return successResponse({
            xp,
            level,
            nextLevelXp,
            currentLevelXp,
            progress: Math.max(0, Math.min(100, progress))
        });

    } catch (error: any) {
        console.error('[XP] Error:', error);
        return errorResponse(error);
    }
}
