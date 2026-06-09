'use client';

import { LocaleLink } from '@/i18n/navigation';
import type { DouyinVideoResult } from '@/lib/douyin/types';
import { cn } from '@/lib/utils';
import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  PlayIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from 'lucide-react';
import { useState, useTransition } from 'react';

type SupportedLocale = 'zh' | 'en';

interface DouyinHomePageClientProps {
  locale: string;
}

interface ApiSuccessResponse {
  code: 0;
  data: DouyinVideoResult;
  traceId: string;
}

interface ApiErrorResponse {
  code: number;
  message?: string;
}

const ratioOptions = ['1080p', '720p', '540p'] as const;

const content = {
  zh: {
    badge: 'Cloudflare 就绪的抖音解析工作台',
    title: '粘贴抖音链接，几秒拿到可用视频地址。',
    description:
      '面向内容运营、选题分析和自动化工作流的抖音解析入口，支持分享文案、短链和 aweme_id，直接返回视频链接、封面和作者信息。',
    ctaPrimary: '立即解析',
    ctaSecondary: '查看能力说明',
    inputLabel: '粘贴抖音分享文案、链接或作品 ID',
    inputPlaceholder:
      '例如：复制打开抖音，看看这个作品 https://v.douyin.com/xxxxxx/ ...',
    parseButton: '开始解析',
    parsingButton: '解析中',
    examplesTitle: '试一下这些输入格式',
    resultTitle: '解析结果',
    resultEmptyTitle: '结果会显示在这里',
    resultEmptyDescription:
      '成功后会返回视频地址、封面、分辨率、作者昵称和分享页来源。',
    openVideo: '打开视频地址',
    copyVideo: '复制视频地址',
    copied: '已复制',
    errorEmpty: '先粘贴一个抖音链接或作品 ID',
    errorFallback: '解析失败，请稍后重试',
    infoTitle: '适合直接上线的 MVP 能力',
    infoDescription:
      '页面先解决一件事：让用户快速完成解析，再逐步补会员、积分和后台。',
    featureTitle: '第一版该有的能力，已经被收束成一条主流程',
    featureDescription:
      '不删你的现有模块代码，先把对用户最关键的输入、解析和结果展示做成成品。',
    workflowTitle: '解析路径',
    workflowDescription:
      '输入到结果只走三步，便于后面继续接配额、风控和支付。',
    scenariosTitle: '这页适合承接的用户',
    scenariosDescription:
      '不是泛泛的 AI 模板页，而是一个能直接转化成产品验证流量的工具入口。',
    faqTitle: '常见问题',
    faqDescription: '先把最容易卡住的上手问题说清楚。',
    finalTitle: '先把网页打磨成产品，再逐步接上完整商业闭环。',
    finalDescription:
      '这一版适合先上线验证解析成功率、用户需求密度和内容增长转化。',
    finalPrimary: '继续完善这版前台',
    finalSecondary: '查看定价页',
    stats: [
      ['3 种输入', '分享文案、短链、aweme_id 都能喂给接口'],
      ['直接返回 URL', '不走视频代理，结果更适合工作流调用'],
      ['Cloudflare 友好', '当前结构已为 OpenNext Worker 和 D1 准备好'],
    ],
    features: [
      {
        title: '主流程前置',
        body: '解析输入框直接放在第一屏，用户不需要先看完整个首页才知道产品怎么用。',
      },
      {
        title: '结果面板可操作',
        body: '返回后可以直接打开链接、复制地址、查看封面和核心元数据，不只是一行 JSON。',
      },
      {
        title: '支持后续接商业逻辑',
        body: '保留你现有的认证、支付、积分和内容体系，前台先做好，后续再逐个接上。',
      },
      {
        title: '适配内容团队场景',
        body: '对内容搬运、素材收集、竞品追踪和爆款拆解更友好，而不是通用开发者模板口吻。',
      },
    ],
    workflow: [
      {
        step: '01',
        title: '识别输入',
        body: '接受分享文案、抖音短链和作品 ID，先抽取可解析的 aweme_id。',
      },
      {
        step: '02',
        title: '抓取分享页',
        body: '服务端解析分享页中的作品数据，必要时自动刷新匿名 ttwid。',
      },
      {
        step: '03',
        title: '回传结果',
        body: '把视频地址、封面、作者昵称和分辨率返回给前台，方便继续下载、分析或接工作流。',
      },
    ],
    scenarios: [
      {
        title: '内容运营',
        body: '快速拿素材地址，方便入库、转存、复盘爆款结构。',
      },
      {
        title: 'AI 产品验证',
        body: '先跑出可用工具页，再决定是否接会员、积分和任务流。',
      },
      {
        title: '自动化工作流',
        body: '前台可给用户直接使用，后面也能复用同一个 /api/video 接口。',
      },
    ],
    faqs: [
      {
        question: '现在返回的是下载文件还是视频地址？',
        answer:
          '当前返回的是可用视频地址和相关元数据，适合浏览器打开、复制到工作流，或在下一步接你自己的下载逻辑。',
      },
      {
        question: '必须登录后才能解析吗？',
        answer:
          '这一版首页默认按匿名可用的 MVP 方式设计，后面你可以再决定是否按次数、会员或积分做限制。',
      },
      {
        question: 'Cloudflare 上线最大的风险是什么？',
        answer:
          '不是页面构建，而是 Cloudflare 出口到抖音上游的稳定性，所以首批上线后要重点盯解析成功率和 403、502 比例。',
      },
      {
        question: '现有模板功能会不会被删掉？',
        answer:
          '不会，这次只先把前台落地页和主流程做成一个更像产品的版本，底层能力先保留。',
      },
    ],
    labels: {
      author: '作者',
      resolution: '分辨率',
      format: '格式',
      source: '来源',
      published: '发布时间',
      bitrate: '码率',
      payload: '视频地址',
      sample: '演示结果',
      live: '实时结果',
    },
    examples: [
      'https://v.douyin.com/abcdefg/',
      'https://www.douyin.com/video/7512345678901234567',
      '作品 ID 7512345678901234567',
    ],
    sample: {
      description: '这里会展示解析成功后的作品标题和结果摘要',
      authorNickname: '示例作者',
      coverUrl: '',
      videoUrl: 'https://aweme.snssdk.com/aweme/v1/play/?video_id=sample-token',
      width: 1080,
      height: 1920,
      format: 'mp4',
      sourcePage: 'https://www.douyin.com/video/sample',
      createTimeText: '等待真实解析结果',
      bitRate: 0,
    },
  },
  en: {
    badge: 'Cloudflare-ready Douyin parsing workspace',
    title: 'Paste a Douyin link and get a usable video URL in seconds.',
    description:
      'A sharp parsing entry for content ops, competitive research, and automation workflows. It accepts share text, short links, and aweme_id, then returns the video URL, cover, and author data.',
    ctaPrimary: 'Parse now',
    ctaSecondary: 'See what it does',
    inputLabel: 'Paste Douyin share text, a link, or an aweme ID',
    inputPlaceholder:
      'Example: Open Douyin and check this post https://v.douyin.com/xxxxxx/ ...',
    parseButton: 'Run parser',
    parsingButton: 'Parsing',
    examplesTitle: 'Try one of these formats',
    resultTitle: 'Result panel',
    resultEmptyTitle: 'Your result will land here',
    resultEmptyDescription:
      'After a successful request, this panel shows the video URL, cover, resolution, author, and source page.',
    openVideo: 'Open video URL',
    copyVideo: 'Copy video URL',
    copied: 'Copied',
    errorEmpty: 'Paste a Douyin link or aweme ID first',
    errorFallback: 'Parsing failed, please try again',
    infoTitle: 'An MVP scope that can actually ship',
    infoDescription:
      'This version focuses on one thing first: let users finish the parse flow, then layer memberships, credits, and admin systems later.',
    featureTitle: 'The first release is now shaped around one clean product flow',
    featureDescription:
      'No feature code is deleted. The user-facing surface is simply being refocused around input, parsing, and result delivery.',
    workflowTitle: 'How the flow runs',
    workflowDescription:
      'The request path stays simple so rate limits, billing, and anti-abuse rules can be added later without a redesign.',
    scenariosTitle: 'Who this page can convert',
    scenariosDescription:
      'This is no longer a generic AI boilerplate front page. It behaves like a focused tool entry that can validate demand.',
    faqTitle: 'Questions users will ask first',
    faqDescription: 'Clear answers early, less friction later.',
    finalTitle: 'Polish the tool page first, then connect the full business loop.',
    finalDescription:
      'This version is strong enough to validate parser success rate, demand quality, and acquisition channels before deeper monetization work.',
    finalPrimary: 'Keep refining the frontend',
    finalSecondary: 'Open pricing page',
    stats: [
      ['3 input modes', 'Share text, short links, and aweme_id are all supported'],
      ['Direct URL output', 'No video proxy layer, which makes the result easier to use in workflows'],
      ['Cloudflare friendly', 'The current architecture is already prepared for OpenNext Worker and D1'],
    ],
    features: [
      {
        title: 'The core action is above the fold',
        body: 'The parser sits in the hero so users understand the product immediately instead of reading through a long template page.',
      },
      {
        title: 'The result panel is operational',
        body: 'Users can open the URL, copy it, inspect metadata, and preview the cover instead of staring at raw JSON.',
      },
      {
        title: 'The rest of the SaaS stack stays intact',
        body: 'Auth, payments, credits, and content modules remain in the codebase so you can connect them when the front page is working.',
      },
      {
        title: 'The tone matches content and research teams',
        body: 'It speaks to operators, researchers, and growth builders instead of sounding like a generic developer template.',
      },
    ],
    workflow: [
      {
        step: '01',
        title: 'Normalize the input',
        body: 'The service accepts share text, Douyin short links, and raw aweme IDs, then extracts the parseable target.',
      },
      {
        step: '02',
        title: 'Resolve the share page',
        body: 'The server fetches the share page and refreshes anonymous ttwid state when needed.',
      },
      {
        step: '03',
        title: 'Return a clean payload',
        body: 'The frontend receives the video URL, cover, author name, and resolution so the user can keep moving.',
      },
    ],
    scenarios: [
      {
        title: 'Content operations',
        body: 'Grab source assets fast, archive them, and review winning post structures.',
      },
      {
        title: 'AI product validation',
        body: 'Launch a usable tool page first, then decide whether to add subscriptions, credits, or task flows.',
      },
      {
        title: 'Automation workflows',
        body: 'The same /api/video contract works for both direct users and downstream workflow tooling.',
      },
    ],
    faqs: [
      {
        question: 'Does it return a downloadable file or a video URL?',
        answer:
          'Right now it returns a usable video URL plus metadata. That makes it better for browsers, workflow steps, or your own download layer later.',
      },
      {
        question: 'Do users need to sign in before parsing?',
        answer:
          'This page is designed as an anonymous-friendly MVP first. You can later decide whether to gate requests by quota, membership, or credits.',
      },
      {
        question: 'What is the biggest Cloudflare launch risk?',
        answer:
          'Not the build step. The real risk is Cloudflare egress stability to Douyin, so watch parser success rate and 403 or 502 ratios after launch.',
      },
      {
        question: 'Will the existing template capabilities be removed?',
        answer:
          'No. This pass only upgrades the product-facing page and the main parse flow. The broader codebase remains available for later use.',
      },
    ],
    labels: {
      author: 'Author',
      resolution: 'Resolution',
      format: 'Format',
      source: 'Source',
      published: 'Published',
      bitrate: 'Bitrate',
      payload: 'Video URL',
      sample: 'Sample result',
      live: 'Live result',
    },
    examples: [
      'https://v.douyin.com/abcdefg/',
      'https://www.douyin.com/video/7512345678901234567',
      'aweme_id 7512345678901234567',
    ],
    sample: {
      description: 'A successful parse will surface the post title and a clean result summary here',
      authorNickname: 'Sample author',
      coverUrl: '',
      videoUrl: 'https://aweme.snssdk.com/aweme/v1/play/?video_id=sample-token',
      width: 1080,
      height: 1920,
      format: 'mp4',
      sourcePage: 'https://www.douyin.com/video/sample',
      createTimeText: 'Waiting for a real parse result',
      bitRate: 0,
    },
  },
} as const;

function formatBitrate(bitRate: number) {
  if (!bitRate) {
    return 'N/A';
  }

  if (bitRate >= 1_000_000) {
    return `${(bitRate / 1_000_000).toFixed(1)} Mbps`;
  }

  if (bitRate >= 1_000) {
    return `${Math.round(bitRate / 1_000)} kbps`;
  }

  return `${bitRate} bps`;
}

function truncateUrl(url: string) {
  if (url.length <= 72) {
    return url;
  }

  return `${url.slice(0, 44)}...${url.slice(-18)}`;
}

function getApiErrorMessage(
  payload: ApiSuccessResponse | ApiErrorResponse,
  fallback: string
) {
  return 'message' in payload && payload.message ? payload.message : fallback;
}

export function DouyinHomePageClient({
  locale,
}: DouyinHomePageClientProps) {
  const pageLocale: SupportedLocale = locale.startsWith('zh') ? 'zh' : 'en';
  const copy = content[pageLocale];
  const [input, setInput] = useState('');
  const [ratio, setRatio] = useState<(typeof ratioOptions)[number]>('1080p');
  const [result, setResult] = useState<DouyinVideoResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const preview = result ?? copy.sample;

  const handleParse = (value?: string) => {
    const nextValue = (value ?? input).trim();

    if (!nextValue) {
      setError(copy.errorEmpty);
      return;
    }

    setInput(nextValue);
    setError('');
    setCopied(false);

    startTransition(() => {
      void parseInput(nextValue);
    });
  };

  const parseInput = async (nextValue: string) => {
    try {
      const response = await fetch('/api/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: nextValue,
          ratio,
        }),
      });

      const payload = (await response.json()) as ApiSuccessResponse | ApiErrorResponse;

      if (!response.ok || payload.code !== 0 || !('data' in payload)) {
        throw new Error(getApiErrorMessage(payload, copy.errorFallback));
      }

      setResult(payload.data);
    } catch (parseError) {
      setResult(null);
      setError(
        parseError instanceof Error ? parseError.message : copy.errorFallback
      );
    }
  };

  const handleCopy = async () => {
    if (!result?.videoUrl) {
      return;
    }

    await navigator.clipboard.writeText(result.videoUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative overflow-hidden bg-[#07111f] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(72,187,255,0.22),_transparent_36%),radial-gradient(circle_at_85%_12%,_rgba(13,148,136,0.18),_transparent_28%),linear-gradient(180deg,_rgba(7,17,31,0.92),_rgba(7,17,31,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />

      <section className="relative min-h-[100dvh] pt-20 pb-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.06fr_0.94fr] lg:px-8">
          <div className="flex flex-col justify-center gap-8 pt-4 lg:pt-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs font-medium tracking-[0.16em] text-sky-100 uppercase">
              <SparklesIcon className="size-3.5" />
              {copy.badge}
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl pb-1 text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl lg:leading-[1.02]">
                <span className="font-[family-name:var(--font-bricolage-grotesque)]">
                  {copy.title}
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                {copy.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleParse()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5"
              >
                {copy.ctaPrimary}
                <ArrowRightIcon className="size-4" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
              >
                {copy.ctaSecondary}
              </a>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {copy.stats.map(([value, detail]) => (
                <div
                  key={value}
                  className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur-sm"
                >
                  <div className="text-lg font-semibold text-white">{value}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/12 bg-[#0d1b2e]/88 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {copy.inputLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {copy.infoDescription}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-medium text-emerald-100">
                  /api/video
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {ratioOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRatio(option)}
                    className={cn(
                      'rounded-2xl border px-3 py-2 text-xs font-medium transition-colors duration-200',
                      ratio === option
                        ? 'border-sky-300/40 bg-sky-300 text-slate-950'
                        : 'border-white/10 bg-white/6 text-slate-300 hover:bg-white/10'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-4">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={copy.inputPlaceholder}
                  className="min-h-44 w-full rounded-[1.75rem] border border-white/10 bg-[#06111f] px-5 py-4 text-sm leading-7 text-white outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-sky-300/35"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => handleParse()}
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-[1.3rem] bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
                  >
                    {isPending ? (
                      <LoaderCircleIcon className="size-4 animate-spin" />
                    ) : (
                      <PlayIcon className="size-4" />
                    )}
                    {isPending ? copy.parsingButton : copy.parseButton}
                  </button>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheckIcon className="size-3.5 text-sky-200" />
                    {copy.infoTitle}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-medium tracking-[0.16em] text-slate-400 uppercase">
                    {copy.examplesTitle}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {copy.examples.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => handleParse(example)}
                        className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-left text-xs text-slate-200 transition-colors duration-200 hover:bg-white/10"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {error ? (
                  <div className="rounded-[1.3rem] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#081423] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      {copy.resultTitle}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {result
                        ? copy.labels.live
                        : copy.resultEmptyDescription}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 px-3 py-2 text-xs text-slate-300">
                    {result ? copy.labels.live : copy.labels.sample}
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
                    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/60">
                      {preview.coverUrl ? (
                        <img
                          src={preview.coverUrl}
                          alt={preview.description}
                          className="h-full min-h-52 w-full object-cover"
                        />
                      ) : (
                        <div className="flex min-h-52 items-end bg-[linear-gradient(145deg,_rgba(34,197,94,0.14),_rgba(56,189,248,0.24),_rgba(7,17,31,0.9))] p-5">
                          <p className="max-w-44 text-sm leading-6 text-slate-100">
                            {result
                              ? preview.description
                              : copy.resultEmptyTitle}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-semibold text-white">
                          {preview.description}
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <InfoCell
                            label={copy.labels.author}
                            value={preview.authorNickname}
                          />
                          <InfoCell
                            label={copy.labels.resolution}
                            value={`${preview.width} x ${preview.height}`}
                          />
                          <InfoCell
                            label={copy.labels.format}
                            value={preview.format}
                          />
                          <InfoCell
                            label={copy.labels.bitrate}
                            value={formatBitrate(preview.bitRate)}
                          />
                          <InfoCell
                            label={copy.labels.published}
                            value={preview.createTimeText}
                          />
                          <InfoCell
                            label={copy.labels.source}
                            value="Douyin share page"
                          />
                        </div>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <div className="text-xs font-medium tracking-[0.16em] text-slate-400 uppercase">
                          {copy.labels.payload}
                        </div>
                        <div className="mt-3 rounded-2xl bg-[#06111f] px-4 py-3 font-mono text-xs leading-6 text-sky-100">
                          {truncateUrl(preview.videoUrl)}
                        </div>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <a
                            href={preview.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] border border-sky-300/20 bg-sky-300/12 px-4 py-3 text-sm font-medium text-sky-100 transition-colors duration-200 hover:bg-sky-300/16"
                          >
                            <ExternalLinkIcon className="size-4" />
                            {copy.openVideo}
                          </a>
                          <button
                            type="button"
                            onClick={handleCopy}
                            disabled={!result}
                            className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {copied ? (
                              <CheckIcon className="size-4 text-emerald-200" />
                            ) : (
                              <CopyIcon className="size-4" />
                            )}
                            {copied ? copy.copied : copy.copyVideo}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative border-t border-white/8 bg-[#08131f]/92 py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium tracking-[0.18em] text-sky-200 uppercase">
              {copy.featureTitle}
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              {copy.featureDescription}
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-12">
            {copy.features.map((item, index) => (
              <div
                key={item.title}
                className={cn(
                  'rounded-[1.9rem] border border-white/10 bg-white/5 p-6',
                  index === 0 && 'lg:col-span-7',
                  index === 1 && 'lg:col-span-5',
                  index === 2 && 'lg:col-span-5',
                  index === 3 && 'lg:col-span-7'
                )}
              >
                <div className="text-sm font-medium tracking-[0.16em] text-sky-200 uppercase">
                  {`0${index + 1}`}
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div className="space-y-5">
            <p className="text-sm font-medium tracking-[0.18em] text-sky-200 uppercase">
              {copy.workflowTitle}
            </p>
            <h2 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white">
              {copy.infoTitle}
            </h2>
            <p className="max-w-xl text-base leading-8 text-slate-300">
              {copy.workflowDescription}
            </p>
          </div>

          <div className="space-y-4">
            {copy.workflow.map((item) => (
              <div
                key={item.step}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="text-sm font-medium tracking-[0.16em] text-sky-200 uppercase">
                    {item.step}
                  </div>
                  <div className="max-w-2xl">
                    <h3 className="text-xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {item.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/8 bg-[#08131f]/92 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium tracking-[0.18em] text-sky-200 uppercase">
              {copy.scenariosTitle}
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              {copy.scenariosDescription}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {copy.scenarios.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.75rem] border border-white/10 bg-[#0a1725] p-6"
              >
                <h3 className="text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faqs" className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium tracking-[0.18em] text-sky-200 uppercase">
              {copy.faqTitle}
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              {copy.faqDescription}
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {copy.faqs.map((item) => (
              <details
                key={item.question}
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 open:bg-white/7"
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-white">
                  {item.question}
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-sky-300/16 bg-[linear-gradient(140deg,_rgba(14,165,233,0.14),_rgba(15,23,42,0.92),_rgba(13,148,136,0.12))] p-8 sm:p-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                {copy.finalTitle}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                {copy.finalDescription}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#top"
                className="inline-flex items-center justify-center gap-2 rounded-[1.3rem] bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5"
              >
                {copy.finalPrimary}
                <ArrowRightIcon className="size-4" />
              </a>
              <LocaleLink
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-[1.3rem] border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
              >
                {copy.finalSecondary}
              </LocaleLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium tracking-[0.16em] text-slate-500 uppercase">
        {label}
      </div>
      <div className="mt-2 text-sm text-slate-100">{value}</div>
    </div>
  );
}
