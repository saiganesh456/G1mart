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
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical Launch Screen CSS (Pre-JS Paint) */
              #g1-launch-screen {
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                background-color: #FFFFFF;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
                user-select: none;
                -webkit-user-select: none;
              }
              html.g1-splash-dismissed #g1-launch-screen {
                display: none !important;
              }
              .g1-launch-logo {
                width: 170px;
                max-width: 55vw;
                height: auto;
                object-fit: contain;
                display: block;
                opacity: 0;
                transform: scale(0.94);
                animation: g1LogoEnter 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              @keyframes g1LogoEnter {
                0% {
                  opacity: 0;
                  transform: scale(0.94);
                }
                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              @media (prefers-reduced-motion: reduce) {
                .g1-launch-logo {
                  transform: none !important;
                  animation: g1LogoEnterReduce 150ms ease-out forwards !important;
                }
                @keyframes g1LogoEnterReduce {
                  0% { opacity: 0; }
                  100% { opacity: 1; }
                }
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('g1mart_launch_splash_seen')) {
                  document.documentElement.classList.add('g1-splash-dismissed');
                }
              } catch (e) {}
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
