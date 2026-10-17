import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'G1 Mart | Fresh Groceries Delivered',
  description: 'Order fresh groceries, dairy, staples and essentials online for fast home delivery in Nellore.',
  icons: {
    icon: '/icons/icon-192x192.png?v=4',
    apple: '/apple-touch-icon.png?v=4',
  },
  manifest: '/manifest.json?v=4',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1E6B2E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F7F7] text-[#212121] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
