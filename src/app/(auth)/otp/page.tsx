'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function OtpRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xl text-center space-y-4">
      <div className="w-6 h-6 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs text-stone-500 font-medium">Redirecting to Google Sign-In...</p>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-400">Loading...</div>}>
      <OtpRedirect />
    </Suspense>
  );
}

