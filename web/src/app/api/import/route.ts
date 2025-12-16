import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Transactional import endpoint - creates deck and cards in a single transaction.
 * Uses database RPC function for atomicity.
 * 
 * POST /api/import
 * Body: {
 *   deck_title: string;
 *   deck_description?: string;
 *   cards: Array<{ front: string; back: string; tags?: string[] }>;
 * }
 */
export async function POST(request: NextRequest) {
    console.log('[API /import] Received transactional import request');

    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );

        // Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('[API /import] Auth error:', authError);
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
        }
        console.log('[API /import] User authenticated:', user.id);

        const body = await request.json();
        const { deck_title, deck_description, cards } = body;

        console.log('[API /import] Request:', { deck_title, cardCount: cards?.length });

        // Validation
        if (!deck_title) {
            return NextResponse.json({ success: false, error: { message: 'deck_title is required' } }, { status: 400 });
        }

        if (!Array.isArray(cards) || cards.length === 0) {
            return NextResponse.json({ success: false, error: { message: 'cards array is required and cannot be empty' } }, { status: 400 });
        }

        // Call transactional RPC function
        const { data, error } = await supabase.rpc('import_deck_with_cards', {
            p_user_id: user.id,
            p_deck_title: deck_title,
            p_deck_description: deck_description || '',
            p_cards: cards
        });

        if (error) {
            console.error('[API /import] RPC error:', error);
            return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
        }

        // Check function result
        if (data && !data.success) {
            console.error('[API /import] Import function failed:', data.error);
            return NextResponse.json({ success: false, error: { message: data.error } }, { status: 500 });
        }

        console.log('[API /import] Successfully imported:', data);
        return NextResponse.json({
            success: true,
            data: {
                deck_id: data.deck_id,
                cards_imported: data.cards_imported
            }
        });

    } catch (error: any) {
        console.error('[API /import] Unexpected error:', error);
        return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }
}
