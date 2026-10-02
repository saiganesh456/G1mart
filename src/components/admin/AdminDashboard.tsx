import React, { useState } from 'react';
import {
  ShieldCheck,
  Package,
  TrendingUp,
  Truck,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Search,
  MapPin,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderStatus, Product } from '../../types';
import { INITIAL_CATEGORIES } from '../../data/mockData';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    adminUpdateProduct,
    adminAddProduct,
    orders,
    updateOrderStatus,
    setRole,
    allDeliveryZones,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'add_product' | 'delivery_zones'>('orders');
  const [productSearch, setProductSearch] = useState('');

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('fruits-vegetables');
  const [newProdUnit, setNewProdUnit] = useState('1 kg');
  const [newProdPrice, setNewProdPrice] = useState(50);
  const [newProdOrigPrice, setNewProdOrigPrice] = useState(60);
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdDesc, setNewProdDesc] = useState('');

  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.grandTotal : 0), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  const handleToggleStock = (product: Product) => {
    adminUpdateProduct({
      ...product,
      inStock: !product.inStock,
      stockCount: !product.inStock ? 20 : 0,
    });
  };

  const handlePriceChange = (product: Product, newPrice: number) => {
    adminUpdateProduct({
      ...product,
      price: newPrice,
    });
  };

  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdBrand.trim()) return;

    adminAddProduct({
      name: newProdName,
      brand: newProdBrand,
      category: newProdCategory,
      unit: newProdUnit,
      price: Number(newProdPrice),
      originalPrice: Number(newProdOrigPrice),
      discountPercentage: Math.max(0, Math.round(((newProdOrigPrice - newProdPrice) / newProdOrigPrice) * 100)),
      inStock: true,
      stockCount: Number(newProdStock),
      image: '/products/prod-11.jpg',
      description: newProdDesc || 'Fresh and premium grocery quality guaranteed by G1 Mart.',
      rating: 4.8,
      reviewsCount: 1,
    });

    setNewProdName('');
    setNewProdBrand('');
    setNewProdDesc('');
    setActiveTab('inventory');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="flex-1 pb-20 space-y-5 max-w-6xl mx-auto w-full">
      {/* Top Admin Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/images/g1_mart_banner_transparent.png"
            alt="G1 Mart"
            className="h-8 w-auto object-contain brightness-110"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo.png';
            }}
          />
          <div>
            <h1 className="text-base sm:text-lg font-black leading-tight">
              Admin &amp; Inventory Console
            </h1>
            <span className="text-[11px] text-stone-400">
              Nellore Central Hub Management · Real-time Control
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRole('customer')}
          className="px-3.5 py-2 bg-white text-stone-900 hover:bg-stone-100 rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          Customer View →
        </button>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">
            Revenue
          </span>
          <span className="text-sm sm:text-base font-black text-[#2E7D32] tabular-nums">
            ₹{totalRevenue}
          </span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">
            Active Orders
          </span>
          <span className="text-sm sm:text-base font-black text-[#FF9800] tabular-nums">
            {activeOrdersCount}
          </span>
        </div>

        <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
          <span className="text-[10px] text-stone-500 font-bold uppercase block">
            Products
          </span>
          <span className="text-sm sm:text-base font-black text-stone-800 tabular-nums">
            {products.length}
          </span>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'orders'
              ? 'bg-white text-[#212121] shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Live Orders ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'inventory'
              ? 'bg-white text-[#212121] shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Inventory ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('add_product')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'add_product'
              ? 'bg-white text-[#212121] shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          + Add Item
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('delivery_zones')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'delivery_zones'
              ? 'bg-white text-[#212121] shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Delivery Zones ({allDeliveryZones.length})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-3.5 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#212121]">
                      #{order.id}
                    </span>
                    <span className="text-[10px] bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded">
                      {order.date}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    Customer: <strong>{order.address.fullName}</strong> ({order.address.mobileNumber})
                  </p>
                  <p className="text-[11px] text-stone-400">
                    {order.address.houseFlat}, {order.address.streetArea}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-[#212121] tabular-nums block">
                    ₹{order.grandTotal}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-bold text-stone-700">Change Status:</span>
                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus(
                      order.id,
                      e.target.value as OrderStatus,
                      `Admin updated order #${order.id} to ${e.target.value}`
                    )
                  }
                  className="bg-stone-50 border border-stone-300 font-bold text-xs py-1 px-2.5 rounded-lg text-stone-800 outline-hidden"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packed">Packed</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search catalog products..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-stone-200 bg-white text-xs outline-hidden focus:border-[#2E7D32]"
            />
          </div>

          <div className="space-y-2">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-stone-200/80 p-3 shadow-2xs flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#212121] truncate">
                      {p.name}
                    </h4>
                    <span className="text-[10px] text-stone-500">
                      {p.brand} · {p.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-stone-500">₹</span>
                    <input
                      type="number"
                      value={p.price}
                      onChange={(e) => handlePriceChange(p, Number(e.target.value))}
                      className="w-14 h-7 px-1 text-center font-bold text-xs border border-stone-300 rounded bg-stone-50"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStock(p)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      p.inStock
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {p.inStock ? 'In Stock' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Tab */}
      {activeTab === 'add_product' && (
        <form
          onSubmit={handleAddNewProduct}
          className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3 text-xs"
        >
          <h3 className="text-sm font-extrabold text-[#212121] mb-2">
            Add New Grocery Product
          </h3>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={newProdName}
              onChange={(e) => setNewProdName(e.target.value)}
              placeholder="e.g. Farm Fresh Alphonso Mangoes"
              className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Brand *
              </label>
              <input
                type="text"
                value={newProdBrand}
                onChange={(e) => setNewProdBrand(e.target.value)}
                placeholder="e.g. Farm Fresh"
                className="w-full h-9 px-3 rounded-xl border border-stone-300 outline-hidden"
                required
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Category
              </label>
              <select
                value={newProdCategory}
                onChange={(e) => setNewProdCategory(e.target.value)}
                className="w-full h-9 px-2 rounded-xl border border-stone-300 outline-hidden"
              >
                {INITIAL_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Unit / Net Wt
              </label>
              <input
                type="text"
                value={newProdUnit}
                onChange={(e) => setNewProdUnit(e.target.value)}
                placeholder="1 kg"
                className="w-full h-9 px-2 rounded-xl border border-stone-300 outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Selling Price (₹)
              </label>
              <input
                type="number"
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(Number(e.target.value))}
                className="w-full h-9 px-2 rounded-xl border border-stone-300 outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                MRP (₹)
              </label>
              <input
                type="number"
                value={newProdOrigPrice}
                onChange={(e) => setNewProdOrigPrice(Number(e.target.value))}
                className="w-full h-9 px-2 rounded-xl border border-stone-300 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={newProdDesc}
              onChange={(e) => setNewProdDesc(e.target.value)}
              placeholder="Fresh quality grocery item..."
              className="w-full p-2.5 rounded-xl border border-stone-300 outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold rounded-xl shadow-xs active:scale-95 transition-all"
          >
            Save to G1 Mart Catalog
          </button>
        </form>
      )}

      {/* Delivery Zones Configuration Tab */}
      {activeTab === 'delivery_zones' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs">
            <h2 className="text-sm font-extrabold text-[#212121] mb-1">
              Configurable Nellore Delivery Zones
            </h2>
            <p className="text-xs text-stone-500">
              Configured delivery radius, fees, thresholds, and estimated turnaround times for Nellore City and surrounding mandals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allDeliveryZones.map((zone) => (
              <div
                key={zone.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#212121]">
                        {zone.name}
                      </h3>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Code: {zone.code}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      zone.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {zone.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {zone.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">
                      Max Radius
                    </span>
                    <span className="font-extrabold text-[#212121]">
                      Within {zone.maxRadiusKm} km
                    </span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">
                      Expected ETA
                    </span>
                    <span className="font-extrabold text-[#2E7D32]">
                      {zone.estimatedDeliveryTimeText}
                    </span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">
                      Delivery Fee
                    </span>
                    <span className="font-extrabold text-[#212121]">
                      ₹{zone.deliveryFee}
                    </span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">
                      Free Above
                    </span>
                    <span className="font-extrabold text-[#2E7D32]">
                      ₹{zone.freeDeliveryThreshold}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                    Covered Areas &amp; Mandals ({zone.supportedAreas.length})
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                    {zone.supportedAreas.map((area) => (
                      <span
                        key={area}
                        className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
