const fs = require('fs');
const { execSync } = require('child_process');

const MP4_DIR = process.env.MP4_DIR;
if (!MP4_DIR) throw new Error('MP4_DIR is required');

const QUEUE_TTL_MS = 6 * 60 * 60 * 1000;
const queue = new Map();

function isValidRecordId(id) {
  return /^[a-f0-9]{40}-\d{13}$/.test(id);
}

function resolveStatus(id, now = Date.now()) {
  if (!isValidRecordId(id)) return 'None';
  if (fs.existsSync(`${MP4_DIR}/${id}.mp4`)) return 'Available';
  try {
    const out = execSync(`docker ps --filter name=${id} --format '{{.ID}}'`, { encoding: 'utf8' });
    if (out.trim()) return 'Converting';
  } catch { /* docker missing or error → fall through */ }
  const queuedAt = queue.get(id);
  if (queuedAt && now - queuedAt < QUEUE_TTL_MS) return 'Queued';
  queue.delete(id);
  return 'None';
}

function markQueued(id, now = Date.now()) { queue.set(id, now); }

module.exports = { resolveStatus, markQueued, isValidRecordId };
