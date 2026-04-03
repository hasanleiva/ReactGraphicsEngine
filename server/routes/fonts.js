const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const FONTS_DIR = process.env.FONTS_DIR
  ? path.resolve(process.env.FONTS_DIR)
  : path.join(__dirname, '../../public/fonts');

const MIME_MAP = {
  ttf: 'font/ttf',
  otf: 'font/otf',
  woff: 'font/woff',
  woff2: 'font/woff2',
};

// GET /search-fonts
router.get('/search-fonts', (req, res) => {
  try {
    const fontData = [];

    if (fs.existsSync(FONTS_DIR)) {
      const files = fs.readdirSync(FONTS_DIR);
      for (const file of files) {
        if (file.match(/\.(ttf|otf|woff|woff2)$/i)) {
          const familyName = file
            .replace(/\.(ttf|otf|woff|woff2)$/i, '')
            .replace(/[-_]/g, ' ');
          fontData.push({
            family: familyName,
            styles: [
              {
                name: `${familyName} Regular`,
                style: 'regular',
                url: `/fonts/${encodeURIComponent(file)}`,
              },
            ],
          });
        }
      }
    }

    return res.json({ data: fontData, total: fontData.length });
  } catch (err) {
    return res.status(500).json({ data: [], total: 0, error: String(err) });
  }
});

// GET /fonts/*
router.get('/*', (req, res) => {
  try {
    const rawPath = req.params[0];
    if (!rawPath) return res.status(404).send('Not found');

    const normalized = path.normalize(rawPath).replace(/\\/g, '/');
    if (normalized.startsWith('..')) return res.status(400).send('Invalid path');

    const filePath = path.join(FONTS_DIR, normalized);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Font not found');
    }

    const ext = path.extname(filePath).toLowerCase().slice(1);
    const mime = MIME_MAP[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', mime);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.sendFile(filePath);
  } catch (err) {
    return res.status(500).send('Server error');
  }
});

module.exports = router;
