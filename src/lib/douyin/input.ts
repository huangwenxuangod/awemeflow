import {
  ALLOWED_INPUT_HOSTS,
  ALLOWED_REDIRECT_HOSTS,
  MAX_INPUT_LENGTH,
  MAX_REDIRECTS,
  REQUEST_TIMEOUT_MS,
} from './constants';
import { DouyinError } from './errors';
import type { ResolveDouyinInput } from './types';

const URL_PATTERN = /https?:\/\/[^\s"'<>]+/i;
const AWEME_ID_PATTERN = /\d{10,30}/;

export function normalizeInput(payload: ResolveDouyinInput) {
  const text = firstText(payload.url, payload.input);
  const explicitId = firstText(payload.awemeId);

  if (!text && !explicitId) {
    throw new DouyinError(400, '请提供抖音链接或作品 ID', 'MISSING_INPUT');
  }

  if (text.length > MAX_INPUT_LENGTH) {
    throw new DouyinError(413, '输入内容过长', 'INPUT_TOO_LARGE');
  }

  if (explicitId && !AWEME_ID_PATTERN.test(explicitId)) {
    throw new DouyinError(400, '作品 ID 格式不正确', 'INVALID_AWEME_ID');
  }

  return {
    text,
    explicitId: explicitId.match(AWEME_ID_PATTERN)?.[0] ?? '',
    ratio: firstText(payload.ratio) || '1080p',
  };
}

export function extractUrl(text: string): URL | null {
  const matched = text.match(URL_PATTERN)?.[0];

  if (!matched) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(matched.replace(/[，。！？、；：）】]+$/u, ''));
  } catch {
    throw new DouyinError(400, '抖音链接格式不正确', 'INVALID_URL');
  }

  assertAllowedHost(url, ALLOWED_INPUT_HOSTS);
  return url;
}

export function extractAwemeId(value: string) {
  const direct = value.match(
    /(?:\/video\/|aweme_id=|item_id=|group_id=|modal_id=)(\d{10,30})/
  );

  if (direct) {
    return direct[1];
  }

  try {
    const url = new URL(value);

    for (const key of ['aweme_id', 'item_id', 'group_id', 'modal_id']) {
      const candidate = url.searchParams.get(key);

      if (candidate && /^\d{10,30}$/.test(candidate)) {
        return candidate;
      }
    }
  } catch {
    // The input may be share text rather than a bare URL.
  }

  return value.match(/\b(\d{16,25})\b/)?.[1] ?? '';
}

export async function resolveShortLink(url: URL) {
  let current = url;

  for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt += 1) {
    assertAllowedHost(current, ALLOWED_REDIRECT_HOSTS);

    const response = await fetch(current, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) ' +
          'AppleWebKit/605.1.15 Mobile/15E148',
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      if (!response.ok) {
        throw new DouyinError(
          response.status,
          `短链接请求失败：HTTP ${response.status}`,
          'SHORT_LINK_FAILED'
        );
      }

      return current;
    }

    const location = response.headers.get('location');

    if (!location) {
      throw new DouyinError(
        502,
        '短链接响应缺少跳转地址',
        'SHORT_LINK_LOCATION_MISSING'
      );
    }

    current = new URL(location, current);
  }

  throw new DouyinError(422, '短链接跳转次数过多', 'TOO_MANY_REDIRECTS');
}

function assertAllowedHost(url: URL, allowedHosts: Set<string>) {
  if (
    url.protocol !== 'https:' ||
    !allowedHosts.has(url.hostname.toLowerCase())
  ) {
    throw new DouyinError(400, '仅支持 HTTPS 抖音链接', 'UNSUPPORTED_HOST');
  }
}

function firstText(...values: Array<string | undefined>) {
  return values.find((value) => value?.trim())?.trim() ?? '';
}
