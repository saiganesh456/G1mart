import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, RotateCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OtpScreen: React.FC = () => {
  const { navigate, verifyOtp, user } = useApp();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);
    if (error) setError('');

    // Auto advance focus
    if (cleanVal && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    const success = verifyOtp(fullOtp);
    if (success) {
      navigate('home');
    } else {
      setError('Invalid OTP code. Use demo code 1234.');
    }
  };

  const handleAutoFill = () => {
    setOtp(['1', '2', '3', '4']);
    setError('');
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimer(30);
    setCanResend(false);
    setError('');
  };

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-6 bg-white select-none max-w-md mx-auto w-full my-auto py-8">
      <div>
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('login')}
          className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200/80 flex items-center justify-center text-stone-700 active:scale-95 transition-all mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-[#212121] tracking-tight">
          Verify OTP Code
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Code sent to <span className="font-bold text-stone-700">{user.phone}</span>
        </p>

        {/* 4 Digit Input Box */}
        <form onSubmit={handleVerify} className="mt-8">
          <div className="flex items-center justify-between gap-3 max-w-xs mx-auto mb-6">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-14 h-15 text-center text-2xl font-bold text-[#212121] rounded-2xl border transition-all outline-hidden ${
                  digit
                    ? 'border-[#2E7D32] bg-[#2E7D32]/5 shadow-xs'
                    : 'border-stone-300 bg-stone-50 focus:border-[#2E7D32] focus:bg-white'
                }`}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium text-center mb-4">
              {error}
            </p>
          )}

          {/* Quick Demo Helper */}
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={handleAutoFill}
              className="text-xs font-semibold text-[#2E7D32] hover:underline bg-[#2E7D32]/10 px-3 py-1.5 rounded-full"
            >
              Demo: Auto-fill 1234
            </button>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            className="w-full h-12 bg-[#2E7D32] hover:bg-[#1b5e20] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/25 active:scale-[0.98] transition-all"
          >
            <span>Verify & Continue</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </form>

        {/* Resend Timer */}
        <div className="text-center mt-6">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] hover:underline"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Resend OTP Code</span>
            </button>
          ) : (
            <span className="text-xs text-stone-500 font-medium">
              Resend OTP in <span className="text-[#2E7D32] font-bold tabular-nums">00:{timer < 10 ? `0${timer}` : timer}</span>
            </span>
          )}
        </div>
      </div>

      <div className="pb-4 text-center">
        <p className="text-[11px] text-stone-400">
          Didn't receive code? Check your SMS or try again.
        </p>
      </div>
    </div>
  );
};
