import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://hitclub-six.vercel.app'),
  title: {
    default: 'HITCLUB 🎖️ Link Vào Cổng Game Hit Club Chính Thức 2026 - Tải App APK/iOS',
    template: '%s | HITCLUB Chính Thức 2026',
  },
  description:
    'HITCLUB (Hit Club) - Cổng game bài đổi thưởng trực tuyến số 1 Việt Nam 2026. Tải game HITCLUB APK/iOS/Web chính hãng tại hitclub-six.vercel.app, nhận giftcode tân thủ 50K, nạp rút 1:1 siêu tốc, bảo mật an toàn tuyệt đối.',
  keywords: [
    'hitclub',
    'hit club',
    'tải hitclub',
    'link vào hitclub',
    'hitclub chính hãng',
    'cổng game hitclub',
    'hitclub 2026',
    'đăng ký hitclub',
    'game bài hitclub',
    'hitclub đổi thưởng',
    'tai hitclub',
    'link hitclub',
    'hitclub six vercel app',
    'tài xỉu hitclub',
    'nạp rút hitclub',
  ],
  authors: [{ name: 'HITCLUB' }],
  creator: 'HITCLUB',
  publisher: 'HITCLUB',
  applicationName: 'HITCLUB',
  alternates: {
    canonical: 'https://hitclub-six.vercel.app/',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://hitclub-six.vercel.app/',
    siteName: 'HITCLUB - Cổng Game Bài Đổi Thưởng Đẳng Cấp',
    title: 'HITCLUB 🎖️ Link Vào Cổng Game Hit Club Chính Thức 2026 - Tải App APK/iOS',
    description:
      'HITCLUB - Trang chủ chính thức cổng game bài đổi thưởng Hit Club 2026. Tải app HitClub APK, iOS không chặn tại hitclub-six.vercel.app, nhận giftcode tân thủ 50K.',
    images: [
      {
        url: '/images/seo/seohit/topgames.webp',
        width: 1200,
        height: 630,
        alt: 'HITCLUB - Cổng Game Bài Đổi Thưởng Uy Tín 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HITCLUB 🎖️ Link Vào Cổng Game Hit Club Chính Thức 2026',
    description:
      'HITCLUB (Hit Club) - Cổng game bài đổi thưởng trực tuyến số 1 Việt Nam 2026. Tải HitClub APK, iOS không chặn tại hitclub-six.vercel.app, nạp rút 1:1 siêu tốc.',
    images: ['/images/seo/seohit/topgames.webp'],
  },
  icons: {
    icon: '/images/logo.webp',
    shortcut: '/images/logo.webp',
    apple: '/apple-icon.png',
  },
  other: {
    'geo.region': 'VN',
    'geo.placename': 'Vietnam',
    'theme-color': '#0c0d14',
  },
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'HITCLUB',
  alternateName: ['Hit Club', 'HitClub Chính Hãng', 'HitClub 2026', 'hitclub-six.vercel.app'],
  url: 'https://hitclub-six.vercel.app/',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://hitclub-six.vercel.app/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HITCLUB',
  url: 'https://hitclub-six.vercel.app/',
  logo: 'https://hitclub-six.vercel.app/images/logo.webp',
  sameAs: ['https://telegram.me/hitclubvietnam'],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+84338358888',
      contactType: 'customer service',
      availableLanguage: ['Vietnamese'],
    },
    {
      '@type': 'ContactPoint',
      telephone: '+16463578777',
      contactType: 'customer service',
      availableLanguage: ['Vietnamese', 'English'],
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="/build/fonts.css" />
        <link rel="stylesheet" href="/build/reference.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
