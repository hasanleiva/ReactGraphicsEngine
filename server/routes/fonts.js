import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

const UPLOADS_PATH = process.env.UPLOADS_PATH
  ? path.resolve(process.env.UPLOADS_PATH)
  : path.resolve('uploads');

const FONTS_DIR = path.join(UPLOADS_PATH, 'fonts');
fs.mkdirSync(FONTS_DIR, { recursive: true });

const FONT_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2'];

const FONT_CONTENT_TYPES = {
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function listFontFiles(dir, baseDir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFontFiles(fullPath, baseDir));
    } else if (FONT_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      results.push(path.relative(baseDir, fullPath));
    }
  }
  return results;
}

// GET /search-fonts
router.get('/search-fonts', (_req, res) => {
  try {
    const fontFiles = listFontFiles(FONTS_DIR, FONTS_DIR);
    const fontData = fontFiles.map((relPath) => {
      const filename = path.basename(relPath);
      const ext = path.extname(filename).toLowerCase();
      const familyName = filename
        .replace(new RegExp(`\\${ext}$`), '')
        .replace(/[-_]/g, ' ');

      return {
        family: familyName,
        styles: [
          {
            name: `${familyName} Regular`,
            style: 'regular',
            url: `/fonts/${relPath.split(path.sep).map(encodeURIComponent).join('/')}`,
          },
        ],
      };
    });

    res.json({ data: fontData, total: fontData.length });
  } catch {
    res.json({ data: [], total: 0 });
  }
});

// GET /fonts/*
router.get('/fonts/*', (req, res) => {
  const rawPath = req.params[0] || '';

  const segments = rawPath.split('/').map(decodeURIComponent);
  if (segments.some((s) => s === '..' || s === '')) {
    return res.status(400).send('Invalid path');
  }

  const fontPath = path.join(FONTS_DIR, ...segments);

  if (!fontPath.startsWith(FONTS_DIR + path.sep)) {
    return res.status(400).send('Invalid path');
  }

  if (!fs.existsSync(fontPath)) return res.status(404).send('Font not found');

  const ext = path.extname(fontPath).toLowerCase();
  const contentType = FONT_CONTENT_TYPES[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(fontPath);
});

export default router;
