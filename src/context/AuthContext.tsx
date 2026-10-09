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
  setLocalUser: (profile: UserProfile) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  isLoading: true,
  isLoggedIn: false,
  setLocalUser: () => {},
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
        try {
          const stored = localStorage.getItem('g1mart_user_session');
          if (stored) setUser(JSON.parse(stored));
        } catch {}
        setIsLoading(false);
        return;
      }

      const activeUser = rawUser || (await supabase.auth.getUser()).data?.user;
      if (!activeUser) {
        setSupabaseUser(null);
        // Fallback to locally stored session if any
        try {
          const stored = localStorage.getItem('g1mart_user_session');
          if (stored) {
            setUser(JSON.parse(stored));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
        setIsLoading(false);
        return;
      }

      setSupabaseUser(activeUser);

      // Fetch profile
      const profile = await authService.getCurrentProfile();
      if (profile) {
        setUser(profile);
        try {
          localStorage.setItem('g1mart_user_session', JSON.stringify(profile));
        } catch {}
      } else {
        const meta = activeUser.user_metadata || {};
        const uEmail = (activeUser.email || meta.email || '').toLowerCase().trim();
        let fallbackRole: any = 'customer';
        if (uEmail === 'g1mart@gmail.com' || uEmail === 'lingalamahendra0@gmail.com') {
          fallbackRole = 'admin';
        } else if (
          uEmail === 'gummasaiganesh57@gmail.com' ||
          uEmail === 'vv727457@gmail.com' ||
          uEmail === 'rider@g1mart.com'
        ) {
          fallbackRole = 'delivery_partner';
        }
        const p: UserProfile = {
          id: activeUser.id,
          name: meta.full_name || meta.name || activeUser.email?.split('@')[0] || 'Customer',
          phone: activeUser.phone || meta.phone || '',
          email: uEmail,
          avatar: meta.avatar_url || meta.picture || '',
          memberSince: new Date(activeUser.created_at).toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric',
          }),
          role: fallbackRole,
        };
        setUser(p);
        try {
          localStorage.setItem('g1mart_user_session', JSON.stringify(p));
        } catch {}
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
        try {
          const stored = localStorage.getItem('g1mart_user_session');
          if (stored) setUser(JSON.parse(stored));
          else setUser(null);
        } catch {
          setUser(null);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const setLocalUser = (profile: UserProfile) => {
    setUser(profile);
    try {
      localStorage.setItem('g1mart_user_session', JSON.stringify(profile));
    } catch {}
  };

  const signOut = async () => {
    await authService.signOut();
    setSupabaseUser(null);
    setUser(null);
    try {
      localStorage.removeItem('g1mart_user_session');
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isLoading,
        isLoggedIn: Boolean(supabaseUser || user),
        setLocalUser,
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
