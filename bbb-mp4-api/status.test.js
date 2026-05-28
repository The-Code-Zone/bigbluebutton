process.env.MP4_DIR = '/tmp/bbb-mp4-test';
process.env.QUEUE_FILE = '/tmp/bbb-mp4-test-queue.json';

const fs = require('node:fs');
const { test, after } = require('node:test');
const assert = require('node:assert');

try { fs.unlinkSync(process.env.QUEUE_FILE); } catch { }

const { resolveStatus, markQueued, unqueue, isValidRecordId } = require('./status');

const validId = 'a'.repeat(40) + '-1779817342444';

test('rejects malformed ids', () => {
  assert.strictEqual(resolveStatus('nope'), 'None');
  assert.strictEqual(isValidRecordId('aaa'), false);
  assert.strictEqual(isValidRecordId(validId), true);
});

test('unqueue returns true once, then false', () => {
  markQueued(validId);
  assert.strictEqual(unqueue(validId), true);
  assert.strictEqual(unqueue(validId), false);
});

test('markQueued persists to disk', () => {
  markQueued(validId);
  const data = JSON.parse(fs.readFileSync(process.env.QUEUE_FILE, 'utf8'));
  assert.strictEqual(typeof data[validId], 'number');
  unqueue(validId);
});

after(() => {
  try { fs.unlinkSync(process.env.QUEUE_FILE); } catch { }
});
