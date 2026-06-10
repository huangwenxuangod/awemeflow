import { DOUYIN_ORIGIN, IES_DOUYIN_ORIGIN, PLAY_ORIGIN } from './constants';
import { isRecord, stringValue } from './router-data';
import type { DouyinInputType, DouyinVideoResult, UnknownRecord } from './types';

interface VideoCandidate {
  url: string;
  uri: string;
  gearName: string;
  qualityType: number | string | null;
  bitRate: number;
  width: number;
  height: number;
  dataSize: number;
  format: string;
}

export function normalizeAweme(
  aweme: UnknownRecord,
  sourceUrl: string,
  ratio = '1080p',
  inputType: DouyinInputType = 'video_url'
): DouyinVideoResult {
  const video = isRecord(aweme.video) ? aweme.video : {};
  const best = pickBestVideo(video);
  const token = extractPlayToken(video);
  const awemeId = stringValue(aweme.aweme_id) || stringValue(aweme.id);
  const canonicalUrl = awemeId ? `${DOUYIN_ORIGIN}/video/${awemeId}` : '';
  const resolvedUrl = awemeId
    ? `${IES_DOUYIN_ORIGIN}/share/video/${awemeId}/`
    : sourceUrl;
  const source = sourceUrl || canonicalUrl;
  const author = isRecord(aweme.author) ? aweme.author : {};
  const createTime = toNumber(aweme.create_time) || null;

  return {
    awemeId,
    canonicalUrl,
    resolvedUrl,
    inputType,
    description: stringValue(aweme.desc),
    createTime,
    createTimeText: formatTime(createTime),
    shareUrl: stringValue(aweme.share_url) || source,
    videoUrl: token ? buildPlayUrl(token, ratio) : best.url,
    videoUri: token || best.uri,
    gearName: token ? best.gearName || 'share_play_addr' : best.gearName,
    qualityType: best.qualityType,
    bitRate: best.bitRate,
    width: best.width,
    height: best.height,
    dataSize: best.dataSize,
    format: best.format,
    coverUrl:
      pickUrl(video.cover) ||
      pickUrl(video.origin_cover) ||
      pickUrl(video.dynamic_cover),
    authorUid: stringValue(author.uid) || stringValue(aweme.author_user_id),
    authorSecUid: stringValue(author.sec_uid),
    authorNickname: stringValue(author.nickname),
    sourcePage: source,
  };
}

function pickBestVideo(video: UnknownRecord): VideoCandidate {
  const candidates: VideoCandidate[] = [];

  if (Array.isArray(video.bit_rate)) {
    for (const item of video.bit_rate) {
      if (!isRecord(item) || !isRecord(item.play_addr)) {
        continue;
      }

      const playAddress = item.play_addr;
      const url = pickUrl(playAddress);

      if (!url) {
        continue;
      }

      candidates.push({
        url,
        uri: stringValue(playAddress.uri),
        gearName: stringValue(item.gear_name),
        qualityType:
          typeof item.quality_type === 'number' ||
          typeof item.quality_type === 'string'
            ? item.quality_type
            : null,
        bitRate: toNumber(item.bit_rate ?? item.bitrate),
        width: toNumber(playAddress.width),
        height: toNumber(playAddress.height),
        dataSize: toNumber(playAddress.data_size),
        format: stringValue(item.format) || 'mp4',
      });
    }
  }

  candidates.sort(
    (left, right) =>
      right.width * right.height - left.width * left.height ||
      right.bitRate - left.bitRate ||
      right.dataSize - left.dataSize
  );

  if (candidates[0]) {
    return candidates[0];
  }

  const playAddress = isRecord(video.play_addr)
    ? video.play_addr
    : isRecord(video.download_addr)
      ? video.download_addr
      : {};

  return {
    url: pickUrl(playAddress),
    uri: stringValue(playAddress.uri),
    gearName: 'play_addr',
    qualityType: null,
    bitRate: 0,
    width: toNumber(playAddress.width),
    height: toNumber(playAddress.height),
    dataSize: toNumber(playAddress.data_size),
    format: 'mp4',
  };
}

function extractPlayToken(video: UnknownRecord) {
  for (const value of [video.play_addr, video.download_addr]) {
    if (isRecord(value)) {
      const token = stringValue(value.uri) || stringValue(value.video_id);

      if (token) {
        return token;
      }
    }
  }

  if (Array.isArray(video.bit_rate)) {
    for (const item of video.bit_rate) {
      if (isRecord(item) && isRecord(item.play_addr)) {
        const token =
          stringValue(item.play_addr.uri) ||
          stringValue(item.play_addr.video_id);

        if (token) {
          return token;
        }
      }
    }
  }

  return '';
}

function buildPlayUrl(token: string, ratio: string) {
  const search = new URLSearchParams({
    video_id: token,
    ratio: ratio || '1080p',
    line: '0',
  });
  return `${PLAY_ORIGIN}/aweme/v1/play/?${search}`;
}

function pickUrl(value: unknown) {
  if (typeof value === 'string') {
    return normalizeUrl(value);
  }

  if (!isRecord(value)) {
    return '';
  }

  if (Array.isArray(value.url_list)) {
    const urls = value.url_list.filter(
      (item): item is string => typeof item === 'string'
    );
    const direct = urls.find(
      (item) => /^https?:\/\//i.test(item) && !item.includes('/aweme/v1/play/')
    );
    return normalizeUrl(direct || urls[0] || '');
  }

  return typeof value.url === 'string' ? normalizeUrl(value.url) : '';
}

function normalizeUrl(value: string) {
  if (!value) {
    return '';
  }

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  try {
    return new URL(value, DOUYIN_ORIGIN).toString();
  } catch {
    return '';
  }
}

function toNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function formatTime(timestamp: number | null) {
  if (!timestamp) {
    return '';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(timestamp * 1000));
}
