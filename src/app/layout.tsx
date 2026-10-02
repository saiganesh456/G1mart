import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'G1 Mart | Fresh Groceries Online',
  description: 'Order fresh groceries online for fast home delivery.',
  icons: { icon: '/logo.png' },
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
