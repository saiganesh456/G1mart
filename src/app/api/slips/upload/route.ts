import { NextRequest, NextResponse } from 'next/server';
import { serverSlipStore } from '@/lib/serverSlipStore';
import { supabase } from '@/lib/supabase/client';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024; // 2.5 MB maximum allowed on server (target compressed <= 1.5MB)

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customerName = (formData.get('name') as string)?.trim() || 'Customer';
    const customerPhone = (formData.get('phone') as string)?.trim() || '';

    // 1. Validate customer phone
    if (!customerPhone || customerPhone.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { error: 'Please provide a valid 10-digit mobile number so the store can reach you.' },
        { status: 400 }
      );
    }

    // 2. Rate limit per phone and per IP
    const phoneLimit = serverSlipStore.checkRateLimit(`phone:${customerPhone}`, 5, 10 * 60 * 1000);
    if (!phoneLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many slip uploads from this phone number. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const ipLimit = serverSlipStore.checkRateLimit(`ip:${ip}`, 10, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many upload attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // 3. Validate file presence
    if (!file) {
      return NextResponse.json({ error: 'No slip image provided.' }, { status: 400 });
    }

    // 4. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid image format (${file.type}). Only JPG, PNG, and WebP are allowed.` },
        { status: 400 }
      );
    }

    // 5. Validate file size
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 1.5MB limit. Please compress or retake.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${file.type.split('/')[1] || 'jpg'}`;
    const storagePath = `slips/${customerPhone.replace(/\D/g, '')}/${fileName}`;

    let imageUrl: string = '';
    let imagePath: string = storagePath;

    // 6. Attempt upload to Supabase private storage bucket 'slips'
    try {
      const { data, error } = await supabase.storage
        .from('slips')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (!error && data) {
        imagePath = data.path;
        // Generate signed URL (valid for 24 hours for review)
        const { data: signedData } = await supabase.storage
          .from('slips')
          .createSignedUrl(data.path, 60 * 60 * 24);
        imageUrl = signedData?.signedUrl || '';
      }
    } catch (storageErr) {
      console.warn('[Slip Upload] Private storage upload notice:', storageErr);
    }

    // Fallback: If Supabase bucket is pending migration, encode as base64 data-url for local store
    if (!imageUrl) {
      imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    // 7. Save record to slip_uploads
    const slip = await serverSlipStore.createSlip({
      customer_name: customerName,
      customer_phone: customerPhone,
      image_path: imagePath,
      image_url: imageUrl,
      ip,
    });

    return NextResponse.json({
      success: true,
      slipId: slip.id,
      message: 'Your slip was sent to the store.',
      slip: {
        id: slip.id,
        customer_name: slip.customer_name,
        created_at: slip.created_at,
        status: slip.status,
      },
    });
  } catch (err: any) {
    console.error('[Slip Upload] Error processing slip:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process slip image.' },
      { status: 500 }
    );
  }
}
