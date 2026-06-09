import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { constructMetadata } from '@/lib/metadata';
import { cn } from '@/lib/utils';
import { MailIcon } from 'lucide-react';
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
  const pt = await getTranslations({ locale, namespace: 'AboutPage' });

  return constructMetadata({
    title: `${pt('title')} | ${t('title')}`,
    description: pt('description'),
    locale,
    pathname: '/about',
  });
}

const pageCopy = {
  zh: {
    badge: '产品定位',
    title: 'AwemeFlow 不是通用模板，而是一个抖音视频解析站。',
    description:
      '这站点先服务最明确的一类需求：把抖音分享文本、短链和作品 ID，尽快转成可用视频地址和结构化结果，方便内容运营、素材管理和自动化工作流接入。',
    sections: [
      {
        title: '为什么先只做解析',
        body: '比起一上来铺满会员、积分、博客和一堆 SaaS 壳子，AwemeFlow 先把最核心的一步做到稳定可用。只有解析成功率和用户使用频率跑通，后面的商业化才值得接。',
      },
      {
        title: '适合谁',
        body: '适合内容团队、竞品分析、素材收集、爆款拆解，以及需要把抖音解析能力接入内部工作流的团队。',
      },
      {
        title: '不想做什么',
        body: '这一阶段不把自己包装成万能内容平台，也不做大而全的下载站矩阵。前台先收口成一件事，后续扩展才不会失焦。',
      },
    ],
    cards: [
      ['输入兼容', '分享文案、短链、aweme_id'],
      ['结果结构', '视频地址、封面、作者、分辨率'],
      ['部署路径', 'OpenNext Worker + D1 + 可选 KV'],
    ],
    cta: '如果你要接 API、批量解析或团队版能力，可以直接联系。',
    contact: '联系支持',
  },
  en: {
    badge: 'Positioning',
    title: 'AwemeFlow is not a generic template site. It is a focused Douyin video parser.',
    description:
      'The site is being shaped around one concrete need first: convert Douyin share text, short links, and aweme IDs into usable video URLs and structured payloads for operators, research teams, and workflow builders.',
    sections: [
      {
        title: 'Why parsing comes first',
        body: 'Instead of leading with memberships, credits, blogs, and broad SaaS framing, AwemeFlow starts by making the parser stable and useful. Monetization only matters after parse success and repeat usage are real.',
      },
      {
        title: 'Who it is for',
        body: 'Content operations, competitive research, asset collection, post analysis, and teams that want to plug Douyin parsing into internal workflows.',
      },
      {
        title: 'What it is not trying to be',
        body: 'This phase does not try to become a catch-all content platform or a sprawling download-site network. The frontend stays narrow so future expansion does not lose focus.',
      },
    ],
    cards: [
      ['Input support', 'Share text, short links, aweme_id'],
      ['Output shape', 'Video URL, cover, author, resolution'],
      ['Deployment path', 'OpenNext Worker + D1 + optional KV'],
    ],
    cta: 'If you want API access, batch parsing, or team features, reach out directly.',
    contact: 'Contact support',
  },
} as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const content = locale === 'zh' ? pageCopy.zh : pageCopy.en;

  return (
    <div className="bg-[#07111f] text-slate-100">
      <Container className="px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-14">
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <Badge className="rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-1 text-sky-100">
                {content.badge}
              </Badge>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-white">
                {content.title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300">
                {content.description}
              </p>
            </div>

            <div className="grid gap-4">
              {content.cards.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
                >
                  <div className="text-sm font-medium tracking-[0.16em] text-sky-200 uppercase">
                    {label}
                  </div>
                  <div className="mt-3 text-xl font-semibold text-white">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {content.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
              >
                <h2 className="text-2xl font-semibold text-white">
                  {section.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {section.body}
                </p>
              </article>
            ))}
          </section>

          <section className="rounded-[2rem] border border-sky-300/18 bg-[linear-gradient(135deg,_rgba(14,165,233,0.14),_rgba(7,17,31,0.92))] p-8">
            <p className="max-w-3xl text-base leading-8 text-slate-200">
              {content.cta}
            </p>
            <a
              href="mailto:support@example.com"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'mt-6 w-fit rounded-2xl border-white/14 bg-white/5 text-white hover:bg-white/10'
              )}
            >
              <MailIcon className="mr-2 size-4" />
              {content.contact}
            </a>
          </section>
        </div>
      </Container>
    </div>
  );
}
