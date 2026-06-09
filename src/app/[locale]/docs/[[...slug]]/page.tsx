import type { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

interface DocPageProps {
  params: Promise<{
    slug?: string[];
    locale: Locale;
  }>;
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: DocPageProps) {
  await params;
  return {};
}

export const revalidate = false;

export default async function DocPage({ params }: DocPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);
  notFound();
}
