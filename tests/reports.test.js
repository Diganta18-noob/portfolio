import test from 'node:test';
import assert from 'node:assert/strict';
import {csvCell, enquiriesCsv} from '../src/utils/reports.js';
test('CSV neutralizes spreadsheet formulas and preserves quotes and line breaks', () => {
  assert.equal(csvCell(' =SUM(A1)'), '"\' =SUM(A1)"');
  assert.equal(csvCell('say "hello"\nnext'), '"say ""hello""\nnext"');
  assert.ok(enquiriesCsv([{message:'@evil',is_read:false}]).includes("'@evil"));
});
