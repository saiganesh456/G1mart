export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminRequest } from '@/lib/authGuard';
import { serverProductOverrides } from '@/lib/serverProductOverrides';
import { productService } from '@/services/productService';
import { serverSupabase as supabase, isSupabaseConfigured } from '@/lib/supabase/serverAdmin';

const SUPABASE_STORAGE_URL = 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/product-images';
const STORAGE_PUBLIC_BASE = 'https://pzrigfczxwscpzxkykvf.supabase.co/storage/v1/object/public/product-images';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Admin authorization required' },
        { status: auth.status || 401 }
      );
    }

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

      // 1. Validate file format and size (10MB max)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
      if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, WEBP, AVIF' },
          { status: 400 }
        );
      }

      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: 'File size exceeds maximum 10MB limit' },
          { status: 400 }
        );
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const ext = file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg';
      const cleanProdId = productId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanProdId}-${Date.now()}.${ext}`;
      const storagePath = `products/${filename}`;

      let finalImageUrl = '';

      // 2. Try Supabase Storage 'product-images' bucket first
      try {
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

        if (uploadResp.ok) {
          finalImageUrl = `${STORAGE_PUBLIC_BASE}/${storagePath}`;
        }
      } catch (sbErr) {
        console.warn('[upload-image] Supabase Storage upload error, falling back to local storage:', sbErr);
      }

      // 3. Fallback: Save to local public/products/uploads/ directory
      if (!finalImageUrl) {
        try {
          const uploadsDir = path.join(process.cwd(), 'public', 'products', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          const localFilePath = path.join(uploadsDir, filename);
          fs.writeFileSync(localFilePath, fileBuffer);
          finalImageUrl = `/products/uploads/${filename}`;
        } catch (fsErr) {
          console.error('[upload-image] Local filesystem write error:', fsErr);
          return NextResponse.json(
            { success: false, error: 'Failed to write uploaded image to disk' },
            { status: 500 }
          );
        }
      }

      // 4. Persist to server product overrides and in-memory catalog
      await serverProductOverrides.saveOverride({
        id: productId,
        imageUrl: finalImageUrl,
        imageStatus: 'VERIFIED',
      });

      await productService.updateProduct({
        id: productId,
        imageUrl: finalImageUrl,
        image: finalImageUrl,
        image_url: finalImageUrl,
        imageStatus: 'VERIFIED',
      });

      // Best effort update to Supabase products table if exists
      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('products')
            .update({
              image_url: finalImageUrl,
              image_status: 'VERIFIED',
              updated_at: new Date().toISOString(),
            })
            .eq('id', productId);
        } catch {}
      }

      return NextResponse.json({
        success: true,
        imageUrl: finalImageUrl,
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

    const cleanUrl = String(imageUrl).trim();

    // Persist to server overrides
    await serverProductOverrides.saveOverride({
      id: productId,
      imageUrl: cleanUrl,
      imageStatus: 'VERIFIED',
    });

    await productService.updateProduct({
      id: productId,
      imageUrl: cleanUrl,
      image: cleanUrl,
      image_url: cleanUrl,
      imageStatus: 'VERIFIED',
    });

    return NextResponse.json({
      success: true,
      imageUrl: cleanUrl,
      productId,
      message: 'Product image updated and verified!',
    });
  } catch (error: any) {
    console.error('[upload-image] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error uploading image' },
      { status: 500 }
    );
  }
}
