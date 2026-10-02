/**
 * Auth layout — clean, full-screen centered layout for login / OTP pages.
 * No Header, BottomNav, or Footer.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
