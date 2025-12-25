import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * Calculate level from total XP
 * Formula: level = floor(sqrt(xp / 100))
 */
function calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Calculate XP needed for next level
 */
function xpForNextLevel(currentLevel: number): number {
    return currentLevel * currentLevel * 100;
}

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

        // Get current profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('xp, level')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('[XP] Error fetching profile:', profileError);
            return errorResponse(profileError);
        }

        const currentXp = profile.xp || 0;
        const currentLevel = profile.level || 1;
        const newXp = currentXp + amount;
        const newLevel = calculateLevel(newXp);
        const leveledUp = newLevel > currentLevel;

        // Update profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                xp: newXp,
                level: newLevel,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('[XP] Error updating profile:', updateError);
            return errorResponse(updateError);
        }

        // Record transaction
        const { error: txError } = await supabase
            .from('xp_transactions')
            .insert({
                user_id: user.id,
                amount,
                reason,
                metadata: metadata || null
            });

        if (txError) {
            console.error('[XP] Error recording transaction:', txError);
            // Don't fail the request if transaction logging fails
        }

        return successResponse({
            xp: newXp,
            level: newLevel,
            leveledUp,
            xpGained: amount,
            nextLevelXp: xpForNextLevel(newLevel),
            currentLevelXp: (newLevel - 1) * (newLevel - 1) * 100,
            progress: ((newXp - ((newLevel - 1) * (newLevel - 1) * 100)) / (newLevel * newLevel * 100 - (newLevel - 1) * (newLevel - 1) * 100)) * 100
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
        const level = profile.level || 1;
        const nextLevelXp = xpForNextLevel(level);
        const currentLevelXp = (level - 1) * (level - 1) * 100;
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
