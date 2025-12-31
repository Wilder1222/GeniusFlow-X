import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const { locale } = await params;
    const origin = requestUrl.origin;

    // Default redirect to home in the current locale
    const next = requestUrl.searchParams.get('next') || `/${locale}/home`;

    if (code) {
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
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch (error) {
                            // This can be ignored if you have middleware refreshing user sessions.
                            console.error('Error setting cookies in callback:', error);
                        }
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Success! Redirect to the destination
            return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : `/${next}`}`);
        }

        console.error('OAuth exchange error:', error.message);
    }

    // Default error redirect
    return NextResponse.redirect(`${origin}/${locale}/auth/login?error=oauth_conversion_failed`);
}
