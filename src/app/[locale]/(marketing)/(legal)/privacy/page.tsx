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
    title: `Privacy Policy | ${t('title')}`,
    description: 'Privacy policy for AwemeFlow.',
    locale,
    pathname: '/privacy',
  });
}

export default async function PrivacyPolicyPage() {
  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">
          AwemeFlow stores only the minimum operational data needed to process requests, secure the service, and respond to support or abuse issues.
        </p>
      </div>
    </Container>
  );
}
