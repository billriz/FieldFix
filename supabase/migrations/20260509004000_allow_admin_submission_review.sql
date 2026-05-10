drop policy if exists "Public can read pending fixes" on public.fixes;
drop policy if exists "Public can approve pending fixes" on public.fixes;
drop policy if exists "Public can reject pending fixes" on public.fixes;

create policy "Public can read pending fixes"
on public.fixes
for select
to public
using (approved = false);

create policy "Public can approve pending fixes"
on public.fixes
for update
to public
using (approved = false)
with check (approved = true);

create policy "Public can reject pending fixes"
on public.fixes
for delete
to public
using (approved = false);
