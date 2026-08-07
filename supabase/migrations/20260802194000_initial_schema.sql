-- Jobilot AI — initial Cloud Mode schema
-- This migration intentionally stores no provider keys, prompts, or AI draft history.

create extension if not exists "pgcrypto";

create table public.cv_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz
);

create table public.cv_versions (
  id uuid primary key default gen_random_uuid(),
  cv_document_id uuid not null references public.cv_documents(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  original_file_name text not null check (char_length(trim(original_file_name)) between 1 and 255),
  storage_path text not null unique,
  mime_type text not null check (mime_type = 'application/pdf'),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 5242880),
  checksum text not null check (char_length(checksum) between 32 and 128),
  created_at timestamptz not null default now(),
  unique (cv_document_id, version_number)
);

create table public.job_offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null check (char_length(trim(company_name)) between 1 and 160),
  position_title text not null check (char_length(trim(position_title)) between 1 and 180),
  description text,
  requirements text,
  location text,
  work_mode text check (work_mode in ('remote', 'hybrid', 'onsite')),
  employment_type text,
  salary_min numeric(12, 2) check (salary_min >= 0),
  salary_max numeric(12, 2) check (salary_max >= 0),
  salary_currency text check (salary_currency is null or salary_currency ~ '^[A-Z]{3}$'),
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz,
  check (salary_max is null or salary_min is null or salary_max >= salary_min)
);

create table public.portfolio_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  artifact_type text not null check (artifact_type in ('link', 'file', 'case_study', 'presentation')),
  url text,
  storage_path text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz,
  check (
    (artifact_type = 'link' and url is not null and storage_path is null)
    or (artifact_type in ('file', 'case_study', 'presentation') and (url is not null or storage_path is not null))
  )
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_offer_id uuid not null references public.job_offers(id) on delete restrict,
  cv_version_id uuid not null references public.cv_versions(id) on delete restrict,
  status text not null default 'saved' check (status in ('saved', 'preparing', 'applied', 'interview', 'offer', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  deleted_at timestamptz,
  cv_file_name_snapshot text not null,
  cv_version_snapshot integer not null check (cv_version_snapshot > 0),
  cv_checksum_snapshot text not null,
  cv_snapshot_created_at timestamptz not null default now()
);

create unique index applications_one_active_per_offer
  on public.applications (user_id, job_offer_id)
  where deleted_at is null;

create table public.application_portfolio_artifacts (
  application_id uuid not null references public.applications(id) on delete cascade,
  portfolio_artifact_id uuid not null references public.portfolio_artifacts(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (application_id, portfolio_artifact_id)
);

create table public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  previous_status text check (previous_status is null or previous_status in ('saved', 'preparing', 'applied', 'interview', 'offer', 'rejected', 'withdrawn')),
  new_status text not null check (new_status in ('saved', 'preparing', 'applied', 'interview', 'offer', 'rejected', 'withdrawn')),
  changed_at timestamptz not null default now(),
  note text
);

create table public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.ai_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  consented_at timestamptz not null default now(),
  revoked_at timestamptz,
  provider text not null check (provider in ('openai', 'gemini')),
  policy_version text not null,
  updated_at timestamptz not null default now()
);

create table public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  cv_version_id uuid references public.cv_versions(id) on delete set null,
  provider text not null check (provider in ('openai', 'gemini')),
  analysis_type text not null check (analysis_type in ('cv_job_match', 'cv_quality', 'cover_letter')),
  result jsonb not null,
  input_checksum text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (application_id is not null or cv_version_id is not null)
);

-- Only server-side code may read or mutate usage; clients cannot reset their limits.
create table public.ai_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  operation_count integer not null default 0 check (operation_count >= 0),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  estimated_cost_usd numeric(12, 6) not null default 0 check (estimated_cost_usd >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

create index cv_documents_user_id_idx on public.cv_documents(user_id) where deleted_at is null;
create index job_offers_user_id_idx on public.job_offers(user_id) where deleted_at is null;
create index portfolio_artifacts_user_id_idx on public.portfolio_artifacts(user_id) where deleted_at is null;
create index applications_user_id_idx on public.applications(user_id) where deleted_at is null;
create index application_status_history_application_id_idx on public.application_status_history(application_id, changed_at desc);
create index application_notes_application_id_idx on public.application_notes(application_id, created_at desc);
create index ai_analyses_user_id_idx on public.ai_analyses(user_id, created_at desc) where deleted_at is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cv_documents_set_updated_at before update on public.cv_documents
for each row execute function public.set_updated_at();
create trigger job_offers_set_updated_at before update on public.job_offers
for each row execute function public.set_updated_at();
create trigger portfolio_artifacts_set_updated_at before update on public.portfolio_artifacts
for each row execute function public.set_updated_at();
create trigger applications_set_updated_at before update on public.applications
for each row execute function public.set_updated_at();
create trigger application_notes_set_updated_at before update on public.application_notes
for each row execute function public.set_updated_at();
create trigger cover_letters_set_updated_at before update on public.cover_letters
for each row execute function public.set_updated_at();
create trigger ai_consents_set_updated_at before update on public.ai_consents
for each row execute function public.set_updated_at();
create trigger ai_usage_daily_set_updated_at before update on public.ai_usage_daily
for each row execute function public.set_updated_at();

-- Prevent a user from creating an Application that references another user's CV or offer.
create or replace function public.assert_application_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.job_offers
    where id = new.job_offer_id and user_id = new.user_id
  ) then
    raise exception 'The job offer must belong to the application owner';
  end if;

  if not exists (
    select 1
    from public.cv_versions version
    join public.cv_documents document on document.id = version.cv_document_id
    where version.id = new.cv_version_id and document.user_id = new.user_id
  ) then
    raise exception 'The CV version must belong to the application owner';
  end if;

  return new;
end;
$$;

create trigger applications_assert_ownership
before insert or update of user_id, job_offer_id, cv_version_id on public.applications
for each row execute function public.assert_application_ownership();

create or replace function public.assert_application_portfolio_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  application_owner uuid;
begin
  select user_id into application_owner from public.applications where id = new.application_id;

  if application_owner is null or not exists (
    select 1 from public.portfolio_artifacts
    where id = new.portfolio_artifact_id and user_id = application_owner
  ) then
    raise exception 'The portfolio artifact must belong to the application owner';
  end if;

  return new;
end;
$$;

create trigger application_portfolio_artifacts_assert_ownership
before insert or update on public.application_portfolio_artifacts
for each row execute function public.assert_application_portfolio_ownership();

create or replace function public.assert_ai_analysis_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.application_id is not null and not exists (
    select 1 from public.applications
    where id = new.application_id and user_id = new.user_id
  ) then
    raise exception 'The application must belong to the analysis owner';
  end if;

  if new.cv_version_id is not null and not exists (
    select 1
    from public.cv_versions version
    join public.cv_documents document on document.id = version.cv_document_id
    where version.id = new.cv_version_id and document.user_id = new.user_id
  ) then
    raise exception 'The CV version must belong to the analysis owner';
  end if;

  return new;
end;
$$;

create trigger ai_analyses_assert_ownership
before insert or update of user_id, application_id, cv_version_id on public.ai_analyses
for each row execute function public.assert_ai_analysis_ownership();

-- Status history is append-only. It is produced by the database, never supplied by the browser.
create or replace function public.track_application_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.application_status_history (application_id, previous_status, new_status)
    values (new.id, null, new.status);
  elsif new.status is distinct from old.status then
    insert into public.application_status_history (application_id, previous_status, new_status)
    values (new.id, old.status, new.status);
  end if;

  return new;
end;
$$;

create trigger applications_track_status_after_insert
after insert on public.applications
for each row execute function public.track_application_status();
create trigger applications_track_status_after_update
after update of status on public.applications
for each row execute function public.track_application_status();

alter table public.cv_documents enable row level security;
alter table public.cv_versions enable row level security;
alter table public.job_offers enable row level security;
alter table public.portfolio_artifacts enable row level security;
alter table public.applications enable row level security;
alter table public.application_portfolio_artifacts enable row level security;
alter table public.application_status_history enable row level security;
alter table public.application_notes enable row level security;
alter table public.cover_letters enable row level security;
alter table public.ai_consents enable row level security;
alter table public.ai_analyses enable row level security;
alter table public.ai_usage_daily enable row level security;

create policy "cv_documents_owner_select" on public.cv_documents
for select to authenticated using (user_id = auth.uid());
create policy "cv_documents_owner_insert" on public.cv_documents
for insert to authenticated with check (user_id = auth.uid());
create policy "cv_documents_owner_update" on public.cv_documents
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "cv_versions_owner_select" on public.cv_versions
for select to authenticated
using (exists (
  select 1 from public.cv_documents document
  where document.id = cv_versions.cv_document_id and document.user_id = auth.uid()
));
create policy "cv_versions_owner_insert" on public.cv_versions
for insert to authenticated with check (exists (
  select 1 from public.cv_documents document
  where document.id = cv_versions.cv_document_id and document.user_id = auth.uid()
));

create policy "job_offers_owner_select" on public.job_offers
for select to authenticated using (user_id = auth.uid());
create policy "job_offers_owner_insert" on public.job_offers
for insert to authenticated with check (user_id = auth.uid());
create policy "job_offers_owner_update" on public.job_offers
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "portfolio_artifacts_owner_select" on public.portfolio_artifacts
for select to authenticated using (user_id = auth.uid());
create policy "portfolio_artifacts_owner_insert" on public.portfolio_artifacts
for insert to authenticated with check (user_id = auth.uid());
create policy "portfolio_artifacts_owner_update" on public.portfolio_artifacts
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "applications_owner_select" on public.applications
for select to authenticated using (user_id = auth.uid());
create policy "applications_owner_insert" on public.applications
for insert to authenticated with check (user_id = auth.uid());
create policy "applications_owner_update" on public.applications
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "application_portfolio_artifacts_owner_access" on public.application_portfolio_artifacts
for all to authenticated
using (exists (
  select 1 from public.applications application
  where application.id = application_portfolio_artifacts.application_id and application.user_id = auth.uid()
))
with check (exists (
  select 1 from public.applications application
  where application.id = application_portfolio_artifacts.application_id and application.user_id = auth.uid()
));

create policy "application_status_history_owner_select" on public.application_status_history
for select to authenticated using (exists (
  select 1 from public.applications application
  where application.id = application_status_history.application_id and application.user_id = auth.uid()
));

create policy "application_notes_owner_select" on public.application_notes
for select to authenticated using (exists (
  select 1 from public.applications application
  where application.id = application_notes.application_id and application.user_id = auth.uid()
));
create policy "application_notes_owner_insert" on public.application_notes
for insert to authenticated with check (exists (
  select 1 from public.applications application
  where application.id = application_notes.application_id and application.user_id = auth.uid()
));
create policy "application_notes_owner_update" on public.application_notes
for update to authenticated using (exists (
  select 1 from public.applications application
  where application.id = application_notes.application_id and application.user_id = auth.uid()
)) with check (exists (
  select 1 from public.applications application
  where application.id = application_notes.application_id and application.user_id = auth.uid()
));

create policy "cover_letters_owner_select" on public.cover_letters
for select to authenticated using (exists (
  select 1 from public.applications application
  where application.id = cover_letters.application_id and application.user_id = auth.uid()
));
create policy "cover_letters_owner_insert" on public.cover_letters
for insert to authenticated with check (exists (
  select 1 from public.applications application
  where application.id = cover_letters.application_id and application.user_id = auth.uid()
));
create policy "cover_letters_owner_update" on public.cover_letters
for update to authenticated using (exists (
  select 1 from public.applications application
  where application.id = cover_letters.application_id and application.user_id = auth.uid()
)) with check (exists (
  select 1 from public.applications application
  where application.id = cover_letters.application_id and application.user_id = auth.uid()
));

create policy "ai_consents_owner_select" on public.ai_consents
for select to authenticated using (user_id = auth.uid());
create policy "ai_consents_owner_insert" on public.ai_consents
for insert to authenticated with check (user_id = auth.uid());
create policy "ai_consents_owner_update" on public.ai_consents
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "ai_analyses_owner_select" on public.ai_analyses
for select to authenticated using (user_id = auth.uid());
create policy "ai_analyses_owner_insert" on public.ai_analyses
for insert to authenticated with check (user_id = auth.uid());

-- ai_usage_daily intentionally has no authenticated policy. It is updated only by server-side code.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cv-files', 'cv-files', false, 5242880, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "cv_files_owner_read" on storage.objects
for select to authenticated
using (bucket_id = 'cv-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "cv_files_owner_upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'cv-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "cv_files_owner_update" on storage.objects
for update to authenticated
using (bucket_id = 'cv-files' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'cv-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "cv_files_owner_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'cv-files' and (storage.foldername(name))[1] = auth.uid()::text);
