import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES, DIFFICULTIES } from '../../../../shared/categories.js';
import { api } from '../../lib/api.js';
import ImageField from '../../components/ImageField.jsx';

const EMPTY = {
  title: '',
  category: '',
  summary: '',
  coverImage: '',
  tags: '',
  prepTime: '',
  servings: '',
  difficulty: '简单',
  ingredients: [{ name: '', amount: '' }],
  steps: [{ text: '', image: '' }],
  tips: '',
};

// 接口数据 ↔ 表单状态（标签在表单里是逗号分隔的一行文字，数字是字符串）
function toForm(recipe) {
  return {
    ...EMPTY,
    ...recipe,
    tags: (recipe.tags ?? []).join('，'),
    prepTime: recipe.prepTime ?? '',
    servings: recipe.servings ?? '',
    ingredients: recipe.ingredients?.length ? recipe.ingredients : EMPTY.ingredients,
    steps: recipe.steps?.length ? recipe.steps.map((s) => ({ image: '', ...s })) : EMPTY.steps,
  };
}

function toPayload(form) {
  // 用 null 而不是 undefined：undefined 在 JSON 里会被丢掉，编辑时就清不掉旧值
  const num = (v) => (v === '' ? null : Number(v));
  return {
    title: form.title,
    category: form.category,
    summary: form.summary,
    coverImage: form.coverImage,
    tags: form.tags.split(/[,，、\s]+/).filter(Boolean),
    prepTime: num(form.prepTime),
    servings: num(form.servings),
    difficulty: form.difficulty,
    ingredients: form.ingredients.filter((i) => i.name.trim()),
    steps: form.steps.filter((s) => s.text.trim()),
    tips: form.tips,
  };
}

export default function RecipeForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(slug);
  const [form, setForm] = useState(EMPTY);
  const [recipeId, setRecipeId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .getRecipe(slug)
      .then((r) => {
        setRecipeId(r._id);
        setForm(toForm(r));
      })
      .catch((err) => setLoadError(err.message));
  }, [slug, isEdit]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // 用料、步骤这类列表字段的通用增删改移
  const listOps = (key, blank) => ({
    update: (i, patch) => set(key, form[key].map((item, j) => (j === i ? { ...item, ...patch } : item))),
    add: () => set(key, [...form[key], { ...blank }]),
    remove: (i) => set(key, form[key].filter((_, j) => j !== i)),
    move: (i, delta) => {
      const next = [...form[key]];
      const j = i + delta;
      if (j < 0 || j >= next.length) return;
      [next[i], next[j]] = [next[j], next[i]];
      set(key, next);
    },
  });
  const ingredients = listOps('ingredients', { name: '', amount: '' });
  const steps = listOps('steps', { text: '', image: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = toPayload(form);
      if (isEdit) await api.updateRecipe(recipeId, payload);
      else await api.createRecipe(payload);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loadError) return <p className="status error">{loadError}</p>;

  return (
    <form className="recipe-form page-narrow" onSubmit={handleSubmit}>
      <div className="admin-header">
        <h1>{isEdit ? `编辑：${form.title}` : '新增菜谱'}</h1>
        <Link to="/admin" className="btn">返回</Link>
      </div>

      <section className="panel">
        <h2>基本信息</h2>
        <label className="field">
          <span>菜名 *</span>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </label>
        <div className="field-row">
          <label className="field">
            <span>分类 *</span>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} required>
              <option value="" disabled>请选择</option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>难度</span>
            <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
              {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            <span>用时（分钟）</span>
            <input type="number" min="0" value={form.prepTime} onChange={(e) => set('prepTime', e.target.value)} />
          </label>
          <label className="field">
            <span>份量（人）</span>
            <input type="number" min="1" value={form.servings} onChange={(e) => set('servings', e.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>一句话简介（显示在卡片上）</span>
          <input value={form.summary} onChange={(e) => set('summary', e.target.value)} />
        </label>
        <label className="field">
          <span>标签（用逗号或空格分隔）</span>
          <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="下饭，快手" />
        </label>
        <ImageField label="封面图" value={form.coverImage} onChange={(v) => set('coverImage', v)} />
      </section>

      <section className="panel">
        <h2>用料</h2>
        {form.ingredients.map((ing, i) => (
          <div key={i} className="list-row">
            <input placeholder="食材" value={ing.name} onChange={(e) => ingredients.update(i, { name: e.target.value })} />
            <input placeholder="用量" value={ing.amount} onChange={(e) => ingredients.update(i, { amount: e.target.value })} />
            <button type="button" className="icon-btn" onClick={() => ingredients.remove(i)} aria-label="删除">×</button>
          </div>
        ))}
        <button type="button" className="btn" onClick={ingredients.add}>＋ 添加用料</button>
      </section>

      <section className="panel">
        <h2>做法</h2>
        {form.steps.map((step, i) => (
          <div key={i} className="step-editor">
            <div className="step-editor-head">
              <strong>步骤 {i + 1}</strong>
              <div>
                <button type="button" className="icon-btn" onClick={() => steps.move(i, -1)} aria-label="上移">↑</button>
                <button type="button" className="icon-btn" onClick={() => steps.move(i, 1)} aria-label="下移">↓</button>
                <button type="button" className="icon-btn" onClick={() => steps.remove(i)} aria-label="删除">×</button>
              </div>
            </div>
            <textarea rows={3} value={step.text} onChange={(e) => steps.update(i, { text: e.target.value })} />
            <ImageField label="步骤图（可选）" value={step.image} onChange={(v) => steps.update(i, { image: v })} />
          </div>
        ))}
        <button type="button" className="btn" onClick={steps.add}>＋ 添加步骤</button>
      </section>

      <section className="panel">
        <h2>小贴士</h2>
        <textarea rows={3} value={form.tips} onChange={(e) => set('tips', e.target.value)} />
      </section>

      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? '保存中…' : isEdit ? '保存修改' : '发布'}
        </button>
      </div>
    </form>
  );
}
