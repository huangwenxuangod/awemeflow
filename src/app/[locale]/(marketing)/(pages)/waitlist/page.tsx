import Container from '@/components/layout/container';
import { WaitlistFormCard } from '@/components/waitlist/waitlist-form-card';
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
  const pt = await getTranslations({ locale, namespace: 'WaitlistPage' });
  return constructMetadata({
    title: `${pt('title')} | ${t('title')}`,
    description: pt('description'),
    locale,
    pathname: '/waitlist',
  });
}

const waitlistCopy = {
  zh: {
    badge: '内测收集',
    heading: '适合准备从单次解析，走向批量解析和 API 接入的用户。',
    description:
      '如果你只是偶尔手动解析，首页已经够用；如果你想要更稳定调用、团队协作和商业配额，这里才是更合适的入口。',
  },
  en: {
    badge: 'Beta access',
    heading: 'Built for users who are moving from one-off parsing toward batch workflows and API access.',
    description:
      'If you only need occasional manual parsing, the homepage flow is enough. This queue is for users who want steadier calls, team workflows, and commercial usage tiers.',
  },
} as const;

export default async function WaitlistPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('WaitlistPage');
  const copy = locale === 'zh' ? waitlistCopy.zh : waitlistCopy.en;

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
            <p className="text-base leading-8 text-slate-300">
              {copy.heading}
            </p>
            <p className="text-sm leading-7 text-slate-400">
              {copy.description}
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#0c1726] p-2">
            <WaitlistFormCard />
          </section>
        </div>
      </Container>
    </div>
  );
}
