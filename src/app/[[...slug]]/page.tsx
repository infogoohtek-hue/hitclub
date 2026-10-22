import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import pages from '../../content/pages.json';
import ReferencePage from '../../components/ReferencePage';

type Content = { title: string; description: string; html: string };
const content = pages as Record<string, Content>;

const SHOW_BANNER_2 = true;
const BANNER_2 = /<div class="swiper-slide banner2">[\s\S]*?<\/div>\s*<\/div>/;

function getPage(slug?: string[]) {
  return content['/' + (slug?.join('/') || '')];
}

export function generateStaticParams() {
  return Object.keys(content).map((path) => ({
    slug: path === '/' ? [] : path.slice(1).split('/'),
  }));
}

export function generateMetadata({ params }: { params: { slug?: string[] } }): Metadata {
  const page = getPage(params.slug);
  if (!page) {
    return {
      title: 'Không tìm thấy trang - HITCLUB',
      description: 'Trang bạn tìm kiếm không tồn tại trên cổng game HITCLUB.',
    };
  }

  const slugPath = params.slug && params.slug.length > 0 ? '/' + params.slug.join('/') : '/';
  const canonicalUrl = `https://hitclub-six.vercel.app${slugPath === '/' ? '/' : slugPath}`;
  const isHome = slugPath === '/';

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonicalUrl,
      siteName: 'HITCLUB',
      locale: 'vi_VN',
      type: isHome ? 'website' : 'article',
      images: [
        {
          url: '/images/seo/seohit/topgames.webp',
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: ['/images/seo/seohit/topgames.webp'],
    },
  };
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Link vào cổng game HITCLUB chính thức ở đâu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Người chơi có thể truy cập link chính hãng tại https://hitclub-six.vercel.app để đăng ký và tải app APK, iOS không bị chặn.',
      },
    },
    {
      '@type': 'Question',
      name: 'Đăng ký tài khoản HitClub như thế nào?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Truy cập trang chủ HitClub chính thống tại hitclub-six.vercel.app, bấm "Đăng ký", điền tên đăng nhập, mật khẩu và số điện thoại để hoàn tất trong 30 giây.',
      },
    },
    {
      '@type': 'Question',
      name: 'Rút tiền tại cổng game HitClub có nhanh không?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'HitClub hỗ trợ nạp rút tiền 1:1 siêu tốc qua hơn 30 ngân hàng, ví điện tử Momo, ZaloPay, P2P và tiền ảo USDT, xử lý tiền về trong vòng 1-5 phút.',
      },
    },
    {
      '@type': 'Question',
      name: 'Làm thế nào để phân biệt HitClub chính hãng và giả mạo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cổng game HitClub chính hãng có hệ thống bảo mật 2 lớp Authenticator, xác thực SHA256 minh bạch, CSKH 24/7 qua Livechat/Hotline và không chủ động nhắn tin trước qua Telegram hay Facebook.',
      },
    },
  ],
};

export default function Page({ params }: { params: { slug?: string[] } }) {
  const page = getPage(params.slug);
  if (!page) notFound();

  const isHome = !params.slug || params.slug.length === 0;
  const html = SHOW_BANNER_2 ? page.html : page.html.replace(BANNER_2, '');

  return (
    <>
      {isHome && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ReferencePage html={html} />
    </>
  );
}
