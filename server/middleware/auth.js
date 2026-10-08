import jwt from 'jsonwebtoken';

export const AUTH_COOKIE = 'admin_token';

export function isAdmin(req) {
  try {
    jwt.verify(req.cookies?.[AUTH_COOKIE], process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function requireAdmin(req, res, next) {
  if (!isAdmin(req)) return res.status(401).json({ error: '请先登录' });
  next();
}
