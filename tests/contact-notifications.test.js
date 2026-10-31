import test from 'node:test';
import assert from 'node:assert/strict';
import {submitContactWithNotification,fetchPublicComments} from '../src/services/backend.js';
const form={name:'Visitor',email:'visitor@example.com',message:'Hello Diganta'};
const recipient='owner@example.com';
test('email notification follows acknowledged inbox storage',async()=>{
  const calls=[];
  const client={rpc:async()=>{calls.push('database');return {error:null};}};
  const fetchImpl=async(url,options)=>{calls.push('email');const body=JSON.parse(options.body);assert.equal(body.email,form.email);assert.equal(body.message,form.message);return {ok:true,json:async()=>({success:'true'})};};
  assert.deepEqual(await submitContactWithNotification(client,form,{recipient,fetchImpl}),{saved:true,notification:'accepted'});
  assert.deepEqual(calls,['database','email']);
});
test('failed storage never sends email or reports success',async()=>{
  let sent=false;
  await assert.rejects(submitContactWithNotification({rpc:async()=>({error:Error('offline')})},form,{recipient,fetchImpl:async()=>{sent=true;}}),/offline/);
  assert.equal(sent,false);
});
test('HTTP 200 with failed provider result does not claim an email was sent',async()=>{
  const client={rpc:async()=>({error:null})};
  const result=await submitContactWithNotification(client,form,{recipient,fetchImpl:async()=>({ok:true,json:async()=>({success:'false',message:'Provider rejected request'})})});
  assert.deepEqual(result,{saved:true,notification:'unavailable'});
});
test('activation requirement and network failure retain acknowledged inbox storage',async()=>{
  const client={rpc:async()=>({error:null})};
  assert.deepEqual(await submitContactWithNotification(client,form,{recipient,fetchImpl:async()=>({ok:true,json:async()=>({success:'false',message:'This form needs Activation.'})})}),{saved:true,notification:'activation_required'});
  assert.deepEqual(await submitContactWithNotification(client,form,{recipient,fetchImpl:async()=>{throw Error('timeout')}}),{saved:true,notification:'unavailable'});
});
test('guestbook excludes only exact imported ids and keeps visitor comments',async()=>{
  const rows=[{id:'imported',content:'Template greeting'},{id:'visitor',content:'Hello'}];
  const client={from:()=>({select:()=>({order:()=>({order:()=>({limit:async()=>({data:rows,error:null})})})})})};
  assert.deepEqual(await fetchPublicComments(client,['imported']),[rows[1]]);
});
