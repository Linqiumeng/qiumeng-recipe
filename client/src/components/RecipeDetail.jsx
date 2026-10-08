import { CoverImage } from './RecipeCard.jsx';
import { imageUrl } from '../lib/image.js';
import { useOrder } from '../lib/OrderContext.jsx';

export default function RecipeDetail({ recipe }) {
  const order = useOrder();
  const ordered = order.has(recipe.slug);

  return (
    <article className="detail">
      <CoverImage recipe={recipe} preset="detail" className="detail-cover" />

      <header className="detail-header">
        <h1>{recipe.title}</h1>
        {recipe.summary && <p className="detail-summary">{recipe.summary}</p>}
        <div className="detail-meta">
          <span className="chip">{recipe.category}</span>
          {recipe.prepTime > 0 && <span>⏱ {recipe.prepTime} 分钟</span>}
          {recipe.servings > 0 && <span>🍽 {recipe.servings} 人份</span>}
          {recipe.difficulty && <span>难度：{recipe.difficulty}</span>}
        </div>
        {recipe.tags?.length > 0 && (
          <div className="tags">
            {recipe.tags.map((t) => (
              <span key={t} className="tag">#{t}</span>
            ))}
          </div>
        )}
        <button type="button" className={`btn ${ordered ? '' : 'btn-primary'}`} onClick={() => order.toggle(recipe)}>
          {ordered ? '✓ 已在点菜单（点击移除）' : '＋ 加入点菜单'}
        </button>
      </header>

      {recipe.ingredients?.length > 0 && (
        <section>
          <h2>用料</h2>
          <ul className="ingredients">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                <span>{ing.name}</span>
                <span className="muted">{ing.amount}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recipe.steps?.length > 0 && (
        <section>
          <h2>做法</h2>
          <ol className="steps">
            {recipe.steps.map((step, i) => (
              <li key={i}>
                <p>{step.text}</p>
                {step.image && <img src={imageUrl(step.image, 'step')} alt={`步骤 ${i + 1}`} loading="lazy" />}
              </li>
            ))}
          </ol>
        </section>
      )}

      {recipe.tips && (
        <section className="tips">
          <h2>小贴士</h2>
          <p>{recipe.tips}</p>
        </section>
      )}
    </article>
  );
}
