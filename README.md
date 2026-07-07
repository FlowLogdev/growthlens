# GrowthLens

Multi-tenant social growth SaaS. Customers connect their Facebook Page, Instagram
Business account, and TikTok Business account and get a dashboard of historical
metrics plus weekly Claude-generated organic growth recommendations. Billing via
Stripe subscriptions.

**Domain:** usegrowthlens.com

Scaffolded from `social-growth-saas-spec.md`. See that file for the full product
spec — this README covers what's implemented and how to run it.

## Stack

- Next.js 16 (App Router) — the spec named Next.js 14, bumped to the current
  major since this is a fresh project
- Supabase (Auth + Postgres with Row Level Security)
- Stripe (subscriptions + customer portal)
- Anthropic Claude API (`claude-sonnet-4-6`)
- Resend (weekly digest email)
- Recharts, Tailwind CSS
- Vercel (hosting + Cron, configured via `vercel.ts`)

## What's implemented (Phase 1 — Foundation, plus scaffolding for later phases)

- Database schema + RLS policies for every tenant table (`supabase/migrations/`)
- Supabase Auth: email/password + Google OAuth, signup creates a `customers` row
- Stripe Checkout, customer portal, and an idempotent webhook handler
  (`stripe_events` table dedupes retried webhook deliveries)
- Meta and TikTok OAuth connect flows, kept in separate integration modules
  (`src/lib/integrations/meta.ts`, `tiktok.ts`) so a review delay on one
  platform doesn't block the other
- Access/refresh tokens encrypted at rest (AES-256-GCM, `src/lib/encryption.ts`)
  before being written to `platform_accounts`
- Fan-out cron pattern (`src/app/api/cron/*`): a lightweight trigger route
  enqueues one job per account instead of looping through all customers in a
  single invocation
- TikTok token-refresh cron (tokens expire in 24h) and a Claude analysis job
  with the prompt template from the spec, wired to a weekly insights cron and
  digest email
- Dashboard shell with all 8 pages from the spec (overview, connect, per-platform,
  posts, insights, links, billing, settings)
- Public Privacy Policy / Terms / Data Deletion pages required for Meta App
  Review — **Privacy Policy and Terms are placeholders and must be replaced
  with real legal copy before submitting for review**

## Not yet implemented / left for later phases

Per the spec's build phases (Section 14), still open:
- Meta App Review submission (demo video, permission justification writeup)
- TikTok audit submission
- Manual CSV fallback for TikTok while its review is pending
- Production-grade rate limiting on OAuth callbacks (current one is
  in-memory, single-instance only — see `src/lib/rate-limit.ts`)
- Charts (Recharts is installed but not yet wired into the per-platform page)
- Link-in-bio click tracking redirect endpoint (the `link_clicks` table and
  dashboard page exist; nothing writes to the table yet)

## Setup

1. Copy `.env.example` to `.env.local` and fill in every value. Generate
   `TOKEN_ENCRYPTION_KEY` with `openssl rand -hex 32`.
2. Create a Supabase project, then run the migrations in
   `supabase/migrations/` against it (via the Supabase SQL editor or the
   Supabase CLI).
3. In Supabase Auth settings, enable Google as an OAuth provider if you want
   the "Continue with Google" button to work.
4. Create Stripe products/prices for the Starter and Pro tiers and set
   `STRIPE_PRICE_ID_STARTER` / `STRIPE_PRICE_ID_PRO`. Point a Stripe webhook
   at `/api/stripe/webhook` for `checkout.session.completed`,
   `customer.subscription.updated`, and `customer.subscription.deleted`.
5. Create a Meta app (Facebook Login for Business) and a TikTok developer app;
   set the app ID/secret and redirect URI env vars to
   `https://usegrowthlens.com/api/oauth/{meta,tiktok}/callback` in production
   (or your `NEXT_PUBLIC_SITE_URL` locally). Both stay in "development mode"
   (usable only by your own test account) until Advanced Access / audit
   approval per Section 7 of the spec.
6. `npm install`
7. `npm run dev`
8. On Vercel, add `usegrowthlens.com` as the project's production domain and
   set `NEXT_PUBLIC_SITE_URL=https://usegrowthlens.com` in the production
   environment variables.

## Cron jobs

Defined in `vercel.ts` (Vercel's current recommended config format, replacing
`vercel.json`):
- `/api/cron/trigger-syncs` — every 6h, fans out one sync per active account
- `/api/cron/refresh-tokens` — every 6h, refreshes TikTok tokens expiring soon
- `/api/cron/generate-insights` — weekly, fans out Claude analysis per account
- `/api/cron/send-digests` — weekly, one Resend email per customer

All cron-triggered routes require `Authorization: Bearer $CRON_SECRET`, which
Vercel Cron sends automatically in production.
