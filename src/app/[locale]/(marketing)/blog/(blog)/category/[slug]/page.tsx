import { LOCALES } from '@/i18n/routing';
import type { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

interface BlogCategoryPageProps {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale, slug: 'hidden' }));
}

export async function generateMetadata({ params }: BlogCategoryPageProps) {
  await params;
  return {};
}

export default async function BlogCategoryPage({
  params,
}: BlogCategoryPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);
  notFound();
}
