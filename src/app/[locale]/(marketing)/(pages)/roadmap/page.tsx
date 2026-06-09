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
  const pt = await getTranslations({ locale, namespace: 'RoadmapPage' });

  return constructMetadata({
    title: `${pt('title')} | ${t('title')}`,
    description: pt('description'),
    locale,
    pathname: '/roadmap',
  });
}

const roadmapCopy = {
  zh: {
    badge: '下一步',
    intro: '路线图不再是假任务看板，而是围绕解析站真实会走的三段式演进。',
    phases: [
      {
        title: '阶段一：把匿名解析跑稳',
        body: '重点盯 Cloudflare 到抖音上游的稳定性、缓存命中和错误码结构，让首页 MVP 真正能承接公开流量。',
      },
      {
        title: '阶段二：接入批量与工作流',
        body: '补批量解析、结果导出、历史记录，以及更适合内容团队和内部自动化系统的接入方式。',
      },
      {
        title: '阶段三：做商业化分层',
        body: '在解析成功率和使用频次验证后，再引入会员方案、额度限制、团队版和 API 套餐。',
      },
    ],
  },
  en: {
    badge: 'Next up',
    intro: 'The roadmap is no longer a fake kanban board. It now follows the three stages this parser product is actually likely to take.',
    phases: [
      {
        title: 'Phase 1: make anonymous parsing stable',
        body: 'Focus on Cloudflare-to-Douyin stability, cache behavior, and clear error handling so the homepage MVP can handle public traffic with confidence.',
      },
      {
        title: 'Phase 2: add batch and workflow access',
        body: 'Introduce batch parsing, export options, history views, and cleaner access patterns for content teams and internal workflow systems.',
      },
      {
        title: 'Phase 3: layer commercialization',
        body: 'Only after parse success and usage frequency are proven should memberships, quotas, team plans, and API packages be added.',
      },
    ],
  },
} as const;

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('RoadmapPage');
  const copy = locale === 'zh' ? roadmapCopy.zh : roadmapCopy.en;

  return (
    <div className="bg-[#07111f] text-slate-100">
      <Container className="px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <section className="space-y-6">
            <Badge className="rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-1 text-sky-100">
              {copy.badge}
            </Badge>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              {t('title')}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-300">
              {copy.intro}
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {copy.phases.map((phase) => (
              <article
                key={phase.title}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
              >
                <h2 className="text-2xl font-semibold text-white">
                  {phase.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {phase.body}
                </p>
              </article>
            ))}
          </section>
        </div>
      </Container>
    </div>
  );
}
