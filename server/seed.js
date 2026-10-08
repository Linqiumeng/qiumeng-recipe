import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Recipe from './models/Recipe.js';
import { uniqueSlug } from './slug.js';
import { cloudinaryConfig, uploadLocalImage } from './cloudinary.js';

export const SEED_DIR = fileURLToPath(new URL('../scripts/seed-data/', import.meta.url));

export function loadSeedRecipes() {
  return JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'recipes.json'), 'utf8'));
}

const isLocalPath = (value) => Boolean(value) && !/^https?:\/\//.test(value);

// 菜谱里引用的所有本地图片路径（封面 + 步骤图）
export function localImagePaths(recipe) {
  return [recipe.coverImage, ...(recipe.steps ?? []).map((s) => s.image)].filter(isLocalPath);
}

// 图片字段写本地相对路径（如 "images/hong-shao-rou.jpg"，相对 baseDir）时，上传到 Cloudinary 换成线上地址。
// strict=false：没配置 Cloudinary 或找不到文件就留空并警告（seed 用）；strict=true：直接报错（recipe 命令用）。
async function resolveImage(value, baseDir, strict) {
  if (!isLocalPath(value)) return value ?? '';
  const filePath = path.resolve(baseDir, value);
  const problem = !cloudinaryConfig()
    ? `未配置 Cloudinary，无法上传图片 ${value}`
    : !fs.existsSync(filePath) && `找不到图片 ${filePath}`;
  if (problem) {
    if (strict) throw new Error(problem);
    console.warn(`  ⚠ ${problem}，已跳过`);
    return '';
  }
  console.log(`  ↑ 上传图片 ${value}`);
  return uploadLocalImage(filePath);
}

export async function resolveImages(recipe, baseDir, { strict = false } = {}) {
  const out = { ...recipe };
  if ('coverImage' in recipe) out.coverImage = await resolveImage(recipe.coverImage, baseDir, strict);
  if (recipe.steps) {
    out.steps = [];
    for (const s of recipe.steps) out.steps.push({ ...s, image: await resolveImage(s.image, baseDir, strict) });
  }
  return out;
}

// 按菜名去重：已经存在的菜跳过，所以可以放心重复运行
export async function seedRecipes(recipes, baseDir = SEED_DIR) {
  let added = 0;
  for (const r of recipes) {
    if (await Recipe.exists({ title: r.title })) {
      console.log(`  - 已存在，跳过：${r.title}`);
      continue;
    }
    const data = await resolveImages(r, baseDir);
    await Recipe.create({ ...data, slug: await uniqueSlug(r.title) });
    console.log(`  + 已添加：${r.title}`);
    added++;
  }
  return added;
}
