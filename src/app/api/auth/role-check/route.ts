import { NextResponse, type NextRequest } from 'next/server';
import { serverStaffStore } from '@/lib/serverStaffStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.toLowerCase()?.trim() || '';

    const role = serverStaffStore.getRoleForEmail(email);
    const isAdmin = role === 'admin';
    const isRider = role === 'delivery_partner' || role === 'rider';

    return NextResponse.json({
      success: true,
      email,
      role,
      isAdmin,
      isRider,
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
    const email = body?.email?.toLowerCase()?.trim() || '';

    const role = serverStaffStore.getRoleForEmail(email);
    const isAdmin = role === 'admin';
    const isRider = role === 'delivery_partner' || role === 'rider';

    return NextResponse.json({
      success: true,
      email,
      role,
      isAdmin,
      isRider,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to check role' },
      { status: 500 }
    );
  }
}
