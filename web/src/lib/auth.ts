import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser extends User {
    // 可以在这里扩展用户属性
}

export interface SignUpData {
    email: string;
    password: string;
    username?: string;
}

export interface SignInData {
    email: string;
    password: string;
}

/**
 * 用户注册 - 通过后端 API
 */
export async function signUp({ email, password, username }: SignUpData) {
    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
    });

    const result = await response.json();

    if (!result.success) {
        // 如果 error 是对象，尝试获取 message，否则直接使用 error
        const errorMessage = typeof result.error === 'object' && result.error?.message
            ? result.error.message
            : (result.error || '注册失败');
        throw new Error(errorMessage);
    }

    // 如果返回了 session，设置到 Supabase 客户端
    if (result.data?.session) {
        await supabase.auth.setSession({
            access_token: result.data.session.accessToken,
            refresh_token: result.data.session.refreshToken,
        });
    }

    return result.data;
}

/**
 * 用户登录 - 通过后端 API
 */
export async function signIn({ email, password }: SignInData) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!result.success) {
        // 如果 error 是对象，尝试获取 message，否则直接使用 error
        const errorMessage = typeof result.error === 'object' && result.error?.message
            ? result.error.message
            : (result.error || '登录失败');
        throw new Error(errorMessage);
    }

    // 设置 session 到 Supabase 客户端
    if (result.data?.session) {
        console.log('[Auth] Setting session locally...');
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: result.data.session.accessToken,
            refresh_token: result.data.session.refreshToken,
        });
        if (sessionError) {
            console.error('[Auth] setSession error:', sessionError);
        } else {
            console.log('[Auth] setSession success, user:', sessionData.user?.email);
        }
    }

    return result.data;
}

/**
 * 退出登录 - 通过后端 API
 */
export async function signOut() {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
    });

    const result = await response.json();

    if (!result.success) {
        const errorMessage = typeof result.error === 'object' && result.error?.message
            ? result.error.message
            : (result.error || '登出失败');
        throw new Error(errorMessage);
    }

    // 清除本地 session
    await supabase.auth.signOut();
}

/**
 * 获取当前会话
 */
export async function getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error('[Auth] getSession error:', error);
        throw error;
    }
    return data.session;
}

/**
 * 获取当前用户
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    console.log('[Auth] Getting current user...');
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        console.error('[Auth] getUser error:', error);
        throw error;
    }
    console.log('[Auth] getUser success:', data.user?.email);
    return data.user as AuthUser;
}

/**
 * Google OAuth 登录
 */
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) throw error;
    return data;
}

/**
 * GitHub OAuth 登录
 */
export async function signInWithGitHub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) throw error;
    return data;
}

/**
 * 重置密码
 */
export async function resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return data;
}

/**
 * 更新密码
 */
export async function updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) throw error;
    return data;
}
