-- Jobilot AI — resolves the output-variable / column-name ambiguity in
-- reserve_ai_operation. The previous migration is intentionally left intact.

create or replace function public.reserve_ai_operation(p_daily_limit integer)
returns table (allowed boolean, operation_count integer)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
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

revoke all on function public.reserve_ai_operation(integer) from public;
grant execute on function public.reserve_ai_operation(integer) to authenticated;
