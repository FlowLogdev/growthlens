-- GrowthLens initial schema
-- Multi-tenant SaaS: every tenant table is scoped by customer_id and RLS-enforced.

create extension if not exists "pgcrypto";

-- Customers (your SaaS users, one row per signed-up business)
create table customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) unique,
  business_name text,
  email text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'trialing', -- trialing, active, past_due, canceled
  plan_tier text default 'starter',             -- starter, pro, business
  created_at timestamptz default now()
);

-- Connected social accounts, one row per platform per customer
create table platform_accounts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) not null,
  platform text not null check (platform in ('facebook','instagram','tiktok')),
  account_id text not null,
  account_name text,
  access_token text not null,      -- encrypted at rest via lib/encryption.ts before insert
  refresh_token text,               -- encrypted at rest via lib/encryption.ts before insert
  token_expires_at timestamptz,
  connected_at timestamptz default now(),
  status text default 'active',     -- active, expired, revoked
  unique(customer_id, platform, account_id)
);

create table daily_metrics (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) not null,
  account_id uuid references platform_accounts(id),
  date date not null,
  followers int,
  reach int,
  impressions int,
  profile_views int,
  engagement_rate numeric,
  new_follows int,
  unfollows int,
  created_at timestamptz default now(),
  unique(account_id, date)
);

create table post_performance (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) not null,
  account_id uuid references platform_accounts(id),
  platform_post_id text not null,
  posted_at timestamptz,
  content_type text,
  caption text,
  reach int,
  impressions int,
  likes int,
  comments int,
  shares int,
  saves int,
  watch_time_avg numeric,
  video_completion_rate numeric,
  permalink text,
  created_at timestamptz default now(),
  unique(account_id, platform_post_id)
);

create table ai_insights (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) not null,
  account_id uuid references platform_accounts(id),
  generated_at timestamptz default now(),
  period_start date,
  period_end date,
  top_performers jsonb,
  blockers jsonb,
  recommendations jsonb,
  raw_response jsonb
);

create table link_clicks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) not null,
  link_slug text,
  source_platform text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  clicked_at timestamptz default now(),
  user_agent text
);

-- Track Stripe webhook events for idempotency
create table stripe_events (
  id text primary key,   -- Stripe event ID
  type text,
  processed_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- customers.id is not the same as auth.uid() (auth_user_id is), so the policy
-- shape differs slightly from the spec's literal example for the customers
-- table itself, but every other tenant table keys off customer_id and matches
-- the spec's pattern via a subquery against customers.auth_user_id = auth.uid().

alter table customers enable row level security;
create policy "customers can only access their own row"
on customers
for all
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

alter table platform_accounts enable row level security;
create policy "customers can only access their own accounts"
on platform_accounts
for all
using (customer_id in (select id from customers where auth_user_id = auth.uid()))
with check (customer_id in (select id from customers where auth_user_id = auth.uid()));

alter table daily_metrics enable row level security;
create policy "customers can only access their own metrics"
on daily_metrics
for all
using (customer_id in (select id from customers where auth_user_id = auth.uid()))
with check (customer_id in (select id from customers where auth_user_id = auth.uid()));

alter table post_performance enable row level security;
create policy "customers can only access their own posts"
on post_performance
for all
using (customer_id in (select id from customers where auth_user_id = auth.uid()))
with check (customer_id in (select id from customers where auth_user_id = auth.uid()));

alter table ai_insights enable row level security;
create policy "customers can only access their own insights"
on ai_insights
for all
using (customer_id in (select id from customers where auth_user_id = auth.uid()))
with check (customer_id in (select id from customers where auth_user_id = auth.uid()));

alter table link_clicks enable row level security;
create policy "customers can only access their own link clicks"
on link_clicks
for all
using (customer_id in (select id from customers where auth_user_id = auth.uid()))
with check (customer_id in (select id from customers where auth_user_id = auth.uid()));

-- stripe_events is service-role only (webhook handler), no customer-facing RLS needed.
alter table stripe_events enable row level security;
create policy "service role only"
on stripe_events
for all
using (false)
with check (false);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index idx_platform_accounts_customer_id on platform_accounts(customer_id);
create index idx_platform_accounts_status on platform_accounts(status);
create index idx_daily_metrics_customer_id on daily_metrics(customer_id);
create index idx_daily_metrics_account_date on daily_metrics(account_id, date);
create index idx_post_performance_customer_id on post_performance(customer_id);
create index idx_ai_insights_customer_id on ai_insights(customer_id);
create index idx_link_clicks_customer_id on link_clicks(customer_id);
