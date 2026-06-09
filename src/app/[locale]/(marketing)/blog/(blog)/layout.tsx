import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default async function BlogListLayout({
  children,
  params,
}: LayoutProps<'/[locale]/blog'>) {
  const { locale } = await params;

  setRequestLocale(locale);
  notFound();

  return children;
}
