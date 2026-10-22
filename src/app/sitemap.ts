import { MetadataRoute } from 'next';
import pages from '../content/pages.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hitclub-six.vercel.app';
  const routes = Object.keys(pages);

  return routes.map((route) => {
    const isHome = route === '/';
    return {
      url: isHome ? `${baseUrl}/` : `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: isHome ? 'daily' : 'weekly',
      priority: isHome ? 1.0 : 0.8,
    };
  });
}
