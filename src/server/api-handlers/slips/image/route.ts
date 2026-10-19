export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase as supabase, isSupabaseConfigured } from '@/lib/supabase/serverAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('path');
    const ALLOWED_BUCKETS = ['slips', 'product-images'];
    const rawBucket = searchParams.get('bucket') || 'slips';
    if (!ALLOWED_BUCKETS.includes(rawBucket)) {
      return NextResponse.json({ error: 'Invalid or restricted storage bucket' }, { status: 403 });
    }
    const bucket = rawBucket;

    if (!filePath) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // Clean leading slash or bucket name if passed, and prevent directory traversal
    const cleanPath = filePath.replace(/^slips\//, '').replace(/^\/+/, '');
    if (cleanPath.includes('..') || cleanPath.includes('\\')) {
      return NextResponse.json({ error: 'Invalid path parameter' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      try {
        // Try download first for direct stream
        const { data, error } = await supabase.storage.from(bucket).download(cleanPath);
        if (!error && data) {
          const buffer = await data.arrayBuffer();
          const contentType = data.type || (cleanPath.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
          });
        }

        // Fallback: create fresh signed URL
        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(cleanPath, 3600);

        if (signedData?.signedUrl) {
          return NextResponse.redirect(signedData.signedUrl);
        }
      } catch (storageErr) {
        console.warn('[api/slips/image] Storage fetch error:', storageErr);
      }
    }

    // Local filesystem fallback
    try {
      const fs = await import('fs');
      const path = await import('path');
      const fileName = path.basename(cleanPath);
      const candidates = [
        path.join(process.cwd(), 'public', 'uploads', 'slips', fileName),
        path.join(process.cwd(), 'public', cleanPath),
        path.join(process.cwd(), cleanPath),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
          const buffer = fs.readFileSync(cand);
          const ext = path.extname(cand).slice(1).toLowerCase() || 'jpeg';
          const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': mimeType,
              'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
          });
        }
      }
    } catch {}

    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
