import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { cloudinaryConfig, signParams, UPLOAD_FOLDER } from '../cloudinary.js';

const router = Router();

// 浏览器拿到签名后直接把图片传给 Cloudinary，图片不经过我们的服务器
// （Vercel 函数的请求体上限约 4.5MB，手机照片很容易超）
router.get('/signature', requireAdmin, (req, res) => {
  const cfg = cloudinaryConfig();
  if (!cfg) return res.status(503).json({ error: '还没有配置 Cloudinary，可以先粘贴图片链接' });

  const params = { folder: UPLOAD_FOLDER, timestamp: Math.round(Date.now() / 1000) };
  res.json({
    cloudName: cfg.cloudName,
    apiKey: cfg.apiKey,
    ...params,
    signature: signParams(params, cfg.apiSecret),
  });
});

export default router;
