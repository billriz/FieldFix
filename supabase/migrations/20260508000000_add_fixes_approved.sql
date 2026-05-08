alter table public.fixes
add column if not exists approved boolean not null default false;

create index if not exists fixes_approved_updated_at_idx
on public.fixes (approved, updated_at desc);
