import { LOCALES } from '@/i18n/routing';
import type { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

interface BlogPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: BlogPageProps) {
  await params;
  return {};
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);
  notFound();
}
