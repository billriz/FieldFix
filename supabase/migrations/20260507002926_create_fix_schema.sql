create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create table if not exists public.fixes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  error_code text,
  model text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fix_feedback (
  id uuid primary key default gen_random_uuid(),
  fix_id uuid not null references public.fixes(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'fix-files',
  path text not null,
  filename text not null,
  content_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path)
);

create table if not exists public.fix_files (
  id uuid primary key default gen_random_uuid(),
  fix_id uuid not null references public.fixes(id) on delete cascade,
  file_id uuid not null references public.files(id) on delete cascade,
  role text not null default 'attachment',
  created_at timestamptz not null default now(),
  unique (fix_id, file_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_fixes_updated_at on public.fixes;
create trigger set_fixes_updated_at
before update on public.fixes
for each row
execute function public.set_updated_at();

drop trigger if exists set_fix_feedback_updated_at on public.fix_feedback;
create trigger set_fix_feedback_updated_at
before update on public.fix_feedback
for each row
execute function public.set_updated_at();

drop trigger if exists set_files_updated_at on public.files;
create trigger set_files_updated_at
before update on public.files
for each row
execute function public.set_updated_at();

create index if not exists fixes_title_trgm_idx
on public.fixes using gin (title gin_trgm_ops);

create index if not exists fixes_error_code_idx
on public.fixes (error_code);

create index if not exists fixes_model_idx
on public.fixes (model);

create index if not exists fix_feedback_fix_id_idx
on public.fix_feedback (fix_id);

create index if not exists fix_files_fix_id_idx
on public.fix_files (fix_id);

create index if not exists fix_files_file_id_idx
on public.fix_files (file_id);

create index if not exists files_filename_trgm_idx
on public.files using gin (filename gin_trgm_ops);
