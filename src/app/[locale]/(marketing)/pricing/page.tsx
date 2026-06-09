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
    heading: '先按解析站 MVP 定价，不把支付系统整包背上去。',
    description:
      '首发阶段先用人工开通或表单收单更轻，等解析成功率和需求密度验证完，再补正式订阅、积分和后台计费。',
    plans: [
      ['试用版', '少量手动解析，适合产品试用和内容验证。'],
      ['专业版', '适合内容团队的稳定日常使用和固定额度。'],
      ['团队/API', '批量解析和接口调用，先走申请或定制。'],
    ],
  },
  en: {
    badge: 'Commercial plans',
    heading: 'Price the parser MVP first without carrying the full billing stack.',
    description:
      'For launch, manual activation or lead capture is lighter. Add subscriptions, credits, and admin billing after parser quality and demand are validated.',
    plans: [
      ['Trial', 'Light manual parsing for first-time testing and validation.'],
      ['Pro', 'Steady usage for content teams with a fixed quota.'],
      ['Team / API', 'Batch parsing and API access handled through request or custom onboarding.'],
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
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="space-y-6">
            <Badge className="rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-1 text-sky-100">
              {copy.badge}
            </Badge>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              {copy.heading}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-300">
              {copy.description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {copy.plans.map(([title, body]) => (
              <div
                key={title}
                className="rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-5"
              >
                <div className="text-lg font-semibold text-white">{title}</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
