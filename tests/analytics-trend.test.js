import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyActivity } from '../src/utils/analytics.js';

const row = (time, session = 'a') => ({ received_at: time, session_id: session });

test('daily activity respects Kolkata midnight, zero-fills and counts daily sessions once', () => {
  const start = Date.parse('2026-11-01T18:30:00Z');
  const end = Date.parse('2026-11-04T18:30:00Z');
  const result = dailyActivity([
    row('2026-11-01T18:30:00Z'), row('2026-11-01T19:00:00Z'),
    row('2026-11-01T20:00:00Z', 'b'), row('2026-11-03T18:30:00Z'),
    row('2026-11-04T18:30:00Z', 'excluded'),
  ], start, end);
  assert.deepEqual(result.map(d => [d.day, d.events, d.sessions]), [
    ['2026-11-02', 3, 2], ['2026-11-03', 0, 0], ['2026-11-04', 1, 1],
  ]);
});

test('previous events align to an equal-length period with exclusive boundaries', () => {
  const start = Date.parse('2026-11-02T00:00:00Z');
  const end = Date.parse('2026-11-04T00:00:00Z');
  const result = dailyActivity([
    row('2026-10-31T00:00:00Z'), row('2026-11-01T23:59:59Z'),
    row('2026-10-30T23:59:59Z'), row('2026-11-02T00:00:00Z'),
  ], start, end);
  assert.equal(result.reduce((n, d) => n + d.previousEvents, 0), 2);
  assert.equal(result.reduce((n, d) => n + d.events, 0), 1);
  assert.equal(result[0].previousEvents, 1);
  assert.equal(result.at(-1).previousEvents, 1);
  assert.deepEqual(dailyActivity([], end, start), []);
});
