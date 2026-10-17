import { NextResponse, type NextRequest } from 'next/server';
import { serverSlipStore } from '@/lib/serverSlipStore';
import { verifyAdminRequest } from '@/lib/authGuard';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Admin authorization required' },
        { status: auth.status || 401 }
      );
    }

    const slips = await serverSlipStore.getSlips();
    return NextResponse.json({ slips });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch slips' },
      { status: 500 }
    );
  }
}
