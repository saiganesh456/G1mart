import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'G1mart | Fresh Groceries Delivered',
  description: 'Order fresh groceries, dairy, staples and essentials online for fast home delivery in Nellore.',
  icons: {
    icon: '/icons/icon-192x192.png?v=6',
    apple: '/apple-touch-icon.png?v=6',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' });
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js', { scope: '/' });
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#F7F7F7] text-[#212121] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
