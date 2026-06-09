import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import '@/styles/mdx.css';

interface BlogPostPageProps {
  params: Promise<{
    locale: Locale;
    slug: string[];
  }>;
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata | undefined> {
  await params;
  return {};
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { locale } = await props.params;

  setRequestLocale(locale);
  notFound();
}
