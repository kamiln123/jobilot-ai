-- Jobilot AI — only a successful, validated Gemini response consumes a daily
-- application limit. Failed validation, provider and timeout attempts stay free.

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

  select coalesce((
    select usage.operation_count
    from public.ai_usage_daily usage
    where usage.user_id = auth.uid() and usage.usage_date = current_date
  ), 0) into v_count;

  return query select v_count < p_daily_limit, v_count;
end;
$$;

create or replace function public.complete_ai_operation(
  p_daily_limit integer,
  p_input_tokens integer,
  p_output_tokens integer
)
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

  if p_daily_limit < 1 or p_daily_limit > 100
    or p_input_tokens < 0 or p_input_tokens > 1000000
    or p_output_tokens < 0 or p_output_tokens > 1000000 then
    raise exception 'Invalid AI usage values';
  end if;

  insert into public.ai_usage_daily (user_id, usage_date, operation_count, input_tokens, output_tokens)
  values (auth.uid(), current_date, 1, p_input_tokens, p_output_tokens)
  on conflict (user_id, usage_date) do update
    set operation_count = public.ai_usage_daily.operation_count + 1,
        input_tokens = public.ai_usage_daily.input_tokens + excluded.input_tokens,
        output_tokens = public.ai_usage_daily.output_tokens + excluded.output_tokens,
        updated_at = now()
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

revoke all on function public.record_ai_usage(integer, integer) from public;
revoke all on function public.complete_ai_operation(integer, integer, integer) from public;
grant execute on function public.complete_ai_operation(integer, integer, integer) to authenticated;
