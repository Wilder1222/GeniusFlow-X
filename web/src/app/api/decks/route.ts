import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/supabase-server';
import { successResponse, errorResponse, ApiResponse } from '@/lib/api-response';

export const GET = withAuth<ApiResponse<any>>(async (req, { user, supabase }) => {
    // Get user's decks
    const { data: decks, error } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return errorResponse(error);
    return successResponse(decks);
});

export const POST = withAuth<ApiResponse<any>>(async (req, { user, supabase }) => {
    try {
        // Parse request body
        const body = await req.json();
        const { title, description } = body;

        if (!title) {
            return errorResponse(new Error('Title is required'));
        }

        console.log('[API /decks] Creating deck for user:', user.id);

        // Create deck
        const { data: deck, error } = await supabase
            .from('decks')
            .insert({
                user_id: user.id,
                title,
                description: description || ''
            })
            .select()
            .single();

        if (error) {
            console.error('[API /decks] Insert error:', error);
            return errorResponse(error);
        }

        return successResponse(deck);
    } catch (e: any) {
        console.error('[API /decks] Unexpected error:', e);
        return errorResponse(e);
    }
});
