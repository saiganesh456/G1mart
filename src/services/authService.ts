import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { UserProfile, UserRole } from '../types';

export interface AuthResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export const authService = {
  isConfigured: (): boolean => isSupabaseConfigured(),

  async getSession() {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[G1 Mart Auth] getSession error:', error.message);
      return null;
    }
    return data.session;
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured()) return null;
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  },

  async getCurrentProfile(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      // Check public.profiles first (from schema migration)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const userEmail = (data?.email || user.email || '').toLowerCase().trim();
      let detectedRole: UserRole = (data?.role as any) || 'customer';

      // Always grant admin to root admin emails or check server role
      if (userEmail === 'g1mart@gmail.com' || userEmail === 'lingalamahendra0@gmail.com') {
        detectedRole = 'admin';
      } else if (
        userEmail === 'gummasaiganesh57@gmail.com' ||
        userEmail === 'vv727457@gmail.com' ||
        userEmail === 'rider@g1mart.com'
      ) {
        detectedRole = 'delivery_partner';
      } else {
        try {
          const roleRes = await fetch('/api/auth/role-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail }),
          });
          const roleData = await roleRes.json();
          if (roleData.success && roleData.role) {
            detectedRole = roleData.role;
          }
        } catch {}
      }

      if (data) {
        return {
          name: data.full_name || 'Customer',
          phone: data.phone || user.phone || '',
          email: userEmail,
          avatar: data.avatar_url || '',
          memberSince: new Date(data.created_at).toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric',
          }),
          role: detectedRole,
        };
      }

      // Fallback directly to user metadata (e.g. from Google OAuth)
      const meta = user.user_metadata || {};
      return {
        id: user.id,
        name: meta.full_name || meta.name || user.email?.split('@')[0] || 'Customer',
        phone: user.phone || meta.phone || '',
        email: userEmail,
        avatar: meta.avatar_url || meta.picture || '',
        memberSince: 'October 2026',
        role: detectedRole,
      };
    } catch {
      return null;
    }
  },

  async signInWithGoogle(nextUrl: string = '/account'): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase configuration required for Google sign-in.',
      };
    }

    try {
      const redirectOrigin =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost:3000';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${redirectOrigin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google sign-in failed' };
    }
  },

  async signInWithOtp(phone: string): Promise<AuthResponse<{ message: string }>> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase configuration required for SMS OTP.',
      };
    }

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data: { message: `OTP sent to ${formattedPhone}` } };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP' };
    }
  },

  async verifyOtp(phone: string, token: string): Promise<AuthResponse<any>> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'Supabase configuration required for OTP verification.',
      };
    }

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed' };
    }
  },

  async signOut(): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;
    const { error } = await supabase.auth.signOut();
    return !error;
  },
};
