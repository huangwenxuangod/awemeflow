import { PricingTable } from '@/components/pricing/pricing-table';
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
  const pt = await getTranslations({ locale, namespace: 'PricingPage' });

  return constructMetadata({
    title: `${pt('title')} | ${t('title')}`,
    description: pt('description'),
    locale,
    pathname: '/pricing',
  });
}

const pricingNotes = {
  zh: {
    badge: '商业方案',
    heading: '先把解析能力卖清楚，再谈会员和批量额度。',
    description:
      '当前定价页保留原有支付组件结构，但对外叙事已经切到 AwemeFlow 的解析产品逻辑，后续可以继续按匿名版、专业版和团队版收紧。',
    points: [
      '免费版适合少量手动解析和产品试用',
      '专业版适合内容团队的稳定日常使用',
      '更高阶的批量解析与 API 调用可走内测或定制方案',
    ],
  },
  en: {
    badge: 'Commercial plans',
    heading: 'Sell the parser clearly first, then layer memberships and usage quotas.',
    description:
      'The pricing page keeps the existing payment component structure for now, but the product narrative is already shifted toward AwemeFlow as a parsing product. It can later be tightened into anonymous, pro, and team plans.',
    points: [
      'Free is for light manual parsing and first-time trials',
      'Pro is for steady operational use by content teams',
      'Higher-volume batch parsing and API access can move through beta or custom plans',
    ],
  },
} as const;

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const copy = locale === 'zh' ? pricingNotes.zh : pricingNotes.en;

  return (
    <div className="bg-[#07111f] text-slate-100">
      <Container className="px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-12">
          <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              <Badge className="rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-1 text-sky-100">
                {copy.badge}
              </Badge>
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                {copy.heading}
              </h1>
              <p className="text-base leading-8 text-slate-300">
                {copy.description}
              </p>
              <div className="space-y-3">
                {copy.points.map((point) => (
                  <div
                    key={point}
                    className="rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#0c1726] p-6">
              <PricingTable />
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
