drop policy if exists "Public can submit unapproved fixes" on public.fixes;

create policy "Public can submit unapproved fixes"
on public.fixes
for insert
to public
with check (approved = false);
