import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, reason } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    console.log(`[Account Deletion Request] Phone: ${phone}, Reason: ${reason || 'N/A'}, Time: ${new Date().toISOString()}`);

    // Here we can store into Supabase or notify admin
    return NextResponse.json({
      success: true,
      message: 'Account deletion request logged successfully. Processing within 48 hours.',
    });
  } catch (error) {
    console.error('Error handling account deletion request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
