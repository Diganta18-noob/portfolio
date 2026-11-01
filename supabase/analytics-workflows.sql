-- Additive analytics and inbox workflow migration. Run after setup.sql.
begin;
alter table public.contact_messages add column if not exists workflow_status text not null default 'new' check(workflow_status in ('new','reviewing','follow-up','closed','archived'));
alter table public.contact_messages add column if not exists admin_notes text not null default '';
alter table public.contact_messages add column if not exists tags text[] not null default '{}';
create table if not exists public.analytics_events (
 event_id uuid primary key, received_at timestamptz not null default now(),
 session_id uuid not null, event_name text not null check(event_name in ('page_view','project_view','project_demo_click','project_source_click','resume_click','contact_start','contact_submit_success','social_click')),
 path text not null check(length(path)<=200), project_key text check(length(project_key)<=150)
);
create index if not exists analytics_received_idx on public.analytics_events(received_at);
alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon,authenticated;
grant select on public.analytics_events to authenticated;
drop policy if exists analytics_admin_read on public.analytics_events;
create policy analytics_admin_read on public.analytics_events for select to authenticated using(public.is_portfolio_admin());
create or replace function public.record_portfolio_event(event_id uuid, session_id uuid, event_name text, path text, project_key text default null) returns void
language plpgsql security definer set search_path='' as $$
begin
 if public.is_portfolio_admin() then return; end if;
 if event_name not in ('page_view','project_view','project_demo_click','project_source_click','resume_click','contact_start','contact_submit_success','social_click') or path !~ '^/' or path ~ '[?#]' or path ~ '^/(admin|login|dashboard)' or length(path)>200 or length(coalesce(project_key,''))>150 then raise exception 'Invalid event'; end if;
 perform pg_advisory_xact_lock(hashtextextended(session_id::text,0));
 if (select count(*) from public.analytics_events e where e.session_id=record_portfolio_event.session_id and e.received_at>now()-interval '1 minute')>=30 then return; end if;
 insert into public.analytics_events(event_id,session_id,event_name,path,project_key) values(event_id,session_id,event_name,path,project_key) on conflict do nothing;
end $$;
revoke all on function public.record_portfolio_event(uuid,uuid,text,text,text) from public;
grant execute on function public.record_portfolio_event(uuid,uuid,text,text,text) to anon,authenticated;
commit;
-- Public telemetry is untrusted; client-supplied successes are observations, not the authoritative enquiry count.
-- Session rate limit is best-effort, not bot protection; deploy gateway rate limiting before high traffic.
