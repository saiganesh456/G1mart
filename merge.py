import re
import sys

def main():
    try:
        with open('src/app/admin/AdminDashboardClient.tsx', 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading: {e}")
        return

    # Add imports
    imports = """
import HomeTab from '@/components/admin/tabs/HomeTab';
import OrdersTab from '@/components/admin/tabs/OrdersTab';
import OrderDetailsPanel from '@/components/admin/tabs/OrderDetailsPanel';
import InventoryTab from '@/components/admin/tabs/InventoryTab';
import ProductDetailsPanel from '@/components/admin/tabs/ProductDetailsPanel';
import MobileBottomNav from '@/components/admin/tabs/MobileBottomNav';
import { LayoutDashboard } from 'lucide-react';
"""
    content = content.replace("import Link from 'next/link';", "import Link from 'next/link';" + imports)

    # Change default activeTab to 'home'
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
    )

    # Add home to navItems
    content = content.replace(
        "  const navItems = [",
        "  const navItems = [\n    { id: 'home' as const, label: 'Dashboard', icon: LayoutDashboard },"
    )

    # Replace Mobile Nav
    mobile_nav_regex = re.compile(r'\{\/\* "?"? MOBILE PINNED BOTTOM NAVIGATION BAR "?"? \*\/\}.*?<\/nav>', re.DOTALL)
    
    mobile_nav_replacement = """
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
"""
    content = mobile_nav_regex.sub(mobile_nav_replacement, content)

    # Now, find <main> and replace the orders and inventory tabs
    # The safest way is to find exactly where they start and end.
    
    # 1. Orders
    orders_start = content.find("{activeTab === 'orders' && (")
    # We will just disable the old one by changing the condition
    content = content.replace("{activeTab === 'orders' && (", "{activeTab === 'orders_DISABLED' && (")
    
    # 2. Inventory
    content = content.replace("{activeTab === 'inventory' && (", "{activeTab === 'inventory_DISABLED' && (")
    
    # Now, inject our new tabs at the very top of <main>
    main_start_idx = content.find('<main className="flex-1 w-full min-w-0 pb-20 lg:pb-0 space-y-4 lg:space-y-6">')
    if main_start_idx != -1:
        insert_idx = main_start_idx + len('<main className="flex-1 w-full min-w-0 pb-20 lg:pb-0 space-y-4 lg:space-y-6">')
        
        new_content = """
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
            
            {activeTab === 'orders' && (
              <OrdersTab 
                orders={orders} 
                onViewOrder={setSelectedOrder} 
              />
            )}
            
            {activeTab === 'inventory' && (
              <InventoryTab 
                products={products} 
                categories={categories} 
                onViewProduct={setSelectedProduct} 
              />
            )}
"""
        content = content[:insert_idx] + new_content + content[insert_idx:]

    # Now we need to close the `) : (` block at the end of the <main> tag.
    main_end_idx = content.rfind('</main>')
    if main_end_idx != -1:
        content = content[:main_end_idx] + "\n          </>\n        )}\n" + content[main_end_idx:]

    # Remove any old alert enabler we added if present
    content = content.replace("""
      {/* Optional Alert Enabler */}
      {!audioEnabled && (
        <div className="bg-blue-50 p-2 text-center text-xs font-bold text-blue-800 cursor-pointer" onClick={() => setAudioEnabled(true)}>
          🔔 Tap to enable new order sound alerts
        </div>
      )}
""", "")

    with open('src/app/admin/AdminDashboardClient.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Success!")

if __name__ == "__main__":
    main()
