import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

const SUPABASE_STORAGE_URL = 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/product-images';
const STORAGE_PUBLIC_BASE = 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_21Va_owgBZfUACOuIp5Z2w_tQFUY74e';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle Multipart File Upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const productId = formData.get('productId') as string | null;

      if (!file || !productId) {
        return NextResponse.json(
          { success: false, error: 'File and productId are required' },
          { status: 400 }
        );
      }

      // 1. Validate file format and size (5MB max)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
      if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, WEBP, AVIF' },
          { status: 400 }
        );
      }

      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: 'File size exceeds maximum 5MB limit' },
          { status: 400 }
        );
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const ext = file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg';
      const storagePath = `products/${productId}-${Date.now()}.${ext}`;

      // 2. Upload to Supabase Storage 'product-images' bucket
      const uploadUrl = `${SUPABASE_STORAGE_URL}/${storagePath}`;
      const uploadResp = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': file.type || 'image/jpeg',
          'x-upsert': 'true',
        },
        body: fileBuffer,
      });

      if (!uploadResp.ok) {
        const errText = await uploadResp.text();
        console.error('[upload-image] Storage upload failed:', errText);
        return NextResponse.json(
          { success: false, error: `Storage upload failed: ${errText}` },
          { status: 500 }
        );
      }

      // 3. Construct Public Supabase URL
      const publicUrl = `${STORAGE_PUBLIC_BASE}/${storagePath}`;

      // 4. Persist to Supabase public.products
      const { error: dbError } = await supabase
        .from('products')
        .update({
          image_url: publicUrl,
          image_status: 'VERIFIED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (dbError) {
        console.error('[upload-image] Database update failed:', dbError);
        return NextResponse.json(
          { success: false, error: `Database update failed: ${dbError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        imageUrl: publicUrl,
        productId,
        message: 'Image uploaded and published successfully!',
      });
    }

    // Handle JSON URL assignment
    const body = await req.json();
    const { productId, imageUrl } = body;

    if (!productId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'productId and imageUrl are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid image URL format' },
        { status: 400 }
      );
    }

    // Persist to Supabase public.products
    const { error: dbError } = await supabase
      .from('products')
      .update({
        image_url: imageUrl,
        image_status: 'VERIFIED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (dbError) {
      console.error('[upload-image] Database update failed:', dbError);
      return NextResponse.json(
        { success: false, error: `Database update failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      productId,
      message: 'Product image updated and verified in database!',
    });
  } catch (error: any) {
    console.error('[upload-image] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error uploading image' },
      { status: 500 }
    );
  }
}
