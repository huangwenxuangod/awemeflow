import { normalizeAweme } from './aweme';
import {
  IES_DOUYIN_ORIGIN,
  RESULT_CACHE_TTL_SECONDS,
  SHARE_USER_AGENT,
} from './constants';
import { DouyinError } from './errors';
import { fetchText } from './http';
import {
  extractAwemeId,
  extractUrl,
  normalizeInput,
  resolveShortLink,
} from './input';
import {
  extractAwemeList,
  extractRouterData,
  stringValue,
} from './router-data';
import { DouyinTrace } from './trace';
import { getTtwid, invalidateTtwid } from './ttwid';
import type {
  DouyinCache,
  DouyinVideoResult,
  ResolveDouyinInput,
  ResolveDouyinResult,
} from './types';

export async function resolveDouyinVideo(
  payload: ResolveDouyinInput,
  cache?: DouyinCache
): Promise<ResolveDouyinResult> {
  const trace = new DouyinTrace(payload.debug === true);
  const input = normalizeInput(payload);
  trace.add('input', {
    hasUrl: Boolean(input.text),
    hasExplicitId: Boolean(input.explicitId),
  });

  let awemeId = input.explicitId || extractAwemeId(input.text);
  let sourceUrl = input.text;
  let prefetchedResult: DouyinVideoResult | null = null;

  if (!awemeId && input.text) {
    const url = extractUrl(input.text);

    if (url) {
      const resolved = await resolveShortLink(url);
      sourceUrl = resolved.toString();
      awemeId = extractAwemeId(sourceUrl);
      trace.add('short_link', {
        host: resolved.hostname,
        foundAwemeId: Boolean(awemeId),
      });

      if (!awemeId) {
        assertResolvableShareUrl(sourceUrl);
        prefetchedResult = await fetchShareVideoByUrl(
          sourceUrl,
          input.ratio,
          cache,
          trace
        );
        awemeId = prefetchedResult.awemeId;
      }
    }
  }

  if (!awemeId) {
    throw new DouyinError(
      400,
      '没有从输入中提取到作品 ID',
      'AWEME_ID_NOT_FOUND'
    );
  }

  trace.add('aweme_id', { awemeId });
  const resultCacheKey = `douyin:video:${awemeId}:${input.ratio}`;
  const cached = await cache?.get<DouyinVideoResult>(resultCacheKey);

  if (cached?.videoUrl) {
    trace.add('cache_hit', { awemeId });
    return buildResult(cached, trace, payload.debug);
  }

  const data =
    prefetchedResult ??
    (await fetchShareVideo(awemeId, input.ratio, sourceUrl, cache, trace));
  await cache?.put(resultCacheKey, data, RESULT_CACHE_TTL_SECONDS);
  trace.add('resolve_success', { awemeId });
  return buildResult(data, trace, payload.debug);
}

async function fetchShareVideo(
  awemeId: string,
  ratio: string,
  sourceUrl: string,
  cache: DouyinCache | undefined,
  trace: DouyinTrace
) {
  const shareUrl = `${IES_DOUYIN_ORIGIN}/share/video/${encodeURIComponent(
    awemeId
  )}/`;
  return fetchShareVideoByUrl(shareUrl, ratio, cache, trace, awemeId, sourceUrl);
}

async function fetchShareVideoByUrl(
  shareUrl: string,
  ratio: string,
  cache: DouyinCache | undefined,
  trace: DouyinTrace,
  expectedAwemeId?: string,
  sourceUrl?: string
) {
  let ttwid = await getTtwid(cache);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    trace.add('share_fetch', {
      awemeId: expectedAwemeId || 'pending',
      attempt: attempt + 1,
      shareUrl,
    });
    const { response, text } = await fetchText(shareUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        Cookie: ttwid.cookie,
        Referer: 'https://v.douyin.com/',
        'User-Agent': SHARE_USER_AGENT,
      },
    });

    if ([401, 403].includes(response.status) && attempt === 0) {
      await invalidateTtwid(cache);
      ttwid = await getTtwid(cache, true);
      continue;
    }

    if (!response.ok) {
      throw new DouyinError(
        response.status,
        `分享页请求失败：HTTP ${response.status}`,
        'SHARE_PAGE_FAILED'
      );
    }

    const routerData = extractRouterData(text);
    trace.add('router_data_parse', { found: Boolean(routerData) });

    if (!routerData) {
      if (attempt === 0) {
        await invalidateTtwid(cache);
        ttwid = await getTtwid(cache, true);
        continue;
      }

      throw new DouyinError(
        422,
        '分享页没有 _ROUTER_DATA',
        'ROUTER_DATA_MISSING'
      );
    }

    const awemeList = extractAwemeList(routerData);
    const aweme =
      awemeList.find((item) => {
        if (!expectedAwemeId) {
          return false;
        }

        return (
          stringValue(item.aweme_id) === expectedAwemeId ||
          stringValue(item.id) === expectedAwemeId
        );
      }) ?? awemeList[0];

    if (!aweme) {
      throw new DouyinError(422, '分享页没有作品数据', 'AWEME_DATA_MISSING');
    }

    const result = normalizeAweme(
      aweme,
      sourceUrl || response.url || shareUrl,
      ratio
    );

    if (!result.videoUrl) {
      throw new DouyinError(422, '没有解析到视频地址', 'VIDEO_URL_MISSING');
    }

    return result;
  }

  throw new DouyinError(502, '抖音解析失败', 'RESOLVE_FAILED');
}

function buildResult(
  data: DouyinVideoResult,
  trace: DouyinTrace,
  includeDebug?: boolean
): ResolveDouyinResult {
  return {
    data,
    traceId: trace.id,
    ...(includeDebug ? { debug: trace.events } : {}),
  };
}

function assertResolvableShareUrl(url: string) {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();

    if (pathname.includes('/share/user/')) {
      throw new DouyinError(
        400,
        '当前短链接跳转到的是用户主页，不是视频分享页。请改用视频详情页链接、分享文案或作品 ID。',
        'SHORT_LINK_TO_USER_PAGE'
      );
    }
  } catch (error) {
    if (error instanceof DouyinError) {
      throw error;
    }
  }
}
