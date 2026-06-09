# AGENTS.md

This repository is no longer being treated as a generic MkSaaS demo.

Agents working here should treat the product as:

- name: `AwemeFlow`
- category: Douyin video parsing site
- primary goal: ship a focused parser MVP on Cloudflare
- current strategy: keep backend/template capability code, but keep the public product surface tightly converged

## Product rules

- Do not re-expand the public site into a generic SaaS template.
- Do not re-enable public blog, docs, or test routes unless explicitly asked.
- Do not remove large existing feature modules unless explicitly asked.
- Prefer changes that improve parser clarity, launch readiness, and product coherence.

## Public product shape

Current public product should feel like one tool:

- homepage parser
- parser-focused pricing
- parser-focused about / contact / waitlist / roadmap / changelog
- no visible template-brand language

If you touch public-facing copy, keep it aligned to:

- Douyin parsing
- content operations
- workflow readiness
- Cloudflare deployment readiness

## Deployment assumptions

- target runtime: Cloudflare Workers
- app adapter: OpenNext Cloudflare
- primary database: Cloudflare D1
- optional parser cache: Cloudflare KV

Important:

- `pnpm build` is the baseline validation command
- native Windows may fail on `opennextjs-cloudflare build` due file locking
- prefer WSL or Linux CI for final Cloudflare build verification when possible

## Commands

- `corepack pnpm dev`
- `corepack pnpm build`
- `corepack pnpm test:douyin`
- `corepack pnpm db:migrate`
- `corepack pnpm db:migrate:prod`
- `corepack pnpm preview`
- `corepack pnpm deploy`

## Editing guidance

- Keep ASCII by default.
- Use `apply_patch` for manual file edits.
- Do not revert unrelated user changes.
- Preserve existing hidden capability code unless the user asks for cleanup.

## High-priority files

- [src/components/home/douyin-homepage-client.tsx](D:/dev/my-project/douyin/awemeflow/src/components/home/douyin-homepage-client.tsx)
- [src/app/[locale]/(marketing)/(home)/page.tsx](D:/dev/my-project/douyin/awemeflow/src/app/[locale]/(marketing)/(home)/page.tsx)
- [src/config/website.tsx](D:/dev/my-project/douyin/awemeflow/src/config/website.tsx)
- [messages/zh.json](D:/dev/my-project/douyin/awemeflow/messages/zh.json)
- [messages/en.json](D:/dev/my-project/douyin/awemeflow/messages/en.json)
- [wrangler.jsonc](D:/dev/my-project/douyin/awemeflow/wrangler.jsonc)
- [docs/DOUYIN_CLOUDFLARE.md](D:/dev/my-project/douyin/awemeflow/docs/DOUYIN_CLOUDFLARE.md)

## Decision default

When there is ambiguity, choose the option that:

1. makes the site feel more like a real Douyin parser product
2. reduces public template noise
3. keeps Cloudflare deployment simpler
4. avoids deleting future-use capability code
