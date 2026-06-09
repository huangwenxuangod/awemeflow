import { LOCALES } from '@/i18n/routing';
import type { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

interface BlogListPageProps {
  params: Promise<{
    locale: Locale;
    page: string;
  }>;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale, page: '2' }));
}

export async function generateMetadata({ params }: BlogListPageProps) {
  await params;
  return {};
}

export default async function BlogListPage({ params }: BlogListPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);
  notFound();
}
