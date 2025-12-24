'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, signIn, signUp, signOut, type AuthUser, type SignInData, type SignUpData } from '@/lib/auth';
import type { Session } from '@supabase/supabase-js';

interface UserProfile {
    avatar_url: string | null;
    display_name: string | null;
    username: string | null;
}

interface AuthContextType {
    user: AuthUser | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    signIn: (data: SignInData) => Promise<any>;
    signUp: (data: SignUpData) => Promise<any>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('avatar_url, display_name, username')
                    .eq('id', userId)
                    .maybeSingle();

                if (!error && data) {
                    setProfile(data);
                }
            } catch (err) {
                console.error('[AuthProvider] Error fetching profile:', err);
            }
        };

        // 获取初始会话
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                setUser(session.user as AuthUser);
                fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        // 监听认证状态变化
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user as AuthUser || null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Auto-redirect to login if not authenticated
    useEffect(() => {
        // Public routes that don't require authentication
        // Landing page (root '/') is public, exact match required
        const publicRoutes = ['/auth/login', '/auth/signup', '/auth/register', '/user'];
        const isLandingPage = pathname === '/';
        const isPublicRoute = isLandingPage || publicRoutes.some(route => pathname?.startsWith(route));

        // If not loading, no user, and not on a public route, redirect to login
        if (!loading && !user && pathname && !isPublicRoute) {
            console.log('[AuthProvider] No user session, redirecting to /auth/login');
            router.push('/auth/login');
        }

        // If not loading, user is logged in, and on login/signup/register page, redirect to home
        const authPages = ['/auth/login', '/auth/signup', '/auth/register'];
        if (!loading && user && pathname && authPages.some(route => pathname.startsWith(route))) {
            console.log('[AuthProvider] User already logged in, redirecting to /home');
            router.push('/home');
        }
    }, [loading, user, pathname, router]);

    const handleSignIn = async (data: SignInData) => {
        const result = await signIn(data);
        // The API returns the user and session in the data object
        if (result?.user) {
            setUser(result.user as AuthUser);
        } else {
            // Fallback if API changed but still returned successful
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        }
        return result;
    };

    const handleSignUp = async (data: SignUpData) => {
        const result = await signUp(data);

        // 如果返回了用户信息，直接设置
        if (result?.user) {
            setUser(result.user as AuthUser);
        } else if (result?.session) {
            // 如果只有 session，尝试获取用户信息
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        }

        return result;
    };

    const handleSignOut = async () => {
        await signOut();
        setUser(null);
        setSession(null);
        // Redirect to login page after logout
        router.push('/auth/login');
    };

    const value = {
        user,
        session,
        profile,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
