import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../../../shared/categories.js';
import { SITE_SUBTITLE } from '../config.js';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import RecipeCard from '../components/RecipeCard.jsx';

const ALL = '全部';

function matches(recipe, q) {
  if (!q) return true;
  const haystack = [
    recipe.title,
    recipe.summary,
    ...(recipe.tags ?? []),
    ...(recipe.ingredients ?? []).map((i) => i.name),
  ].join(' ').toLowerCase();
  return haystack.includes(q.toLowerCase());
}

export default function Home() {
  const { data: recipes, error, loading } = useAsync(() => api.listRecipes(), []);
  // 分类和搜索词放在 URL 里：刷新、分享、从详情页返回都能保留
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? ALL;
  const q = params.get('q') ?? '';

  const updateParam = (key, value, emptyValue = '') => {
    const next = new URLSearchParams(params);
    if (value && value !== emptyValue) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const c = { [ALL]: recipes?.length ?? 0 };
    for (const r of recipes ?? []) c[r.category] = (c[r.category] ?? 0) + 1;
    return c;
  }, [recipes]);

  const visible = (recipes ?? []).filter((r) => (category === ALL || r.category === category) && matches(r, q));

  return (
    <>
      <p className="subtitle">{SITE_SUBTITLE}</p>

      <div className="toolbar">
        <nav className="tabs" aria-label="分类">
          {[{ name: ALL, emoji: '' }, ...CATEGORIES].map((c) => (
            <button
              key={c.name}
              type="button"
              className={`tab ${category === c.name ? 'is-active' : ''}`}
              onClick={() => updateParam('category', c.name, ALL)}
            >
              {c.emoji} {c.name}
              <span className="tab-count">{counts[c.name] ?? 0}</span>
            </button>
          ))}
        </nav>
        <input
          type="search"
          className="search"
          placeholder="搜菜名、标签或食材，比如「土豆」"
          value={q}
          onChange={(e) => updateParam('q', e.target.value)}
        />
      </div>

      {loading && <p className="status">加载中…</p>}
      {error && <p className="status error">{error.message}</p>}
      {recipes && visible.length === 0 && <p className="status">这里还没有菜，换个分类看看吧。</p>}

      <div className="grid">
        {visible.map((r) => (
          <RecipeCard key={r._id} recipe={r} />
        ))}
      </div>
    </>
  );
}
