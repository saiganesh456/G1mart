import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { productService } from '@/services/productService';

const CATALOG_PATH = path.join(process.cwd(), 'src', 'data', 'products-catalog.json');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'all';
    const stockStatus = searchParams.get('stock') || 'all';

    let products = await productService.getAllProductsRaw();

    if (query) {
      const q = query.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.rawName && p.rawName.toLowerCase().includes(q)) ||
          (p.itemNumber && String(p.itemNumber).includes(q))
      );
    }

    if (category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    if (stockStatus === 'in_stock') {
      products = products.filter((p) => p.inStock);
    } else if (stockStatus === 'out_of_stock') {
      products = products.filter((p) => !p.inStock);
    }

    return NextResponse.json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, brand, price, originalPrice, unit, inStock, imageUrl, imageStatus, category, subCategory } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    if (!fs.existsSync(CATALOG_PATH)) {
      return NextResponse.json({ success: false, error: 'Catalog file not found' }, { status: 500 });
    }

    const rawData = fs.readFileSync(CATALOG_PATH, 'utf-8');
    const catalog = JSON.parse(rawData);

    const index = catalog.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Product not found in catalog' }, { status: 404 });
    }

    const current = catalog[index];

    // Update fields if provided
    if (name !== undefined) current.name = String(name).trim();
    if (brand !== undefined) current.brand = String(brand).trim();
    if (category !== undefined) current.category = String(category).trim();
    if (subCategory !== undefined) current.subCategory = String(subCategory).trim();
    if (unit !== undefined) {
      current.unit = String(unit).trim();
      current.pack_size = String(unit).trim();
    }
    if (price !== undefined) {
      current.price = Number(price);
      current.priceConfirmed = Number(price) > 0;
    }
    if (originalPrice !== undefined) {
      current.originalPrice = Number(originalPrice);
      if (current.price > 0 && current.originalPrice > current.price) {
        current.discountPercentage = Math.round(((current.originalPrice - current.price) / current.originalPrice) * 100);
      } else {
        current.discountPercentage = 0;
      }
    }
    if (inStock !== undefined) current.inStock = Boolean(inStock);
    if (imageUrl !== undefined) {
      const cleanImg = String(imageUrl).trim();
      current.imageUrl = cleanImg;
      current.image = cleanImg;
      current.image_url = cleanImg;
      current.imageStatus = imageStatus || 'VERIFIED';
      current.image_status = imageStatus || 'VERIFIED';
    }

    // Save updated catalog back to file
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf-8');

    // Also update in-memory catalog
    await productService.updateProduct(current);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: current,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
