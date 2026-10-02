'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  TrendingUp,
  Tag,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  Check,
} from 'lucide-react';
import type { Category, Product } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

export default function AdminDashboardClient({ initialProducts, categories }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [activeTab, setActiveTab] = useState<'inventory' | 'add_product'>('inventory');

  // New product form state
  const [newProductName, setNewProductName] = useState('');
  const [newBrand, setNewBrand] = useState('G1 Mart');
  const [newCategory, setNewCategory] = useState(categories[0]?.id || 'rice-dal-atta');
  const [newSubCategory, setNewSubCategory] = useState(categories[0]?.subcategories[0] || 'Atta & Flours');
  const [newUnit, setNewUnit] = useState('1 kg');
  const [newPrice, setNewPrice] = useState('65');
  const [newMRP, setNewMRP] = useState('65');
  const [newStock, setNewStock] = useState('50');
  const [newImage, setNewImage] = useState('/products/prod-2.jpg');
  const [newDesc, setNewDesc] = useState('Authentic, hygienically packed product sourced directly for G1 Mart Supermarket.');
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);

  // Quick photo presets for adding items easily
  const PHOTO_PRESETS = [
    { label: 'Atta / Wheat', url: '/products/prod-2.jpg' },
    { label: 'Tata Salt', url: '/products/prod-1.jpg' },
    { label: 'Sunflower Oil', url: '/products/prod-3.jpg' },
    { label: 'Fresh Milk', url: '/products/prod-4.jpg' },
    { label: 'Brown Bread', url: '/products/prod-5.jpg' },
    { label: 'Basmati Rice', url: '/products/prod-6.jpg' },
    { label: 'Potato Chips', url: '/products/prod-7.jpg' },
    { label: 'Coca Cola', url: '/products/prod-8.jpg' },
    { label: 'Surf Excel', url: '/products/prod-9.jpg' },
    { label: 'Colgate Dental', url: '/products/prod-10.jpg' },
    { label: 'Toor Dal', url: '/products/photos/toor-dal.jpg' },
    { label: 'Urad Dal', url: '/products/photos/urad-dal.jpg' },
    { label: 'Moong Dal', url: '/products/photos/moong-dal.jpg' },
    { label: 'Chana Dal', url: '/products/photos/chana-dal.jpg' },
    { label: 'Cashews / Kaju', url: '/products/photos/cashews.jpg' },
    { label: 'Almonds / Badam', url: '/products/photos/almonds.jpg' },
    { label: 'Red Chilli Powder', url: '/products/photos/chilli-powder.jpg' },
    { label: 'Turmeric Powder', url: '/products/photos/turmeric.jpg' },
    { label: 'Crystal Salt', url: '/products/photos/crystal-salt.jpg' },
    { label: 'Suji Rava', url: '/products/photos/suji-rava.jpg' },
    { label: 'Pure Cow Ghee', url: '/products/photos/ghee.jpg' },
    { label: 'Pooja Camphor', url: '/products/photos/pooja-camphor.jpg' },
  ];

  // Selected category object
  const currentCategoryObj = categories.find((c) => c.id === newCategory);

  // Metrics
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = totalProducts - inStockCount;

  // Filtered products list for inventory table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.rawName && p.rawName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;

      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock' && p.inStock) ||
        (stockFilter === 'out_of_stock' && !p.inStock);

      return matchSearch && matchCat && matchStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Handle live stock toggle
  const toggleStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    );
  };

  // Handle inline price update
  const updatePrice = (productId: string, newP: number) => {
    if (isNaN(newP) || newP < 0) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, price: newP, originalPrice: newP } : p
      )
    );
  };

  // Handle Add Product submit
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newPrice) || 0;
    const mrpNum = parseFloat(newMRP) || priceNum;
    const stockNum = parseInt(newStock, 10) || 10;

    const newProd: Product = {
      id: `g1-${Date.now()}`,
      itemNumber: products.length + 1,
      name: `${newProductName} (${newUnit})`,
      brand: newBrand || 'G1 Mart',
      category: newCategory,
      subCategory: newSubCategory,
      unit: newUnit,
      price: priceNum,
      originalPrice: mrpNum,
      discountPercentage: mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0,
      inStock: stockNum > 0,
      stockCount: stockNum,
      image: newImage || '/products/photos/test-rice.jpg',
      description: newDesc,
      rating: 4.9,
      reviewsCount: 1,
      isPopular: true,
      isBestDeal: false,
    };

    setProducts((prev) => [newProd, ...prev]);
    setAddSuccessMsg(`"${newProd.name}" successfully added to G1 Mart store!`);

    // Reset form
    setNewProductName('');
    setTimeout(() => {
      setAddSuccessMsg(null);
      setActiveTab('inventory');
    }, 2000);
  };

  // Simulated live customer preview item
  const previewProduct: Product = {
    id: 'preview-item',
    name: newProductName ? `${newProductName} (${newUnit})` : `Sample Product (${newUnit})`,
    brand: newBrand || 'G1 Mart',
    category: newCategory,
    subCategory: newSubCategory,
    unit: newUnit,
    price: parseFloat(newPrice) || 50,
    originalPrice: parseFloat(newMRP) || 50,
    discountPercentage: 0,
    inStock: true,
    stockCount: parseInt(newStock, 10) || 20,
    image: newImage,
    description: newDesc,
    rating: 4.8,
    reviewsCount: 12,
    isPopular: true,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#2E7D32]" />
            <span>G1 Mart Store Inventory &amp; Catalog</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Manage 472 products, update real selling prices, toggle stock, and publish new inventory.
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-[#2E7D32] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Inventory ({totalProducts})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add_product')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'add_product'
                ? 'bg-[#2E7D32] text-white shadow-xs'
                : 'bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#C8E6C9]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2E7D32] flex items-center justify-center font-black">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-stone-900">{totalProducts}</div>
            <div className="text-[11px] font-semibold text-stone-500">Total Products</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-black">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-green-700">{inStockCount}</div>
            <div className="text-[11px] font-semibold text-stone-500">Live In-Stock</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-red-600">{outOfStockCount}</div>
            <div className="text-[11px] font-semibold text-stone-500">Out of Stock</div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-stone-900">{categories.length}</div>
            <div className="text-[11px] font-semibold text-stone-500">Store Aisles</div>
          </div>
        </div>
      </div>

      {/* TAB 1: INVENTORY MANAGER */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          {/* Search & Filter Toolbar */}
          <div className="p-3 sm:p-4 border-b border-stone-200/80 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, brand..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-bold bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="all">All Aisles ({totalProducts})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>

              {/* Stock Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="text-xs font-bold bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="all">All Stock Status</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock Only</option>
              </select>
            </div>
          </div>

          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Price (₹)</th>
                  <th className="py-2.5 px-3">Stock Status</th>
                  <th className="py-2.5 px-3 text-right">Customer View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredProducts.slice(0, 100).map((p, index) => (
                  <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-stone-400 text-[11px]">
                      {p.itemNumber || index + 1}
                    </td>

                    {/* Product Name & Photo */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-200/80 overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://placehold.co/80x80/e8f5e9/2e7d32?text=G1';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-stone-900 truncate max-w-xs">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-stone-500 font-medium">
                            Brand: <span className="font-semibold text-stone-700">{p.brand}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Subcategory */}
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-stone-700 block truncate">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-stone-400 block truncate">
                        {p.subCategory || 'General'}
                      </span>
                    </td>

                    {/* Unit */}
                    <td className="py-2.5 px-3 font-semibold text-stone-600">
                      {p.unit}
                    </td>

                    {/* Price with inline quick edit */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-stone-900">₹</span>
                        <input
                          type="number"
                          defaultValue={p.price}
                          onBlur={(e) => updatePrice(p.id, parseFloat(e.target.value))}
                          className="w-16 px-1.5 py-0.5 border border-stone-200 rounded text-xs font-black text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                        />
                      </div>
                    </td>

                    {/* Live Stock Toggle Switch */}
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => toggleStock(p.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                          p.inStock
                            ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800'
                            : 'bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800'
                        }`}
                        title="Click to toggle stock status"
                      >
                        {p.inStock ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-700" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* View on Store link */}
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/category/${p.category}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E7D32] hover:text-[#1B5E20] hover:underline"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-stone-500 text-xs">
              No products match your search or filter.
            </div>
          )}

          {filteredProducts.length > 100 && (
            <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-xs font-semibold text-stone-500">
              Showing first 100 of {filteredProducts.length} filtered items. Use search to find specific items.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADD NEW PRODUCT WITH LIVE CUSTOMER PREVIEW */}
      {activeTab === 'add_product' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (8 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="text-base font-extrabold text-stone-900">
                Add New Product to G1 Mart
              </h2>
              <p className="text-xs text-stone-500">
                Newly added products become instantly discoverable on the storefront and Blinkit category dashboard.
              </p>
            </div>

            {addSuccessMsg && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{addSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Aashirvaad Superior MP Atta"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                />
              </div>

              {/* Brand & Net Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="G1 Mart / ITC / Tata"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Net Quantity / Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g. 1 kg, 500 g, 1 pack"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Store Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      setNewCategory(e.target.value);
                      const cat = categories.find((c) => c.id === e.target.value);
                      if (cat && cat.subcategories.length > 0) {
                        setNewSubCategory(cat.subcategories[0]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Blinkit Subcategory
                  </label>
                  <select
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  >
                    {currentCategoryObj?.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, MRP, Stock Count */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    MRP / Orig Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMRP}
                    onChange={(e) => setNewMRP(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>
              </div>

              {/* Product Photo Selector / URL */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Image (Photo Pack)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="URL or /products/..."
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                  />
                </div>

                {/* Preset quick buttons */}
                <div>
                  <span className="text-[10px] font-bold text-stone-400 block mb-1">
                    Or select from high-resolution FMCG presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-100">
                    {PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setNewImage(p.url)}
                        className={`text-[10px] px-2 py-1 rounded-lg border font-semibold transition-all ${
                          newImage === p.url
                            ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:bg-white"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-extrabold text-sm tracking-wide shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save &amp; Publish to G1 Mart Store</span>
              </button>
            </form>
          </div>

          {/* Right: Live Customer Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-[#E8F5E9]/50 border border-[#2E7D32]/20 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#2E7D32]" />
                <h3 className="text-xs font-black text-[#1B5E20] uppercase tracking-wider">
                  Live Customer Preview
                </h3>
              </div>
              <p className="text-[11px] text-stone-600 font-medium">
                This shows exactly what shoppers will see in the app and on the Blinkit-style Category Dashboard.
              </p>
            </div>

            {/* Render realistic customer product card */}
            <div className="max-w-[240px] mx-auto sm:mx-0">
              <ProductCard product={previewProduct} />
            </div>

            <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-500 font-medium space-y-1">
              <div>✓ Category: <strong>{newCategory}</strong></div>
              <div>✓ Subcategory: <strong>{newSubCategory}</strong></div>
              <div>✓ Instant addition to client-side catalog state</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
