-- Audit trail for the public data-deletion mechanism required by Meta App
-- Review (spec Section 13). Service-role only — the deletion route itself
-- performs the actual purge and logs it here.
create table data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  customer_id uuid,
  status text default 'completed', -- completed, not_found
  requested_at timestamptz default now()
);

alter table data_deletion_requests enable row level security;
create policy "service role only"
on data_deletion_requests
for all
using (false)
with check (false);
