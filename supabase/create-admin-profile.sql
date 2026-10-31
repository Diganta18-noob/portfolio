-- First create this email under Supabase Authentication > Users > Add user.
-- Set your own password there. This script grants that existing user the admin role.
do $$
declare owner_id uuid;
begin
  select id into owner_id from auth.users
  where lower(email) = 'digantab.cse.jisu21@gmail.com' and deleted_at is null;
  if owner_id is null then
    raise exception 'First create digantab.cse.jisu21@gmail.com in Authentication > Users, then run this script again.';
  end if;
  insert into public.profiles(id,username,role)
  values(owner_id,'diganta','admin')
  on conflict(id) do update set role='admin';
end;
$$;
select 'Admin profile ready. Sign in at https://www.diganta.tech/admin with your Auth user email and password.' as status;
