import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAsync } from '../../lib/useAsync.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);
  const { data: recipes, error, loading } = useAsync(() => api.listRecipes(), [reloadKey]);

  const handleDelete = async (recipe) => {
    if (!confirm(`确定删除「${recipe.title}」吗？删除后无法恢复。`)) return;
    try {
      await api.deleteRecipe(recipe._id);
      setReloadKey((k) => k + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/');
  };

  return (
    <div className="page-narrow">
      <div className="admin-header">
        <h1>菜谱管理</h1>
        <div className="admin-actions">
          <Link to="/admin/new" className="btn btn-primary">＋ 新增菜谱</Link>
          <button type="button" className="btn" onClick={handleLogout}>退出登录</button>
        </div>
      </div>

      {loading && <p className="status">加载中…</p>}
      {error && <p className="status error">{error.message}</p>}

      {recipes && (
        <ul className="admin-list panel">
          {recipes.length === 0 && <li className="muted">还没有菜谱</li>}
          {recipes.map((r) => (
            <li key={r._id}>
              <div>
                <Link to={`/recipes/${r.slug}`}>{r.title}</Link>
                <span className="chip">{r.category}</span>
              </div>
              <div className="admin-row-actions">
                <Link to={`/admin/edit/${r.slug}`}>编辑</Link>
                <button type="button" className="link-btn danger" onClick={() => handleDelete(r)}>
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
