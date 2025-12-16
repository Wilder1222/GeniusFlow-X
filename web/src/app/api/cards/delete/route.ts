import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { batchDeleteImages } from '@/lib/media';

/**
 * DELETE /api/cards/delete
 * Batch delete cards (max 100 per request)
 * 
 * Body: {
 *   ids: string[] // Array of card IDs to delete (max 100)
 * }
 */
export async function POST(request: NextRequest) {
    console.log('[API POST /cards/delete] Received batch delete request');

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
            console.error('[API POST /cards/delete] Auth error:', authError);
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
        }

        const body = await request.json();
        const { ids } = body as { ids: string[] };

        // Validation
        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({
                success: false,
                error: { message: 'ids array is required and cannot be empty' }
            }, { status: 400 });
        }

        if (ids.length > 100) {
            return NextResponse.json({
                success: false,
                error: { message: 'Cannot delete more than 100 cards at once' }
            }, { status: 400 });
        }

        console.log('[API POST /cards/delete] Deleting', ids.length, 'cards');

        // Verify all cards belong to user's decks
        const { data: cardsToDelete, error: fetchError } = await supabase
            .from('cards')
            .select('id, deck_id, front_media, back_media, decks!inner(user_id)')
            .in('id', ids);

        if (fetchError) {
            console.error('[API POST /cards/delete] Fetch error:', fetchError);
            return NextResponse.json({
                success: false,
                error: { message: 'Failed to fetch cards' }
            }, { status: 500 });
        }

        // Check ownership
        const unauthorizedCards = cardsToDelete?.filter(
            // @ts-ignore
            card => card.decks.user_id !== user.id
        );

        if (unauthorizedCards && unauthorizedCards.length > 0) {
            console.error('[API POST /cards/delete] Unauthorized cards:', unauthorizedCards);
            return NextResponse.json({
                success: false,
                error: { message: 'Unauthorized: Some cards do not belong to you' }
            }, { status: 403 });
        }

        // Collect all media URLs to delete
        const mediaUrls: (string | null)[] = [];
        cardsToDelete?.forEach(card => {
            if (card.front_media) mediaUrls.push(card.front_media);
            if (card.back_media) mediaUrls.push(card.back_media);
        });

        // Delete media from storage (don't wait, do it async)
        if (mediaUrls.length > 0) {
            batchDeleteImages(mediaUrls).catch(err =>
                console.error('[API POST /cards/delete] Media cleanup error:', err)
            );
        }

        // Delete cards from database
        const { error: deleteError } = await supabase
            .from('cards')
            .delete()
            .in('id', ids)
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('[API POST /cards/delete] Delete error:', deleteError);
            return NextResponse.json({
                success: false,
                error: { message: deleteError.message }
            }, { status: 500 });
        }

        console.log('[API POST /cards/delete] Successfully deleted', ids.length, 'cards');
        return NextResponse.json({
            success: true,
            data: {
                deletedCount: ids.length
            }
        });

    } catch (error: any) {
        console.error('[API POST /cards/delete] Unexpected error:', error);
        return NextResponse.json({
            success: false,
            error: { message: error.message }
        }, { status: 500 });
    }
}
