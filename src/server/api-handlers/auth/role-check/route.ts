export const dynamic = 'force-dynamic';
import { NextResponse, type NextRequest } from 'next/server';
import { serverStaffStore, normalizeEmail } from '@/lib/serverStaffStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

async function resolveRole(rawEmail: string, normalizedEmail?: string) {
  const email = (rawEmail || '').toLowerCase().trim();
  const norm = normalizedEmail || normalizeEmail(email);

  let role = serverStaffStore.getRoleForEmail(email);
  if (role === 'customer' && norm) {
    role = serverStaffStore.getRoleForEmail(norm);
  }

  // Supabase fallback in case of cold lambdas
  if (role === 'customer' && isSupabaseConfigured() && email) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .or(`email.eq.${email},email.eq.${norm}`)
        .maybeSingle();

      if (data?.role && data.role !== 'customer') {
        role = data.role as any;
      }
    } catch (err) {
      console.warn('[RoleCheck] Supabase fallback query warning:', err);
    }
  }

  const isAdmin = role === 'admin';
  const isRider = role === 'delivery_partner' || role === 'rider';

  return { email, role, isAdmin, isRider };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || '';
    const norm = searchParams.get('normalizedEmail') || '';
    const result = await resolveRole(email, norm);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to check role' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email || '';
    const norm = body?.normalizedEmail || '';
    const result = await resolveRole(email, norm);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to check role' },
      { status: 500 }
    );
  }
}
