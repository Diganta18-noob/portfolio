import test from 'node:test';
import assert from 'node:assert/strict';
import {paginate} from '../src/utils/pagination.js';
test('deleting the last comment on a page returns to remaining comments',()=>{
  const before=Array.from({length:11},(_,id)=>({id}));
  assert.equal(paginate(before,2,10).items.length,1);
  const after=paginate(before.slice(0,10),2,10);
  assert.equal(after.page,1);
  assert.equal(after.totalPages,1);
  assert.equal(after.items.length,10);
});
test('empty and filtered comments always produce a valid first page',()=>{
  assert.deepEqual(paginate([],3,10),{page:1,totalPages:1,items:[]});
});
