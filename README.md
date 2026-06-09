# AwemeFlow

AwemeFlow is a Cloudflare-ready Douyin video parsing site.

It is focused on one clear job:

- accept Douyin share text, short links, or `aweme_id`
- return usable video URLs
- expose cover, author, and basic metadata
- keep the product surface narrow enough to ship fast

## Current status

The public site has already been converged into a single-product parser:

- homepage is productized around the parser
- public blog, docs, and test routes are hidden from users
- Chinese and English product copy is aligned to `AwemeFlow`
- `pnpm build` passes
- the parser route is available at `/api/video`

## Stack

- Next.js 16 App Router
- `next-intl`
- OpenNext for Cloudflare
- Cloudflare Workers
- Cloudflare D1
- optional Cloudflare KV cache for Douyin cookie + short parser cache

## Local development

```powershell
corepack pnpm install
corepack pnpm dev
```

Default local URL:

```text
http://127.0.0.1:8787
```

Useful commands:

```powershell
corepack pnpm build
corepack pnpm test:douyin
corepack pnpm db:migrate
corepack pnpm db:migrate:prod
corepack pnpm preview
corepack pnpm deploy
```

## Cloudflare deploy checklist

### 1. Configure Worker + D1

Check [wrangler.jsonc](D:/dev/my-project/douyin/awemeflow/wrangler.jsonc):

- Worker name
- D1 binding `DB`
- D1 database id
- migration directory

If you want parser cache sharing across isolates, create KV:

```powershell
pnpm wrangler kv namespace create DOUYIN_CACHE
```

Then add the namespace to `wrangler.jsonc`.

### 2. Configure environment variables / secrets

At minimum, review:

- `NEXT_PUBLIC_BASE_URL`
- `BETTER_AUTH_SECRET`
- `RESEND_API_KEY` if email is enabled
- Stripe keys if payment stays enabled
- OAuth keys if Google/GitHub login stays enabled

Reference template:

- [env.example](D:/dev/my-project/douyin/awemeflow/env.example)

For production secrets on Cloudflare, use Wrangler secrets or the Cloudflare dashboard.

### 3. Apply D1 migrations

Before first production deploy:

```powershell
corepack pnpm db:migrate:prod
```

### 4. Deploy

```powershell
corepack pnpm deploy
```

## Important note for Windows

`opennextjs-cloudflare build` is not fully reliable on native Windows and may fail with file locking errors inside `.open-next/`.

This is a local environment limitation, not a confirmed app-code blocker.

Recommended deployment paths:

- deploy from Cloudflare via GitHub-connected Linux build
- deploy from WSL
- deploy from a Linux CI runner

## Launch judgment

This project is close enough to ship to Cloudflare as a first parser MVP if you accept the current scope:

- parser-first public site
- hidden template routes
- existing auth / payment / dashboard code kept in repo but not yet fully productized

What still needs your production decision before real launch:

- whether to keep auth enabled
- whether to keep payment enabled now or later
- whether to add KV cache before production traffic
- final domain and production env values

## Related docs

- [docs/DOUYIN_CLOUDFLARE.md](D:/dev/my-project/douyin/awemeflow/docs/DOUYIN_CLOUDFLARE.md)
- [wrangler.jsonc](D:/dev/my-project/douyin/awemeflow/wrangler.jsonc)
- [AGENTS.md](D:/dev/my-project/douyin/awemeflow/AGENTS.md)
