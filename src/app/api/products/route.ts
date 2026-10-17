export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/productService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    let products = await productService.getProducts();

    if (query) {
      const q = query.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      products: products.slice(0, limit),
      total: products.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to search products' },
      { status: 500 }
    );
  }
}
