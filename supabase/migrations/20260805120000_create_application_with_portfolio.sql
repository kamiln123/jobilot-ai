-- Create an Application atomically, deriving the immutable CV snapshot on the server.
-- The browser never provides snapshot metadata or a user identifier.
create or replace function public.create_application_with_portfolio(
  p_job_offer_id uuid,
  p_cv_version_id uuid,
  p_status text default 'saved',
  p_portfolio_artifact_ids uuid[] default array[]::uuid[]
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_application_id uuid;
  v_file_name text;
  v_version_number integer;
  v_checksum text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (
    select 1
    from public.job_offers
    where id = p_job_offer_id
      and user_id = auth.uid()
      and deleted_at is null
  ) then
    raise exception 'The job offer must belong to the authenticated user';
  end if;

  select version.original_file_name, version.version_number, version.checksum
    into v_file_name, v_version_number, v_checksum
  from public.cv_versions version
  join public.cv_documents document on document.id = version.cv_document_id
  where version.id = p_cv_version_id
    and document.user_id = auth.uid()
    and document.deleted_at is null;

  if not found then
    raise exception 'The CV version must belong to the authenticated user';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_portfolio_artifact_ids, array[]::uuid[])) as artifact(id)
    left join public.portfolio_artifacts portfolio on portfolio.id = artifact.id
      and portfolio.user_id = auth.uid()
      and portfolio.archived_at is null
    where portfolio.id is null
  ) then
    raise exception 'Every portfolio artifact must belong to the authenticated user';
  end if;

  insert into public.applications (
    user_id,
    job_offer_id,
    cv_version_id,
    status,
    sent_at,
    cv_file_name_snapshot,
    cv_version_snapshot,
    cv_checksum_snapshot
  ) values (
    auth.uid(),
    p_job_offer_id,
    p_cv_version_id,
    p_status,
    case when p_status = 'applied' then now() else null end,
    v_file_name,
    v_version_number,
    v_checksum
  ) returning id into v_application_id;

  insert into public.application_portfolio_artifacts (application_id, portfolio_artifact_id)
  select v_application_id, artifact.id
  from (
    select distinct id
    from unnest(coalesce(p_portfolio_artifact_ids, array[]::uuid[])) as source(id)
  ) as artifact;

  return v_application_id;
end;
$$;

revoke all on function public.create_application_with_portfolio(uuid, uuid, text, uuid[]) from public;
grant execute on function public.create_application_with_portfolio(uuid, uuid, text, uuid[]) to authenticated;
