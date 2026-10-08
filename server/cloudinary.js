import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const UPLOAD_FOLDER = 'recipes';

export function cloudinaryConfig() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return null;
  return { cloudName: CLOUDINARY_CLOUD_NAME, apiKey: CLOUDINARY_API_KEY, apiSecret: CLOUDINARY_API_SECRET };
}

// Cloudinary 签名算法：参数按键名排序拼成 a=1&b=2，末尾接上 secret 后取 SHA-1。
export function signParams(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

// 供 seed 脚本在服务端直接上传本地图片
export async function uploadLocalImage(filePath) {
  const cfg = cloudinaryConfig();
  if (!cfg) throw new Error('未配置 Cloudinary');
  const params = { folder: UPLOAD_FOLDER, timestamp: Math.round(Date.now() / 1000) };
  const form = new FormData();
  form.append('file', await fs.openAsBlob(filePath), path.basename(filePath));
  form.append('api_key', cfg.apiKey);
  form.append('signature', signParams(params, cfg.apiSecret));
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? '上传失败');
  return data.secure_url;
}
