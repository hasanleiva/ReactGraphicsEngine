import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

function generateToken() {
  return `tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// GET /api/auth/user
router.get('/api/auth/user', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/auth/login
router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken();
    db.prepare("INSERT INTO sessions (token, email, expires_at) VALUES (?, ?, datetime('now', '+7 days'))")
      .run(token, email);

    res.cookie('auth_token', token, COOKIE_OPTIONS);
    res.json({ success: true, user: { email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/signup
router.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = db.prepare('SELECT email FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)')
      .run(email, passwordHash, name || null, 'user');

    const token = generateToken();
    db.prepare("INSERT INTO sessions (token, email, expires_at) VALUES (?, ?, datetime('now', '+7 days'))")
      .run(token, email);

    res.cookie('auth_token', token, COOKIE_OPTIONS);
    res.json({ success: true, user: { email, name: name || null, role: 'user' } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/api/auth/logout', (req, res) => {
  try {
    const token = req.cookies?.auth_token;
    if (token) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
    res.clearCookie('auth_token', { path: '/' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/password
router.post('/api/auth/password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(req.user.email);

    if (!(await bcrypt.compare(oldPassword, user.password_hash))) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(newHash, req.user.email);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
