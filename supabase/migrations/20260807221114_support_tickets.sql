-- Support ticket workflow and explicit 14-day trial window.
-- Ticket rows are server-only. The public form writes through the service role.

alter table public.customers
add column if not exists trial_ends_at timestamptz default (now() + interval '14 days');

update public.customers
set trial_ends_at = now() + interval '14 days'
where subscription_status = 'trialing'
  and trial_ends_at is null;

create sequence if not exists public.support_ticket_number_seq
  as bigint
  start with 1000
  increment by 1
  no cycle;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique default (
    'Growth' || nextval('public.support_ticket_number_seq')::text || to_char(now(), 'YYYY')
  ),
  customer_id uuid references public.customers(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,
  description text not null,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'standard'
    check (priority in ('standard', 'priority')),
  email_delivery_status text not null default 'pending'
    check (email_delivery_status in ('pending', 'sent', 'failed')),
  email_provider_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_customer_id_idx
  on public.support_tickets(customer_id)
  where customer_id is not null;

create index if not exists support_tickets_email_created_at_idx
  on public.support_tickets(email, created_at desc);

create index if not exists support_tickets_open_created_at_idx
  on public.support_tickets(created_at desc)
  where status in ('open', 'in_progress');

alter table public.support_tickets enable row level security;

revoke all on table public.support_tickets from anon, authenticated;
revoke all on sequence public.support_ticket_number_seq from anon, authenticated;
grant select, insert, update on table public.support_tickets to service_role;
grant usage, select on sequence public.support_ticket_number_seq to service_role;
