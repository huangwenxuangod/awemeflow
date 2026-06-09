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
  const pt = await getTranslations({ locale, namespace: 'ChangelogPage' });

  return constructMetadata({
    title: `${pt('title')} | ${t('title')}`,
    description: pt('description'),
    locale,
    pathname: '/changelog',
  });
}

const releases = {
  zh: [
    ['2026-06-09', '站点收敛为 AwemeFlow 解析站入口，保留 /api/video 主流程。'],
    ['2026-06-09', 'Cloudflare Workers / OpenNext 部署路径整理为首发主线路。'],
  ],
  en: [
    ['2026-06-09', 'The site was converged into AwemeFlow as a parser-first product surface with /api/video as the core flow.'],
    ['2026-06-09', 'Cloudflare Workers and OpenNext became the launch deployment path.'],
  ],
} as const;

export default async function ChangelogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('ChangelogPage');
  const items = locale === 'zh' ? releases.zh : releases.en;

  return (
    <Container className="py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-center text-3xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {items.map(([date, text]) => (
            <div
              key={`${date}-${text}`}
              className="rounded-2xl border border-border/60 bg-card px-6 py-5"
            >
              <div className="text-sm text-muted-foreground">{date}</div>
              <div className="mt-2 text-sm leading-7">{text}</div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
