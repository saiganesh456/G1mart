const fs = require('fs');

const oldFilePath = 'src/app/admin/AdminDashboardClient.tsx';
let content = fs.readFileSync(oldFilePath, 'utf8');

// 1. Add imports for new tabs
const newImports = `
import HomeTab from '@/components/admin/tabs/HomeTab';
import OrdersTab from '@/components/admin/tabs/OrdersTab';
import OrderDetailsPanel from '@/components/admin/tabs/OrderDetailsPanel';
import InventoryTab from '@/components/admin/tabs/InventoryTab';
import ProductDetailsPanel from '@/components/admin/tabs/ProductDetailsPanel';
import MobileBottomNav from '@/components/admin/tabs/MobileBottomNav';
import { LayoutDashboard } from 'lucide-react';
`;
content = content.replace("import Link from 'next/link';", "import Link from 'next/link';" + newImports);

// 2. Add 'home' to activeTab state and audio state
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'orders' | 'slips' | 'payments' | 'riders' | 'inventory' | 'add_product' | 'staff'>('orders');",
  "const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'slips' | 'payments' | 'riders' | 'inventory' | 'add_product' | 'staff'>('home');\n" +
  "  const [audioEnabled, setAudioEnabled] = useState(false);\n" +
  "  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);\n" +
  "  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);\n" +
  "  const [previousOrderCount, setPreviousOrderCount] = useState<number>(0);\n" +
  "  useEffect(() => {\n" +
  "    if (orders.length > previousOrderCount && previousOrderCount > 0) {\n" +
  "      if (audioEnabled) {\n" +
  "        try { const audio = new Audio('/ting.mp3'); audio.play().catch(e => console.log('Audio play failed', e)); } catch(e) {}\n" +
  "      }\n" +
  "    }\n" +
  "    setPreviousOrderCount(orders.length);\n" +
  "  }, [orders.length, audioEnabled]);\n"
);

// 3. Add home to navItems
content = content.replace(
  "  const navItems = [",
  "  const navItems = [\n    { id: 'home' as const, label: 'Dashboard', icon: LayoutDashboard },"
);

// 4. Replace Mobile Nav
const oldMobileNavRegex = /\{\/\* "?"? MOBILE BOTTOM NAVIGATION \(APP LIKE\) "?"? \*\/\}.*?<\/nav>/s;
content = content.replace(oldMobileNavRegex, `
      {/* Mobile Bottom Nav */}
      <MobileBottomNav 
        activeTab={activeTab === 'orders' && selectedOrder ? 'orders' : activeTab === 'inventory' && selectedProduct ? 'inventory' : activeTab} 
        onChangeTab={(t) => {
          setActiveTab(t as any);
          setSelectedOrder(null);
          setSelectedProduct(null);
        }}
        orderBadge={activeOrdersCount > 0 ? activeOrdersCount : undefined} 
      />
`);

// 5. Replace Main Content Area
// We want to wrap the old main content in a condition that only shows it if selectedOrder and selectedProduct are null.
// Also, we want to replace the activeTab === 'orders' block with our new <OrdersTab>
// And the activeTab === 'inventory' block with our new <InventoryTab>
// And add activeTab === 'home' block.

// We will inject the new tabs at the top of the <main> block and hide the old ones using conditionals, or just comment them out.
const mainRegex = /(<main className="flex-1 w-full min-w-0 pb-20 lg:pb-0 space-y-4 lg:space-y-6">)/;
content = content.replace(mainRegex, `$1

        {/* Optional Alert Enabler */}
        {!audioEnabled && (
          <div className="bg-blue-50 p-2 text-center text-xs font-bold text-blue-800 cursor-pointer lg:rounded-xl mb-4" onClick={() => setAudioEnabled(true)}>
            🔔 Tap to enable new order sound alerts
          </div>
        )}

        {selectedOrder ? (
          <OrderDetailsPanel 
            order={selectedOrder} 
            onBack={() => setSelectedOrder(null)} 
            onUpdateStatus={(id, status) => {
              handleUpdateOrderStatus(id, status);
              setSelectedOrder(prev => prev ? {...prev, status} : null);
            }} 
          />
        ) : selectedProduct ? (
          <ProductDetailsPanel 
            product={selectedProduct} 
            onBack={() => setSelectedProduct(null)} 
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeTab 
                orders={orders} 
                onViewOrder={setSelectedOrder} 
                onNavigateToOrders={(status) => {
                  setActiveTab('orders');
                }} 
              />
            )}
`);

// We need to close the `) : (` block at the end of the main tag.
const mainEndRegex = /(<\/main>)/;
content = content.replace(mainEndRegex, `
          </>
        )}
$1`);

// Now we need to disable the OLD orders tab and OLD inventory tab.
content = content.replace(/\{activeTab === 'orders' && \(/g, "{activeTab === 'orders_old_disabled' && (");
content = content.replace(/\{activeTab === 'inventory' && \(/g, "{activeTab === 'inventory_old_disabled' && (");

// And inject the NEW orders and inventory tabs
content = content.replace(
  "{activeTab === 'orders_old_disabled' && (",
  `{activeTab === 'orders' && (
    <OrdersTab 
      orders={orders} 
      onViewOrder={setSelectedOrder} 
    />
  )}
  {activeTab === 'orders_old_disabled' && (`
);

content = content.replace(
  "{activeTab === 'inventory_old_disabled' && (",
  `{activeTab === 'inventory' && (
    <InventoryTab 
      products={products} 
      categories={categories} 
      onViewProduct={setSelectedProduct} 
    />
  )}
  {activeTab === 'inventory_old_disabled' && (`
);


fs.writeFileSync('src/app/admin/AdminDashboardClient.tsx', content, 'utf8');
console.log('Restored old features and integrated new mobile tabs!');
