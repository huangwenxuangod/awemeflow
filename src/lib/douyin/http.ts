import { MAX_RESPONSE_BYTES, REQUEST_TIMEOUT_MS } from './constants';
import { DouyinError } from './errors';

export async function fetchText(
  url: string,
  init: RequestInit
): Promise<{ response: Response; text: string }> {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const contentLength = Number(response.headers.get('content-length') || 0);

  if (contentLength > MAX_RESPONSE_BYTES) {
    throw new DouyinError(
      502,
      '抖音响应内容过大',
      'UPSTREAM_RESPONSE_TOO_LARGE'
    );
  }

  if (!response.body) {
    return { response, text: '' };
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    size += value.byteLength;

    if (size > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new DouyinError(
        502,
        '抖音响应内容过大',
        'UPSTREAM_RESPONSE_TOO_LARGE'
      );
    }

    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { response, text: new TextDecoder().decode(body) };
}

export function getSetCookieHeaders(headers: Headers) {
  const withGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };
  const cookies = withGetSetCookie.getSetCookie?.() ?? [];

  if (cookies.length > 0) {
    return cookies;
  }

  const combined = headers.get('set-cookie');
  return combined ? [combined] : [];
}
