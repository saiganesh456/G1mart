import React from 'react';
import { Bell, CheckCircle2, Tag, Info, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    navigate,
  } = useApp();

  return (
    <div className="flex-1 pb-24 p-3.5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#212121]">
            Notifications
          </h2>
          <p className="text-xs text-stone-500">
            Order updates & fresh deals
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={clearAllNotifications}
            className="text-xs font-bold text-stone-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.orderId) {
                  navigate('order_tracking', { orderId: notif.orderId });
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                notif.read
                  ? 'bg-white border-stone-200 opacity-80'
                  : 'bg-white border-[#2E7D32]/40 shadow-xs ring-1 ring-[#2E7D32]/10'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.type === 'order'
                    ? 'bg-[#2E7D32]/10 text-[#2E7D32]'
                    : notif.type === 'offer'
                    ? 'bg-[#FF9800]/15 text-[#FF9800]'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {notif.type === 'order' && <CheckCircle2 className="w-4 h-4" />}
                {notif.type === 'offer' && <Tag className="w-4 h-4" />}
                {notif.type === 'info' && <Info className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-[#212121] truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-stone-400 whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.orderId && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E7D32] mt-2">
                    <span>Track Order</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200/80">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-3">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#212121]">All caught up</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
            You will receive order status alerts and exclusive Hyderabad grocery deals here.
          </p>
        </div>
      )}
    </div>
  );
};
