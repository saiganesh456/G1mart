import React from 'react';
import { Package, Layers, Truck, Users, LayoutDashboard, CreditCard, Menu } from 'lucide-react';

interface Props {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  orderBadge?: number;
}

export default function MobileBottomNav({ activeTab, onChangeTab, orderBadge }: Props) {
  const navItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package, badge: orderBadge },
    { id: 'inventory', label: 'Products', icon: Layers },
    { id: 'riders', label: 'Riders', icon: Truck },
    { id: 'more', label: 'More', icon: Menu },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-1 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeTab(item.id)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
              isActive ? 'text-[#1B5E20]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="relative">
              <Icon className={`w-[22px] h-[22px] ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-1 ${isActive ? 'font-black' : 'font-semibold'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
