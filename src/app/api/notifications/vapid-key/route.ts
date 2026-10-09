import { NextResponse } from 'next/server';
import { serverPushService } from '@/lib/serverPushService';

export async function GET() {
  const publicKey = serverPushService.getPublicKey();
  return NextResponse.json({
    success: true,
    publicKey,
  });
}
