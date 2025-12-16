import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * PUT /api/decks/[id]
 * Update deck information (title, description)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: deckId } = await params;
    console.log('[API PUT /decks/:id] Received request for deck:', deckId);

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
            console.error('[API PUT /decks/:id] Auth error:', authError);
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
        }

        const body = await request.json();
        const { title, description } = body;

        // Validation
        if (!title?.trim()) {
            return NextResponse.json({
                success: false,
                error: { message: 'Title is required' }
            }, { status: 400 });
        }

        // Verify deck ownership
        const { data: existingDeck, error: fetchError } = await supabase
            .from('decks')
            .select('id')
            .eq('id', deckId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !existingDeck) {
            console.error('[API PUT /decks/:id] Deck not found or access denied:', fetchError);
            return NextResponse.json({
                success: false,
                error: { message: 'Deck not found or access denied' }
            }, { status: 404 });
        }

        // Update deck
        const { data: updatedDeck, error: updateError } = await supabase
            .from('decks')
            .update({
                title: title.trim(),
                description: description?.trim() || null
            })
            .eq('id', deckId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('[API PUT /decks/:id] Update error:', updateError);
            return NextResponse.json({
                success: false,
                error: { message: updateError.message }
            }, { status: 500 });
        }

        console.log('[API PUT /decks/:id] Successfully updated deck:', deckId);
        return NextResponse.json({
            success: true,
            data: updatedDeck
        });

    } catch (error: any) {
        console.error('[API PUT /decks/:id] Unexpected error:', error);
        return NextResponse.json({
            success: false,
            error: { message: error.message }
        }, { status: 500 });
    }
}

/**
 * DELETE /api/decks/[id]
 * Delete a single deck (cascades to delete all cards in the deck)
 */

/**
 * DELETE /api/decks/[id]
 * Delete a single deck (cascades to delete all cards in the deck)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: deckId } = await params;
    console.log('[API DELETE /decks/:id] Received request for deck:', deckId);

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
            console.error('[API DELETE /decks/:id] Auth error:', authError);
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
        }

        // Verify deck ownership before deletion
        const { data: deck, error: fetchError } = await supabase
            .from('decks')
            .select('id, title')
            .eq('id', deckId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !deck) {
            console.error('[API DELETE /decks/:id] Deck not found or access denied:', fetchError);
            return NextResponse.json({
                success: false,
                error: { message: 'Deck not found or access denied' }
            }, { status: 404 });
        }

        console.log('[API DELETE /decks/:id] Deleting deck:', { id: deckId, title: deck.title });

        // Delete the deck (cards will be cascade deleted due to ON DELETE CASCADE)
        const { error: deleteError } = await supabase
            .from('decks')
            .delete()
            .eq('id', deckId)
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('[API DELETE /decks/:id] Delete error:', deleteError);
            return NextResponse.json({
                success: false,
                error: { message: deleteError.message }
            }, { status: 500 });
        }

        console.log('[API DELETE /decks/:id] Successfully deleted deck:', deckId);
        return NextResponse.json({
            success: true,
            data: {
                id: deckId
            }
        });

    } catch (error: any) {
        console.error('[API DELETE /decks/:id] Unexpected error:', error);
        return NextResponse.json({
            success: false,
            error: { message: error.message }
        }, { status: 500 });
    }
}
