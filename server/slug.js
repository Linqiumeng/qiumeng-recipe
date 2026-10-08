import { pinyin } from 'pinyin-pro';
import Recipe from './models/Recipe.js';

// 「番茄炒蛋」→ "fan-qie-chao-dan"，重名时追加 -2、-3…
export async function uniqueSlug(title) {
  const base =
    pinyin(title, { toneType: 'none', type: 'array', nonZh: 'consecutive' })
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'recipe';

  let slug = base;
  for (let i = 2; await Recipe.exists({ slug }); i++) slug = `${base}-${i}`;
  return slug;
}
