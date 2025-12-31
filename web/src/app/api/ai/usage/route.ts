import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createRouteClient } from '@/lib/supabase-server';
import { getMembershipStatus } from '@/lib/membership';

/**
 * GET /api/ai/usage
 * Get current AI usage status for the authenticated user
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createRouteClient(req);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                errorResponse('Unauthorized'),
                { status: 401 }
            );
        }

        const status = await getMembershipStatus(supabase, user.id);

        return successResponse({
            tier: status.tier,
            limit: status.limit,
            used: status.used,
            remaining: status.remaining,
            canGenerate: status.canGenerate
        });
    } catch (error: any) {
        console.error('AI usage error:', error);
        return errorResponse(new Error(error.message || 'Failed to get AI usage'));
    }
}
