import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { AppError, ErrorCode } from './errors';

/**
 * Create a Supabase client for use in Route Handlers (GET/POST etc.)
 * Uses the request's cookies for authentication.
 */
export function createRouteClient(req: NextRequest): SupabaseClient {
    return createServerClient(
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
}

/**
 * Create a Supabase client for use in Server Actions.
 * Accesses cookies directly from Next.js headers.
 */
export async function createActionClient(): Promise<SupabaseClient> {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                },
            },
        }
    );
}

/**
 * Authentication context passed to route handlers.
 */
export interface AuthContext {
    user: User;
    supabase: SupabaseClient;
}

/**
 * Higher-order function that wraps a route handler with authentication.
 * Eliminates boilerplate auth checks in every route.
 * 
 * @example
 * export const GET = withAuth(async (req, { user, supabase }) => {
 *   const { data } = await supabase.from('decks').select('*').eq('user_id', user.id);
 *   return successResponse(data);
 * });
 */
export function withAuth<T>(
    handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse<T>>
) {
    return async (req: NextRequest): Promise<NextResponse<T> | NextResponse<{ error: { message: string } }>> => {
        const supabase = createRouteClient(req);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: { message: 'Unauthorized' } },
                { status: 401 }
            ) as NextResponse<{ error: { message: string } }>;
        }

        return handler(req, { user, supabase });
    };
}

/**
 * Create a response with cache headers for GET endpoints.
 * 
 * @param data - Response data
 * @param maxAge - Cache duration in seconds (default: 60)
 * @param staleWhileRevalidate - Stale-while-revalidate duration in seconds (default: 300)
 */
export function cachedResponse<T>(
    data: T,
    maxAge: number = 60,
    staleWhileRevalidate: number = 300
): NextResponse<T> {
    return NextResponse.json(data, {
        headers: {
            'Cache-Control': `private, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
        }
    });
}

/**
 * Get user's deck IDs - commonly used across stats endpoints.
 * Returns empty array if user has no decks.
 */
export async function getUserDeckIds(
    supabase: SupabaseClient,
    userId: string
): Promise<string[]> {
    const { data: userDecks } = await supabase
        .from('decks')
        .select('id')
        .eq('user_id', userId);

    return userDecks?.map((d: { id: string }) => d.id) || [];
}
