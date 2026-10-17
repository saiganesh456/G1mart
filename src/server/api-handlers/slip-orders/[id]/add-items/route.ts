export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { serverSlipOrders } from '@/lib/serverSlipOrders';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items provided to add' },
        { status: 400 }
      );
    }

    const result = await serverSlipOrders.addCustomerItems(id, items);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to add items to slip order' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Items added to slip order successfully',
      order: result.order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error adding items to slip order' },
      { status: 500 }
    );
  }
}
