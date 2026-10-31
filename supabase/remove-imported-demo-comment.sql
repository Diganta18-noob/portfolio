-- Remove only the confirmed imported demo comment. Visitor comments are preserved.
-- Run once in your Supabase SQL Editor, or delete this row from Admin > Comments.
begin;
delete from public.portfolio_comments
where id = 'e2b8bdfe-9b86-4580-9541-2a36face2d12'::uuid
  and md5(user_name || E'\n' || content) = '04f07b0d91829326687c55899e3a4791'
returning id;
commit;
