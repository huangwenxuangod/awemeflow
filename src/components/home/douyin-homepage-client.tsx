'use client';

import { LocaleLink } from '@/i18n/navigation';
import type { DouyinVideoResult } from '@/lib/douyin/types';
import { cn } from '@/lib/utils';
import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  SearchIcon,
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
    badge: '抖音视频解析',
    title: '抖音视频无水印解析下载',
    description:
      '粘贴抖音分享链接、分享文案或作品 ID，一键解析视频地址、封面、作者和基础元数据。',
    inputPlaceholder: '粘贴抖音分享链接或分享文案到这里',
    parseButton: '立即解析',
    parsingButton: '解析中...',
    ratioLabel: '输出规格',
    examplesLabel: '示例',
    examples: [
      'https://v.douyin.com/abcdefg/',
      'https://www.douyin.com/video/7512345678901234567',
      '作品 ID 7512345678901234567',
    ],
    trustBar: ['免费使用', '无需登录', '支持分享文案', '支持作品 ID'],
    stats: [
      ['支持输入', '短链 / 长链 / 文案 / ID'],
      ['解析结果', '视频地址 / 封面 / 作者'],
      ['使用方式', '打开 / 复制 / 后续下载'],
    ],
    resultTitle: '解析结果',
    resultEmpty: '解析成功后，视频地址和作品信息会显示在这里。',
    resultLive: '实时结果',
    resultSample: '演示结果',
    openVideo: '打开视频',
    copyVideo: '复制地址',
    copied: '已复制',
    errorEmpty: '先粘贴一个抖音链接或作品 ID',
    errorFallback: '解析失败，请稍后重试',
    featureTitle: '支持内容',
    features: [
      '抖音分享短链',
      '抖音视频页链接',
      '分享口令文案',
      '作品 ID 输入',
    ],
    stepsTitle: '使用方法',
    steps: [
      ['复制抖音分享链接', '从抖音 App 或网页复制分享内容。'],
      ['粘贴到输入框', '支持短链、长链、口令文案和作品 ID。'],
      ['点击立即解析', '拿到视频地址、封面、作者和分辨率信息。'],
    ],
    faqTitle: '常见问题',
    faqs: [
      [
        '解析后返回什么？',
        '当前返回视频地址、封面、作者信息和基础元数据，适合直接打开或继续下载处理。',
      ],
      [
        '需要登录吗？',
        '不需要，这一版默认匿名可用。',
      ],
      [
        '为什么有时解析失败？',
        '主要和上游分享页稳定性有关，刷新后重试通常可以恢复。',
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
    badge: 'Douyin parser',
    title: 'Douyin video parser',
    description:
      'Paste a Douyin share link, share text, or aweme ID to get the video URL, cover, author, and base metadata instantly.',
    inputPlaceholder: 'Paste a Douyin share link or share text here',
    parseButton: 'Parse now',
    parsingButton: 'Parsing...',
    ratioLabel: 'Output',
    examplesLabel: 'Examples',
    examples: [
      'https://v.douyin.com/abcdefg/',
      'https://www.douyin.com/video/7512345678901234567',
      'aweme_id 7512345678901234567',
    ],
    trustBar: ['Free to use', 'No login', 'Share text supported', 'Works with aweme ID'],
    stats: [
      ['Input', 'Short link / long link / text / ID'],
      ['Output', 'Video URL / cover / author'],
      ['Usage', 'Open / copy / download next'],
    ],
    resultTitle: 'Parsed result',
    resultEmpty: 'After parsing, the video URL and asset metadata will appear here.',
    resultLive: 'Live result',
    resultSample: 'Sample result',
    openVideo: 'Open video',
    copyVideo: 'Copy URL',
    copied: 'Copied',
    errorEmpty: 'Paste a Douyin link or aweme ID first',
    errorFallback: 'Parsing failed, please try again',
    featureTitle: 'Supported input',
    features: [
      'Douyin short links',
      'Douyin video page URLs',
      'Share text content',
      'Raw aweme IDs',
    ],
    stepsTitle: 'How to use',
    steps: [
      ['Copy the share link', 'Copy the share content from the Douyin app or web page.'],
      ['Paste into the box', 'Short links, long links, share text, and aweme IDs all work.'],
      ['Click parse now', 'Get the video URL, cover, author, and resolution data.'],
    ],
    faqTitle: 'FAQs',
    faqs: [
      [
        'What does the parser return?',
        'It returns the video URL, cover, author data, and base metadata for direct use or download handling.',
      ],
      [
        'Do I need to log in?',
        'No. This release is anonymous-friendly by default.',
      ],
      [
        'Why does parsing sometimes fail?',
        'It is usually caused by upstream share-page instability. Refreshing and retrying often works.',
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
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#f7fbff_0%,#eef5ff_34%,#f5f7fb_100%)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-12 pt-16 text-center sm:px-6 lg:px-8 lg:pb-16">
          <div className="rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-semibold tracking-[0.2em] text-sky-700 uppercase shadow-sm">
            {copy.badge}
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.1] text-slate-950 sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            {copy.description}
          </p>

          <div className="mt-9 w-full max-w-5xl rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={copy.inputPlaceholder}
                    className="min-h-32 w-full resize-none bg-transparent text-sm leading-7 text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleParse()}
                  disabled={isPending}
                  className="inline-flex min-h-[128px] min-w-[170px] items-center justify-center gap-2 rounded-[22px] bg-sky-500 px-6 py-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-sky-600 disabled:opacity-70"
                >
                  {isPending ? (
                    <LoaderCircleIcon className="size-5 animate-spin" />
                  ) : (
                    <SearchIcon className="size-5" />
                  )}
                  {isPending ? copy.parsingButton : copy.parseButton}
                </button>
              </div>

              <div className="flex flex-col gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-left lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    {copy.ratioLabel}
                  </span>
                  {ratioOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRatio(option)}
                      className={cn(
                        'rounded-full border px-3 py-2 text-xs font-semibold transition-colors duration-200',
                        ratio === option
                          ? 'border-sky-500 bg-sky-500 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    {copy.examplesLabel}
                  </span>
                  {copy.examples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => handleParse(example)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:text-slate-900"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {error ? (
                <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {copy.trustBar.map((item) => (
              <div
                key={item}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 grid w-full max-w-4xl gap-3 sm:grid-cols-3">
            {copy.stats.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[20px] border border-slate-200 bg-white px-5 py-4 text-left shadow-sm"
              >
                <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                  {label}
                </div>
                <div className="mt-2 text-sm font-medium text-slate-900">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    {copy.resultTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {result ? copy.resultLive : copy.resultEmpty}
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                  {result ? copy.resultLive : copy.resultSample}
                </div>
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
                  {preview.coverUrl ? (
                    <img
                      src={preview.coverUrl}
                      alt={preview.description}
                      className="h-full min-h-72 w-full object-cover"
                    />
                  ) : (
                    <div className="flex min-h-72 flex-col justify-between bg-[linear-gradient(180deg,#dbeafe_0%,#eff6ff_100%)] p-6">
                      <div className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-sky-700">
                        {result ? copy.resultLive : copy.resultSample}
                      </div>
                      <div>
                        <p className="max-w-xs text-lg font-semibold leading-8 text-slate-900">
                          {preview.description}
                        </p>
                        <div className="mt-3 text-sm text-slate-600">
                          {preview.authorNickname}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="text-base font-semibold text-slate-950">
                      {preview.description}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                      {copy.labels.payload}
                    </div>
                    <div className="mt-3 rounded-[18px] border border-slate-200 bg-white px-4 py-4 font-mono text-xs leading-6 text-slate-700">
                      {truncateUrl(preview.videoUrl)}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <a
                        href={preview.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-sky-600"
                      >
                        <ExternalLinkIcon className="size-4" />
                        {copy.openVideo}
                      </a>
                      <button
                        type="button"
                        onClick={handleCopy}
                        disabled={!result}
                        className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {copied ? (
                          <CheckIcon className="size-4 text-emerald-600" />
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

            <div className="space-y-6">
              <section
                id="features"
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-6"
              >
                <h3 className="text-xl font-semibold text-slate-950">
                  {copy.featureTitle}
                </h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {copy.features.map((item) => (
                    <div
                      key={item}
                      className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-6">
                <h3 className="text-xl font-semibold text-slate-950">
                  {copy.stepsTitle}
                </h3>
                <div className="mt-5 space-y-3">
                  {copy.steps.map(([title, body], index) => (
                    <div
                      key={title}
                      className="rounded-[20px] border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-950">
                            {title}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {body}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <section id="faqs" className="pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-slate-950">
                {copy.faqTitle}
              </h3>
              <LocaleLink
                href="/contact"
                className="text-sm font-semibold text-sky-600 transition-colors duration-200 hover:text-sky-700"
              >
                Contact
              </LocaleLink>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {copy.faqs.map(([question, answer]) => (
                <div
                  key={question}
                  className="rounded-[20px] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="text-sm font-semibold leading-6 text-slate-950">
                    {question}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {answer}
                  </p>
                </div>
              ))}
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
      <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
        {label}
      </div>
      <div className="mt-2 text-sm text-slate-900">{value}</div>
    </div>
  );
}
