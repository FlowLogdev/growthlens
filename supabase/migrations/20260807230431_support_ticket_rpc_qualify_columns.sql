create or replace function public.create_support_ticket(
  p_name text,
  p_email text,
  p_subject text,
  p_description text
)
returns table (
  ticket_id uuid,
  ticket_number text,
  created_at timestamptz,
  priority text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_subject text := btrim(coalesce(p_subject, ''));
  v_description text := btrim(coalesce(p_description, ''));
  v_customer_id uuid;
  v_priority text := 'standard';
begin
  if char_length(v_name) < 2 or char_length(v_name) > 80 then
    raise exception using errcode = '22023', message = 'invalid_name';
  end if;

  if char_length(v_email) > 254
    or v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception using errcode = '22023', message = 'invalid_email';
  end if;

  if char_length(v_subject) < 4
    or char_length(v_subject) > 160
    or v_subject ~ E'[\\r\\n]' then
    raise exception using errcode = '22023', message = 'invalid_subject';
  end if;

  if char_length(v_description) < 20 or char_length(v_description) > 5000 then
    raise exception using errcode = '22023', message = 'invalid_description';
  end if;

  if (
    select count(*)
    from public.support_tickets as recent_ticket
    where recent_ticket.email = v_email
      and recent_ticket.created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  if (select auth.uid()) is not null then
    select
      c.id,
      case
        when c.plan_tier in ('pro', 'business')
          and (
            c.subscription_status = 'active'
            or (
              c.subscription_status = 'trialing'
              and c.trial_ends_at is not null
              and c.trial_ends_at > now()
            )
          )
        then 'priority'
        else 'standard'
      end
    into v_customer_id, v_priority
    from public.customers as c
    where c.auth_user_id = (select auth.uid())
    limit 1;
  end if;

  return query
  insert into public.support_tickets as st (
    customer_id,
    name,
    email,
    subject,
    description,
    priority,
    email_delivery_status
  )
  values (
    v_customer_id,
    v_name,
    v_email,
    v_subject,
    v_description,
    v_priority,
    'pending'
  )
  returning st.id, st.ticket_number, st.created_at, st.priority;
end;
$$;
