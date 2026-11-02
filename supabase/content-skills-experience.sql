begin;
alter table public.site_content add column if not exists skills jsonb;
alter table public.site_content add column if not exists experience jsonb;
alter table public.site_content_versions add column if not exists skills jsonb;
alter table public.site_content_versions add column if not exists experience jsonb;
create or replace function public.publish_portfolio_content(content text,skills_list jsonb,experience_list jsonb) returns void language plpgsql security definer set search_path='' as $$
declare item jsonb;
begin
 if not public.is_portfolio_admin() then raise exception 'Admin access required'; end if;
 if skills_list is null or experience_list is null or jsonb_typeof(skills_list)<>'array' or jsonb_typeof(experience_list)<>'array' then raise exception 'Lists required';end if;
 if jsonb_array_length(skills_list)>50 or jsonb_array_length(experience_list)>30 then raise exception 'Too many entries';end if;
 for item in select value from jsonb_array_elements(skills_list) loop
 if jsonb_typeof(item)<>'string' or length(trim(item#>>'{}')) not between 1 and 80 then raise exception 'Invalid skill';end if;end loop;
 for item in select value from jsonb_array_elements(experience_list) loop
 if jsonb_typeof(item)<>'object' or coalesce(length(trim(item->>'role')),0) not between 1 and 150 or coalesce(length(trim(item->>'company')),0) not between 1 and 150 or coalesce(length(item->>'period'),0)>100 or coalesce(length(item->>'description'),0)>2000 then raise exception 'Invalid experience';end if;end loop;
 insert into public.site_content_versions(bio,skills,experience,created_by) values(trim(content),skills_list,experience_list,auth.uid());
 insert into public.site_content(id,bio,skills,experience) values(1,trim(content),skills_list,experience_list) on conflict(id) do update set bio=excluded.bio,skills=excluded.skills,experience=excluded.experience,updated_at=now();
end $$;
revoke all on function public.publish_portfolio_content(text,jsonb,jsonb) from public;
grant execute on function public.publish_portfolio_content(text,jsonb,jsonb) to authenticated;
commit;
