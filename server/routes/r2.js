import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

const UPLOADS_PATH = process.env.UPLOADS_PATH
  ? path.resolve(process.env.UPLOADS_PATH)
  : path.resolve('uploads');

// GET /api/r2/get/:filename
router.get('/api/r2/get/:filename', (req, res) => {
  const filename = req.params.filename;

  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).send('Invalid filename');
  }

  const filePath = path.join(UPLOADS_PATH, filename);

  if (!filePath.startsWith(UPLOADS_PATH + path.sep)) {
    return res.status(400).send('Invalid filename');
  }

  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');

  res.sendFile(filePath);
});

export default router;
