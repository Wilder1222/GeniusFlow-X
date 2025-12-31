/**
 * Auth Context - 认证上下文
 * 
 * 管理全局认证状态、用户信息和会话
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';
import { AuthContextType, Profile } from '../types/auth';
import { showMessage } from 'react-native-flash-message';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        // 1. 初始化检查当前会话
        const initAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                setSession(initialSession);
                setUser(initialSession?.user ?? null);

                if (initialSession?.user) {
                    await fetchProfile(initialSession.user.id);
                }
            } catch (error) {
                console.error('Error init auth:', error);
            } finally {
                setIsInitialLoading(false);
            }
        };

        initAuth();

        // 2. 监听 Auth 状态变化
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (currentSession?.user) {
                await fetchProfile(currentSession.user.id);
            } else {
                setProfile(null);
            }

            setIsInitialLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await authService.getProfile(userId);
        if (!error && data) {
            setProfile(data as Profile);
        }
    };

    const signOut = async () => {
        const { error } = await authService.signOut();
        if (error) {
            showMessage({
                message: '退出失败',
                description: error,
                type: 'danger',
            });
        } else {
            setUser(null);
            setSession(null);
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isInitialLoading,
                signOut,
                refreshProfile,
                profile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
