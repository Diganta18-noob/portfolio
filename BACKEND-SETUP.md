# Connect your portfolio backend

Backend setup for Diganta Biswas’s personal portfolio.

## 1. Connect Supabase
Create `.env.local` in the project root, based on `.env.example`:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLIC-PUBLISHABLE-KEY
```

A legacy `VITE_SUPABASE_ANON_KEY` also works. Never use a service-role/secret key in Vite. Restart the dev server after changing environment values. The app automatically uses the backend when both settings are present; there is no static-mode toggle to forget.

Without these values, the public site uses your local projects; contact opens an email draft; admin login is disabled with setup instructions. No local mock messages are presented as delivered.

## 2. Set up tables, permissions, and storage
Run `supabase/setup.sql` in your own project's SQL Editor. It owns/replaces policies for the five portfolio tables and the three portfolio image buckets, including inherited template policies; unrelated tables/buckets are left alone. Inspect the SQL before using it with a shared database. Existing portfolio records are kept. Older template tables are upgraded with missing columns (including `is_published` and `order_index`); existing UUID IDs are retained. If an earlier copy failed, replace the entire SQL Editor query with the updated file and run it again. If the editor reports an aborted transaction, run `ROLLBACK;` before retrying.

Then run `supabase/seed.sql` to add your four personal projects. It does not overwrite or duplicate matching titles. Once connected, the site reads database projects rather than merging static samples; this makes dashboard deletions and draft status authoritative.

## 3. Create your admin account
In Supabase Authentication, add your own user and set its password. Copy that user's UUID. Run the following in SQL Editor after replacing the UUID (not in the browser console):

```sql
insert into public.profiles (id, username, role)
values ('YOUR-AUTH-USER-UUID', 'diganta', 'admin')
on conflict (id) do update set role = 'admin';
```

You can instead run `supabase/create-admin-profile.sql` after creating the Auth user with your portfolio contact email; it finds the UUID for you.

Visit `/admin` or `/login`. `/admin` directs you through the protected dashboard and shows login when signed out. Sign in with the account you created. There is no default password or bypass account. Public signup is unnecessary; disable it in your Supabase Auth settings if you do not use it.

## 4. What is connected
- `/dashboard/projects`: create, edit, publish/unpublish, and delete projects. New database records appear on the public site after refresh. Image uploads validate type/size and surface storage failures.
- `/dashboard/certificates`: upload/delete certificates with error reporting.
- `/dashboard/comments`: read, feature/unfeature, and delete public comments.
- `/dashboard/messages`: read private contact enquiries, mark read/unread, filter unread, paginate, reply through your email app, and delete. A successful form submission means the database received it. FormSubmit also requests an email notification; the recipient must activate the form once. Failed notifications do not erase saved enquiries.
- Public guestbook: database-backed text comments; anonymous image uploads are disabled to prevent storage abuse. No fake browser-only delivery. Comment changes use Supabase Realtime.

Messages are submitted through a validated RPC; anonymous users have no table read access. A server-side limit allows five contact messages per sender email per hour. The honeypot and email limit are basic spam controls, not a full bot protection service.

## 5. Verify your own project
1. Signed out: open `/dashboard/messages`; it must redirect to `/login`.
2. Sign in with your admin account. Create/edit a project, save as draft, and verify a signed-out browser cannot see it or its detail route. Publish it and check again.
3. Upload a PNG/JPEG/WebP smaller than 5 MB. A larger file or a failed upload must show an error and keep the form open.
4. In a signed-out browser, submit one private contact message. Confirm it appears only in your admin inbox; test read/unread and delete.
5. Attempt a direct anonymous SELECT on `contact_messages`; it must be denied. A signed-in non-admin must see no messages and cannot edit projects or grant itself admin.
6. Post a public guestbook comment. Verify feature/unfeature and deletion from the dashboard.
7. Disconnect the network during submission: the text must remain, with an error, and no success notice.
8. Sign out; the dashboard must become inaccessible.

Run `npm test` and `npm run build` for local regression/build checks. Live login, database policies, storage, and delivery need your Supabase credentials and executed SQL to verify end to end.
