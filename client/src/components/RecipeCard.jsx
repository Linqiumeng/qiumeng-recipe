import { Link, useLocation } from 'react-router-dom';
import { categoryEmoji } from '../../../shared/categories.js';
import { imageUrl } from '../lib/image.js';
import { useOrder } from '../lib/OrderContext.jsx';

export function CoverImage({ recipe, preset, className = '' }) {
  if (recipe.coverImage) {
    return <img className={`cover ${className}`} src={imageUrl(recipe.coverImage, preset)} alt={recipe.title} loading="lazy" />;
  }
  return (
    <div className={`cover cover-placeholder ${className}`} aria-hidden="true">
      {categoryEmoji(recipe.category)}
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
        <div className="card-body">
          <h3 className="card-title">{recipe.title}</h3>
          {recipe.summary && <p className="card-summary">{recipe.summary}</p>}
          <div className="card-meta">
            <span className="chip">{recipe.category}</span>
            {recipe.prepTime > 0 && <span>⏱ {recipe.prepTime} 分钟</span>}
            {recipe.difficulty && <span className="card-difficulty">{recipe.difficulty}</span>}
          </div>
        </div>
      </Link>
      <button
        type="button"
        className={`order-toggle ${ordered ? 'is-ordered' : ''}`}
        onClick={() => order.toggle(recipe)}
        aria-pressed={ordered}
        title={ordered ? '从点菜单移除' : '加入点菜单'}
      >
        {ordered ? '✓ 已点' : '＋ 点菜'}
      </button>
    </article>
  );
}
