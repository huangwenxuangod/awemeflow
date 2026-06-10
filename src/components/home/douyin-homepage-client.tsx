'use client';

import { LocaleLink } from '@/i18n/navigation';
import type { DouyinInputType, DouyinVideoResult } from '@/lib/douyin/types';
import { cn } from '@/lib/utils';
import {
  CheckIcon,
  ClipboardIcon,
  CopyIcon,
  DownloadIcon,
  GlobeIcon,
  ImageIcon,
  LoaderCircleIcon,
  SearchIcon,
  SparklesIcon,
  VideoIcon,
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

const content = {
  zh: {
    brand: 'AwemeFlow',
    home: '首页',
    section: '抖音/图集',
    feedback: '问题反馈',
    language: 'ZH',
    title: '免费解析去水印工具',
    description:
      '免费解析抖音视频和图集，尽量统一转成长链，直接给你可见、可复制、可下载的结果。',
    placeholder: '请粘贴抖音视频链接、分享文案或作品 ID',
    paste: '粘贴',
    clear: '清除',
    parse: '解析视频',
    parsing: '解析中',
    resultTitle: '解析结果',
    emptyResult:
      '先贴一个可解析的抖音链接。解析成功后，这里会直接展示标题、长链、视频地址、封面和下载按钮。',
    detailTitle: '已识别内容',
    canonicalLabel: '标准长链',
    sourceLabel: '解析入口',
    videoLabel: '视频地址',
    inputTypeLabel: '输入类型',
    authorLabel: '作者',
    resolutionLabel: '画面尺寸',
    publishedLabel: '发布时间',
    downloadVideo: '下载无水印视频',
    downloadImage: '下载封面图片',
    copyLink: '复制链接',
    copyVideo: '复制视频地址',
    copied: '已复制',
    qualityTitle: '多清晰度选项',
    qualityCopy: '复制',
    features: [
      ['完全免费不限次数', '不做花活，先把解析和下载打通。'],
      ['无需注册/登录', '打开就能用，不让用户先过一堆门槛。'],
      ['直接看到解析结果', '标题、长链、封面、下载入口都摆在眼前。'],
      ['优先转成标准长链', '方便你确认解析到的到底是不是那条作品。'],
    ],
    howToTitle: '如何使用',
    steps: [
      ['复制链接', '从抖音复制视频链接、分享文案或者作品 ID。'],
      ['粘贴解析', '粘贴到输入框，点击“解析视频”。'],
      ['确认结果', '先看标题和标准长链，确认作品是不是你要的。'],
      ['直接下载', '点击下载视频、复制视频地址，或者保存封面图片。'],
    ],
    typeLabels: {
      aweme_id: '作品 ID',
      video_url: '视频详情页链接',
      share_video_url: '分享视频页链接',
      short_link: '抖音短链',
      share_text: '分享文案',
    },
    sample: {
      awemeId: '7380678787580562707',
      canonicalUrl: 'https://www.douyin.com/video/7380678787580562707',
      resolvedUrl: 'https://www.iesdouyin.com/share/video/7380678787580562707/',
      inputType: 'video_url' as DouyinInputType,
      description: '解析成功后，这里会直接显示作品标题和下载入口。',
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
    errors: {
      empty: '先粘贴一个抖音链接、分享文案或作品 ID',
      fallback: '解析失败，请稍后重试',
    },
  },
  en: {
    brand: 'AwemeFlow',
    home: 'Home',
    section: 'Douyin/Gallery',
    feedback: 'Feedback',
    language: 'EN',
    title: 'Free Douyin parser',
    description:
      'Parse Douyin videos and galleries, normalize to canonical long URLs when possible, and expose clear download-ready results.',
    placeholder: 'Paste a Douyin video URL, share text, or aweme ID',
    paste: 'Paste',
    clear: 'Clear',
    parse: 'Parse',
    parsing: 'Parsing',
    resultTitle: 'Result',
    emptyResult:
      'Paste a valid Douyin asset first. After parsing, this area will show the title, canonical URL, video URL, cover, and download actions.',
    detailTitle: 'Detected asset',
    canonicalLabel: 'Canonical URL',
    sourceLabel: 'Resolved from',
    videoLabel: 'Video URL',
    inputTypeLabel: 'Input type',
    authorLabel: 'Author',
    resolutionLabel: 'Resolution',
    publishedLabel: 'Published',
    downloadVideo: 'Download video',
    downloadImage: 'Download cover',
    copyLink: 'Copy link',
    copyVideo: 'Copy video URL',
    copied: 'Copied',
    qualityTitle: 'Quality options',
    qualityCopy: 'Copy',
    features: [
      ['Free to use', 'Keep the product focused on parsing and download first.'],
      ['No signup', 'Open the page and use it immediately.'],
      ['Visible results', 'Title, canonical URL, cover, and downloads stay upfront.'],
      ['Canonical URL first', 'Make it obvious which asset the parser actually resolved.'],
    ],
    howToTitle: 'How it works',
    steps: [
      ['Copy a link', 'Copy a Douyin URL, share text, or aweme ID.'],
      ['Paste and parse', 'Paste the input and click parse.'],
      ['Confirm the asset', 'Check the title and canonical URL first.'],
      ['Download directly', 'Download the video, copy the video URL, or save the cover image.'],
    ],
    typeLabels: {
      aweme_id: 'Aweme ID',
      video_url: 'Video detail URL',
      share_video_url: 'Share video URL',
      short_link: 'Short link',
      share_text: 'Share text',
    },
    sample: {
      awemeId: '7380678787580562707',
      canonicalUrl: 'https://www.douyin.com/video/7380678787580562707',
      resolvedUrl: 'https://www.iesdouyin.com/share/video/7380678787580562707/',
      inputType: 'video_url' as DouyinInputType,
      description: 'Successful parsing will show the asset title and download actions here.',
      authorNickname: 'Sample author',
      coverUrl: '',
      videoUrl: 'https://aweme.snssdk.com/aweme/v1/play/?video_id=sample-token',
      width: 1080,
      height: 1920,
      format: 'mp4',
      sourcePage: 'https://www.douyin.com/video/sample',
      createTimeText: 'Waiting for real result',
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
    errors: {
      empty: 'Paste a Douyin link, share text, or aweme ID first',
      fallback: 'Parsing failed, please try again',
    },
  },
} as const;

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

  if (trimmed.includes('/video/') || trimmed.includes('modal_id=')) {
    return 'video_url';
  }

  if (trimmed.includes('http')) {
    return 'share_text';
  }

  return 'share_text';
}

function formatFileSize(bytes: number) {
  if (!bytes || bytes <= 0) {
    return '';
  }

  const mb = bytes / 1024 / 1024;
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)}GB`;
  }

  return `${mb.toFixed(1)}MB`;
}

function buildQualityRows(result: DouyinVideoResult) {
  const baseSize = result.dataSize || 0;
  const width = result.width || 0;
  const height = result.height || 0;

  return ratioOptions.map((ratio, index) => {
    const scale =
      ratio === '1080p' ? 1 : ratio === '720p' ? 0.78 : 0.58;
    const nextWidth = width ? Math.round(width * scale) : 0;
    const nextHeight = height ? Math.round(height * scale) : 0;
    const size = baseSize ? Math.round(baseSize * scale * scale) : 0;

    return {
      ratio,
      label:
        nextWidth && nextHeight
          ? `${ratio} (${nextWidth}x${nextHeight})`
          : ratio,
      sizeLabel: formatFileSize(size),
      url: appendRatio(result.videoUrl, ratio),
      active: ratio === '1080p',
      index,
    };
  });
}

function appendRatio(url: string, ratio: string) {
  try {
    const next = new URL(url);
    next.searchParams.set('ratio', ratio);
    return next.toString();
  } catch {
    return url;
  }
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const inferredType = useMemo(() => detectInputType(input), [input]);
  const activeType = result?.inputType ?? inferredType;
  const qualityRows = useMemo(
    () => (result ? buildQualityRows(result) : []),
    [result]
  );

  const handleParse = (value?: string) => {
    const nextValue = (value ?? input).trim();

    if (!nextValue) {
      setError(copy.errors.empty);
      return;
    }

    setInput(nextValue);
    setError('');
    setCopiedField(null);

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
        throw new Error(getApiErrorMessage(payload, copy.errors.fallback));
      }

      setResult(payload.data);
    } catch (parseError) {
      setResult(null);
      setError(
        parseError instanceof Error ? parseError.message : copy.errors.fallback
      );
    }
  };

  const handlePaste = async () => {
    const nextValue = await navigator.clipboard.readText();
    if (!nextValue) {
      return;
    }
    setInput(nextValue);
    setError('');
  };

  const handleCopy = async (key: string, value: string) => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopiedField(key);
    window.setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <header className="sticky top-0 z-20 border-b border-[#f0f0f0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <LocaleLink
              href="/"
              className="text-[22px] font-bold tracking-tight text-[#7c3aed]"
            >
              {copy.brand}
            </LocaleLink>
            <nav className="hidden items-center gap-8 text-[15px] font-medium text-[#6b7280] sm:flex">
              <span className="border-b-2 border-[#8b5cf6] pb-2 text-[#8b5cf6]">
                {copy.home}
              </span>
              <span>{copy.section}</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#7c3aed,#a855f7)] px-5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(139,92,246,0.28)] sm:inline-flex"
            >
              <SparklesIcon className="size-4" />
              {copy.feedback}
            </button>
            <div className="inline-flex items-center gap-2 text-[15px] text-[#6b7280]">
              <GlobeIcon className="size-4" />
              {copy.language}
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-[#f4f4f5]">
          <div className="mx-auto max-w-6xl px-4 pb-14 pt-16 text-center sm:px-6 lg:px-8 lg:pb-16 lg:pt-20">
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl lg:text-[64px]">
              {copy.title}
            </h1>
            <p className="mx-auto mt-5 max-w-4xl text-lg leading-8 text-[#6b7280]">
              {copy.description}
            </p>

            <div className="mx-auto mt-12 max-w-3xl">
              <div className="overflow-hidden rounded-[20px] border border-[#ececec] bg-white shadow-[0_12px_32px_rgba(17,24,39,0.06)]">
                <div className="flex flex-col sm:flex-row">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={copy.placeholder}
                    className="h-16 flex-1 border-0 px-5 text-base text-[#111827] outline-none placeholder:text-[#9ca3af]"
                  />
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="h-16 border-t border-[#f1f1f1] px-7 text-base font-medium text-[#4b5563] transition-colors hover:bg-[#fafafa] sm:border-l sm:border-t-0"
                  >
                    {copy.paste}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleParse()}
                    disabled={isPending}
                    className="h-16 bg-[#ff3b5c] px-8 text-base font-semibold text-white transition-colors hover:bg-[#ff244b] disabled:opacity-70"
                  >
                    {isPending ? copy.parsing : copy.parse}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-3">
                {ratioOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRatio(option)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm transition-colors',
                      ratio === option
                        ? 'border-[#8b5cf6] bg-[#8b5cf6] text-white'
                        : 'border-[#e5e7eb] bg-white text-[#6b7280]'
                    )}
                  >
                    {option}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setInput('');
                    setResult(null);
                    setError('');
                  }}
                  className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm text-[#6b7280]"
                >
                  {copy.clear}
                </button>
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-left text-sm text-[#be123c]">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="border-b border-[#f4f4f5] bg-[#fcfcff]">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {copy.features.map(([title, body], index) => (
                <div
                  key={title}
                  className={cn(
                    'rounded-[24px] border border-[#f0e7ff] p-7 text-center shadow-sm',
                    index % 2 === 0 ? 'bg-[#fff7fb]' : 'bg-[#faf5ff]'
                  )}
                >
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-[#ff3b5c] shadow-sm">
                    {index === 0 ? (
                      <SparklesIcon className="size-6" />
                    ) : index === 1 ? (
                      <CheckIcon className="size-6" />
                    ) : index === 2 ? (
                      <VideoIcon className="size-6" />
                    ) : (
                      <GlobeIcon className="size-6" />
                    )}
                  </div>
                  <div className="mt-5 text-[28px] font-semibold tracking-tight text-[#111827]">
                    {title}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#6b7280]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#f4f4f5] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#111827]">
                {copy.resultTitle}
              </h2>
            </div>

            {result ? (
              <div className="mx-auto max-w-4xl space-y-8">
                <div className="rounded-[24px] border border-[#ececf3] bg-white p-6 shadow-[0_18px_40px_rgba(17,24,39,0.05)]">
                  <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="w-full lg:w-[340px]">
                      {result.coverUrl ? (
                        <img
                          src={result.coverUrl}
                          alt={result.description}
                          className="aspect-[3/4] w-full rounded-[20px] object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[3/4] w-full items-center justify-center rounded-[20px] bg-[#f6f5ff] text-[#8b5cf6]">
                          <ImageIcon className="size-12" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-2xl font-bold leading-10 text-[#111827]">
                        {result.description || copy.emptyResult}
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <InfoBox
                          label={copy.inputTypeLabel}
                          value={
                            activeType ? copy.typeLabels[activeType] : '-'
                          }
                        />
                        <InfoBox
                          label={copy.authorLabel}
                          value={result.authorNickname || '-'}
                        />
                        <InfoBox
                          label={copy.resolutionLabel}
                          value={`${result.width} x ${result.height}`}
                        />
                        <InfoBox
                          label={copy.publishedLabel}
                          value={result.createTimeText || '-'}
                        />
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <a
                          href={result.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#8b5cf6] px-5 text-sm font-semibold text-white"
                        >
                          <DownloadIcon className="size-4" />
                          {copy.downloadVideo}
                        </a>
                        <a
                          href={result.coverUrl || result.canonicalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#8b5cf6] px-5 text-sm font-semibold text-white"
                        >
                          <ImageIcon className="size-4" />
                          {copy.downloadImage}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#ececf3] bg-white p-6 shadow-[0_18px_40px_rgba(17,24,39,0.05)]">
                  <div className="text-lg font-semibold text-[#111827]">
                    {copy.detailTitle}
                  </div>

                  <div className="mt-5 space-y-4">
                    <ResultRow
                      label={copy.canonicalLabel}
                      value={result.canonicalUrl}
                      actionLabel={
                        copiedField === 'canonical' ? copy.copied : copy.copyLink
                      }
                      onAction={() =>
                        handleCopy('canonical', result.canonicalUrl)
                      }
                    />
                    <ResultRow
                      label={copy.sourceLabel}
                      value={result.resolvedUrl}
                      actionLabel={
                        copiedField === 'resolved' ? copy.copied : copy.copyLink
                      }
                      onAction={() =>
                        handleCopy('resolved', result.resolvedUrl)
                      }
                    />
                    <ResultRow
                      label={copy.videoLabel}
                      value={result.videoUrl}
                      actionLabel={
                        copiedField === 'video' ? copy.copied : copy.copyVideo
                      }
                      onAction={() => handleCopy('video', result.videoUrl)}
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#ececf3] bg-white p-6 shadow-[0_18px_40px_rgba(17,24,39,0.05)]">
                  <div className="text-lg font-semibold text-[#111827]">
                    {copy.qualityTitle}
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-3">
                      {qualityRows.map((row) => (
                        <a
                          key={row.ratio}
                          href={row.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-full items-center justify-between rounded-2xl bg-[#3b82f6] px-5 py-4 text-left text-white"
                        >
                          <span className="text-sm font-semibold">
                            {row.label}
                            {row.sizeLabel ? ` ${row.sizeLabel}` : ''}
                          </span>
                          <DownloadIcon className="size-4" />
                        </a>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {qualityRows.map((row) => (
                        <button
                          key={`${row.ratio}-copy`}
                          type="button"
                          onClick={() => handleCopy(`quality-${row.ratio}`, row.url)}
                          className="inline-flex w-full min-w-[84px] items-center justify-center rounded-2xl bg-[#22c55e] px-5 py-4 text-sm font-semibold text-white"
                        >
                          {copiedField === `quality-${row.ratio}`
                            ? copy.copied
                            : copy.qualityCopy}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl rounded-[24px] border border-dashed border-[#ddd6fe] bg-[#faf7ff] px-6 py-14 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white text-[#8b5cf6] shadow-sm">
                  {isPending ? (
                    <LoaderCircleIcon className="size-7 animate-spin" />
                  ) : (
                    <SearchIcon className="size-7" />
                  )}
                </div>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#6b7280]">
                  {isPending ? copy.parsing : copy.emptyResult}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#fcfcff]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#111827]">
                {copy.howToTitle}
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {copy.steps.map(([title, body], index) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-[#f0eefb] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff1f2] text-[#ff3b5c]">
                      {index === 0 ? (
                        <ClipboardIcon className="size-5" />
                      ) : index === 1 ? (
                        <CopyIcon className="size-5" />
                      ) : index === 2 ? (
                        <CheckIcon className="size-5" />
                      ) : (
                        <DownloadIcon className="size-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-[#111827]">
                        {title}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[#6b7280]">
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#fafafa] px-4 py-3">
      <div className="text-xs text-[#6b7280]">{label}</div>
      <div className="mt-2 text-sm font-medium text-[#111827]">{value}</div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  actionLabel,
  onAction,
}: {
  label: string;
  value: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="text-xs text-[#6b7280]">{label}</div>
        <div className="mt-2 break-all text-sm leading-7 text-[#111827]">
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#22c55e] px-5 text-sm font-semibold text-white"
      >
        {actionLabel}
      </button>
    </div>
  );
}
