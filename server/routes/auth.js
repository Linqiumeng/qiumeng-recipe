import crypto from 'node:crypto';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { AUTH_COOKIE, isAdmin } from '../middleware/auth.js';

const router = Router();
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest();

router.post('/login', (req, res) => {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return res.status(500).json({ error: '服务器未配置 ADMIN_PASSWORD' });

  // 先哈希再比较，长度一致才能用 timingSafeEqual
  if (!crypto.timingSafeEqual(sha256(req.body?.password ?? ''), sha256(expected))) {
    return res.status(401).json({ error: '密码不对' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: Boolean(process.env.VERCEL),
    maxAge: THIRTY_DAYS,
  });
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  res.clearCookie(AUTH_COOKIE);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  res.json({ admin: isAdmin(req) });
});

export default router;
