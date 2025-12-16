'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, signIn, signUp, signOut, type AuthUser, type SignInData, type SignUpData } from '@/lib/auth';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: AuthUser | null;
    session: Session | null;
    loading: boolean;
    signIn: (data: SignInData) => Promise<any>;
    signUp: (data: SignUpData) => Promise<any>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 获取初始会话
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                setUser(session.user as AuthUser);
            }
            setLoading(false);
        });

        // 监听认证状态变化
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user as AuthUser || null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Auto-redirect to login if not authenticated
    useEffect(() => {
        // Public routes that don't require authentication
        const publicRoutes = ['/auth/login', '/auth/signup', '/user'];
        const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

        // If not loading, no user, and not on a public route, redirect to login
        if (!loading && !user && pathname && !isPublicRoute) {
            console.log('[AuthProvider] No user session, redirecting to /auth/login');
            router.push('/auth/login');
        }
    }, [loading, user, pathname, router]);

    const handleSignIn = async (data: SignInData) => {
        const result = await signIn(data);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        return result;
    };

    const handleSignUp = async (data: SignUpData) => {
        const result = await signUp(data);

        // 如果有 session（无需邮箱确认），获取用户信息
        if (result?.session) {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        }
        // 如果没有 session（需要邮箱确认），不尝试获取用户，让用户去确认邮箱

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
