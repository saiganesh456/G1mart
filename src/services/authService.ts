import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

export interface AuthResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export const authService = {
  /**
   * Check if Supabase Auth is active and configured
   */
  isConfigured: (): boolean => isSupabaseConfigured(),

  /**
   * Get current authenticated user session
   */
  async getSession() {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[G1 Mart Auth] getSession error:', error.message);
      return null;
    }
    return data.session;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured()) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return authService.getUserProfile(user.id);
  },

  /**
   * Fetch user profile from public.profiles
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        name: data.full_name || 'Customer',
        phone: data.phone || '',
        email: data.email || '',
        avatar: data.avatar_url || '',
        walletBalance: Number(data.wallet_balance) || 0,
        memberSince: new Date(data.created_at).toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric',
        }),
      };
    } catch (err) {
      console.warn('[G1 Mart Auth] Failed to fetch profile from Supabase:', err);
      return null;
    }
  },

  /**
   * Sign in with Phone Number (Passwordless OTP)
   * Note: Production SMS provider requires Twilio / MessageBird in Supabase dashboard
   */
  async signInWithPhone(phone: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Phone sign-in failed' };
    }
  },

  /**
   * Alias for signInWithPhone
   */
  async signInWithOtp(phone: string): Promise<AuthResponse> {
    return this.signInWithPhone(phone);
  },

  /**
   * Verify Phone OTP token
   */
  async verifyPhoneOtp(phone: string, token: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      return { success: token === '1234' || token.length >= 4 };
    }

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'OTP verification failed' };
    }
  },

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'OAuth failed' };
    }
  },

  /**
   * Sign Out
   */
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  },

  /**
   * Listen to Auth State Changes
   */
  onAuthStateChange(callback: (profile: UserProfile | null) => void): () => void {
    if (!isSupabaseConfigured()) {
      return () => {};
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id);
        callback(profile);
      } else {
        callback(null);
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  },
};
