import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://awemeflow.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/zh',
    '/en',
    '/zh/pricing',
    '/en/pricing',
    '/zh/contact',
    '/en/contact',
    '/zh/changelog',
    '/en/changelog',
    '/zh/terms',
    '/en/terms',
    '/zh/cookie',
    '/en/cookie',
    '/zh/privacy',
    '/en/privacy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
  }));
}
