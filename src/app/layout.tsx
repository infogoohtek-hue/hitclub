import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HITCLUB',
  description: 'Giao diện HITCLUB được xây dựng bằng Next.js 14.',
  robots: { index: false, follow: false },
  icons: { icon: '/apple-icon.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><head><link rel="stylesheet" href="/build/fonts.css" /><link rel="stylesheet" href="/build/reference.css" /></head><body>{children}</body></html>;
}
