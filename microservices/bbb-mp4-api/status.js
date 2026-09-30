const fs = require('fs');
const { execSync } = require('child_process');

const MP4_DIR = process.env.MP4_DIR;
if (!MP4_DIR) throw new Error('MP4_DIR is required');
const QUEUE_FILE = process.env.QUEUE_FILE;
if (!QUEUE_FILE) throw new Error('QUEUE_FILE is required');

const QUEUE_TTL_MS = 6 * 60 * 60 * 1000;
const queue = new Map();

function loadQueue() {
  try {
    if (!fs.existsSync(QUEUE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
    for (const [k, v] of Object.entries(parsed)) queue.set(k, v);
  } catch (e) {
    console.error('queue load failed:', e.message);
  }
}

function persistQueue() {
  try {
    const tmp = `${QUEUE_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(Object.fromEntries(queue)));
    fs.renameSync(tmp, QUEUE_FILE);
  } catch (e) {
    console.error('queue persist failed:', e.message);
  }
}

loadQueue();

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
  if (queue.delete(id)) persistQueue();
  return 'None';
}

function markQueued(id, now = Date.now()) {
  queue.set(id, now);
  persistQueue();
}

function unqueue(id) {
  const had = queue.delete(id);
  if (had) persistQueue();
  return had;
}

function getQueueIds() {
  return Array.from(queue.keys());
}

module.exports = { resolveStatus, markQueued, unqueue, getQueueIds, isValidRecordId };
