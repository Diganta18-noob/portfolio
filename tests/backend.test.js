import test from 'node:test';
import assert from 'node:assert/strict';
import { backendSettings, requireAdmin, submitMessage, fetchPublicProjects, uploadPortfolioImage } from '../src/services/backend.js';

test('backend is static without credentials and live with valid public credentials', () => {
  assert.equal(backendSettings({}).configured, false);
  assert.equal(backendSettings({VITE_SUPABASE_URL:'https://mine.supabase.co',VITE_SUPABASE_ANON_KEY:'public-key'}).configured, true);
  assert.equal(backendSettings({VITE_SUPABASE_URL:'bad-url',VITE_SUPABASE_ANON_KEY:'x'}).configured, false);
  assert.equal(backendSettings({VITE_SUPABASE_URL:'https://mine.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_x'}).configured, true);
  assert.equal(backendSettings({VITE_SUPABASE_URL:'https://mine.supabase.co',VITE_SUPABASE_ANON_KEY:'sb_secret_no'}).configured, false);
});
test('only a verified admin profile can enter dashboard', async () => {
  const make = (role, error=null) => ({auth:{getUser:async()=>({data:{user:{id:'owner'}},error:null})},from:()=>({select:()=>({eq:()=>({single:async()=>({data:{role},error})})})})});
  assert.equal(await requireAdmin(make('admin')), true);
  assert.equal(await requireAdmin(make('user')), false);
  assert.equal(await requireAdmin(make('admin',new Error('policy denied'))), false);
  assert.equal(await requireAdmin({auth:{getUser:async()=>({data:{user:null}})}}), false);
});
test('contact submits trimmed private message, with no read privilege required', async () => {
  let payload;
  const client={rpc:async(name,data)=>{assert.equal(name,'submit_contact_message');payload=data;return {error:null};}};
  await submitMessage(client,{name:' Diganta ',email:' hi@example.com ',message:' Hello from my portfolio '});
  assert.deepEqual(payload,{sender_name:'Diganta',sender_email:'hi@example.com',message_body:'Hello from my portfolio'});
});
test('invalid contact input never reaches the backend', async () => {
  const client={rpc:()=>{throw new Error('should not call')}};
  await assert.rejects(submitMessage(client,{name:' ',email:'x',message:' '}),/name|email|message/i);
  await assert.rejects(submitMessage(client,{name:'A',email:'invalid',message:'Hello'}),/email/i);
  await assert.rejects(submitMessage(client,{name:'A',email:'a@b.com',message:'x'.repeat(5001)}),/5000/);
});
test('message delivery errors reject; success cannot be inferred from network failure', async () => {
  await assert.rejects(submitMessage({rpc:async()=>({error:new Error('offline')})},{name:'A',email:'a@b.com',message:'Hello'}),/offline/);
  await assert.rejects(submitMessage(null,{name:'A',email:'a@b.com',message:'Hello'}),/configured/i);
});
test('public project reads filter publication and propagate failures', async () => {
  let filter;
  const client={from:()=>({select:()=>({eq:(key,value)=>{filter=[key,value];return {order:async()=>({data:[{id:1}],error:null})};}})})};
  assert.deepEqual(await fetchPublicProjects(client),[{id:1}]);
  assert.deepEqual(filter,['is_published',true]);
});
test('storage rejects unsafe files and does not manufacture URL on failed upload', async () => {
  await assert.rejects(uploadPortfolioImage(null,'project-images',{type:'text/html',size:10}),/PNG|JPEG|WebP/i);
  await assert.rejects(uploadPortfolioImage(null,'project-images',{type:'image/png',size:6*1024*1024}),/5 MB/);
  let requestedURL=false;
  const client={storage:{from:()=>({upload:async()=>({error:new Error('bucket denied')}),getPublicUrl:()=>{requestedURL=true;}})}};
  await assert.rejects(uploadPortfolioImage(client,'project-images',{type:'image/png',size:100}),/bucket denied/);
  assert.equal(requestedURL,false);
});

import { checked } from '../src/services/backend.js';
test('checked mutations never hide database errors', async () => {
  await assert.rejects(checked(Promise.resolve({data:null,error:new Error('row denied')})),/row denied/);
  await assert.rejects(checked(Promise.reject(new Error('connection dropped'))),/connection dropped/);
  assert.deepEqual(await checked(Promise.resolve({data:{id:7},error:null})),{id:7});
});
test('legacy service-role JWTs are rejected before client initialization', () => {
  const token='header.'+Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')+'.signature';
  assert.equal(backendSettings({VITE_SUPABASE_URL:'https://mine.supabase.co',VITE_SUPABASE_ANON_KEY:token}).configured,false);
});
test('public project request failures are surfaced rather than using stale drafts', async () => {
  const client={from:()=>({select:()=>({eq:()=>({order:async()=>({data:null,error:new Error('network unavailable')})})})})};
  await assert.rejects(fetchPublicProjects(client),/network unavailable/);
});
