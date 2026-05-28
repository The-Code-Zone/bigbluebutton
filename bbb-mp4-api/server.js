require('dotenv').config();
const express = require('express');
const { spawn, execSync } = require('child_process');
const { resolveStatus, markQueued, unqueue, getQueueIds, isValidRecordId } = require('./status');
const pkg = require('./package.json');

const PORT = 8479;
const SECRET = process.env.API_SECRET;
const BBB_MP4_SCRIPT = process.env.BBB_MP4_SCRIPT;
if (!SECRET) { console.error('API_SECRET is required'); process.exit(1); }
if (!BBB_MP4_SCRIPT) { console.error('BBB_MP4_SCRIPT is required'); process.exit(1); }

const app = express();
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const h = req.get('Authorization') || '';
  if (h !== `Bearer ${SECRET}`) return res.status(401).end();
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    version: pkg.version,
    queueSize: getQueueIds().length,
  });
});

app.get('/statuses', (req, res) => {
  const ids = (req.query.ids || '').split(',').filter(Boolean);
  const result = {};
  for (const id of ids) result[id] = resolveStatus(id);
  res.json(result);
});

app.get('/queue', (req, res) => {
  const ids = getQueueIds();
  const result = {};
  for (const id of ids) result[id] = resolveStatus(id);
  res.json(result);
});

app.post('/convert/:id', (req, res) => {
  const id = req.params.id;
  if (!isValidRecordId(id)) return res.status(400).json({ error: 'bad id' });
  const status = resolveStatus(id);
  if (status === 'None') {
    spawn('bash', [BBB_MP4_SCRIPT, id], { detached: true, stdio: 'ignore' }).unref();
    markQueued(id);
    return res.json({ status: 'Queued' });
  }
  res.json({ status });
});

app.delete('/convert/:id', (req, res) => {
  const id = req.params.id;
  if (!isValidRecordId(id)) return res.status(400).json({ error: 'bad id' });
  const status = resolveStatus(id);
  if (status === 'None') return res.status(404).json({ error: 'not tracked' });
  if (status === 'Available') return res.status(409).json({ error: 'already converted; nothing to cancel' });
  if (status === 'Queued') {
    try { execSync(`pkill -f "bash ${BBB_MP4_SCRIPT} ${id}"`, { stdio: 'ignore' }); } catch { /* no match is fine */ }
    unqueue(id);
    return res.json({ removed: true, wasInState: 'Queued' });
  }
  if (status === 'Converting') {
    if (req.query.force !== 'true') {
      return res.status(409).json({ error: 'currently converting; pass ?force=true to abort' });
    }
    try { execSync(`docker rm -f ${id}`, { stdio: 'ignore' }); } catch { /* container may already be gone */ }
    unqueue(id);
    return res.json({ removed: true, wasInState: 'Converting', forced: true });
  }
});

app.listen(PORT, '127.0.0.1', () => console.log(`bbb-mp4-api on :${PORT}`));
