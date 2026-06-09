import Container from '@/components/layout/container';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: `Cookie Policy | ${t('title')}`,
    description: 'Cookie usage policy for AwemeFlow.',
    locale,
    pathname: '/cookie',
  });
}

export default async function CookiePolicyPage() {
  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="text-muted-foreground">
          AwemeFlow uses essential cookies needed for language preference, basic session continuity, and parser workflow stability.
        </p>
      </div>
    </Container>
  );
}
