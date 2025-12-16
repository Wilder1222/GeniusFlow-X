import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * PUT /api/cards/[id]
 * Update a card's content
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: cardId } = await params;
    console.log('[API PUT /cards/:id] Received request for card:', cardId);

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
            console.error('[API PUT /cards/:id] Auth error:', authError);
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
        }

        const body = await request.json();
        const { front, back, tags, front_media, back_media } = body;

        // Validation
        if (!front?.trim() || !back?.trim()) {
            return NextResponse.json({
                success: false,
                error: { message: 'Front and back are required' }
            }, { status: 400 });
        }

        // Verify ownership
        const { data: existingCard, error: fetchError } = await supabase
            .from('cards')
            .select('deck_id, decks!inner(user_id)')
            .eq('id', cardId)
            .single();

        if (fetchError || !existingCard) {
            console.error('[API PUT /cards/:id] Card not found:', fetchError);
            return NextResponse.json({ success: false, error: { message: 'Card not found' } }, { status: 404 });
        }

        // @ts-ignore
        if (existingCard.decks.user_id !== user.id) {
            console.error('[API PUT /cards/:id] Unauthorized access');
            return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 403 });
        }

        // Update card
        const { data: updatedCard, error: updateError } = await supabase
            .from('cards')
            .update({
                front: front.trim(),
                back: back.trim(),
                tags: tags || [],
                front_media: front_media || null,
                back_media: back_media || null
            })
            .eq('id', cardId)
            .select()
            .single();

        if (updateError) {
            console.error('[API PUT /cards/:id] Update error:', updateError);
            return NextResponse.json({
                success: false,
                error: { message: updateError.message }
            }, { status: 500 });
        }

        console.log('[API PUT /cards/:id] Successfully updated card:', cardId);
        return NextResponse.json({
            success: true,
            data: updatedCard
        });

    } catch (error: any) {
        console.error('[API PUT /cards/:id] Unexpected error:', error);
        return NextResponse.json({
            success: false,
            error: { message: error.message }
        }, { status: 500 });
    }
}
