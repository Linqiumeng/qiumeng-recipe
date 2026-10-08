import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/useAsync.js';
import RecipeDetail from './RecipeDetail.jsx';

export default function RecipeModal() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: recipe, error, loading } = useAsync(() => api.getRecipe(slug), [slug]);

  // 关闭 = 后退一步，这样浏览器/手机的返回键也能关闭弹窗
  const close = () => navigate(-1);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={close} aria-label="关闭">
          ×
        </button>
        {loading && <p className="status">加载中…</p>}
        {error && <p className="status error">{error.message}</p>}
        {recipe && <RecipeDetail recipe={recipe} />}
      </div>
    </div>
  );
}
