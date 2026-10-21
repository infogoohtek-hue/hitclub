import { notFound } from 'next/navigation';
import pages from '../../content/pages.json';
import ReferencePage from '../../components/ReferencePage';

type Content = { title: string; description: string; html: string };
const content = pages as Record<string, Content>;
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
  return <ReferencePage html={page.html} />;
}
