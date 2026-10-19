export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Payment simulation is permanently disabled.' },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Payment simulation is permanently disabled.' },
    { status: 403 }
  );
}
