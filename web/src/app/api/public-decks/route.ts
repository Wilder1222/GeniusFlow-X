import { NextRequest, NextResponse } from 'next/server';
import { createActionClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    try {
        const supabase = await createActionClient();

        let query = supabase
            .from('decks')
            .select(`
                *,
                profiles:user_id (username, avatar_url),
                cards:cards(count)
            `, { count: 'exact' })
            .eq('is_public', true);

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data: decks, count, error } = await query
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(from, to);

        if (error) {
            console.error('[API GET /api/public-decks] Error:', error);
            return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: {
                decks,
                total: count || 0,
                page,
                pageSize,
                totalPages: Math.ceil((count || 0) / pageSize)
            }
        });
    } catch (error: any) {
        console.error('[API GET /api/public-decks] Unexpected error:', error);
        return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
    }
}
