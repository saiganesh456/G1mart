import { NextResponse } from 'next/server';
import { serverSlipStore } from '@/lib/serverSlipStore';

export async function GET() {
  try {
    const slips = await serverSlipStore.getSlips();
    return NextResponse.json({ slips });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch slips' },
      { status: 500 }
    );
  }
}
