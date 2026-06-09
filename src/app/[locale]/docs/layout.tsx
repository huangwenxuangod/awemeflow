import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import '@/styles/mdx.css';

export default async function DocsRootLayout({
  children,
  params,
}: LayoutProps<'/[locale]/docs'>) {
  const { locale } = await params;

  setRequestLocale(locale);
  notFound();

  return children as ReactNode;
}
