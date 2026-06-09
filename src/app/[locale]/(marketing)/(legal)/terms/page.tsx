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
    title: `Terms of Service | ${t('title')}`,
    description: 'Terms of service for AwemeFlow.',
    locale,
    pathname: '/terms',
  });
}

export default async function TermsOfServicePage() {
  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">
          AwemeFlow is provided for lawful parsing and workflow usage. Users are responsible for how parsed upstream links are used after retrieval.
        </p>
      </div>
    </Container>
  );
}
