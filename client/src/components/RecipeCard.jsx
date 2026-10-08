import { Link, useLocation } from 'react-router-dom';
import { categoryEmoji } from '../../../shared/categories.js';
import { imageUrl } from '../lib/image.js';
import { useOrder } from '../lib/OrderContext.jsx';

// 没有照片时占位图的「桌布」颜色
const CATEGORY_TINT = {
  凉菜: '#dfe5d3',
  荤菜: '#ecd5c4',
  素菜: '#e3e8d6',
  汤羹: '#f0d9cf',
  主食: '#efe3c8',
  甜点小吃: '#f1e6d6',
};

export function CoverImage({ recipe, preset, className = '' }) {
  if (recipe.coverImage) {
    return (
      <div className={`photo ${className}`}>
        <img src={imageUrl(recipe.coverImage, preset)} alt={recipe.title} loading="lazy" />
      </div>
    );
  }
  // 俯拍视角的「桌布 + 盘子 + 食物」
  return (
    <div className={`photo photo-placeholder ${className}`} style={{ '--tint': CATEGORY_TINT[recipe.category] }} aria-hidden="true">
      <div className="plate"><span>{categoryEmoji(recipe.category)}</span></div>
    </div>
  );
}

export default function RecipeCard({ recipe }) {
  const location = useLocation();
  const order = useOrder();
  const ordered = order.has(recipe.slug);

  return (
    <article className="card">
      <Link to={`/recipes/${recipe.slug}`} state={{ background: location }} className="card-link">
        <CoverImage recipe={recipe} preset="card" />
        <h3 className="card-title">{recipe.title}</h3>
        {recipe.summary && <p className="card-summary">{recipe.summary}</p>}
        <div className="card-meta">
          <span className="pill pill-accent">{recipe.category}</span>
          {recipe.prepTime > 0 && <span className="pill card-time">⏱ {recipe.prepTime} 分钟</span>}
        </div>
      </Link>
      <button
        type="button"
        className={`want ${ordered ? 'is-on' : ''}`}
        onClick={() => order.toggle(recipe)}
        aria-pressed={ordered}
        title={ordered ? '从点菜单移除' : '加入点菜单'}
      >
        {ordered ? '♥ 想吃' : '♡ 想吃'}
      </button>
    </article>
  );
}
