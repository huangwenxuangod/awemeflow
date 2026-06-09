# Douyin Parser Deployment

## Architecture

Deploy the Next.js site and `/api/video` route as one OpenNext Cloudflare
Worker. Keep the existing D1 binding for MkSaaS data. Add a KV namespace for
the anonymous `ttwid` cookie and short-lived video result cache.

The API works without KV, but every cold Worker isolate may register a new
`ttwid`, and parsed video results will not be shared across isolates.

## Create the KV namespace

```powershell
pnpm wrangler kv namespace create DOUYIN_CACHE
```

Add the returned namespace ID to `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  {
    "binding": "DOUYIN_CACHE",
    "id": "<namespace-id>"
  }
]
```

Then regenerate Cloudflare binding types:

```powershell
pnpm cf-typegen
```

## Validate locally

```powershell
pnpm test:douyin
pnpm exec tsc --noEmit
pnpm preview
```

Test the API:

```powershell
curl.exe -X POST "http://localhost:8787/api/video" `
  -H "Content-Type: application/json" `
  -d "{`"input`":`"粘贴抖音分享文本或链接`"}"
```

## Deploy

Apply existing D1 migrations before the first production deployment:

```powershell
pnpm db:migrate:prod
pnpm deploy
```

The recommended production topology is:

```text
Browser
  -> OpenNext Worker (Next.js site + /api/video)
     -> D1 (MkSaaS users, credits, application data)
     -> KV DOUYIN_CACHE (ttwid and five-minute parser results)
     -> Douyin share endpoints
```

Do not proxy complete video bodies through the Worker. Return the parsed video
URL to the browser. If Cloudflare egress is blocked by Douyin, keep the
`/api/video` contract and move only the resolver behind a regional service.
