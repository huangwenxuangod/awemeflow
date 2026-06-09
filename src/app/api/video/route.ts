import { createKvCache, resolveDouyinVideo, toDouyinError } from '@/lib/douyin';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const inputSchema = z
  .object({
    input: z.string().max(8192).optional(),
    url: z.string().max(8192).optional(),
    awemeId: z.string().max(30).optional(),
    ratio: z.string().max(20).optional(),
    debug: z.boolean().optional(),
  })
  .refine((value) => value.input || value.url || value.awemeId, {
    message: '请提供抖音链接或作品 ID',
  });

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);

    if (contentLength > 1024 * 1024) {
      return NextResponse.json(
        { code: 413, message: '请求体过大' },
        { status: 413 }
      );
    }

    const payload = inputSchema.parse(await request.json());
    const cache = await getOptionalCache();
    const result = await resolveDouyinVideo(payload, cache);

    return NextResponse.json({
      code: 0,
      ...result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          code: 400,
          message: error.issues[0]?.message || '请求参数不正确',
        },
        { status: 400 }
      );
    }

    const normalized = toDouyinError(error);

    return NextResponse.json(
      {
        code: normalized.statusCode,
        error: normalized.code,
        message: normalized.message,
      },
      { status: normalized.statusCode }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const input = url.searchParams.get('url') || url.searchParams.get('input');
  const awemeId = url.searchParams.get('aweme_id');
  const ratio = url.searchParams.get('ratio') || undefined;

  if (!input && !awemeId) {
    return NextResponse.json(
      { code: 400, message: '请提供 url、input 或 aweme_id' },
      { status: 400 }
    );
  }

  return POST(
    new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, awemeId, ratio }),
    })
  );
}

async function getOptionalCache() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const cacheNamespace = (
      env as CloudflareEnv & { DOUYIN_CACHE?: KVNamespace }
    ).DOUYIN_CACHE;
    return createKvCache(cacheNamespace);
  } catch {
    return undefined;
  }
}
