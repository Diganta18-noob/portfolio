import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const setup=fs.readFileSync(new URL('../supabase/setup.sql',import.meta.url),'utf8');
async function fixture(){
  const db=new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to anon,authenticated;
    create schema storage;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    grant usage on schema storage to anon,authenticated;
    grant select,insert,delete on storage.objects to anon,authenticated;
  `);
  return db;
}
test('setup upgrades old tables, preserves records and UUID ids, and can run twice',async()=>{
  const db=await fixture();
  try{
    await db.exec(`create table public.projects(id uuid primary key default gen_random_uuid(),"Title" text,"Description" text,"Img" text,"Link" text,"Github" text); insert into public.projects("Title") values('Existing project'); create table public.certificates(id uuid primary key default gen_random_uuid(),"Img" text); create table public.portfolio_comments(id uuid primary key default gen_random_uuid(),user_name text,content text);`);
    await assert.rejects(db.query('select is_published from public.projects'),/does not exist/);
    await db.exec(setup);
    assert.equal((await db.query('select "Title",is_published,order_index from public.projects')).rows[0].Title,'Existing project');
    assert.equal((await db.query('select is_published from public.projects')).rows[0].is_published,true);
    await db.exec(setup);
    assert.equal((await db.query('select count(*)::int as count from public.projects')).rows[0].count,1);
    assert.equal((await db.query("select data_type from information_schema.columns where table_schema='public' and table_name='projects' and column_name='id'")).rows[0].data_type,'uuid');
  }finally{await db.close();}
});
test('fresh setup enforces inbox privacy, published reads, and no anonymous uploads',async()=>{
  const db=await fixture();
  try{
    await db.exec(setup);
    await db.exec(`insert into public.projects("Title",is_published) values('Visible',true),('Draft',false); set role anon;`);
    assert.equal((await db.query('select "Title" from public.projects')).rows.length,1);
    await assert.rejects(db.query('select * from public.contact_messages'),/permission denied/);
    await db.query("select public.submit_contact_message('Visitor','visitor@example.com','Test private message')");
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values('profile-images','test.png')"),/row-level security/);
    await db.exec('reset role');
    assert.equal((await db.query('select count(*)::int as count from public.contact_messages')).rows[0].count,1);
    await db.exec("set role authenticated");
    assert.equal((await db.query('select * from public.contact_messages')).rows.length,0);
  }finally{await db.close();}
});

test('admin setup requires an existing Auth user and is safe to rerun',async()=>{
  const db=await fixture();
  try{
    await db.exec(setup);
    await db.exec('alter table auth.users add column email text, add column deleted_at timestamptz');
    const adminSQL=fs.readFileSync(new URL('../supabase/create-admin-profile.sql',import.meta.url),'utf8');
    await assert.rejects(db.exec(adminSQL),/First create/);
    await db.exec("insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000001','digantab.cse.jisu21@gmail.com')");
    await db.exec(adminSQL);
    await db.exec(adminSQL);
    const result=await db.query('select role from public.profiles');
    assert.deepEqual(result.rows,[{role:'admin'}]);
  }finally{await db.close();}
});

test('analytics migration is repeatable, deduplicates events and denies public reads',async()=>{
 const db=await fixture();try{
 await db.exec(setup);
 const migration=fs.readFileSync(new URL('../supabase/analytics-workflows.sql',import.meta.url),'utf8');
 await db.exec(migration);await db.exec(migration);
 await db.exec('set role anon');
 const call="select public.record_portfolio_event('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','page_view','/',null)";
 await db.exec(call);await db.exec(call);
 await assert.rejects(db.query('select * from public.analytics_events'),/permission denied/);
 await assert.rejects(db.exec("select public.record_portfolio_event(gen_random_uuid(),gen_random_uuid(),'page_view','/login',null)"),/Invalid event/);
 await db.exec('reset role');
 assert.equal((await db.query('select count(*)::int as n from public.analytics_events')).rows[0].n,1);
 }finally{await db.close();}
});

test('content publishing saves revisions, public reads only published bio, audit has no message body',async()=>{const db=await fixture();try{await db.exec(setup);const sql=fs.readFileSync(new URL('../supabase/content-reports-audit.sql',import.meta.url),'utf8');await db.exec(sql);await db.exec(sql);await db.exec("insert into auth.users(id) values('11111111-1111-4111-8111-111111111111');insert into public.profiles(id,username,role) values('11111111-1111-4111-8111-111111111111','owner','admin');set role authenticated;select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);select public.publish_portfolio_bio('First biography');select public.publish_portfolio_bio('Second biography');");assert.equal((await db.query('select count(*)::int n from public.site_content_versions')).rows[0].n,2);assert.equal((await db.query('select count(*)::int n from public.admin_audit_events')).rows[0].n,2);await db.exec("reset role;select set_config('request.jwt.claim.sub','',false);set role anon;");assert.equal((await db.query('select bio from public.site_content')).rows[0].bio,'Second biography');await assert.rejects(db.query('select * from public.site_content_versions'),/permission denied/);await db.exec('reset role;set role authenticated');await assert.rejects(db.exec("select public.publish_portfolio_bio('Unauthorized')"),/Admin access required/);}finally{await db.close();}});
