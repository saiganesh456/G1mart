import React from 'react';
import { LayoutDashboard, Package, Layers, Users } from 'lucide-react';

interface Props {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  orderBadge?: number;
}

export default function MobileBottomNav({ activeTab, onChangeTab, orderBadge }: Props) {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package, badge: orderBadge },
    { id: 'inventory', label: 'Inventory', icon: Layers },
    { id: 'staff', label: 'Staff & Roles', icon: Users },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_25px_-10px_rgba(0,0,0,0.12)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeTab(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isActive ? 'text-[#1B5E20]' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-1 tracking-tight ${
                isActive ? 'font-black text-[#1B5E20]' : 'font-semibold text-stone-500'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
