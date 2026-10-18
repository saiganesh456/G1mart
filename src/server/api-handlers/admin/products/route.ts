export const dynamic = 'force-dynamic';
import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { productService } from '@/services/productService';
import { verifyAdminRequest } from '@/lib/authGuard';

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

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Admin authorization required' },
        { status: auth.status || 401 }
      );
    }

    const body = await request.json();
    const { id, name, brand, price, originalPrice, unit, inStock, imageUrl, imageStatus, category, subCategory } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const MIGRATED_PATH = path.join(process.cwd(), 'data', 'migrated_products.json');
    const VARIANTS_PATH = path.join(process.cwd(), 'data', 'migrated_product_variants.json');

    // 1. Update data/migrated_products.json (Storefront source of truth)
    if (fs.existsSync(MIGRATED_PATH)) {
      try {
        const migratedList = JSON.parse(fs.readFileSync(MIGRATED_PATH, 'utf-8'));
        const mIndex = migratedList.findIndex((p: any) => p.id === id);
        if (mIndex !== -1) {
          const mProd = migratedList[mIndex];
          if (name !== undefined) mProd.name = String(name).trim();
          if (brand !== undefined) mProd.brand = String(brand).trim();
          if (category !== undefined) mProd.category_id = String(category).trim();
          if (subCategory !== undefined) mProd.sub_category = String(subCategory).trim();
          if (unit !== undefined) mProd.unit = String(unit).trim();
          if (price !== undefined) mProd.price = Number(price);
          if (originalPrice !== undefined) mProd.originalPrice = Number(originalPrice);
          if (inStock !== undefined) mProd.is_active = Boolean(inStock);
          if (imageUrl !== undefined) {
            mProd.image_url = String(imageUrl).trim();
            mProd.image_status = 'verified';
          }
          fs.writeFileSync(MIGRATED_PATH, JSON.stringify(migratedList, null, 2), 'utf-8');
        }
      } catch (err) {
        console.warn('[Admin Products] Error updating migrated_products.json:', err);
      }
    }

    // 2. Update data/migrated_product_variants.json if price/stock changed
    if (fs.existsSync(VARIANTS_PATH)) {
      try {
        const variantsList = JSON.parse(fs.readFileSync(VARIANTS_PATH, 'utf-8'));
        let variantUpdated = false;
        variantsList.forEach((v: any) => {
          if (v.product_id === id) {
            if (price !== undefined) v.price = Number(price);
            if (originalPrice !== undefined) v.mrp = Number(originalPrice);
            if (body.stockCount !== undefined) v.stock = Number(body.stockCount);
            variantUpdated = true;
          }
        });
        if (variantUpdated) {
          fs.writeFileSync(VARIANTS_PATH, JSON.stringify(variantsList, null, 2), 'utf-8');
        }
      } catch (err) {
        console.warn('[Admin Products] Error updating migrated_product_variants.json:', err);
      }
    }

    // 3. Update src/data/products-catalog.json (Admin catalog backup)
    if (fs.existsSync(CATALOG_PATH)) {
      try {
        const rawData = fs.readFileSync(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(rawData);
        const index = catalog.findIndex((p: any) => p.id === id);
        if (index !== -1) {
          const current = catalog[index];
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
          fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
        }
      } catch (err) {
        console.warn('[Admin Products] Error updating products-catalog.json:', err);
      }
    }

    // 4. Update in-memory product service immediately for live storefront
    await productService.updateProduct({
      id,
      ...(name !== undefined && { name: String(name).trim() }),
      ...(brand !== undefined && { brand: String(brand).trim() }),
      ...(category !== undefined && { category: String(category).trim() }),
      ...(subCategory !== undefined && { subCategory: String(subCategory).trim() }),
      ...(unit !== undefined && { unit: String(unit).trim() }),
      ...(price !== undefined && { price: Number(price), priceConfirmed: Number(price) > 0 }),
      ...(originalPrice !== undefined && { originalPrice: Number(originalPrice) }),
      ...(inStock !== undefined && { inStock: Boolean(inStock) }),
      ...(body.stockCount !== undefined && { stockCount: Number(body.stockCount) }),
      ...(imageUrl !== undefined && {
        imageUrl: String(imageUrl).trim(),
        image: String(imageUrl).trim(),
        image_url: String(imageUrl).trim(),
        imageStatus: imageStatus || 'VERIFIED',
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully across all customer catalogs',
      productId: id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
