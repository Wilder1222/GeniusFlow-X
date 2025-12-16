import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { success: false, error: { message: 'Unauthorized' } },
            { status: 401 }
        );
    }

    // Get user's decks
    const { data: decks, error } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json(
            { success: false, error: { message: error.message } },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        data: decks
    });
}

export async function POST(request: NextRequest) {
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

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { success: false, error: { message: 'Unauthorized' } },
            { status: 401 }
        );
    }

    // Parse request body
    const body = await request.json();
    const { title, description } = body;

    if (!title) {
        return NextResponse.json(
            { success: false, error: { message: 'Title is required' } },
            { status: 400 }
        );
    }

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
        return NextResponse.json(
            { success: false, error: { message: error.message } },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        data: deck
    });
}
