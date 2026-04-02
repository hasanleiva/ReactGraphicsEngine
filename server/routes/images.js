import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const UPLOADS_PATH = process.env.UPLOADS_PATH
  ? path.resolve(process.env.UPLOADS_PATH)
  : path.resolve('uploads');

const IMAGES_DIR = path.join(UPLOADS_PATH, 'images');
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Allowed image MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, id);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Sanitize an image ID - reject anything with path separators
function safeId(id) {
  if (!id || id.includes('/') || id.includes('\\') || id.includes('..')) return null;
  return id;
}

// POST /api/images/upload
router.post('/api/images/upload', requireAuth, (req, res) => {
  if (req.user.role === 'admin') {
    upload.single('file')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file provided' });

      const id = req.file.filename;
      res.json({
        success: true,
        url: `/api/images/get/${id}`,
        id,
        documentId: id,
        img: { url: `/api/images/get/${id}`, mime: req.file.mimetype },
      });
    });
  } else {
    upload.single('file')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file provided' });

      const fileBuffer = fs.readFileSync(req.file.path);
      const base64 = fileBuffer.toString('base64');
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        data: `data:${req.file.mimetype};base64,${base64}`,
      });
    });
  }
});

// GET /api/images/list
router.get('/api/images/list', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.json([]);
  }

  try {
    const files = fs.readdirSync(IMAGES_DIR);
    const images = files
      .filter((f) => !f.startsWith('.'))
      .map((id) => ({
        id,
        documentId: id,
        img: { url: `/api/images/get/${id}`, mime: 'image/png' },
        name: id,
      }));
    res.json(images);
  } catch {
    res.json([]);
  }
});

// GET /api/images/get/:id
router.get('/api/images/get/:id', (req, res) => {
  const id = safeId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid image id' });

  const filePath = path.join(IMAGES_DIR, id);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });

  res.sendFile(filePath);
});

// DELETE /api/images/remove/:id
router.delete('/api/images/remove/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const id = safeId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid image id' });

  const filePath = path.join(IMAGES_DIR, id);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });

  fs.unlinkSync(filePath);
  res.json({ success: true });
});

export default router;
