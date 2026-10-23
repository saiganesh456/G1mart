export const dynamic = 'force-dynamic';
import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { productService, normalizeCategory } from '@/services/productService';
import { serverProductOverrides } from '@/lib/serverProductOverrides';
import { verifyAdminRequest } from '@/lib/authGuard';
import { serverSupabase as supabase, isSupabaseConfigured } from '@/lib/supabase/serverAdmin';

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
          (p.id && p.id.toLowerCase().includes(q)) ||
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
          if (category !== undefined) mProd.category_id = normalizeCategory(String(category).trim());
          if (subCategory !== undefined) mProd.sub_category = String(subCategory).trim();
          if (unit !== undefined) mProd.unit = String(unit).trim();
          if (price !== undefined) mProd.price = Number(price);
          if (originalPrice !== undefined) mProd.originalPrice = Number(originalPrice);
          if (inStock !== undefined) mProd.is_active = Boolean(inStock);
          if (body.stockCount !== undefined) {
            mProd.stock_count = Number(body.stockCount);
            mProd.stockCount = Number(body.stockCount);
          }
          if (Array.isArray(body.variants) && body.variants.length > 0) {
            mProd.variants = body.variants;
          }
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

        if (Array.isArray(body.variants) && body.variants.length > 0) {
          body.variants.forEach((bv: any, bIdx: number) => {
            const existing = variantsList.find(
              (v: any) =>
                v.product_id === id &&
                (v.id === bv.id ||
                  (bv.size_label &&
                    v.size_label &&
                    bv.size_label.trim().toLowerCase() === v.size_label.trim().toLowerCase()))
            );
            if (existing) {
              if (bv.price !== undefined) existing.price = Number(bv.price);
              if (bv.mrp !== undefined) existing.mrp = Number(bv.mrp);
              if (bv.stock !== undefined) existing.stock = Number(bv.stock);
              if (bv.size_label) existing.size_label = bv.size_label.trim();
              if (bv.image_url) existing.image_url = bv.image_url;
              variantUpdated = true;
            } else {
              variantsList.push({
                id: bv.id || `${id}-v${Date.now().toString().slice(-4)}${bIdx}`,
                product_id: id,
                size_label: bv.size_label ? bv.size_label.trim() : '1 unit',
                price: Number(bv.price) || 0,
                mrp: Number(bv.mrp) || Number(bv.price) || 0,
                stock: Number(bv.stock) >= 0 ? Number(bv.stock) : 15,
                image_url: bv.image_url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              variantUpdated = true;
            }
          });
        } else {
          variantsList.forEach((v: any) => {
            if (v.product_id === id) {
              if (price !== undefined) v.price = Number(price);
              if (originalPrice !== undefined) v.mrp = Number(originalPrice);
              if (body.stockCount !== undefined) v.stock = Number(body.stockCount);
              variantUpdated = true;
            }
          });
        }

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
          if (Array.isArray(body.variants) && body.variants.length > 0) current.variants = body.variants;
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

    // 4. Persist override to Supabase cloud storage (shared across all Vercel Lambdas)
    await serverProductOverrides.saveOverride({
      id,
      ...(name !== undefined && { name: String(name).trim() }),
      ...(brand !== undefined && { brand: String(brand).trim() }),
      ...(category !== undefined && { category: String(category).trim() }),
      ...(subCategory !== undefined && { subCategory: String(subCategory).trim() }),
      ...(unit !== undefined && { unit: String(unit).trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(originalPrice !== undefined && { originalPrice: Number(originalPrice) }),
      ...(inStock !== undefined && { inStock: Boolean(inStock) }),
      ...(body.stockCount !== undefined && { stockCount: Number(body.stockCount) }),
      ...(imageUrl !== undefined && {
        imageUrl: String(imageUrl).trim(),
        imageStatus: imageStatus || 'VERIFIED',
      }),
      ...(body.variants !== undefined && { variants: body.variants }),
    });

    // 5. Update in-memory product service immediately for live storefront
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
      ...(body.variants !== undefined && { variants: body.variants }),
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

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Admin authorization required' },
        { status: auth.status || 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      brand,
      category,
      subCategory,
      unit,
      price,
      originalPrice,
      stockCount,
      inStock,
      imageUrl,
      imageStatus,
      variants,
    } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();
    const cleanBrand = brand ? String(brand).trim() : 'G1 Mart';
    const cleanUnit = unit ? String(unit).trim() : '1 unit';
    const cleanCategory = normalizeCategory(category ? String(category).trim() : 'atta-rice-dal');
    const numPrice = Number(price) || 0;
    const numMrp = Number(originalPrice) || numPrice;
    const numStock = stockCount !== undefined ? Number(stockCount) : 15;
    const boolInStock = inStock !== undefined ? Boolean(inStock) : numStock > 0;
    const cleanImg = imageUrl && String(imageUrl).trim() ? String(imageUrl).trim() : '/products/placeholder.svg';

    const newId = `g1-p${Date.now().toString().slice(-6)}`;

    const newVariants =
      Array.isArray(variants) && variants.length > 0
        ? variants
        : [
            {
              id: `${newId}-v1`,
              product_id: newId,
              size_label: cleanUnit,
              price: numPrice,
              mrp: numMrp,
              stock: numStock,
              image_url: cleanImg,
            },
          ];

    const newProduct: any = {
      id: newId,
      name: cleanName,
      brand: cleanBrand,
      category: cleanCategory,
      category_id: cleanCategory,
      subCategory: subCategory ? String(subCategory).trim() : undefined,
      unit: cleanUnit,
      price: numPrice,
      priceConfirmed: numPrice > 0,
      originalPrice: numMrp,
      discountPercentage:
        numMrp > numPrice && numMrp > 0
          ? Math.round(((numMrp - numPrice) / numMrp) * 100)
          : 0,
      stockCount: numStock,
      inStock: boolInStock,
      imageUrl: cleanImg,
      image_url: cleanImg,
      image: cleanImg,
      imageStatus: imageStatus || 'VERIFIED',
      image_status: imageStatus || 'VERIFIED',
      isActive: true,
      variants: newVariants,
    };

    const MIGRATED_PATH = path.join(process.cwd(), 'data', 'migrated_products.json');
    const VARIANTS_PATH = path.join(process.cwd(), 'data', 'migrated_product_variants.json');

    // 1. Update data/migrated_products.json
    if (fs.existsSync(MIGRATED_PATH)) {
      try {
        const migratedList = JSON.parse(fs.readFileSync(MIGRATED_PATH, 'utf-8'));
        migratedList.unshift({
          id: newId,
          name: cleanName,
          brand: cleanBrand,
          category_id: cleanCategory,
          sub_category: subCategory ? String(subCategory).trim() : undefined,
          unit: cleanUnit,
          price: numPrice,
          originalPrice: numMrp,
          is_active: boolInStock,
          image_url: cleanImg,
          image_status: 'verified',
        });
        fs.writeFileSync(MIGRATED_PATH, JSON.stringify(migratedList, null, 2), 'utf-8');
      } catch (err) {
        console.warn('[Admin Products] Error adding to migrated_products.json:', err);
      }
    }

    // 2. Update data/migrated_product_variants.json
    if (fs.existsSync(VARIANTS_PATH)) {
      try {
        const variantsList = JSON.parse(fs.readFileSync(VARIANTS_PATH, 'utf-8'));
        newVariants.forEach((v: any) => variantsList.unshift(v));
        fs.writeFileSync(VARIANTS_PATH, JSON.stringify(variantsList, null, 2), 'utf-8');
      } catch (err) {
        console.warn('[Admin Products] Error adding to migrated_product_variants.json:', err);
      }
    }

    // 3. Update src/data/products-catalog.json
    if (fs.existsSync(CATALOG_PATH)) {
      try {
        const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
        catalog.unshift(newProduct);
        fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
      } catch (err) {
        console.warn('[Admin Products] Error adding to products-catalog.json:', err);
      }
    }

    // 4. Persist override to Supabase cloud storage (KV fallback)
    await serverProductOverrides.saveOverride({
      id: newId,
      name: cleanName,
      brand: cleanBrand,
      category: cleanCategory,
      subCategory: subCategory ? String(subCategory).trim() : undefined,
      unit: cleanUnit,
      price: numPrice,
      originalPrice: numMrp,
      inStock: boolInStock,
      stockCount: numStock,
      imageUrl: cleanImg,
      imageStatus: imageStatus || 'VERIFIED',
      variants: newVariants,
    });

    // 5. Update in-memory product service immediately
    await productService.addProduct(newProduct);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully and published to storefront!',
      product: newProduct,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Admin authorization required' },
        { status: auth.status || 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const MIGRATED_PATH = path.join(process.cwd(), 'data', 'migrated_products.json');
    const VARIANTS_PATH = path.join(process.cwd(), 'data', 'migrated_product_variants.json');

    // 1. Remove from data/migrated_products.json
    if (fs.existsSync(MIGRATED_PATH)) {
      try {
        const migratedList = JSON.parse(fs.readFileSync(MIGRATED_PATH, 'utf-8'));
        const filtered = migratedList.filter((p: any) => p.id !== id);
        if (filtered.length !== migratedList.length) {
          fs.writeFileSync(MIGRATED_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
        }
      } catch (err) {
        console.warn('[Admin Products] Error removing from migrated_products.json:', err);
      }
    }

    // 2. Remove from data/migrated_product_variants.json
    if (fs.existsSync(VARIANTS_PATH)) {
      try {
        const variantsList = JSON.parse(fs.readFileSync(VARIANTS_PATH, 'utf-8'));
        const filteredVariants = variantsList.filter((v: any) => v.product_id !== id);
        if (filteredVariants.length !== variantsList.length) {
          fs.writeFileSync(VARIANTS_PATH, JSON.stringify(filteredVariants, null, 2), 'utf-8');
        }
      } catch (err) {
        console.warn('[Admin Products] Error removing from migrated_product_variants.json:', err);
      }
    }

    // 3. Remove from src/data/products-catalog.json
    if (fs.existsSync(CATALOG_PATH)) {
      try {
        const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
        const filteredCatalog = catalog.filter((p: any) => p.id !== id);
        if (filteredCatalog.length !== catalog.length) {
          fs.writeFileSync(CATALOG_PATH, JSON.stringify(filteredCatalog, null, 2), 'utf-8');
        }
      } catch (err) {
        console.warn('[Admin Products] Error removing from products-catalog.json:', err);
      }
    }

    // 4. Mark deleted in cloud overrides
    try {
      await serverProductOverrides.saveOverride({
        id,
        inStock: false,
        stockCount: 0,
        is_active: false,
        isActive: false,
        deleted: true,
      } as any);
    } catch (err) {
      console.warn('[Admin Products] Error updating override on delete:', err);
    }

    // 5. Remove from in-memory product service
    await productService.deleteProduct(id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      productId: id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
