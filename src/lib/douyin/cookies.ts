export function extractCookieValue(cookies: string[], name: string) {
  const escapedName = escapeRegExp(name);
  const pattern = new RegExp(`(?:^|;\\s*)${escapedName}=([^;]+)`);

  for (const cookie of cookies) {
    const matched = cookie.match(pattern);

    if (matched) {
      return matched[1];
    }
  }

  return '';
}

export function extractCookieExpires(cookies: string[], name: string) {
  const escapedName = escapeRegExp(name);

  for (const cookie of cookies) {
    if (!new RegExp(`(?:^|;\\s*)${escapedName}=`).test(cookie)) {
      continue;
    }

    const maxAge = cookie.match(/;\s*Max-Age=(\d+)/i);

    if (maxAge) {
      return Date.now() + Number(maxAge[1]) * 1000;
    }

    const expires = cookie.match(/;\s*Expires=([^;]+)/i);

    if (expires) {
      const timestamp = Date.parse(expires[1]);
      return Number.isNaN(timestamp) ? 0 : timestamp;
    }
  }

  return 0;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
