import db from '../db.js';

/**
 * Middleware that validates the auth_token cookie against the sessions table.
 * On success attaches req.user = { email, name, role } and calls next().
 * On failure returns 401 JSON.
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const session = db
    .prepare("SELECT email FROM sessions WHERE token = ? AND expires_at > datetime('now')")
    .get(token);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const user = db
    .prepare('SELECT email, name, role FROM users WHERE email = ?')
    .get(session.email);

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = user;
  next();
}
