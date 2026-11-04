import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { purgeStaleCookies } from '@/lib/cookieHygiene';
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
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('[G1 Mart Auth] getSession error:', error.message);
        return null;
      }
      return data.session;
    } catch {
      return null;
    }
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured()) return null;
    try {
      // First try active session (auto-refreshes expired token)
      const session = await this.getSession();
      if (session?.user) return session.user;

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) return null;
      return user;
    } catch {
      return null;
    }
  },

  async getCurrentProfile(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      // Check public.profiles first
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const userEmail = (data?.email || user.email || '').toLowerCase().trim();
      let detectedRole: UserRole = (data?.role as any) || 'customer';

      // Normalized email for Gmail dot-invariance
      const emailParts = userEmail.split('@');
      const normEmail =
        emailParts.length === 2 && (emailParts[1] === 'gmail.com' || emailParts[1] === 'googlemail.com')
          ? `${emailParts[0].replace(/\./g, '').split('+')[0]}@gmail.com`
          : userEmail;

      // Always grant admin to root admin emails
      const isCoreAdmin =
        userEmail === 'sureshdega466@gmail.com' ||
        userEmail === 'g1mart@gmail.com' ||
        userEmail === 'lingalamahendra0@gmail.com' ||
        userEmail === 'gummasaiganesh57@gmail.com' ||
        userEmail === 'gumma.saiganesh57@gmail.com' ||
        normEmail === 'gummasaiganesh57@gmail.com' ||
        userEmail === 'orders@g1mart.com' ||
        userEmail === 'admin@g1mart.com';

      const isCoreRider =
        userEmail === 'rider@g1mart.com' ||
        normEmail === 'rider@g1mart.com';

      if (isCoreAdmin) {
        detectedRole = 'admin';
      } else if (isCoreRider) {
        detectedRole = 'delivery_partner';
      }

      if (data) {
        const meta = user.user_metadata || {};
        const profileName = data.full_name || meta.full_name || meta.name || user.email?.split('@')[0] || 'Customer';
        return {
          id: user.id,
          name: profileName,
          phone: data.phone || user.phone || '',
          email: userEmail,
          avatar: data.avatar_url || '',
          memberSince: new Date(data.created_at || Date.now()).toLocaleDateString('en-IN', {
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

      if (typeof document !== 'undefined') {
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const secureStr = isHttps ? '; Secure' : '';
        // Persist intended destination in cookie and localStorage so it survives OAuth redirect
        document.cookie = `g1mart_auth_next=${encodeURIComponent(nextUrl)}; path=/; max-age=1800; SameSite=Lax${secureStr}`;
        try {
          localStorage.setItem('g1mart_auth_next', nextUrl);
        } catch {}
      }

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
    try {
      await purgeStaleCookies().catch(() => {});
    } catch {}
    const { error } = await supabase.auth.signOut();
    return !error;
  },
};
