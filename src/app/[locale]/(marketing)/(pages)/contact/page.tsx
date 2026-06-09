import { ContactFormCard } from '@/components/contact/contact-form-card';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
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
  const pt = await getTranslations({ locale, namespace: 'ContactPage' });

  return constructMetadata({
    title: `${pt('title')} | ${t('title')}`,
    description: pt('description'),
    locale,
    pathname: '/contact',
  });
}

const supportCopy = {
  zh: {
    badge: '支持入口',
    heading: '把异常链接、合作需求和接入问题，直接汇到一个入口里。',
    points: [
      '解析失败样本反馈',
      '批量解析与团队协作需求',
      'API 接入、商业合作与定制方案',
    ],
  },
  en: {
    badge: 'Support entry',
    heading: 'Keep failed samples, integration asks, and commercial requests in one clear channel.',
    points: [
      'Failed parse examples',
      'Batch parsing and team workflow requests',
      'API access, commercial questions, and custom integrations',
    ],
  },
} as const;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const t = await getTranslations('ContactPage');
  const { locale } = await params;
  const copy = locale === 'zh' ? supportCopy.zh : supportCopy.en;

  return (
    <div className="bg-[#07111f] text-slate-100">
      <Container className="px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-6">
            <Badge className="rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-1 text-sky-100">
              {copy.badge}
            </Badge>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              {t('title')}
            </h1>
            <p className="text-base leading-8 text-slate-300">{copy.heading}</p>

            <div className="space-y-3">
              {copy.points.map((point) => (
                <div
                  key={point}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200"
                >
                  {point}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#0c1726] p-2">
            <ContactFormCard />
          </section>
        </div>
      </Container>
    </div>
  );
}
