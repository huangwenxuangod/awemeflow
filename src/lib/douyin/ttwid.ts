import {
  IES_DOUYIN_ORIGIN,
  SHARE_USER_AGENT,
  TTWID_CACHE_TTL_SECONDS,
  TTWID_REGISTER_URL,
} from './constants';
import { extractCookieExpires, extractCookieValue } from './cookies';
import { DouyinError } from './errors';
import { fetchText, getSetCookieHeaders } from './http';
import type { DouyinCache, TtwidValue } from './types';

const CACHE_KEY = 'douyin:ttwid:v1';
let memoryValue: TtwidValue | null = null;

export async function getTtwid(cache?: DouyinCache, force = false) {
  if (!force && isValid(memoryValue)) {
    return memoryValue;
  }

  if (!force && cache) {
    const cached = await cache.get<TtwidValue>(CACHE_KEY);

    if (isValid(cached)) {
      memoryValue = cached;
      return cached;
    }
  }

  const value = await registerTtwid();
  memoryValue = value;

  if (cache) {
    await cache.put(CACHE_KEY, value, TTWID_CACHE_TTL_SECONDS);
  }

  return value;
}

export async function invalidateTtwid(cache?: DouyinCache) {
  memoryValue = null;
  await cache?.delete(CACHE_KEY);
}

async function registerTtwid(): Promise<TtwidValue> {
  const { response, text } = await fetchText(TTWID_REGISTER_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Referer: `${IES_DOUYIN_ORIGIN}/`,
      'User-Agent': SHARE_USER_AGENT,
    },
    body: JSON.stringify({
      region: 'cn',
      aid: 1768,
      needFid: false,
      service: 'www.iesdouyin.com',
      migrate_info: {
        ticket: '',
        source: 'node',
      },
      cbUrlProtocol: 'https',
      union: true,
    }),
  });

  if (!response.ok) {
    throw new DouyinError(
      response.status,
      `ttwid 注册失败：HTTP ${response.status}`,
      'TTWID_REGISTER_FAILED'
    );
  }

  const cookies = getSetCookieHeaders(response.headers);
  const ttwid = extractCookieValue(cookies, 'ttwid');

  if (!ttwid) {
    throw new DouyinError(
      502,
      `ttwid 注册响应无 Cookie：${text.slice(0, 120)}`,
      'TTWID_COOKIE_MISSING'
    );
  }

  return {
    ttwid,
    cookie: `ttwid=${ttwid}`,
    expiresAt:
      extractCookieExpires(cookies, 'ttwid') ||
      Date.now() + TTWID_CACHE_TTL_SECONDS * 1000,
  };
}

function isValid(value: TtwidValue | null): value is TtwidValue {
  return Boolean(
    value?.ttwid &&
      value.cookie &&
      (!value.expiresAt || value.expiresAt > Date.now() + 60_000)
  );
}
