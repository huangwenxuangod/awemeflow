import type { UnknownRecord } from './types';

export function extractRouterData(source: string): unknown | null {
  for (const marker of ['window._ROUTER_DATA', '_ROUTER_DATA']) {
    const markerIndex = source.indexOf(marker);

    if (markerIndex < 0) {
      continue;
    }

    const start = source.indexOf('{', markerIndex);
    const json = readBalancedJson(source, start);

    if (json) {
      const parsed = parseScriptJson(json);

      if (parsed) {
        return parsed;
      }
    }
  }

  const renderData = source.match(
    /<script[^>]+id=["']RENDER_DATA["'][^>]*>([\s\S]*?)<\/script>/i
  );

  return renderData ? parseScriptJson(renderData[1]) : null;
}

export function extractAwemeList(data: unknown) {
  const result: UnknownRecord[] = [];
  const visited = new Set<object>();

  function walk(value: unknown, depth: number) {
    if (depth > 10 || (!isRecord(value) && !Array.isArray(value))) {
      return;
    }

    if (visited.has(value)) {
      return;
    }

    visited.add(value);

    if (Array.isArray(value)) {
      for (const item of value) {
        if (looksAwemeLike(item)) {
          result.push(item);
        }
        walk(item, depth + 1);
      }
      return;
    }

    if (looksAwemeLike(value)) {
      result.push(value);
    }

    for (const child of Object.values(value)) {
      if (looksAwemeLike(child)) {
        result.push(child);
      }
      walk(child, depth + 1);
    }
  }

  walk(data, 0);

  const seen = new Set<string>();

  return result.filter((item) => {
    const id = stringValue(item.aweme_id) || stringValue(item.id);

    if (!id || seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });
}

export function looksAwemeLike(value: unknown): value is UnknownRecord {
  return (
    isRecord(value) &&
    Boolean(value.aweme_id || value.video || value.desc || value.share_url)
  );
}

export function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function stringValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
}

function readBalancedJson(source: string, start: number) {
  if (start < 0 || !['{', '['].includes(source[start])) {
    return '';
  }

  const stack: string[] = [];
  let quote = '';
  let escaping = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (escaping) {
        escaping = false;
      } else if (character === '\\') {
        escaping = true;
      } else if (character === quote) {
        quote = '';
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '{' || character === '[') {
      stack.push(character);
    } else if (character === '}' || character === ']') {
      const opening = stack.pop();

      if (
        !opening ||
        (opening === '{' && character !== '}') ||
        (opening === '[' && character !== ']')
      ) {
        return '';
      }

      if (stack.length === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  return '';
}

function parseScriptJson(value: string): unknown | null {
  const decoded = decodeHtmlEntities(value.trim());

  for (const candidate of [safeDecodeURIComponent(decoded), decoded]) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next representation.
    }
  }

  return null;
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}
