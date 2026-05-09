drop policy if exists "Public can read file fix links" on public.fix_files;

create policy "Public can read file fix links"
on public.fix_files
for select
to anon, authenticated
using (true);

insert into public.fix_files (fix_id, file_id, role)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '44444444-4444-4444-8444-444444444441',
    'reference'
  ),
  (
    '11111111-1111-4111-8111-111111111111',
    '44444444-4444-4444-8444-444444444442',
    'reference'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '44444444-4444-4444-8444-444444444444',
    'diagram'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '44444444-4444-4444-8444-444444444445',
    'form'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444446',
    'diagram'
  )
on conflict (fix_id, file_id) do update
set role = excluded.role;
