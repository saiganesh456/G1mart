import React from 'react';
import { Plus, MapPin, Check, Trash2, Edit3, ArrowLeft, Home, Briefcase, Navigation } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AddressListScreen: React.FC = () => {
  const {
    addresses,
    selectedAddress,
    selectAddress,
    deleteAddress,
    setDefaultAddress,
    navigate,
    setCurrentLocation,
  } = useApp();

  const handleUseCurrentLocation = () => {
    // Hyderabad geoloc mock
    const currentLoc = 'Road No. 36, Jubilee Hills, Hyderabad - 500033';
    setCurrentLocation(currentLoc);
    navigate('add_address');
  };

  return (
    <div className="flex-1 pb-24 space-y-5 max-w-3xl mx-auto w-full">
      {/* Top CTA: Use Current Location */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-3.5 shadow-2xs space-y-2.5">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="w-full py-2.5 px-3 bg-[#2E7D32]/10 hover:bg-[#2E7D32]/15 text-[#2E7D32] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          <span>Use Current GPS Location</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('add_address')}
          className="w-full py-2.5 px-3 border border-dashed border-[#2E7D32] hover:bg-[#2E7D32]/5 text-[#2E7D32] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hyderabad Address</span>
        </button>
      </div>

      {/* Saved Addresses List */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block px-1">
          Saved Addresses ({addresses.length})
        </span>

        {addresses.map((addr) => {
          const isSelected = selectedAddress?.id === addr.id;
          return (
            <div
              key={addr.id}
              onClick={() => selectAddress(addr.id)}
              className={`bg-white rounded-2xl border p-4 shadow-2xs transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-[#2E7D32] ring-2 ring-[#2E7D32]/20'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 shrink-0 ${
                      isSelected
                        ? 'bg-[#2E7D32] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {addr.type === 'Home' && <Home className="w-4 h-4" />}
                    {addr.type === 'Work' && <Briefcase className="w-4 h-4" />}
                    {addr.type === 'Other' && <MapPin className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-[#212121]">
                        {addr.type}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-stone-100 text-stone-600 font-bold px-2 py-0.5 rounded-md">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-stone-800 mt-1">
                      {addr.fullName} · {addr.mobileNumber}
                    </p>

                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {addr.houseFlat}, {addr.streetArea}
                    </p>
                    <p className="text-xs text-stone-500">
                      {addr.landmark ? `Landmark: ${addr.landmark} · ` : ''}
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>

                    {addr.deliveryInstructions && (
                      <p className="text-[11px] text-stone-500 italic mt-1.5 bg-stone-50 p-1.5 rounded-lg border border-stone-200/60">
                        "{addr.deliveryInstructions}"
                      </p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDefaultAddress(addr.id);
                    }}
                    className="text-stone-500 hover:text-[#2E7D32] font-semibold"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-bold">
                    Primary Address
                  </span>
                )}

                <div className="flex items-center gap-3">
                  {addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAddress(addr.id);
                      }}
                      className="text-stone-400 hover:text-rose-600 transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
