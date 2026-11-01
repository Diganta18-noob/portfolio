-- Additive content revisions, saved reports and server-written audit history.
begin;
create table if not exists public.site_content_versions(id bigint generated always as identity primary key,bio text not null check(length(bio) between 1 and 5000),created_at timestamptz not null default now(),created_by uuid not null default auth.uid());
create table if not exists public.site_content(id integer primary key check(id=1),bio text not null check(length(bio) between 1 and 5000),updated_at timestamptz not null default now());
create table if not exists public.report_presets(id uuid primary key default gen_random_uuid(),owner_id uuid not null default auth.uid(),name text not null check(length(name) between 1 and 80),days integer not null check(days in(7,30,90,365)),created_at timestamptz not null default now());
create table if not exists public.admin_audit_events(id bigint generated always as identity primary key,actor uuid,action text not null,entity text not null,entity_id text,created_at timestamptz not null default now());
alter table public.site_content_versions enable row level security;
alter table public.site_content enable row level security;
alter table public.report_presets enable row level security;
alter table public.admin_audit_events enable row level security;
revoke all on public.site_content_versions,public.site_content,public.report_presets,public.admin_audit_events from anon,authenticated;
grant select on public.site_content to anon,authenticated;
grant select on public.site_content_versions,public.admin_audit_events to authenticated;
grant select,insert,delete on public.report_presets to authenticated;
drop policy if exists published_content on public.site_content;
create policy published_content on public.site_content for select using(true);
drop policy if exists revisions_admin on public.site_content_versions;
create policy revisions_admin on public.site_content_versions for select to authenticated using(public.is_portfolio_admin());
drop policy if exists audit_admin on public.admin_audit_events;
create policy audit_admin on public.admin_audit_events for select to authenticated using(public.is_portfolio_admin());
drop policy if exists presets_owner on public.report_presets;
create policy presets_owner on public.report_presets for all to authenticated using(public.is_portfolio_admin() and owner_id=auth.uid()) with check(public.is_portfolio_admin() and owner_id=auth.uid());
create or replace function public.publish_portfolio_bio(content text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_portfolio_admin() then raise exception 'Admin access required'; end if;
 insert into public.site_content_versions(bio,created_by) values(trim(content),auth.uid());
 insert into public.site_content(id,bio) values(1,trim(content)) on conflict(id) do update set bio=excluded.bio,updated_at=now();
end $$;
revoke all on function public.publish_portfolio_bio(text) from public;
grant execute on function public.publish_portfolio_bio(text) to authenticated;
create or replace function public.audit_portfolio_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.admin_audit_events(actor,action,entity,entity_id) values(auth.uid(),TG_OP,TG_TABLE_NAME,case when TG_OP='DELETE' then old.id::text else new.id::text end);
 if TG_OP='DELETE' then return old; end if; return new;
end $$;
revoke all on function public.audit_portfolio_change() from public;
do $$ declare table_name text; begin
 foreach table_name in array array['projects','certificates','portfolio_comments','contact_messages','site_content'] loop
 execute format('drop trigger if exists portfolio_audit on public.%I',table_name);
 execute format('create trigger portfolio_audit after insert or update or delete on public.%I for each row execute function public.audit_portfolio_change()',table_name);
 end loop;
end $$;
commit;
