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
    badge: 'AwemeFlow parser',
    title: '把抖音链接变成可直接使用的视频地址。',
    description:
      '首屏就是解析器。粘贴分享文案、短链或作品 ID，马上拿到视频地址、封面、作者信息和基础元数据。',
    trustBar: [
      '支持分享文案',
      '支持短链与 aweme_id',
      '返回视频地址与封面',
      '适合内容工作流',
    ],
    panelTitle: '输入素材',
    panelHint: '默认匿名可用，适合手动处理、素材核验和工作流前置步骤。',
    inputLabel: '粘贴抖音分享文案、链接或作品 ID',
    inputPlaceholder:
      '例如：复制打开抖音，看看这个作品 https://v.douyin.com/xxxxxx/ ...',
    parseButton: '立即解析',
    parsingButton: '解析中',
    resultTitle: '解析结果',
    resultEmptyTitle: '结果会直接落在这里',
    resultEmptyDescription: '成功后会返回视频地址、封面、作者和基础元数据。',
    openVideo: '打开地址',
    copyVideo: '复制地址',
    copied: '已复制',
    errorEmpty: '先粘贴一个抖音链接或作品 ID',
    errorFallback: '解析失败，请稍后重试',
    examplesTitle: '试试这些输入',
    outputsEyebrow: '输出能力',
    outputsTitle: '一条解析，直接拿到核心结果',
    outputsDescription:
      '不讲长篇故事，首页就该把输入和输出说清楚。',
    outputs: [
      ['视频地址', '浏览器可直接打开，也能继续交给下载、归档或自动化流程。'],
      ['封面和作者', '快速确认素材来源，方便运营、研究和人工核验。'],
      ['分辨率和格式', '先判断素材规格，再决定后续处理方式。'],
    ],
    flowEyebrow: '工作方式',
    flowTitle: '整个流程应该在几秒内讲清楚',
    flowDescription:
      '用户不需要先看一堆宣传页，只需要知道输什么、会发生什么、拿到什么。',
    flow: [
      ['粘贴输入', '分享文案、短链、作品 ID 都可以直接丢进来。'],
      ['服务端解析', '自动识别 aweme_id，拉取分享页并整理结构化结果。'],
      ['继续使用', '复制地址、打开视频，或者继续接到你的工作流里。'],
    ],
    faqTitle: '常见问题',
    faqs: [
      [
        '返回的是下载文件还是视频地址？',
        '当前返回的是可用视频地址和元数据，更适合浏览器打开和接后续流程。',
      ],
      [
        '需要登录后才能解析吗？',
        '这版按匿名可用设计，先保证首个核心动作足够快。',
      ],
      [
        '支持哪些输入？',
        '支持抖音分享文案、短链和作品 ID。',
      ],
      [
        '上线后最大的风险是什么？',
        '重点不是页面，而是 Cloudflare 到抖音上游链路的稳定性，需要持续盯成功率。',
      ],
    ],
    labels: {
      author: '作者',
      resolution: '分辨率',
      format: '格式',
      published: '发布时间',
      bitrate: '码率',
      payload: '视频地址',
      source: '来源',
      sample: '演示结果',
      live: '实时结果',
      parserState: '解析状态',
      parserReady: '可立即体验',
      anonymous: '匿名可用',
    },
    examples: [
      'https://v.douyin.com/abcdefg/',
      'https://www.douyin.com/video/7512345678901234567',
      '作品 ID 7512345678901234567',
    ],
    sample: {
      description: '解析成功后，这里会展示作品摘要和核心信息。',
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
    ctaPrimary: '继续解析',
    ctaSecondary: '联系支持',
  },
  en: {
    badge: 'AwemeFlow parser',
    title: 'Turn a Douyin link into a usable video source.',
    description:
      'The parser is the first thing you see. Paste share text, a short link, or an aweme ID and get back the video URL, cover, author, and base metadata.',
    trustBar: [
      'Works with share text',
      'Supports short links and aweme_id',
      'Returns video URL and cover',
      'Built for workflow use',
    ],
    panelTitle: 'Input',
    panelHint:
      'Anonymous by default. Good for manual operations, asset validation, and workflow prep.',
    inputLabel: 'Paste Douyin share text, a link, or an aweme ID',
    inputPlaceholder:
      'Example: Open Douyin and check this post https://v.douyin.com/xxxxxx/ ...',
    parseButton: 'Parse now',
    parsingButton: 'Parsing',
    resultTitle: 'Parsed result',
    resultEmptyTitle: 'Your result will land here',
    resultEmptyDescription:
      'A successful parse returns the video URL, cover, author, and basic metadata.',
    openVideo: 'Open URL',
    copyVideo: 'Copy URL',
    copied: 'Copied',
    errorEmpty: 'Paste a Douyin link or aweme ID first',
    errorFallback: 'Parsing failed, please try again',
    examplesTitle: 'Try these inputs',
    outputsEyebrow: 'Output',
    outputsTitle: 'One parse gives you the assets that matter',
    outputsDescription:
      'No long pitch deck. The page should explain the input and output immediately.',
    outputs: [
      ['Video URL', 'Open it in the browser or pass it into a download, archive, or automation step.'],
      ['Cover and author', 'Quickly validate source context for operations, research, or review.'],
      ['Resolution and format', 'Judge the asset spec before sending it downstream.'],
    ],
    flowEyebrow: 'Flow',
    flowTitle: 'The whole product should explain itself in seconds',
    flowDescription:
      'Users should know what to paste, what happens next, and what comes back without reading a marketing page first.',
    flow: [
      ['Paste the input', 'Share text, short links, and aweme IDs all work here.'],
      ['Resolve upstream', 'The server extracts the aweme target and normalizes the response.'],
      ['Keep moving', 'Copy the URL, open the video, or feed it into your next workflow step.'],
    ],
    faqTitle: 'FAQs',
    faqs: [
      [
        'Does it return a file or a video URL?',
        'It currently returns a usable video URL and metadata, which fits browsers and downstream workflow steps better.',
      ],
      [
        'Do users need to log in first?',
        'This release is intentionally anonymous-friendly so the main parser action stays immediate.',
      ],
      [
        'What inputs are supported?',
        'Douyin share text, short links, and aweme IDs.',
      ],
      [
        'What is the main production risk?',
        'The biggest risk is upstream stability between Cloudflare egress and Douyin, not the page itself.',
      ],
    ],
    labels: {
      author: 'Author',
      resolution: 'Resolution',
      format: 'Format',
      published: 'Published',
      bitrate: 'Bitrate',
      payload: 'Video URL',
      source: 'Source',
      sample: 'Sample result',
      live: 'Live result',
      parserState: 'Parser state',
      parserReady: 'Ready to use',
      anonymous: 'Anonymous access',
    },
    examples: [
      'https://v.douyin.com/abcdefg/',
      'https://www.douyin.com/video/7512345678901234567',
      'aweme_id 7512345678901234567',
    ],
    sample: {
      description: 'A successful parse will surface the asset summary and key metadata here.',
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
    ctaPrimary: 'Parse another',
    ctaSecondary: 'Contact support',
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

      const payload =
        (await response.json()) as ApiSuccessResponse | ApiErrorResponse;

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
    <div className="bg-[#050b14] text-slate-100">
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_88%_14%,rgba(14,165,233,0.12),transparent_22%),linear-gradient(180deg,rgba(5,11,20,0.96),rgba(5,11,20,1))]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(5,11,20,0),rgba(5,11,20,1))]" />

        <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl gap-8 px-4 pb-14 pt-20 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:pb-16">
          <div className="flex flex-col justify-center gap-6 lg:max-w-[38rem] lg:py-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-300/16 bg-sky-300/8 px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-sky-100 uppercase">
              <SparklesIcon className="size-3.5" />
              {copy.badge}
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold text-white sm:text-[3.5rem] sm:leading-[1.04] lg:text-[4rem] lg:leading-[1.02]">
                {copy.title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                {copy.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {copy.trustBar.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricChip
                label={copy.labels.parserState}
                value={copy.labels.parserReady}
              />
              <MetricChip label={copy.labels.source} value="Douyin" />
              <MetricChip label="Access" value={copy.labels.anonymous} />
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="w-full rounded-[30px] border border-white/10 bg-[#0a1422]/92 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-6 lg:max-w-[48rem] lg:justify-self-end">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="text-lg font-semibold text-white">
                      {copy.panelTitle}
                    </div>
                    <p className="max-w-xl text-sm leading-6 text-slate-400">
                      {copy.panelHint}
                    </p>
                  </div>
                  <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-emerald-300/18 bg-emerald-300/10 px-3 py-2 text-[11px] font-medium tracking-[0.16em] text-emerald-100 uppercase">
                    <ShieldCheckIcon className="size-3.5" />
                    Live parser
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">
                    {copy.inputLabel}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ratioOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRatio(option)}
                        className={cn(
                          'rounded-2xl border px-3 py-2 text-xs font-medium transition-colors duration-200',
                          ratio === option
                            ? 'border-sky-300/30 bg-sky-300 text-slate-950'
                            : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={copy.inputPlaceholder}
                    className="min-h-44 w-full rounded-[24px] border border-white/8 bg-[#050c17] px-5 py-4 text-sm leading-7 text-white outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-sky-300/30"
                  />
                </div>

                <div className="rounded-[24px] border border-white/8 bg-[#07101a] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <button
                      type="button"
                      onClick={() => handleParse()}
                      disabled={isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
                    >
                      {isPending ? (
                        <LoaderCircleIcon className="size-4 animate-spin" />
                      ) : (
                        <PlayIcon className="size-4" />
                      )}
                      {isPending ? copy.parsingButton : copy.parseButton}
                    </button>

                    <div className="flex flex-wrap gap-2">
                      {copy.examples.map((example) => (
                        <button
                          key={example}
                          type="button"
                          onClick={() => handleParse(example)}
                          className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2 text-left text-xs text-slate-300 transition-colors duration-200 hover:bg-white/[0.08]"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
                    <div className="text-[11px] font-medium tracking-[0.16em] text-slate-500 uppercase">
                      {copy.examplesTitle}
                    </div>
                    <div className="text-xs text-slate-400">
                      {ratio} output
                    </div>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-[18px] border border-rose-300/18 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                ) : null}

                <div className="rounded-[24px] border border-white/8 bg-[#07101a] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        {copy.resultTitle}
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">
                        {result ? copy.labels.live : copy.resultEmptyDescription}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 px-3 py-2 text-[11px] font-medium tracking-[0.16em] text-slate-300 uppercase">
                      {result ? copy.labels.live : copy.labels.sample}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="overflow-hidden rounded-[22px] border border-white/8 bg-slate-900/60">
                      {preview.coverUrl ? (
                        <img
                          src={preview.coverUrl}
                          alt={preview.description}
                          className="h-full min-h-56 w-full object-cover"
                        />
                      ) : (
                        <div className="flex min-h-56 flex-col justify-between bg-[linear-gradient(145deg,rgba(14,165,233,0.16),rgba(15,23,42,0.92),rgba(34,197,94,0.12))] p-5">
                          <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-medium tracking-[0.16em] text-slate-200 uppercase">
                            {result ? copy.labels.live : copy.labels.sample}
                          </div>
                          <div className="space-y-2">
                            <p className="max-w-52 text-sm leading-6 text-slate-100">
                              {result
                                ? preview.description
                                : copy.resultEmptyTitle}
                            </p>
                            <div className="text-xs text-slate-300">
                              {preview.authorNickname}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-[20px] border border-white/8 bg-white/[0.04] p-4">
                        <div className="text-base font-semibold text-white">
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

                      <div className="rounded-[20px] border border-white/8 bg-white/[0.04] p-4">
                        <div className="text-[11px] font-medium tracking-[0.16em] text-slate-400 uppercase">
                          {copy.labels.payload}
                        </div>
                        <div className="mt-3 rounded-2xl bg-[#050c17] px-4 py-3 font-mono text-xs leading-6 text-sky-100">
                          {truncateUrl(preview.videoUrl)}
                        </div>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <a
                            href={preview.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-sky-300/16 bg-sky-300/10 px-4 py-3 text-sm font-medium text-sky-100 transition-colors duration-200 hover:bg-sky-300/14"
                          >
                            <ExternalLinkIcon className="size-4" />
                            {copy.openVideo}
                          </a>
                          <button
                            type="button"
                            onClick={handleCopy}
                            disabled={!result}
                            className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
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
        className="border-b border-white/8 bg-[#07111c] py-18 scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="text-sm font-medium tracking-[0.18em] text-sky-200 uppercase">
              {copy.outputsEyebrow}
            </div>
            <h2 className="text-4xl font-semibold text-white">
              {copy.outputsTitle}
            </h2>
            <p className="text-base leading-8 text-slate-300">
              {copy.outputsDescription}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {copy.outputs.map(([title, body]) => (
              <div
                key={title}
                className="rounded-[22px] border border-white/8 bg-white/[0.04] p-6"
              >
                <div className="text-lg font-semibold text-white">{title}</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-18">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
          <div className="space-y-4">
            <div className="text-sm font-medium tracking-[0.18em] text-sky-200 uppercase">
              {copy.flowEyebrow}
            </div>
            <h2 className="text-4xl font-semibold text-white">
              {copy.flowTitle}
            </h2>
            <p className="max-w-xl text-base leading-8 text-slate-300">
              {copy.flowDescription}
            </p>
          </div>

          <div className="space-y-4">
            {copy.flow.map(([title, body], index) => (
              <div
                key={title}
                className="rounded-[22px] border border-white/8 bg-white/[0.04] p-6"
              >
                <div className="flex items-start gap-5">
                  <div className="rounded-2xl border border-sky-300/16 bg-sky-300/8 px-3 py-2 text-[11px] font-medium tracking-[0.16em] text-sky-100 uppercase">
                    {`0${index + 1}`}
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">
                      {title}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faqs"
        className="border-t border-white/8 bg-[#07111c] py-18 scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-sm font-medium tracking-[0.18em] text-sky-200 uppercase">
              {copy.faqTitle}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {copy.faqs.map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-[22px] border border-white/8 bg-white/[0.04] p-6 open:bg-white/[0.06]"
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-white">
                  {question}
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleParse()}
              className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-sky-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5"
            >
              {copy.ctaPrimary}
              <ArrowRightIcon className="size-4" />
            </button>
            <LocaleLink
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-white/8 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/[0.08]"
            >
              {copy.ctaSecondary}
            </LocaleLink>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
      <div className="text-[11px] font-medium tracking-[0.16em] text-slate-500 uppercase">
        {label}
      </div>
      <div className="mt-2 text-sm text-slate-100">{value}</div>
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
