import { NextRequest, NextResponse } from 'next/server';
import { serverSlipStore } from '@/lib/serverSlipStore';
import { serverSlipOrders } from '@/lib/serverSlipOrders';
import { supabase } from '@/lib/supabase/client';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_UPLOAD_BYTES = 2.5 * 1024 * 1024; // 2.5 MB maximum allowed on server (target compressed <= 1.5MB)

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Parse form data
    const formData = await req.formData();
    const customerName = (formData.get('name') as string)?.trim() || 'Valued Customer';
    const customerPhone = (formData.get('phone') as string)?.trim() || '';
    const customerNote = (formData.get('note') as string)?.trim() || '';

    // Location attributes copied from saved location
    const address = (formData.get('address') as string)?.trim() || 'Padarupalli, Nellore';
    const lat = formData.get('lat') ? Number(formData.get('lat')) : null;
    const lng = formData.get('lng') ? Number(formData.get('lng')) : null;
    const pincode = (formData.get('pincode') as string)?.trim() || null;
    const distanceKm = formData.get('distance_km') ? Number(formData.get('distance_km')) : 2;
    const etaMin = formData.get('eta_min') ? Number(formData.get('eta_min')) : 15;
    const zoneId = (formData.get('zone_id') as string)?.trim() || null;
    const zoneMinOrder = formData.get('zone_min_order') ? Number(formData.get('zone_min_order')) : 500;
    const orderType = ((formData.get('order_type') as string) === 'pickup' ? 'pickup' : 'delivery') as 'delivery' | 'pickup';

    // Collect all uploaded files (supports multi-page slips)
    const rawFiles = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const filesToProcess: File[] = [];
    if (rawFiles && rawFiles.length > 0) {
      filesToProcess.push(...rawFiles.filter((f) => f && f.size > 0));
    }
    if (filesToProcess.length === 0 && singleFile && singleFile.size > 0) {
      filesToProcess.push(singleFile);
    }

    // 1. Validate customer phone
    if (!customerPhone || customerPhone.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { error: 'Please provide a valid 10-digit mobile number so the store can reach you.' },
        { status: 400 }
      );
    }

    // 2. Rate limit per phone and per IP
    const phoneLimit = serverSlipStore.checkRateLimit(`phone:${customerPhone}`, 6, 10 * 60 * 1000);
    if (!phoneLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many slip uploads from this phone number. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const ipLimit = serverSlipStore.checkRateLimit(`ip:${ip}`, 12, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many upload attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // 3. Validate file presence
    if (filesToProcess.length === 0) {
      return NextResponse.json({ error: 'No slip image provided.' }, { status: 400 });
    }

    // Validate MIME types and file sizes
    for (const f of filesToProcess) {
      if (!ALLOWED_MIME_TYPES.includes(f.type)) {
        return NextResponse.json(
          { error: `Invalid image format (${f.type}). Only JPG, PNG, and WebP are allowed.` },
          { status: 400 }
        );
      }
      if (f.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: `Image (${f.name}) exceeds the 2.5MB limit. Please compress or retake.` },
          { status: 400 }
        );
      }
    }

    let uploadDir = '';
    // Serverless platforms like Vercel have a read-only filesystem (/var/task).
    // Only attempt local filesystem directory preparation when not on Vercel and in dev environments.
    if (!process.env.VERCEL) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const targetDir = path.join(process.cwd(), 'public', 'uploads', 'slips');
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        uploadDir = targetDir;
      } catch (dirErr) {
        console.warn('[Slip Upload] Local uploads directory not writable (serverless environment):', dirErr);
        uploadDir = '';
      }
    }

    const uploadedUrls: string[] = [];
    const uploadedPaths: string[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = file.type.split('/')[1] || 'jpg';
      const fileName = `${Date.now()}_p${i + 1}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const storagePath = `slips/${customerPhone.replace(/\D/g, '')}/${fileName}`;

      let localPublicUrl = '';
      if (uploadDir) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const localFilePath = path.join(uploadDir, fileName);
          fs.writeFileSync(localFilePath, buffer);
          localPublicUrl = `/uploads/slips/${fileName}`;
        } catch (fsErr) {
          console.warn('[Slip Upload] Could not write to public folder:', fsErr);
        }
      }

      let fileUrl = localPublicUrl;
      let filePath = storagePath;

      // Upload to Supabase private bucket 'slips' if available
      try {
        const { data, error } = await supabase.storage
          .from('slips')
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (!error && data) {
          filePath = data.path;
          const { data: signedData } = await supabase.storage
            .from('slips')
            .createSignedUrl(data.path, 60 * 60 * 24);
          if (signedData?.signedUrl) {
            fileUrl = signedData.signedUrl;
          }
        }
      } catch (storageErr) {
        console.warn('[Slip Upload] Private storage upload notice:', storageErr);
      }

      // Universal zero-fail fallback: base64 Data URI works on all environments including Vercel
      if (!fileUrl) {
        fileUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
      }

      uploadedUrls.push(fileUrl);
      uploadedPaths.push(filePath);
    }

    // 7. Save record to slip_uploads
    const primaryUrl = uploadedUrls[0];
    const primaryPath = uploadedPaths[0];

    const slip = await serverSlipStore.createSlip({
      customer_name: customerName,
      customer_phone: customerPhone,
      image_path: primaryPath,
      image_url: primaryUrl,
      image_paths: uploadedPaths,
      image_urls: uploadedUrls,
      customer_note: customerNote,
      ip,
    });

    // Create Phase 6 slip_orders record
    const slipOrder = await serverSlipOrders.createSlipOrder({
      customerName,
      customerPhone,
      customerNote,
      address,
      lat,
      lng,
      pincode,
      distanceKm,
      etaMin,
      zoneId,
      zoneMinOrder,
      orderType,
      images: uploadedPaths.map((p, idx) => ({
        storagePath: p,
        imageUrl: uploadedUrls[idx],
      })),
    });

    return NextResponse.json({
      success: true,
      slipId: slipOrder.id,
      orderId: slipOrder.id,
      pagesCount: uploadedUrls.length,
      message: 'We received your list. Our team will call you to confirm',
      slip: {
        id: slipOrder.id,
        customer_name: slipOrder.customer_name,
        created_at: slipOrder.created_at,
        status: slipOrder.status,
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
