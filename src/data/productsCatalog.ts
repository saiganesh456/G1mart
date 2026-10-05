import { Product } from '@/types';
import rawCatalog from './products-catalog.json';

export const CATALOG_PRODUCTS: Product[] = (rawCatalog as any[]).map((item) => {
  const isApproved = Boolean(item.imageUrl && item.imageStatus === 'VERIFIED');
  return {
    id: item.id,
    itemNumber: item.sourceItemNo ?? item.itemNumber,
    rawName: item.sourceName ?? item.name,
    name: item.name,
    brand: item.brand || 'Unbranded',
    category: item.category || 'other',
    subCategory: item.subCategory ?? undefined,
    unit: item.unit || '1 unit',
    price: Number(item.price || 0),
    priceConfirmed: Boolean(item.priceConfirmed ?? (item.price > 0)),
    originalPrice: Number(item.originalPrice || item.price || 0),
    discountPercentage: Number(item.discountPercentage || 0),
    inStock: Boolean(item.inStock ?? true),
    stockCount: Number(item.stockCount ?? 15),
    image: item.imageUrl || '/products/placeholder.svg',
    image_path: item.imageUrl || undefined,
    imageUrl: item.imageUrl || null,
    image_url: item.imageUrl || null,
    image_source: isApproved ? 'manufacturer' : 'placeholder',
    image_license: isApproved ? 'Brand Pack' : null,
    image_status: item.imageStatus || (isApproved ? 'VERIFIED' : 'NEEDS_REVIEW'),
    imageStatus: item.imageStatus || (isApproved ? 'VERIFIED' : 'NEEDS_REVIEW'),
    image_match_note: item.imageMatchNote ?? undefined,
    description: item.description || `Original Indian market product: ${item.name}`,
    rating: Number(item.rating || 4.8),
    reviewsCount: Number(item.reviewsCount || 12),
    isPopular: Boolean(item.isPopular),
    isBestDeal: Boolean(item.isBestDeal),
    isActive: Boolean(item.isActive ?? true),
  };
});
