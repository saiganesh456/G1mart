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

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) return null;

      return {
        name: data.full_name || 'Customer',
        phone: data.phone || user.phone || '',
        email: data.email || user.email || '',
        avatar: data.avatar_url || '',
        memberSince: new Date(data.created_at).toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric',
        }),
      };
    } catch {
      return null;
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
