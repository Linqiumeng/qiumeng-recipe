// Cloudinary 图片可以在 URL 里指定尺寸和格式，让卡片只加载缩略图
const PRESETS = {
  card: 'c_fill,w_600,h_450,f_auto,q_auto',
  detail: 'c_limit,w_1200,f_auto,q_auto',
  step: 'c_limit,w_800,f_auto,q_auto',
};

export function imageUrl(url, preset) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/${PRESETS[preset]}/`);
}
