'use client';

import { LocaleLink } from '@/i18n/navigation';
import type { DouyinVideoResult } from '@/lib/douyin/types';
import { cn } from '@/lib/utils';
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FilmIcon,
  Link2Icon,
  LoaderCircleIcon,
  SearchIcon,
  ShieldCheckIcon,
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

const featureToneClasses = [
  'bg-[#f5f7ff]',
  'bg-[#f8f5ff]',
  'bg-[#f3fbff]',
  'bg-[#f9f9f9]',
] as const;

const iconToneClasses = [
  'bg-[#e6ebff] text-[#3f5efb]',
  'bg-[#efe7ff] text-[#7c3aed]',
  'bg-[#e7f6ff] text-[#0f7ec7]',
  'bg-[#ededed] text-[#111111]',
] as const;

const content = {
  zh: {
    badge: 'AwemeFlow',
    title: '抖音视频无水印解析',
    description:
      '粘贴抖音分享链接、分享文案或作品 ID，直接返回视频地址、封面、作者和基础信息。',
    inputPlaceholder: '请粘贴抖音分享链接、分享文案或作品 ID',
    parseButton: '开始解析',
    parsingButton: '解析中',
    ratioLabel: '清晰度',
    examplesLabel: '示例输入',
    examples: [
      'https://www.douyin.com/video/7380678787580562707',
      'https://www.iesdouyin.com/share/video/7380678787580562707/',
      '作品 ID 7380678787580562707',
    ],
    trustBar: ['免费使用', '无需登录', '支持短链 / 长链', '支持分享文案 / 作品 ID'],
    featureTitle: '支持这些输入方式',
    featureCards: [
      ['短链接解析', '直接粘贴抖音分享短链，自动提取真实作品地址。'],
      ['视频页链接', '支持完整视频页链接，适合网页端直接复制使用。'],
      ['分享文案识别', '把带口令的分享文案整段粘贴进来，也能自动识别。'],
      ['作品 ID 解析', '只输入作品 ID 也可以，适合脚本或批量处理场景。'],
    ],
    stepsTitle: '使用方法',
    steps: [
      ['复制分享内容', '从抖音 App 或网页复制分享链接、文案或作品 ID。'],
      ['粘贴到输入框', '首页第一屏直接粘贴，不需要登录，也不需要跳转。'],
      ['获取解析结果', '马上看到视频地址、封面、作者信息，并可复制或打开。'],
    ],
    resultTitle: '解析结果',
    resultEmpty: '解析完成后，视频地址和作品信息会显示在这里。',
    resultLive: '实时结果',
    resultSample: '演示结果',
    resultHint: '返回结果适合直接打开、复制链接，或继续接到下载流程。',
    openVideo: '打开视频',
    copyVideo: '复制地址',
    copied: '已复制',
    errorEmpty: '先粘贴一个抖音链接、分享文案或作品 ID',
    errorFallback: '解析失败，请稍后重试',
    faqTitle: '常见问题',
    faqs: [
      [
        '支持什么格式？',
        '支持抖音分享短链、完整视频页链接、分享文案，以及纯作品 ID 输入。',
      ],
      [
        '需要注册账号吗？',
        '不需要，这个页面默认匿名可用，打开就能直接解析。',
      ],
      [
        '为什么偶尔会失败？',
        '通常是上游分享页波动导致，刷新后重新提交一次多数可以恢复。',
      ],
    ],
    labels: {
      author: '作者',
      resolution: '分辨率',
      format: '格式',
      published: '发布时间',
      bitrate: '码率',
      source: '来源',
      payload: '视频地址',
    },
    sourceValue: '抖音分享页',
    contactLabel: '联系',
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
  },
  en: {
    badge: 'AwemeFlow',
    title: 'Douyin Video Parser',
    description:
      'Paste a Douyin share link, share text, or aweme ID to get the video URL, cover, author, and base metadata right away.',
    inputPlaceholder: 'Paste a Douyin share link, share text, or aweme ID',
    parseButton: 'Parse now',
    parsingButton: 'Parsing',
    ratioLabel: 'Quality',
    examplesLabel: 'Examples',
    examples: [
      'https://www.douyin.com/video/7380678787580562707',
      'https://www.iesdouyin.com/share/video/7380678787580562707/',
      'aweme_id 7380678787580562707',
    ],
    trustBar: ['Free to use', 'No login', 'Short and full links', 'Share text and aweme ID'],
    featureTitle: 'Supported input types',
    featureCards: [
      ['Short links', 'Paste a Douyin short share link and extract the real asset source.'],
      ['Video page URLs', 'Full video page URLs are supported for direct web workflows.'],
      ['Share text parsing', 'Paste the whole share message and the parser will detect the asset.'],
      ['Aweme IDs', 'Raw aweme IDs also work for script-driven or batch scenarios.'],
    ],
    stepsTitle: 'How it works',
    steps: [
      ['Copy the share content', 'Copy a link, share text, or aweme ID from Douyin.'],
      ['Paste into the box', 'Use the parser immediately on the first screen with no sign-in.'],
      ['Get the result', 'Open the video URL, copy it, and inspect the basic metadata.'],
    ],
    resultTitle: 'Parsed result',
    resultEmpty: 'After parsing, the video URL and asset details will appear here.',
    resultLive: 'Live result',
    resultSample: 'Sample result',
    resultHint: 'Use the returned URL directly, or pass it into your next download step.',
    openVideo: 'Open video',
    copyVideo: 'Copy URL',
    copied: 'Copied',
    errorEmpty: 'Paste a Douyin link, share text, or aweme ID first',
    errorFallback: 'Parsing failed, please try again',
    faqTitle: 'FAQs',
    faqs: [
      [
        'What input types are supported?',
        'Short links, full video page URLs, share text content, and raw aweme IDs are all supported.',
      ],
      [
        'Do I need an account?',
        'No. The parser is anonymous-friendly and ready to use on page load.',
      ],
      [
        'Why does it sometimes fail?',
        'That is usually caused by upstream share-page instability. Retrying often fixes it.',
      ],
    ],
    labels: {
      author: 'Author',
      resolution: 'Resolution',
      format: 'Format',
      published: 'Published',
      bitrate: 'Bitrate',
      source: 'Source',
      payload: 'Video URL',
    },
    sourceValue: 'Douyin share page',
    contactLabel: 'Contact',
    sample: {
      description: 'A successful parse will show the asset summary and key metadata here.',
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
  if (url.length <= 88) {
    return url;
  }

  return `${url.slice(0, 54)}...${url.slice(-24)}`;
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
    <div className="min-h-screen bg-white text-[#111111]">
      <section className="border-b border-[#ececec]">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 md:pb-16 md:pt-18 lg:px-8 lg:pb-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full border border-[#e8e8e8] bg-[#fafafa] px-4 py-2 text-xs font-medium text-[#4b5563]">
              {copy.badge}
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6b7280] sm:text-lg">
              {copy.description}
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-5xl rounded-[20px] border border-[#e9e9e9] bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex min-h-[58px] flex-1 items-center rounded-[16px] border border-[#e5e7eb] bg-[#fafafa] px-4">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={copy.inputPlaceholder}
                  className="h-12 w-full border-0 bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#9ca3af] sm:text-[15px]"
                />
              </div>

              <button
                type="button"
                onClick={() => handleParse()}
                disabled={isPending}
                className="inline-flex h-[58px] shrink-0 items-center justify-center gap-2 rounded-[16px] bg-[#111111] px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#222222] disabled:opacity-70 sm:px-7 sm:text-[15px]"
              >
                {isPending ? (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                ) : (
                  <SearchIcon className="size-4" />
                )}
                {isPending ? copy.parsingButton : copy.parseButton}
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-3 border-t border-[#efefef] pt-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#6b7280]">{copy.ratioLabel}</span>
                  {ratioOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRatio(option)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs transition-colors duration-200',
                        ratio === option
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#e5e7eb] bg-white text-[#4b5563] hover:border-[#d1d5db] hover:text-[#111111]'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
                  {copy.trustBar.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-[#f5f5f5] px-3 py-1.5 text-[#4b5563]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
                <span>{copy.examplesLabel}</span>
                {copy.examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleParse(example)}
                    className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-left text-[#4b5563] transition-colors duration-200 hover:border-[#d1d5db] hover:text-[#111111]"
                  >
                    {example}
                  </button>
                ))}
              </div>

              {error ? (
                <div className="rounded-[14px] border border-[#fecaca] bg-[#fff7f7] px-4 py-3 text-sm text-[#b91c1c]">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#efefef] bg-[#fcfcfc]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#111111]">
                {copy.featureTitle}
              </h2>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {copy.featureCards.map(([title, body], index) => (
              <div
                key={title}
                className={cn(
                  'rounded-[16px] border border-[#e9e9e9] p-5',
                  featureToneClasses[index % featureToneClasses.length]
                )}
              >
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl',
                    iconToneClasses[index % iconToneClasses.length]
                  )}
                >
                  <FeatureIcon index={index} />
                </div>
                <div className="mt-4 text-base font-medium text-[#111111]">
                  {title}
                </div>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="steps" className="border-b border-[#efefef]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-[#111111]">
            {copy.stepsTitle}
          </h2>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {copy.steps.map(([title, body], index) => (
              <div
                key={title}
                className="rounded-[16px] border border-[#e9e9e9] bg-white p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-[#111111] text-sm font-medium text-white">
                  {index + 1}
                </div>
                <div className="mt-5 text-lg font-medium text-[#111111]">
                  {title}
                </div>
                <p className="mt-2 text-sm leading-6 text-[#6b7280]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-[#efefef] bg-[#fcfcfc]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#111111]">
                {copy.resultTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                {result ? copy.resultHint : copy.resultEmpty}
              </p>
            </div>
            <div className="inline-flex w-fit rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs text-[#4b5563]">
              {result ? copy.resultLive : copy.resultSample}
            </div>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="overflow-hidden rounded-[18px] border border-[#e9e9e9] bg-white">
              {preview.coverUrl ? (
                <img
                  src={preview.coverUrl}
                  alt={preview.description}
                  className="h-full min-h-[340px] w-full object-cover"
                />
              ) : (
                <div className="flex min-h-[340px] flex-col justify-between bg-[linear-gradient(180deg,#f5f7ff_0%,#fbfbfb_100%)] p-6">
                  <div className="inline-flex w-fit items-center rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs text-[#4b5563]">
                    {result ? copy.resultLive : copy.resultSample}
                  </div>
                  <div>
                    <div className="text-sm text-[#6b7280]">{copy.labels.author}</div>
                    <div className="mt-2 text-2xl font-medium text-[#111111]">
                      {preview.authorNickname}
                    </div>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-[#6b7280]">
                      {preview.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="rounded-[18px] border border-[#e9e9e9] bg-white p-6">
                <div className="text-lg font-medium leading-7 text-[#111111]">
                  {preview.description}
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <InfoCell label={copy.labels.author} value={preview.authorNickname} />
                  <InfoCell
                    label={copy.labels.resolution}
                    value={`${preview.width} x ${preview.height}`}
                  />
                  <InfoCell label={copy.labels.format} value={preview.format} />
                  <InfoCell
                    label={copy.labels.bitrate}
                    value={formatBitrate(preview.bitRate)}
                  />
                  <InfoCell
                    label={copy.labels.published}
                    value={preview.createTimeText}
                  />
                  <InfoCell label={copy.labels.source} value={copy.sourceValue} />
                </div>
              </div>

              <div className="rounded-[18px] border border-[#e9e9e9] bg-white p-6">
                <div className="text-xs text-[#6b7280]">{copy.labels.payload}</div>
                <div className="mt-3 rounded-[14px] border border-[#ececec] bg-[#fafafa] px-4 py-4 font-mono text-xs leading-6 text-[#374151]">
                  {truncateUrl(preview.videoUrl)}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={preview.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#111111] px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#222222]"
                  >
                    <ExternalLinkIcon className="size-4" />
                    {copy.openVideo}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!result}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#111111] transition-colors duration-200 hover:border-[#d1d5db] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {copied ? (
                      <CheckIcon className="size-4 text-[#16a34a]" />
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
      </section>

      <section id="faqs" className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-[#111111]">
              {copy.faqTitle}
            </h2>
            <LocaleLink
              href="/contact"
              className="text-sm text-[#4b5563] transition-colors duration-200 hover:text-[#111111]"
            >
              {copy.contactLabel}
            </LocaleLink>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {copy.faqs.map(([question, answer]) => (
              <div
                key={question}
                className="rounded-[16px] border border-[#e9e9e9] bg-white p-5"
              >
                <div className="text-base font-medium leading-7 text-[#111111]">
                  {question}
                </div>
                <p className="mt-3 text-sm leading-6 text-[#6b7280]">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureIcon({ index }: { index: number }) {
  const className = 'size-[18px]';

  switch (index) {
    case 0:
      return <Link2Icon className={className} />;
    case 1:
      return <FilmIcon className={className} />;
    case 2:
      return <FileTextIcon className={className} />;
    default:
      return <ShieldCheckIcon className={className} />;
  }
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[#6b7280]">{label}</div>
      <div className="mt-2 text-sm text-[#111111]">{value}</div>
    </div>
  );
}
