const db = require('../db');

function getSessionUser(req) {
  const token = req.cookies?.auth_token;
  if (!token) return null;

  const session = db
    .prepare("SELECT email FROM sessions WHERE token = ? AND expires_at > datetime('now')")
    .get(token);
  if (!session) return null;

  const user = db
    .prepare('SELECT email, name, role FROM users WHERE email = ?')
    .get(session.email);
  return user || null;
}

function requireAuth(req, res, next) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  req.user = user;
  next();
}

module.exports = { requireAuth, requireAdmin, getSessionUser };
