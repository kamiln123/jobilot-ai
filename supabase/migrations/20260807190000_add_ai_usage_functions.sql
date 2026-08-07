-- Jobilot AI — server-side AI quota helpers.
-- The browser never gets direct access to ai_usage_daily rows.

create or replace function public.reserve_ai_operation(p_daily_limit integer)
returns table (allowed boolean, operation_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if p_daily_limit < 1 or p_daily_limit > 100 then
    raise exception 'The AI daily limit must be between 1 and 100';
  end if;

  insert into public.ai_usage_daily (user_id, usage_date, operation_count)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, usage_date) do update
    set operation_count = public.ai_usage_daily.operation_count + 1
  where public.ai_usage_daily.operation_count < p_daily_limit
  returning operation_count into v_count;

  if v_count is null then
    return query
      select false, coalesce((
        select usage.operation_count
        from public.ai_usage_daily usage
        where usage.user_id = auth.uid() and usage.usage_date = current_date
      ), p_daily_limit);
    return;
  end if;

  return query select true, v_count;
end;
$$;

create or replace function public.record_ai_usage(
  p_input_tokens integer,
  p_output_tokens integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if p_input_tokens < 0 or p_input_tokens > 1000000
    or p_output_tokens < 0 or p_output_tokens > 1000000 then
    raise exception 'Invalid AI token count';
  end if;

  update public.ai_usage_daily
  set input_tokens = input_tokens + p_input_tokens,
      output_tokens = output_tokens + p_output_tokens,
      updated_at = now()
  where user_id = auth.uid() and usage_date = current_date;
end;
$$;

revoke all on function public.reserve_ai_operation(integer) from public;
revoke all on function public.record_ai_usage(integer, integer) from public;
grant execute on function public.reserve_ai_operation(integer) to authenticated;
grant execute on function public.record_ai_usage(integer, integer) to authenticated;
