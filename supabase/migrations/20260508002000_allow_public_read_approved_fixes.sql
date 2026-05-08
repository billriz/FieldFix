drop policy if exists "Public can read approved fixes" on public.fixes;

create policy "Public can read approved fixes"
on public.fixes
for select
to anon, authenticated
using (approved = true);
