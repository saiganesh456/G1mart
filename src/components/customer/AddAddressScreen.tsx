import React, { useState } from 'react';
import { Home, Briefcase, MapPin, Check, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AddAddressScreen: React.FC = () => {
  const { addAddress, goBack, user } = useApp();

  const [fullName, setFullName] = useState(user.name || 'Sai Ganesh');
  const [mobileNumber, setMobileNumber] = useState(user.phone.replace('+91 ', '') || '9876543210');
  const [houseFlat, setHouseFlat] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('500081');
  const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDefault, setIsDefault] = useState(true);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim() || !houseFlat.trim() || !streetArea.trim() || !pincode.trim()) {
      setError('Please fill in all mandatory fields');
      return;
    }

    addAddress({
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      houseFlat: houseFlat.trim(),
      streetArea: streetArea.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      type,
      isDefault,
      deliveryInstructions: deliveryInstructions.trim(),
    });

    goBack();
  };

  return (
    <div className="flex-1 pb-24 p-3.5 space-y-4">
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs">
        <h2 className="text-base font-extrabold text-[#212121] mb-1">
          Add Delivery Address
        </h2>
        <p className="text-xs text-stone-500 mb-4">
          Pinpoint your location in Hyderabad for 15-30m grocery delivery.
        </p>

        {error && (
          <div className="p-2.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Address Type Selector */}
          <div>
            <label className="font-bold text-stone-700 block mb-1.5">
              Address Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Home', 'Work', 'Other'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    type === t
                      ? 'border-[#2E7D32] bg-[#2E7D32]/10 text-[#2E7D32]'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {t === 'Home' && <Home className="w-3.5 h-3.5" />}
                  {t === 'Work' && <Briefcase className="w-3.5 h-3.5" />}
                  {t === 'Other' && <MapPin className="w-3.5 h-3.5" />}
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Receiver's name"
                className="w-full h-10 px-3 rounded-xl border border-stone-300 outline-hidden focus:border-[#2E7D32]"
                required
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="10-digit number"
                className="w-full h-10 px-3 rounded-xl border border-stone-300 outline-hidden focus:border-[#2E7D32]"
                required
              />
            </div>
          </div>

          {/* House / Flat & Street */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              House / Flat / Block / Floor No. *
            </label>
            <input
              type="text"
              value={houseFlat}
              onChange={(e) => setHouseFlat(e.target.value)}
              placeholder="e.g. Flat 304, Green Meadows Apt"
              className="w-full h-10 px-3 rounded-xl border border-stone-300 outline-hidden focus:border-[#2E7D32]"
              required
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Street / Area / Colony *
            </label>
            <input
              type="text"
              value={streetArea}
              onChange={(e) => setStreetArea(e.target.value)}
              placeholder="e.g. Road No. 45, Jubilee Hills"
              className="w-full h-10 px-3 rounded-xl border border-stone-300 outline-hidden focus:border-[#2E7D32]"
              required
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Nearby Landmark (Optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Inorbit Mall or Metro Pillar 12"
              className="w-full h-10 px-3 rounded-xl border border-stone-300 outline-hidden focus:border-[#2E7D32]"
            />
          </div>

          {/* City, State, Pincode */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-300 bg-stone-50 font-semibold"
                readOnly
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-300 bg-stone-50 font-semibold"
                readOnly
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Pincode *
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="500081"
                className="w-full h-10 px-3 rounded-xl border border-stone-300 outline-hidden focus:border-[#2E7D32]"
                required
              />
            </div>
          </div>

          {/* Delivery Instructions */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Delivery Instructions for Rider
            </label>
            <input
              type="text"
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="e.g. Ring the bell twice, leave with security"
              className="w-full h-10 px-3 rounded-xl border border-stone-300 outline-hidden focus:border-[#2E7D32]"
            />
          </div>

          {/* Set Default Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="set-default"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 accent-[#2E7D32] rounded"
            />
            <label htmlFor="set-default" className="text-stone-700 font-medium">
              Make this my default delivery address
            </label>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md active:scale-[0.98] transition-all"
            >
              Save Address & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
