import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { UserInfoCard } from '@/components/profile/user-info-card';
import { PublicDeckList } from '@/components/profile/public-deck-list';
import { StatsDisplay } from '@/components/profile/stats-display';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
    const { userId } = await params;
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
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                }
            }
        }
    );

    // 1. Get Viewer (Optional)
    const { data: { user: viewer } } = await supabase.auth.getUser();

    // 2. Fetch Target Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, username, display_name, avatar_url, bio, is_public')
        .eq('user_id', userId) // userId params is 9-digit
        .single();

    if (profileError || !profile) {
        notFound();
    }

    // 3. Check Privacy
    if (!profile.is_public && viewer?.id !== profile.id) {
        // Render Private Profile State
        return (
            <div className={styles.container}>
                <div className={styles.privateCard}>
                    <h1 className={styles.privateTitle}>此资料是私密的</h1>
                    <p>用户已将资料设为私密。</p>
                </div>
            </div>
        );
    }

    // 4. Fetch Details (Stats, Follows, Decks)
    const [followersResult, followingResult, statsResult, decksResult] = await Promise.all([
        supabase
            .from('user_follows')
            .select('id', { count: 'exact', head: true })
            .eq('following_id', profile.user_id),
        supabase
            .from('user_follows')
            .select('id', { count: 'exact', head: true })
            .eq('follower_id', profile.user_id),
        supabase
            .from('study_stats')
            .select('*')
            .eq('user_id', profile.id)
            .single(),
        supabase
            .from('decks')
            .select('*')
            .eq('user_id', profile.id)
            .eq('is_public', true)
            .order('created_at', { ascending: false })
    ]);

    // 5. Check Follow Status
    let isFollowing = false;
    if (viewer && viewer.id !== profile.id) {
        const { data: viewerProfile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('id', viewer.id)
            .single();

        if (viewerProfile) {
            const { count } = await supabase
                .from('user_follows')
                .select('id', { count: 'exact', head: true })
                .eq('follower_id', viewerProfile.user_id)
                .eq('following_id', profile.user_id);

            isFollowing = (count || 0) > 0;
        }
    }

    const profileData = {
        userId: profile.user_id,
        username: profile.username,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        followersCount: followersResult.count || 0,
        followingCount: followingResult.count || 0,
        isFollowing,
        isOwnProfile: viewer?.id === profile.id
    };

    return (
        <div className={styles.container}>
            <UserInfoCard profile={profileData} />

            <div className={styles.contentGrid}>
                <div className={styles.leftCol}>
                    <h2 className={styles.sectionTitle}>学习成就</h2>
                    <StatsDisplay initialStats={statsResult.data} />
                </div>

                <div className={styles.rightCol}>
                    <h2 className={styles.sectionTitle}>公开牌组</h2>
                    <PublicDeckList decks={decksResult.data || []} />
                </div>
            </div>
        </div>
    );
}
