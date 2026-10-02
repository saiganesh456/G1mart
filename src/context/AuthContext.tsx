'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { authService } from '@/services/authService';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: any | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  isLoading: true,
  isLoggedIn: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (rawUser?: any) => {
    try {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      const activeUser = rawUser || (await supabase.auth.getUser()).data?.user;
      if (!activeUser) {
        setSupabaseUser(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setSupabaseUser(activeUser);

      // Fetch profile
      const profile = await authService.getCurrentProfile();
      if (profile) {
        setUser(profile);
      } else {
        const meta = activeUser.user_metadata || {};
        setUser({
          name: meta.full_name || meta.name || activeUser.email?.split('@')[0] || 'Customer',
          phone: activeUser.phone || meta.phone || '',
          email: activeUser.email || '',
          avatar: meta.avatar_url || meta.picture || '',
          memberSince: new Date(activeUser.created_at).toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric',
          }),
        });
      }
    } catch (err) {
      console.warn('[AuthContext] Error loading user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    if (!isSupabaseConfigured()) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authService.signOut();
    setSupabaseUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isLoading,
        isLoggedIn: Boolean(supabaseUser),
        signOut,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
