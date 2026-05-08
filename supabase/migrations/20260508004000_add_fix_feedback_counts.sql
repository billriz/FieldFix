alter table public.fixes
add column if not exists success_count integer not null default 0 check (success_count >= 0),
add column if not exists failure_count integer not null default 0 check (failure_count >= 0);

create or replace function public.submit_fix_feedback(target_fix_id uuid, was_success boolean)
returns table(success_count integer, failure_count integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  if was_success then
    update public.fixes
    set success_count = public.fixes.success_count + 1
    where id = target_fix_id and approved = true
    returning public.fixes.success_count, public.fixes.failure_count
    into success_count, failure_count;

    if success_count is null then
      raise exception 'Fix not found';
    end if;

    insert into public.fix_feedback (fix_id, rating, comment)
    values (target_fix_id, 5, 'success');
  else
    update public.fixes
    set failure_count = public.fixes.failure_count + 1
    where id = target_fix_id and approved = true
    returning public.fixes.success_count, public.fixes.failure_count
    into success_count, failure_count;

    if failure_count is null then
      raise exception 'Fix not found';
    end if;

    insert into public.fix_feedback (fix_id, rating, comment)
    values (target_fix_id, 1, 'failure');
  end if;

  return next;
end;
$$;

grant execute on function public.submit_fix_feedback(uuid, boolean) to anon, authenticated;
