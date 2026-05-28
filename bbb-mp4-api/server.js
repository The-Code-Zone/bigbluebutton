require('dotenv').config();
const express = require('express');
const { spawn } = require('child_process');
const { resolveStatus, markQueued, isValidRecordId } = require('./status');

const PORT = 8479;
const SECRET = process.env.API_SECRET;
const BBB_MP4_SCRIPT = process.env.BBB_MP4_SCRIPT;
if (!SECRET) { console.error('API_SECRET is required'); process.exit(1); }
if (!BBB_MP4_SCRIPT) { console.error('BBB_MP4_SCRIPT is required'); process.exit(1); }

const app = express();
app.use((req, res, next) => {
  const h = req.get('Authorization') || '';
  if (h !== `Bearer ${SECRET}`) return res.status(401).end();
  next();
});

app.get('/statuses', (req, res) => {
  const ids = (req.query.ids || '').split(',').filter(Boolean);
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

app.listen(PORT, '127.0.0.1', () => console.log(`bbb-mp4-api on :${PORT}`));
