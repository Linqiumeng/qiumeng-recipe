// 命令行管理菜谱，主要给 agent 用（也可以自己用）。直接读写数据库，不需要后台密码。
//
//   npm run recipe -- list [分类]            列出所有菜（可按分类筛选）
//   npm run recipe -- show <slug>            输出一道菜的完整 JSON（可另存后修改再 update）
//   npm run recipe -- add <文件.json>        新增；文件里可以是一道菜，也可以是数组
//   npm run recipe -- update <slug> <文件.json>  修改；只改文件里出现的字段
//   npm run recipe -- delete <slug> [--yes]  删除；不加 --yes 只预览，不会真的删
//
// JSON 里的图片可以写本地路径（相对 JSON 文件所在目录），会自动上传到 Cloudinary。
// 未设置 MONGODB_URI 时连接 `npm run dev` 启动的本地开发数据库。
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import Recipe, { EDITABLE_FIELDS, pickEditable } from '../server/models/Recipe.js';
import { uniqueSlug } from '../server/slug.js';
import { localImagePaths, resolveImages } from '../server/seed.js';
import { cloudinaryConfig } from '../server/cloudinary.js';

const LOCAL_DEV_URI = 'mongodb://127.0.0.1:27018/recipes';

const USAGE = `用法：
  npm run recipe -- list [分类]
  npm run recipe -- show <slug>
  npm run recipe -- add <文件.json>
  npm run recipe -- update <slug> <文件.json>
  npm run recipe -- delete <slug> [--yes]`;

class UserError extends Error {}

function readJson(file) {
  if (!file) throw new UserError(USAGE);
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) throw new UserError(`找不到文件 ${filePath}`);
  try {
    return { data: JSON.parse(fs.readFileSync(filePath, 'utf8')), baseDir: path.dirname(filePath) };
  } catch (err) {
    throw new UserError(`${file} 不是合法的 JSON：${err.message}`);
  }
}

async function findBySlug(slug) {
  if (!slug) throw new UserError(USAGE);
  const recipe = await Recipe.findOne({ slug });
  if (!recipe) throw new UserError(`没有找到 slug 为「${slug}」的菜，可以先运行 list 查看`);
  return recipe;
}

// 先校验文字内容、检查本地图片都存在，再上传图片：避免数据有错时白白传了图
async function checkBeforeUpload(doc, raw, baseDir) {
  await doc.validate();
  const images = localImagePaths(raw);
  if (images.length && !cloudinaryConfig()) {
    throw new UserError(`JSON 里有本地图片，但 .env 里没有配置 Cloudinary：${images.join('、')}`);
  }
  const missing = images.filter((p) => !fs.existsSync(path.resolve(baseDir, p)));
  if (missing.length) throw new UserError(`找不到图片：${missing.join('、')}（路径相对于 JSON 文件所在目录）`);
}

const commands = {
  async list(category) {
    const filter = category ? { category } : {};
    const recipes = await Recipe.find(filter).select('title slug category updatedAt').sort({ category: 1, title: 1 }).lean();
    if (!recipes.length) return console.log('（没有菜谱）');
    for (const r of recipes) console.log(`${r.category}\t${r.title}\t${r.slug}`);
    console.log(`共 ${recipes.length} 道`);
  },

  async show(slug) {
    const recipe = await findBySlug(slug);
    console.log(JSON.stringify(pickEditable(recipe.toObject()), null, 2));
  },

  async add(file) {
    const { data, baseDir } = readJson(file);
    const items = Array.isArray(data) ? data : [data];
    let failed = 0;
    for (const raw of items) {
      const label = raw.title ?? '(无菜名)';
      try {
        if (await Recipe.exists({ title: raw.title })) {
          throw new UserError('已经有同名的菜了；要修改请用 update');
        }
        await checkBeforeUpload(new Recipe({ ...pickEditable(raw), slug: 'pending' }), raw, baseDir);
        const resolved = await resolveImages(pickEditable(raw), baseDir, { strict: true });
        const recipe = await Recipe.create({ ...resolved, slug: await uniqueSlug(raw.title) });
        console.log(`✓ 已添加：${recipe.title}（/recipes/${recipe.slug}）`);
      } catch (err) {
        failed++;
        console.error(`✗ ${label}：${errorMessage(err)}`);
      }
    }
    if (failed) process.exitCode = 1;
  },

  async update(slug, file) {
    const recipe = await findBySlug(slug);
    const { data, baseDir } = readJson(file);
    if (Array.isArray(data)) throw new UserError('update 一次只能改一道菜，JSON 不能是数组');
    const changes = pickEditable(data);
    const ignored = Object.keys(data).filter((k) => !EDITABLE_FIELDS.includes(k));
    if (ignored.length) console.warn(`  ⚠ 忽略不可修改的字段：${ignored.join('、')}`);
    if (!Object.keys(changes).length) throw new UserError('JSON 里没有可修改的字段');

    recipe.set(changes);
    await checkBeforeUpload(recipe, changes, baseDir);
    recipe.set(await resolveImages(changes, baseDir, { strict: true }));
    await recipe.save();
    console.log(`✓ 已更新：${recipe.title}（改动字段：${Object.keys(changes).join('、')}）`);
  },

  async delete(slug, flag) {
    const recipe = await findBySlug(slug);
    if (flag !== '--yes') {
      console.log(`将要删除：${recipe.title}（${recipe.category}，/recipes/${recipe.slug}）`);
      console.log('删除后无法恢复。确认要删请加 --yes 再运行一次。');
      return;
    }
    await recipe.deleteOne();
    console.log(`✓ 已删除：${recipe.title}`);
  },
};

function errorMessage(err) {
  if (err.name === 'ValidationError') return Object.values(err.errors).map((e) => e.message).join('；');
  return err.message;
}

const [command, ...args] = process.argv.slice(2);
if (!commands[command]) {
  console.error(USAGE);
  process.exit(1);
}

const uri = process.env.MONGODB_URI || LOCAL_DEV_URI;
if (!process.env.MONGODB_URI) console.warn('（未设置 MONGODB_URI，使用本地开发数据库，需要先运行 npm run dev）');

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  await commands[command](...args);
} catch (err) {
  if (err.name === 'MongooseServerSelectionError') console.error('✗ 连不上数据库。用本地数据库时请先运行 npm run dev');
  else console.error(`✗ ${errorMessage(err)}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
