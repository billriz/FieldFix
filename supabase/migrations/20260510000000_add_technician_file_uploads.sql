insert into storage.buckets (id, name, public, file_size_limit)
values ('technician-files', 'technician-files', true, 52428800)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

alter table public.files
add column if not exists file_url text,
add column if not exists model text;

create index if not exists files_model_idx
on public.files (model);

drop policy if exists "Public can read technician files" on storage.objects;
drop policy if exists "Public can upload technician files" on storage.objects;
drop policy if exists "Public can add technician file records" on public.files;

create policy "Public can read technician files"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'technician-files');

create policy "Public can upload technician files"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'technician-files');

create policy "Public can add technician file records"
on public.files
for insert
to anon, authenticated
with check (bucket = 'technician-files' and file_url is not null);
