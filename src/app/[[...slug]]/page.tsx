import { notFound } from 'next/navigation';
import pages from '../../content/pages.json';
import ReferencePage from '../../components/ReferencePage';

type Content = { title: string; description: string; html: string };
const content = pages as Record<string, Content>;
/** Đặt thành true để hiện lại banner thứ 2 (slide banner6 - hitclub.istanbul). */
const SHOW_BANNER_2 = true;
const BANNER_2 = /<div class="swiper-slide banner2">[\s\S]*?<\/div>\s*<\/div>/;
function getPage(slug?: string[]) { return content['/' + (slug?.join('/') || '')]; }

export function generateStaticParams() {
  return Object.keys(content).map(path => ({ slug: path === '/' ? [] : path.slice(1).split('/') }));
}
export function generateMetadata({ params }: { params: { slug?: string[] } }) {
  const page = getPage(params.slug);
  return { title: page?.title || 'Không tìm thấy trang', description: page?.description };
}
export default function Page({ params }: { params: { slug?: string[] } }) {
  const page = getPage(params.slug);
  if (!page) notFound();
  const html = SHOW_BANNER_2 ? page.html : page.html.replace(BANNER_2, '');
  return <ReferencePage html={html} />;
}
