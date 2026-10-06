import { NextRequest, NextResponse } from 'next/server';
import { serverSlipStore } from '@/lib/serverSlipStore';
import { supabase } from '@/lib/supabase/client';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const slip = await serverSlipStore.getSlipById(id);

    if (!slip) {
      return NextResponse.json({ error: 'Slip not found' }, { status: 404 });
    }

    // Refresh signed URL if image_path is in Supabase storage
    let freshUrl = slip.image_url;
    if (slip.image_path && !slip.image_path.startsWith('data:')) {
      try {
        const { data } = await supabase.storage
          .from('slips')
          .createSignedUrl(slip.image_path, 60 * 60); // 1-hour signed URL
        if (data?.signedUrl) {
          freshUrl = data.signedUrl;
        }
      } catch (e) {
        // use fallback url
      }
    }

    return NextResponse.json({
      slip: {
        ...slip,
        image_url: freshUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to get slip' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, admin_notes, handled_by } = body;

    const updated = await serverSlipStore.updateSlip(id, {
      status,
      admin_notes,
      handled_by: handled_by || 'Store Staff',
    });

    if (!updated) {
      return NextResponse.json({ error: 'Slip not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, slip: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update slip' },
      { status: 500 }
    );
  }
}
