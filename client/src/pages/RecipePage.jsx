import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import RecipeDetail from '../components/RecipeDetail.jsx';

// 直接打开 /recipes/:slug（分享链接、刷新）时显示的完整页面
export default function RecipePage() {
  const { slug } = useParams();
  const { data: recipe, error, loading } = useAsync(() => api.getRecipe(slug), [slug]);

  return (
    <div className="page-narrow">
      <Link to="/" className="back-link">← 所有菜谱</Link>
      {loading && <p className="status">加载中…</p>}
      {error && <p className="status error">{error.message}</p>}
      {recipe && <RecipeDetail recipe={recipe} />}
    </div>
  );
}
