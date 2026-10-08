import { Router } from 'express';
import Recipe, { pickEditable } from '../models/Recipe.js';
import { requireAdmin } from '../middleware/auth.js';
import { uniqueSlug } from '../slug.js';

const router = Router();

// 列表只返回卡片和搜索需要的字段；带上用料名，方便按「土豆」之类搜索
const LIST_FIELDS = 'title slug coverImage summary category tags prepTime difficulty ingredients.name createdAt';

router.get('/', async (req, res) => {
  const recipes = await Recipe.find().select(LIST_FIELDS).sort({ createdAt: -1 }).lean();
  res.json(recipes);
});

router.get('/:slug', async (req, res) => {
  const recipe = await Recipe.findOne({ slug: req.params.slug }).lean();
  if (!recipe) return res.status(404).json({ error: '没有找到这道菜' });
  res.json(recipe);
});

router.post('/', requireAdmin, async (req, res) => {
  const data = pickEditable(req.body);
  const recipe = await Recipe.create({ ...data, slug: await uniqueSlug(data.title ?? '') });
  res.status(201).json(recipe);
});

// slug 创建后不再变化，避免已经分享出去的链接失效
router.put('/:id', requireAdmin, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ error: '没有找到这道菜' });
  recipe.set(pickEditable(req.body));
  await recipe.save();
  res.json(recipe);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const recipe = await Recipe.findByIdAndDelete(req.params.id);
  if (!recipe) return res.status(404).json({ error: '没有找到这道菜' });
  res.json({ ok: true });
});

export default router;
