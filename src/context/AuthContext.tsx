'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { authService } from '@/services/authService';
import { UserProfile, UserRole } from '@/types';

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
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('g1mart_user_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      return !localStorage.getItem('g1mart_user_session');
    } catch {
      return true;
    }
  });

  const fetchProfile = async (rawUser?: any) => {
    try {
      let activeUser = rawUser;

      if (!activeUser && isSupabaseConfigured()) {
        try {
          const session = await authService.getSession();
          if (session?.user) {
            activeUser = session.user;
          } else {
            const userRes = await supabase.auth.getUser();
            activeUser = userRes.data?.user;
          }
        } catch (err) {
          console.warn('[AuthContext] Session retrieval note:', err);
        }
      }

      if (!activeUser) {
        // Fallback to locally stored session if any (Never log user out unless explicit SIGNED_OUT)
        try {
          const stored = localStorage.getItem('g1mart_user_session');
          if (stored) {
            setUser(JSON.parse(stored));
          }
        } catch {}
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
          if (profile.name) localStorage.setItem('g1mart_customer_name', profile.name);
          if (profile.phone) localStorage.setItem('g1mart_customer_phone', profile.phone);
        } catch {}
      } else {
        const meta = activeUser.user_metadata || {};
        const uEmail = (activeUser.email || meta.email || '').toLowerCase().trim();
        const emailParts = uEmail.split('@');
        const normEmail =
          emailParts.length === 2 && (emailParts[1] === 'gmail.com' || emailParts[1] === 'googlemail.com')
            ? `${emailParts[0].replace(/\./g, '').split('+')[0]}@gmail.com`
            : uEmail;

        let fallbackRole: UserRole = 'customer';
        const isCoreAdmin =
          uEmail === 'sureshdega466@gmail.com' ||
          uEmail === 'g1mart@gmail.com' ||
          uEmail === 'lingalamahendra0@gmail.com' ||
          uEmail === 'gummasaiganesh57@gmail.com' ||
          uEmail === 'gumma.saiganesh57@gmail.com' ||
          normEmail === 'gummasaiganesh57@gmail.com' ||
          uEmail === 'orders@g1mart.com' ||
          uEmail === 'admin@g1mart.com';

        const isCoreRider =
          uEmail === 'rider@g1mart.com' ||
          normEmail === 'rider@g1mart.com';

        if (isCoreAdmin) {
          fallbackRole = 'admin';
        } else if (isCoreRider) {
          fallbackRole = 'delivery_partner';
        }

        const p: UserProfile = {
          id: activeUser.id,
          name: meta.full_name || meta.name || activeUser.email?.split('@')[0] || 'Customer',
          phone: activeUser.phone || meta.phone || '',
          email: uEmail,
          avatar: meta.avatar_url || meta.picture || '',
          memberSince: new Date(activeUser.created_at || Date.now()).toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric',
          }),
          role: fallbackRole,
        };
        setUser(p);
        try {
          localStorage.setItem('g1mart_user_session', JSON.stringify(p));
          if (p.name) localStorage.setItem('g1mart_customer_name', p.name);
          if (p.phone) localStorage.setItem('g1mart_customer_phone', p.phone);
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
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user) {
        await fetchProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setSupabaseUser(null);
        setUser(null);
        try {
          localStorage.removeItem('g1mart_user_session');
          localStorage.removeItem('g1mart_account_orders');
          localStorage.removeItem('g1mart_last_used_address');
          localStorage.removeItem('g1mart_customer_phone');
          localStorage.removeItem('g1mart_customer_name');
          localStorage.removeItem('g1mart_checkout_address');
        } catch {}
      } else {
        // For INITIAL_SESSION or non-signout events where session is momentarily null,
        // preserve the local session to avoid unauthenticated flicker or auth loops!
        try {
          const stored = localStorage.getItem('g1mart_user_session');
          if (stored) {
            setUser(JSON.parse(stored));
          }
        } catch {}
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
      if (profile.name) localStorage.setItem('g1mart_customer_name', profile.name);
      if (profile.phone) localStorage.setItem('g1mart_customer_phone', profile.phone);
    } catch {}
  };

  const signOut = async () => {
    await authService.signOut();
    setSupabaseUser(null);
    setUser(null);
    try {
      localStorage.removeItem('g1mart_user_session');
      localStorage.removeItem('g1mart_account_orders');
      localStorage.removeItem('g1mart_last_used_address');
      localStorage.removeItem('g1mart_customer_phone');
      localStorage.removeItem('g1mart_customer_name');
      localStorage.removeItem('g1mart_checkout_address');
      sessionStorage.removeItem('g1mart_orders_list');
      sessionStorage.removeItem('g1mart_latest_order');
      sessionStorage.removeItem('g1mart_recent_order');
    } catch {}
  };

  const isLoggedIn = Boolean(
    supabaseUser ||
    (user && (user.id || user.email || user.phone || (user.name && user.name !== 'Customer')))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isLoading,
        isLoggedIn,
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
