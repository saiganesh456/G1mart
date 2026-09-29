import React, { useState } from 'react';
import { Smartphone, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { navigate, loginWithPhone, loginWithGoogle } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhoneNumber(val);
      if (error) setError('');
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('Please enter your 10-digit mobile number');
      return;
    }
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);
    await loginWithPhone(phoneNumber);
    setIsLoading(false);
    navigate('otp');
  };

  const handleGoogleSignIn = () => {
    loginWithGoogle();
    navigate('home');
  };

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-6 bg-white select-none max-w-md mx-auto w-full my-auto py-8">
      {/* Top Brand Header */}
      <div>
        <div className="flex items-center justify-between mb-8 pt-2">
          <div className="flex items-center gap-2">
            <img
              src="/assets/images/g1_mart_banner_transparent.png"
              alt="G1 Mart"
              className="h-9 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('home')}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800"
          >
            Browse as Guest
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-[#212121] tracking-tight">
          Enter Mobile Number
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          We will send a 4-digit verification code to your phone.
        </p>

        {/* Mobile Input Form */}
        <form onSubmit={handleContinue} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="phone-input"
              className="text-xs font-semibold text-stone-700 block mb-1.5"
            >
              Phone Number
            </label>
            <div className="flex items-center h-13 rounded-xl border border-stone-300 focus-within:border-[#2E7D32] focus-within:ring-2 focus-within:ring-[#2E7D32]/10 bg-white px-3 transition-all">
              <div className="flex items-center gap-1.5 pr-2.5 border-r border-stone-200 text-stone-700 text-sm font-bold">
                <span className="text-xs">🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                id="phone-input"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit number"
                className="w-full h-full pl-3 text-sm sm:text-base font-bold text-[#212121] tracking-wider outline-hidden bg-transparent"
                autoFocus
              />
              {phoneNumber.length === 10 && (
                <div className="w-5 h-5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || phoneNumber.length !== 10}
            className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              phoneNumber.length === 10
                ? 'bg-[#2E7D32] hover:bg-[#1b5e20] text-white shadow-[#2E7D32]/25 active:scale-[0.98]'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Optional Google Login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full h-12 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-colors active:scale-[0.99]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="pt-6 pb-2 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Your data is 100% secure with G1 Mart</span>
        </div>
        <p className="text-[10px] text-stone-400">
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );
};
