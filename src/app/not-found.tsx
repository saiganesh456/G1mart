import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F7F7F7]">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-4 text-2xl font-black">
        404
      </div>
      <h1 className="text-xl font-extrabold text-[#212121] mb-2">Page Not Found</h1>
      <p className="text-sm text-stone-600 mb-6 max-w-sm">
        The page or product you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
      >
        ← Back to Storefront
      </Link>
    </div>
  );
}
