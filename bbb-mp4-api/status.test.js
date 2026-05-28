process.env.MP4_DIR = '/tmp/bbb-mp4-test';

const test = require('node:test');
const assert = require('node:assert');
const { resolveStatus, isValidRecordId } = require('./status');

test('rejects malformed ids', () => {
  assert.strictEqual(resolveStatus('nope'), 'None');
  assert.strictEqual(isValidRecordId('aaa'), false);
  assert.strictEqual(isValidRecordId('a'.repeat(40) + '-1779817342444'), true);
});
