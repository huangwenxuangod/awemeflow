'use client';

import { LocaleLink } from '@/i18n/navigation';
import type { DouyinInputType, DouyinVideoResult } from '@/lib/douyin/types';
import { cn } from '@/lib/utils';
import {
  CheckCircle2Icon,
  CheckIcon,
  CircleAlertIcon,
  CopyIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FilmIcon,
  Link2Icon,
  LoaderCircleIcon,
  SearchIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';

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

type ParseStage = 'idle' | 'identify' | 'normalize' | 'resolve' | 'done';

const content = {
  zh: {
    badge: 'AwemeFlow',
    title: '抖音视频解析工作台',
    description:
      '把短链、长链、分享文案或作品 ID 统一识别为标准作品链接，并直接返回视频地址、封面和作者信息。',
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
    trustBar: ['统一转标准长链', '无需登录', '结果可复制', '失败原因明确'],
    featureTitle: '支持这些输入方式',
    featureCards: [
      ['短链接识别', '先展开抖音短链，再尽量统一收敛为标准作品链接。'],
      ['视频页链接', '直接识别视频详情页，优先走最稳定的作品解析链路。'],
      ['分享文案识别', '整段分享文案也可以贴进来，系统会先提取可解析对象。'],
      ['作品 ID 直达', '作品 ID 会直接转成标准长链，适合批量和程序化处理。'],
    ],
    stepsTitle: '当前解析流程',
    steps: [
      ['识别输入类型', '先判断你贴进来的是作品 ID、视频页、短链还是分享文案。'],
      ['标准化作品链接', '把可识别输入尽量统一转换成标准长链，减少后续歧义。'],
      ['生成可操作结果', '清晰展示作者、封面、标准长链和视频地址，支持直接复制。'],
    ],
    stageTitle: '解析进度',
    stageItems: [
      ['identify', '识别输入类型'],
      ['normalize', '统一标准长链'],
      ['resolve', '获取作品与视频地址'],
      ['done', '结果准备完成'],
    ] as const,
    workbenchTitle: '解析结果工作台',
    resultEmpty: '解析完成后，这里会展示标准作品链接、视频地址和核心元数据。',
    resultLive: '实时结果',
    resultSample: '演示结果',
    resultHint: '优先确认标准长链，再决定复制视频地址、打开原页或继续下载处理。',
    openVideo: '打开视频',
    openSource: '打开原作品',
    copyVideo: '复制视频地址',
    copyCanonical: '复制标准长链',
    copied: '已复制',
    errorEmpty: '先粘贴一个抖音链接、分享文案或作品 ID',
    errorFallback: '解析失败，请稍后重试',
    canonicalLabel: '标准长链',
    resolvedLabel: '解析入口',
    stagePending: '等待开始',
    stageRunning: '处理中',
    stageDone: '已完成',
    statusTitle: '当前识别',
    statusDetected: '已识别',
    statusFallback: '等待输入',
    faqTitle: '常见问题',
    faqs: [
      [
        '为什么要统一转成长链？',
        '因为作品 ID 和标准长链最稳定，统一后结果更清楚，也更方便复制和追踪。',
      ],
      [
        '为什么有些短链还是不行？',
        '部分短链会跳到用户主页而不是作品页，这类输入在纯后端环境里无法稳定还原成具体作品。',
      ],
      [
        '最佳输入方式是什么？',
        '优先使用视频详情页链接、分享页链接或作品 ID，这三种是目前最稳定的主链路。',
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
      inputType: '输入类型',
    },
    sourceValue: '抖音分享页',
    contactLabel: '联系',
    sample: {
      awemeId: '7380678787580562707',
      canonicalUrl: 'https://www.douyin.com/video/7380678787580562707',
      resolvedUrl: 'https://www.iesdouyin.com/share/video/7380678787580562707/',
      inputType: 'video_url' as DouyinInputType,
      description: '解析成功后，这里会展示标准作品链接和核心结果。',
      authorNickname: '示例作者',
      coverUrl: '',
      videoUrl: 'https://aweme.snssdk.com/aweme/v1/play/?video_id=sample-token',
      width: 1080,
      height: 1920,
      format: 'mp4',
      sourcePage: 'https://www.douyin.com/video/sample',
      createTimeText: '等待真实解析结果',
      bitRate: 0,
      createTime: null,
      shareUrl: 'https://www.douyin.com/video/sample',
      videoUri: 'sample-token',
      gearName: 'play_addr',
      qualityType: null,
      dataSize: 0,
      authorUid: '',
      authorSecUid: '',
    },
  },
  en: {
    badge: 'AwemeFlow',
    title: 'Douyin Parsing Workbench',
    description:
      'Normalize short links, long links, share text, or aweme IDs into a canonical asset URL, then expose the video URL, cover, and author data clearly.',
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
    trustBar: ['Canonical long URL first', 'No login', 'Copy-ready output', 'Clear failure reasons'],
    featureTitle: 'Supported input types',
    featureCards: [
      ['Short links', 'Expand Douyin short links first, then normalize them into canonical asset URLs when possible.'],
      ['Video page URLs', 'Use the most stable route by resolving full video detail URLs directly.'],
      ['Share text parsing', 'Paste the entire share message and the parser will extract the parseable asset.'],
      ['Aweme IDs', 'Raw aweme IDs are converted into canonical long URLs immediately.'],
    ],
    stepsTitle: 'Current parsing flow',
    steps: [
      ['Identify the input', 'Detect whether the input is an aweme ID, video URL, short link, or share text.'],
      ['Normalize the asset URL', 'Convert the supported input into a canonical long URL whenever possible.'],
      ['Generate action-ready output', 'Show author, cover, canonical URL, and video URL in one clear workbench.'],
    ],
    stageTitle: 'Parsing progress',
    stageItems: [
      ['identify', 'Identify input type'],
      ['normalize', 'Normalize canonical URL'],
      ['resolve', 'Fetch asset and video URL'],
      ['done', 'Prepare result'],
    ] as const,
    workbenchTitle: 'Result workbench',
    resultEmpty: 'After parsing, this area will show the canonical asset URL, video URL, and core metadata.',
    resultLive: 'Live result',
    resultSample: 'Sample result',
    resultHint: 'Confirm the canonical URL first, then copy the video URL, open the source page, or continue into download handling.',
    openVideo: 'Open video',
    openSource: 'Open source page',
    copyVideo: 'Copy video URL',
    copyCanonical: 'Copy canonical URL',
    copied: 'Copied',
    errorEmpty: 'Paste a Douyin link, share text, or aweme ID first',
    errorFallback: 'Parsing failed, please try again',
    canonicalLabel: 'Canonical URL',
    resolvedLabel: 'Resolved from',
    stagePending: 'Pending',
    stageRunning: 'Running',
    stageDone: 'Done',
    statusTitle: 'Detected input',
    statusDetected: 'Detected',
    statusFallback: 'Waiting for input',
    faqTitle: 'FAQs',
    faqs: [
      [
        'Why normalize into a long URL?',
        'Aweme IDs and canonical long URLs are the clearest and most stable asset representations for users and systems.',
      ],
      [
        'Why do some short links still fail?',
        'Some short links redirect to user profile pages instead of a specific asset page, which cannot be resolved reliably in a server-only flow.',
      ],
      [
        'What is the best input type?',
        'Prefer a video detail URL, a share-video page URL, or a raw aweme ID for the most stable parsing path.',
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
      inputType: 'Input type',
    },
    sourceValue: 'Douyin share page',
    contactLabel: 'Contact',
    sample: {
      awemeId: '7380678787580562707',
      canonicalUrl: 'https://www.douyin.com/video/7380678787580562707',
      resolvedUrl: 'https://www.iesdouyin.com/share/video/7380678787580562707/',
      inputType: 'video_url' as DouyinInputType,
      description: 'A successful parse will show the canonical asset URL and the core result set here.',
      authorNickname: 'Sample author',
      coverUrl: '',
      videoUrl: 'https://aweme.snssdk.com/aweme/v1/play/?video_id=sample-token',
      width: 1080,
      height: 1920,
      format: 'mp4',
      sourcePage: 'https://www.douyin.com/video/sample',
      createTimeText: 'Waiting for a real parse result',
      bitRate: 0,
      createTime: null,
      shareUrl: 'https://www.douyin.com/video/sample',
      videoUri: 'sample-token',
      gearName: 'play_addr',
      qualityType: null,
      dataSize: 0,
      authorUid: '',
      authorSecUid: '',
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

function detectInputType(value: string): DouyinInputType | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/\b\d{16,25}\b/.test(trimmed) && !trimmed.includes('http')) {
    return 'aweme_id';
  }

  if (trimmed.includes('v.douyin.com')) {
    return 'short_link';
  }

  if (trimmed.includes('/share/video/')) {
    return 'share_video_url';
  }

  if (trimmed.includes('/video/')) {
    return 'video_url';
  }

  if (trimmed.includes('http')) {
    return 'share_text';
  }

  return 'share_text';
}

function getInputTypeLabel(type: DouyinInputType | null, locale: SupportedLocale) {
  const map = {
    zh: {
      aweme_id: '作品 ID',
      video_url: '视频详情页链接',
      share_video_url: '分享视频页链接',
      short_link: '抖音短链',
      share_text: '分享文案',
    },
    en: {
      aweme_id: 'Aweme ID',
      video_url: 'Video detail URL',
      share_video_url: 'Share-video URL',
      short_link: 'Short link',
      share_text: 'Share text',
    },
  } as const;

  return type ? map[locale][type] : '';
}

function getStageState(stage: ParseStage, current: ParseStage) {
  const order: ParseStage[] = ['idle', 'identify', 'normalize', 'resolve', 'done'];
  const currentIndex = order.indexOf(current);
  const stageIndex = order.indexOf(stage);

  if (current === 'idle') {
    return 'pending';
  }

  if (stageIndex < currentIndex) {
    return 'done';
  }

  if (stageIndex === currentIndex) {
    return 'running';
  }

  return 'pending';
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
  const [copiedField, setCopiedField] = useState<'video' | 'canonical' | null>(null);
  const [parseStage, setParseStage] = useState<ParseStage>('idle');
  const [isPending, startTransition] = useTransition();

  const preview = result ?? copy.sample;
  const inferredType = useMemo(() => detectInputType(input), [input]);
  const activeType = result?.inputType ?? inferredType;

  const handleParse = (value?: string) => {
    const nextValue = (value ?? input).trim();

    if (!nextValue) {
      setError(copy.errorEmpty);
      setParseStage('idle');
      return;
    }

    setInput(nextValue);
    setError('');
    setCopiedField(null);
    setParseStage('identify');

    startTransition(() => {
      void parseInput(nextValue);
    });
  };

  const parseInput = async (nextValue: string) => {
    try {
      setParseStage('normalize');
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

      setParseStage('resolve');

      const payload =
        (await response.json()) as ApiSuccessResponse | ApiErrorResponse;

      if (!response.ok || payload.code !== 0 || !('data' in payload)) {
        throw new Error(getApiErrorMessage(payload, copy.errorFallback));
      }

      setResult(payload.data);
      setParseStage('done');
    } catch (parseError) {
      setResult(null);
      setError(
        parseError instanceof Error ? parseError.message : copy.errorFallback
      );
      setParseStage('idle');
    }
  };

  const handleCopy = async (field: 'video' | 'canonical', value: string) => {
    if (!result || !value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1600);
  };

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <section className="border-b border-[#ececec]">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 md:pb-16 lg:px-8 lg:pb-18">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full border border-[#e8e8e8] bg-[#fafafa] px-4 py-2 text-xs font-medium text-[#4b5563]">
              {copy.badge}
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#111111] sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[#6b7280] sm:text-lg">
              {copy.description}
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-6xl rounded-[24px] border border-[#e9e9e9] bg-white p-4 sm:p-5">
            <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-[18px] border border-[#ececec] bg-[#fcfcfc] p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="flex min-h-[58px] flex-1 items-center rounded-[16px] border border-[#e5e7eb] bg-white px-4">
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

                <div className="mt-4 flex flex-col gap-4 border-t border-[#efefef] pt-4">
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

                  <div className="rounded-[16px] border border-[#ececec] bg-white p-4">
                    <div className="text-xs text-[#6b7280]">{copy.statusTitle}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f5] px-3 py-1.5 text-sm text-[#111111]">
                        <CheckCircle2Icon className="size-4 text-[#16a34a]" />
                        {activeType
                          ? `${copy.statusDetected}：${getInputTypeLabel(activeType, pageLocale)}`
                          : copy.statusFallback}
                      </div>
                      {preview.awemeId ? (
                        <div className="rounded-full border border-[#e5e7eb] px-3 py-1.5 text-xs text-[#4b5563]">
                          ID {preview.awemeId}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
                    {copy.trustBar.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white px-3 py-1.5 text-[#4b5563]"
                      >
                        {item}
                      </span>
                    ))}
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

              <div className="rounded-[18px] border border-[#ececec] bg-[#fcfcfc] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-medium text-[#111111]">
                    {copy.stageTitle}
                  </h2>
                  <div className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-xs text-[#4b5563]">
                    {parseStage === 'done'
                      ? copy.stageDone
                      : isPending || parseStage !== 'idle'
                        ? copy.stageRunning
                        : copy.stagePending}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {copy.stageItems.map(([stageKey, label]) => {
                    const state = getStageState(stageKey, parseStage);

                    return (
                      <div
                        key={stageKey}
                        className="flex items-center gap-3 rounded-[14px] border border-[#e9e9e9] bg-white px-4 py-3"
                      >
                        <div
                          className={cn(
                            'flex size-8 items-center justify-center rounded-full text-xs font-medium',
                            state === 'done' &&
                              'bg-[#111111] text-white',
                            state === 'running' &&
                              'bg-[#e8eefc] text-[#1d4ed8]',
                            state === 'pending' &&
                              'bg-[#f3f4f6] text-[#6b7280]'
                          )}
                        >
                          {state === 'done' ? (
                            <CheckIcon className="size-4" />
                          ) : state === 'running' ? (
                            <LoaderCircleIcon className="size-4 animate-spin" />
                          ) : (
                            <span>·</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-[#111111]">
                            {label}
                          </div>
                        </div>
                        <div className="text-xs text-[#6b7280]">
                          {state === 'done'
                            ? copy.stageDone
                            : state === 'running'
                              ? copy.stageRunning
                              : copy.stagePending}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-[14px] border border-[#e9e9e9] bg-white p-4">
                  <div className="text-xs text-[#6b7280]">{copy.canonicalLabel}</div>
                  <div className="mt-2 break-all text-sm leading-6 text-[#111111]">
                    {preview.canonicalUrl || copy.resultEmpty}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-[#efefef] bg-[#fcfcfc]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#111111]">
                {copy.workbenchTitle}
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

                <div className="mt-6 space-y-4">
                  <WorkbenchField
                    label={copy.canonicalLabel}
                    value={preview.canonicalUrl}
                    actionLabel={
                      copiedField === 'canonical' ? copy.copied : copy.copyCanonical
                    }
                    onAction={() =>
                      handleCopy('canonical', preview.canonicalUrl)
                    }
                    disabled={!result}
                  />
                  <WorkbenchField
                    label={copy.resolvedLabel}
                    value={preview.resolvedUrl}
                    muted
                  />
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <InfoCell label={copy.labels.inputType} value={getInputTypeLabel(preview.inputType, pageLocale)} />
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
                </div>
              </div>

              <div className="rounded-[18px] border border-[#e9e9e9] bg-white p-6">
                <WorkbenchField
                  label={copy.labels.payload}
                  value={truncateUrl(preview.videoUrl)}
                  actionLabel={copiedField === 'video' ? copy.copied : copy.copyVideo}
                  onAction={() => handleCopy('video', preview.videoUrl)}
                  disabled={!result}
                />

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
                  <a
                    href={preview.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#111111] transition-colors duration-200 hover:border-[#d1d5db]"
                  >
                    <Link2Icon className="size-4" />
                    {copy.openSource}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#efefef] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-[#111111]">
            {copy.featureTitle}
          </h2>

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

      <section id="steps" className="border-b border-[#efefef] bg-[#fcfcfc]">
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

function WorkbenchField({
  label,
  value,
  actionLabel,
  onAction,
  disabled,
  muted = false,
}: {
  label: string;
  value: string;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-[#6b7280]">{label}</div>
      <div className="mt-2 rounded-[14px] border border-[#ececec] bg-[#fafafa] px-4 py-4 text-sm leading-6 text-[#111111]">
        <div className={cn('break-all', muted && 'text-[#6b7280]')}>{value}</div>
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#111111] transition-colors duration-200 hover:border-[#d1d5db] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CopyIcon className="size-4" />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
