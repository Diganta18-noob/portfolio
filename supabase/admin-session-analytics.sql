-- Private owner workspace session observations. Requires setup.sql.
begin;
create table if not exists public.admin_workspace_sessions (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 started_at timestamptz not null default now(),last_seen_at timestamptz not null default now(),ended_at timestamptz,
 active_seconds integer not null default 0 check(active_seconds>=0)
);
alter table public.admin_workspace_sessions enable row level security;
revoke all on public.admin_workspace_sessions from anon,authenticated;
grant select on public.admin_workspace_sessions to authenticated;
drop policy if exists owner_session_read on public.admin_workspace_sessions;
create policy owner_session_read on public.admin_workspace_sessions for select to authenticated using(public.is_portfolio_admin());
create or replace function public.observe_admin_session(session_key uuid default null,finish boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if not public.is_portfolio_admin() then raise exception 'Admin access required';end if;
 if session_key is null then
 if finish then return null;end if;
 insert into public.admin_workspace_sessions(user_id) values(auth.uid()) returning id into result;
 else
 update public.admin_workspace_sessions set active_seconds=active_seconds+least(30,greatest(0,floor(extract(epoch from(now()-last_seen_at)))::integer)),last_seen_at=now(),ended_at=case when finish then now() else null end
 where id=session_key and user_id=auth.uid() and ended_at is null returning id into result;
 end if;
 return result;
end $$;
revoke all on function public.observe_admin_session(uuid,boolean) from public;
grant execute on function public.observe_admin_session(uuid,boolean) to authenticated;
commit;
