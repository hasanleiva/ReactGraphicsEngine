import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const UPLOADS_PATH = process.env.UPLOADS_PATH
  ? path.resolve(process.env.UPLOADS_PATH)
  : path.resolve('uploads');

const TEMPLATES_DIR = path.join(UPLOADS_PATH, 'templates');
fs.mkdirSync(TEMPLATES_DIR, { recursive: true });

function safeName(name) {
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) return null;
  return name;
}

// GET /api/templates/list
router.get('/api/templates/list', (req, res) => {
  try {
    const files = fs.readdirSync(TEMPLATES_DIR);
    const templates = files
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''));
    res.json({ success: true, templates });
  } catch {
    res.json({ success: true, templates: [] });
  }
});

// POST /api/templates/save
router.post('/api/templates/save', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { id, content } = req.body;
  const safeId = safeName(id);
  if (!safeId) return res.status(400).json({ error: 'Invalid template id' });

  try {
    const filePath = path.join(TEMPLATES_DIR, `${safeId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(content), 'utf8');
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/templates/get/*
router.get('/api/templates/get/*', (req, res) => {
  const rawPath = req.params[0] || '';

  const segments = rawPath.split('/').map(decodeURIComponent);
  if (segments.some((s) => s === '..' || s === '')) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  const relativePath = segments.join('/');
  const filePath = path.join(TEMPLATES_DIR, `${relativePath}.json`);

  if (!filePath.startsWith(TEMPLATES_DIR + path.sep) && filePath !== TEMPLATES_DIR) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  try {
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({ success: true, content });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
